import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";

export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export function useInvoicesData() {
  const queryClient = useQueryClient();

  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          invoice_line_items(*)
        `)
        .eq("organization_id", DEMO_ORG_ID)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const stats = {
    totalOutstanding: invoices
      ?.filter((i) => ["sent", "viewed", "overdue"].includes(i.status))
      .reduce((sum, i) => sum + Number(i.total), 0) || 0,
    paidLast30Days: invoices
      ?.filter((i) => {
        if (i.status !== "paid") return false;
        const paidDate = i.paid_at ? new Date(i.paid_at) : new Date(i.updated_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return paidDate >= thirtyDaysAgo;
      })
      .reduce((sum, i) => sum + Number(i.total), 0) || 0,
    overdue: invoices
      ?.filter((i) => i.status === "overdue")
      .reduce((sum, i) => sum + Number(i.total), 0) || 0,
  };

  // Generate next invoice number
  const getNextInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      ?.map((i) => {
        const match = i.invoice_number.match(/INV-(\d{4})-(\d+)/);
        if (match && parseInt(match[1]) === year) {
          return parseInt(match[2]);
        }
        return 0;
      })
      .filter((n) => n > 0) || [];
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `INV-${year}-${String(maxNumber + 1).padStart(3, "0")}`;
  };

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async (invoiceData: {
      client_name: string;
      client_email: string;
      issue_date: string;
      due_date: string;
      line_items: LineItem[];
      tax_rate: number;
      currency: string;
      notes?: string;
      send_immediately: boolean;
    }) => {
      const subtotal = invoiceData.line_items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * (invoiceData.tax_rate / 100);
      const total = subtotal + taxAmount;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          organization_id: DEMO_ORG_ID,
          invoice_number: getNextInvoiceNumber(),
          client_name: invoiceData.client_name,
          client_email: invoiceData.client_email,
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date,
          subtotal,
          tax_rate: invoiceData.tax_rate,
          tax_amount: taxAmount,
          total,
          currency: invoiceData.currency,
          notes: invoiceData.notes,
          status: invoiceData.send_immediately ? "sent" : "draft",
          sent_at: invoiceData.send_immediately ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert line items
      if (invoiceData.line_items.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_line_items")
          .insert(
            invoiceData.line_items.map((item) => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return invoice;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(
        variables.send_immediately
          ? "Invoice created and sent"
          : "Invoice saved as draft"
      );
    },
    onError: (error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });

  // Update invoice status mutation
  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: string; status: InvoiceStatus }) => {
      const updates: Record<string, any> = { status };
      
      if (status === "sent") {
        updates.sent_at = new Date().toISOString();
      } else if (status === "paid") {
        updates.paid_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("invoices")
        .update(updates)
        .eq("id", invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update invoice: ${error.message}`);
    },
  });

  return {
    invoices,
    stats,
    isLoading: invoicesLoading,
    createInvoice,
    updateInvoiceStatus,
    getNextInvoiceNumber,
  };
}

export function formatInvoiceDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
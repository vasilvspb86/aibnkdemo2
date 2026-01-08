import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_ACCOUNT_ID = "22222222-2222-2222-2222-222222222222";

export type ExpenseStatus = "pending" | "approved" | "rejected" | "reimbursed";

export function useExpensesData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch expenses
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("organization_id", DEMO_ORG_ID)
        .order("expense_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const stats = {
    thisMonth: expenses
      ?.filter((e) => {
        const expenseDate = new Date(e.expense_date);
        const now = new Date();
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, e) => sum + Number(e.amount), 0) || 0,
    pending: expenses
      ?.filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + Number(e.amount), 0) || 0,
    pendingCount: expenses?.filter((e) => e.status === "pending").length || 0,
  };

  // Category breakdown
  const categoryBreakdown = expenses?.reduce((acc, expense) => {
    const category = expense.category || "Other";
    acc[category] = (acc[category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  const categoryData = Object.entries(categoryBreakdown)
    .map(([name, value], index) => ({
      name,
      value,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }))
    .sort((a, b) => b.value - a.value);

  // Upload receipt
  const uploadReceipt = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id || "anon"}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  // Create expense mutation
  const createExpense = useMutation({
    mutationFn: async (expenseData: {
      description: string;
      amount: number;
      expense_date: string;
      category: string;
      vendor?: string;
      receipt?: File;
      needs_approval: boolean;
    }) => {
      let receiptUrl: string | null = null;

      if (expenseData.receipt) {
        receiptUrl = await uploadReceipt(expenseData.receipt);
      }

      const { data, error } = await supabase
        .from("expenses")
        .insert({
          organization_id: DEMO_ORG_ID,
          user_id: user?.id,
          description: expenseData.description,
          amount: expenseData.amount,
          currency: "AED",
          expense_date: expenseData.expense_date,
          category: expenseData.category,
          vendor: expenseData.vendor,
          receipt_url: receiptUrl,
          needs_approval: expenseData.needs_approval,
          status: expenseData.needs_approval ? "pending" : "approved",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add expense: ${error.message}`);
    },
  });

  // Update expense status mutation
  const updateExpenseStatus = useMutation({
    mutationFn: async ({
      expenseId,
      status,
      expenseData,
    }: {
      expenseId: string;
      status: ExpenseStatus;
      expenseData?: {
        amount: number;
        description: string;
        category: string;
        vendor?: string;
      };
    }) => {
      const updates: Record<string, any> = { status };

      if (status === "approved") {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = user?.id;
      }

      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", expenseId)
        .select()
        .single();

      if (error) throw error;

      // Create a debit transaction when expense is approved
      if (status === "approved" && expenseData) {
        const { error: txError } = await supabase
          .from("transactions")
          .insert({
            account_id: DEMO_ACCOUNT_ID,
            type: "debit",
            amount: expenseData.amount,
            currency: "AED",
            status: "completed",
            description: expenseData.description,
            reference: `EXP-${expenseId.substring(0, 8).toUpperCase()}`,
            counterparty_name: expenseData.vendor || "Expense",
            category: expenseData.category,
          });

        if (txError) throw txError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Expense status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update expense: ${error.message}`);
    },
  });

  return {
    expenses,
    stats,
    categoryData,
    isLoading: expensesLoading,
    createExpense,
    updateExpenseStatus,
  };
}

export function formatExpenseDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Demo IDs
const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_ACCOUNT_ID = "22222222-2222-2222-2222-222222222222";

export function usePaymentsData() {
  const queryClient = useQueryClient();

  // Fetch beneficiaries
  const { data: beneficiaries, isLoading: beneficiariesLoading } = useQuery({
    queryKey: ["beneficiaries", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("organization_id", DEMO_ORG_ID)
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          beneficiary:beneficiaries(name)
        `)
        .eq("organization_id", DEMO_ORG_ID)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch payment links
  const { data: paymentLinks, isLoading: linksLoading } = useQuery({
    queryKey: ["payment-links", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_links")
        .select("*")
        .eq("organization_id", DEMO_ORG_ID)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Create payment mutation
  const createPayment = useMutation({
    mutationFn: async (paymentData: {
      beneficiary_id?: string;
      beneficiary_name?: string;
      amount: number;
      currency: string;
      reference?: string;
      purpose?: string;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const counterpartyName = paymentData.beneficiary_name || "Recipient";
      
      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          organization_id: DEMO_ORG_ID,
          account_id: DEMO_ACCOUNT_ID,
          beneficiary_id: paymentData.beneficiary_id || null,
          amount: paymentData.amount,
          currency: paymentData.currency,
          reference: paymentData.reference || null,
          purpose: paymentData.purpose || null,
          status: "pending_approval",
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (paymentError) throw paymentError;

      // Also create a transaction record linked to this payment
      const { error: txError } = await supabase
        .from("transactions")
        .insert({
          account_id: DEMO_ACCOUNT_ID,
          type: "debit",
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: "pending",
          description: `Payment to ${counterpartyName}`,
          reference: `PAY-${payment.id.substring(0, 8).toUpperCase()}`,
          counterparty_name: counterpartyName,
          category: paymentData.purpose || "Transfer",
          metadata: { payment_id: payment.id },
        });
      
      if (txError) throw txError;
      
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Payment created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create payment: ${error.message}`);
    },
  });

  // Create payment link mutation
  const createPaymentLink = useMutation({
    mutationFn: async (linkData: {
      amount: number;
      description: string;
    }) => {
      const linkCode = generateLinkCode();
      const { data, error } = await supabase
        .from("payment_links")
        .insert({
          organization_id: DEMO_ORG_ID,
          amount: linkData.amount,
          currency: "AED",
          description: linkData.description,
          link_code: linkCode,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-links"] });
      toast.success("Payment link created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create payment link: ${error.message}`);
    },
  });

  // Create beneficiary mutation
  const createBeneficiary = useMutation({
    mutationFn: async (beneficiaryData: {
      name: string;
      bank_name: string;
      iban: string;
      vendor_type: string;
    }) => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .insert({
          organization_id: DEMO_ORG_ID,
          name: beneficiaryData.name,
          bank_name: beneficiaryData.bank_name,
          iban: beneficiaryData.iban,
          vendor_type: beneficiaryData.vendor_type,
          currency: "AED",
          country: "UAE",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast.success("Beneficiary added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add beneficiary: ${error.message}`);
    },
  });

  // Update payment mutation
  const updatePayment = useMutation({
    mutationFn: async (paymentData: {
      id: string;
      beneficiary_id?: string;
      amount?: number;
      currency?: string;
      reference?: string;
      purpose?: string;
      status?: "draft" | "pending_approval" | "scheduled" | "processing" | "completed" | "failed" | "cancelled";
    }) => {
      const { id, ...updateData } = paymentData;
      const { data, error } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update payment: ${error.message}`);
    },
  });

  // Approve payment mutation
  const approvePayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update payment to completed
      const { data: payment, error } = await supabase
        .from("payments")
        .update({ 
          status: "completed",
          approved_by: user?.id,
          account_id: DEMO_ACCOUNT_ID,
          processed_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .select(`*, beneficiary:beneficiaries(name)`)
        .single();
      
      if (error) throw error;

      const counterpartyName = payment.beneficiary?.name || "Recipient";

      // Try to update existing transaction by metadata->>'payment_id' (most reliable)
      const { data: updatedTx, error: updateError } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("account_id", DEMO_ACCOUNT_ID)
        .filter("metadata->>payment_id", "eq", paymentId)
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;

      // If no transaction was updated, create a new completed transaction
      if (!updatedTx) {
        const { error: txCreateError } = await supabase
          .from("transactions")
          .insert({
            account_id: DEMO_ACCOUNT_ID,
            type: "debit",
            amount: payment.amount,
            currency: payment.currency,
            status: "completed",
            description: `Payment to ${counterpartyName}`,
            reference: `PAY-${paymentId.substring(0, 8).toUpperCase()}`,
            counterparty_name: counterpartyName,
            category: payment.purpose || "Transfer",
            metadata: { payment_id: payment.id },
          });
        
        if (txCreateError) throw txCreateError;
      }
      
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["account-transactions", DEMO_ACCOUNT_ID] });
      queryClient.invalidateQueries({ queryKey: ["account-details", DEMO_ACCOUNT_ID] });
      toast.success("Payment approved and completed");
    },
    onError: (error) => {
      toast.error(`Failed to approve payment: ${error.message}`);
    },
  });

  // Cancel payment mutation
  const cancelPayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { data: payment, error } = await supabase
        .from("payments")
        .update({ status: "cancelled" })
        .eq("id", paymentId)
        .select()
        .single();
      
      if (error) throw error;

      // Cancel related transaction using metadata->>'payment_id'
      await supabase
        .from("transactions")
        .update({ status: "cancelled" })
        .eq("account_id", DEMO_ACCOUNT_ID)
        .filter("metadata->>payment_id", "eq", paymentId);
      
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["account-transactions", DEMO_ACCOUNT_ID] });
      queryClient.invalidateQueries({ queryKey: ["account-details", DEMO_ACCOUNT_ID] });
      toast.success("Payment cancelled");
    },
    onError: (error) => {
      toast.error(`Failed to cancel payment: ${error.message}`);
    },
  });

  // Delete draft payment mutation
  const deletePayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", paymentId)
        .eq("status", "draft"); // Only allow deleting drafts
      
      if (error) throw error;
      return paymentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Draft payment deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete payment: ${error.message}`);
    },
  });

  return {
    beneficiaries,
    payments,
    paymentLinks,
    isLoading: beneficiariesLoading || paymentsLoading || linksLoading,
    createPayment,
    createPaymentLink,
    createBeneficiary,
    updatePayment,
    approvePayment,
    cancelPayment,
    deletePayment,
  };
}

function generateLinkCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatPaymentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

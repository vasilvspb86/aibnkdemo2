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
      beneficiary_id: string;
      amount: number;
      currency: string;
      reference: string;
      purpose: string;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("payments")
        .insert({
          organization_id: DEMO_ORG_ID,
          account_id: DEMO_ACCOUNT_ID,
          beneficiary_id: paymentData.beneficiary_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          reference: paymentData.reference,
          purpose: paymentData.purpose,
          status: "pending_approval",
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
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

  return {
    beneficiaries,
    payments,
    paymentLinks,
    isLoading: beneficiariesLoading || paymentsLoading || linksLoading,
    createPayment,
    createPaymentLink,
    createBeneficiary,
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

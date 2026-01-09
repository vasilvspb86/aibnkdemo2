import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ComplianceAnswers {
  case_id: string;
  account_use_purpose: "invoice_clients" | "pay_suppliers" | "both" | null;
  expected_monthly_volume_band: "0_50k" | "50_200k" | "200k_plus" | null;
  customer_location: "uae" | "gcc" | "international" | null;
  cash_activity: boolean | null;
  pep_confirmation: "no" | "yes" | "unsure" | null;
  other_controllers: boolean;
  created_at: string;
  updated_at: string;
}

export function useComplianceAnswers(caseId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["compliance-answers", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_answers")
        .select("*")
        .eq("case_id", caseId)
        .single();

      if (error) throw error;
      return data as ComplianceAnswers;
    },
    enabled: !!caseId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<ComplianceAnswers>) => {
      const { data, error } = await supabase
        .from("compliance_answers")
        .update(updates)
        .eq("case_id", caseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-answers", caseId] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateCompliance: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

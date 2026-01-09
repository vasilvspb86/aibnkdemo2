import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OnboardingCase {
  id: string;
  user_id: string;
  status: "draft" | "submitted" | "in_review" | "needs_info" | "approved" | "not_approved";
  progress_percent: number;
  entity_type: string;
  sla_text: string | null;
  risk_level: string;
  created_at: string;
  submitted_at: string | null;
  updated_at: string;
}

export function useOnboardingCase(caseId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["onboarding-case", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (error) throw error;
      return data as OnboardingCase;
    },
    enabled: !!caseId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { data, error } = await supabase
        .from("onboarding_cases")
        .update(updates)
        .eq("id", caseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-case", caseId] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateCase: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

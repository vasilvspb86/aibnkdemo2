import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyProfile {
  case_id: string;
  trade_license_number: string | null;
  issuing_authority: string | null;
  company_legal_name: string | null;
  legal_form: string | null;
  registered_address: string | null;
  business_activity: string | null;
  operating_address: string | null;
  website: string | null;
  prefill_source: "registry_lookup" | "manual_entry" | null;
  confirmed_by_user: boolean;
  created_at: string;
  updated_at: string;
}

export function useCompanyProfile(caseId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["company-profile", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("case_id", caseId)
        .single();

      if (error) throw error;
      return data as CompanyProfile;
    },
    enabled: !!caseId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<CompanyProfile>) => {
      const { data, error } = await supabase
        .from("company_profiles")
        .update(updates)
        .eq("case_id", caseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile", caseId] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

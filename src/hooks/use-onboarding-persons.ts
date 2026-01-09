import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OnboardingPerson {
  id: string;
  case_id: string;
  full_name: string | null;
  dob: string | null;
  nationality: string | null;
  roles: string[];
  ownership_percent: number;
  email: string | null;
  phone: string | null;
  is_uae_resident: boolean;
  emirates_id_number: string | null;
  created_at: string;
  updated_at: string;
}

export function useOnboardingPersons(caseId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["onboarding-persons", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_persons")
        .select("*")
        .eq("case_id", caseId);

      if (error) throw error;
      return data as OnboardingPerson[];
    },
    enabled: !!caseId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (person: Record<string, any> & { case_id: string }) => {
      if (person.id) {
        const { data, error } = await supabase
          .from("onboarding_persons")
          .update({
            full_name: person.full_name,
            dob: person.dob,
            nationality: person.nationality,
            roles: person.roles,
            ownership_percent: person.ownership_percent,
            email: person.email,
            phone: person.phone,
            is_uae_resident: person.is_uae_resident,
            emirates_id_number: person.emirates_id_number,
          })
          .eq("id", person.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("onboarding_persons")
          .insert({
            case_id: person.case_id,
            full_name: person.full_name,
            dob: person.dob,
            nationality: person.nationality,
            roles: person.roles,
            ownership_percent: person.ownership_percent,
            email: person.email,
            phone: person.phone,
            is_uae_resident: person.is_uae_resident,
            emirates_id_number: person.emirates_id_number,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    upsertPerson: upsertMutation.mutateAsync,
    isUpdating: upsertMutation.isPending,
  };
}

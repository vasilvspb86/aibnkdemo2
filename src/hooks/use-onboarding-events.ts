import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OnboardingEvent {
  id: string;
  case_id: string;
  event_type: string;
  actor: "user" | "system";
  metadata: Record<string, any>;
  created_at: string;
}

export function useOnboardingEvents(caseId: string) {
  const query = useQuery({
    queryKey: ["onboarding-events", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_events")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OnboardingEvent[];
    },
    enabled: !!caseId,
  });

  return {
    events: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

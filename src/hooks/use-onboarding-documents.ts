import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type DocType = "trade_license" | "moa_aoa" | "emirates_id_front" | "emirates_id_back" | "passport" | "proof_of_address";
export type DocStatus = "missing" | "uploaded" | "validating" | "accepted" | "rejected";

export interface OnboardingDocument {
  id: string;
  case_id: string;
  document_type: DocType;
  owner_person_id: string | null;
  status: DocStatus;
  file_url: string | null;
  file_name: string | null;
  expiry_date: string | null;
  validation_notes: string | null;
  rejection_reason_code: string | null;
  uploaded_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useOnboardingDocuments(caseId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["onboarding-documents", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_documents")
        .select("*")
        .eq("case_id", caseId);

      if (error) throw error;
      return data as OnboardingDocument[];
    },
    enabled: !!caseId,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ docType, file }: { docType: DocType; file: File }) => {
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${docType}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${caseId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("onboarding-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("onboarding-documents")
        .getPublicUrl(filePath);

      // Check if document already exists
      const existingDoc = query.data?.find((d) => d.document_type === docType);

      if (existingDoc) {
        // Update existing document
        const { data, error } = await supabase
          .from("onboarding_documents")
          .update({
            status: "uploaded",
            file_url: urlData.publicUrl,
            file_name: file.name,
            uploaded_at: new Date().toISOString(),
          })
          .eq("id", existingDoc.id)
          .select()
          .single();

        if (error) throw error;

        // Simulate validation process
        simulateValidation(existingDoc.id, caseId, queryClient);

        return data;
      } else {
        // Create new document record
        const { data, error } = await supabase
          .from("onboarding_documents")
          .insert({
            case_id: caseId,
            document_type: docType,
            status: "uploaded",
            file_url: urlData.publicUrl,
            file_name: file.name,
            uploaded_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // Simulate validation process
        simulateValidation(data.id, caseId, queryClient);

        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-documents", caseId] });
    },
  });

  return {
    documents: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    uploadDocument: (docType: DocType, file: File) =>
      uploadMutation.mutateAsync({ docType, file }),
    isUploading: uploadMutation.isPending,
  };
}

// Simulate document validation (for demo)
async function simulateValidation(docId: string, caseId: string, queryClient: any) {
  // After 1 second, set to validating
  setTimeout(async () => {
    await supabase
      .from("onboarding_documents")
      .update({ status: "validating" })
      .eq("id", docId);
    queryClient.invalidateQueries({ queryKey: ["onboarding-documents", caseId] });
  }, 1000);

  // After 3 seconds, set to accepted
  setTimeout(async () => {
    await supabase
      .from("onboarding_documents")
      .update({ status: "accepted" })
      .eq("id", docId);
    queryClient.invalidateQueries({ queryKey: ["onboarding-documents", caseId] });
  }, 3000);
}

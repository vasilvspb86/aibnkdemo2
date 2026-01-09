import { useCompanyProfile } from "./use-company-profile";
import { useOnboardingPersons } from "./use-onboarding-persons";
import { useComplianceAnswers } from "./use-compliance-answers";
import { useOnboardingDocuments } from "./use-onboarding-documents";

// Progress weights as per spec:
// Company confirmed: 20%
// Owner complete: 20%
// Compliance complete: 20%
// Documents (40% split across 5 required docs = 8% each)

export function useOnboardingProgress(caseId: string): number {
  const { data: companyProfile } = useCompanyProfile(caseId);
  const { data: persons } = useOnboardingPersons(caseId);
  const { data: compliance } = useComplianceAnswers(caseId);
  const { documents } = useOnboardingDocuments(caseId);

  let progress = 0;

  // Company: 20%
  if (companyProfile?.confirmed_by_user) {
    progress += 20;
  }

  // Owner: 20%
  const owner = persons?.[0];
  if (owner?.full_name && owner?.dob && owner?.nationality && owner?.ownership_percent === 100) {
    progress += 20;
  }

  // Compliance: 20%
  if (
    compliance?.account_use_purpose &&
    compliance?.expected_monthly_volume_band &&
    compliance?.customer_location &&
    compliance?.pep_confirmation
  ) {
    progress += 20;
  }

  // Documents: 40% (8% each for 5 required docs)
  const requiredDocTypes = ["trade_license", "moa_aoa", "emirates_id_front", "emirates_id_back", "passport"];
  const docProgressPerDoc = 40 / requiredDocTypes.length; // 8% each

  requiredDocTypes.forEach((type) => {
    const doc = documents?.find((d) => d.document_type === type);
    if (doc?.status === "accepted") {
      progress += docProgressPerDoc;
    }
  });

  return Math.round(progress);
}

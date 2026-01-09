import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Loader2,
  Building2,
  User,
  Shield,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  Pencil,
} from "lucide-react";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { useOnboardingPersons } from "@/hooks/use-onboarding-persons";
import { useComplianceAnswers } from "@/hooks/use-compliance-answers";
import { useOnboardingDocuments } from "@/hooks/use-onboarding-documents";
import { useOnboardingCase } from "@/hooks/use-onboarding-case";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type OutletContext = {
  caseId: string;
  onboardingCase: any;
};

const purposeLabels: Record<string, string> = {
  invoice_clients: "Invoice clients",
  pay_suppliers: "Pay suppliers",
  both: "Both",
};

const volumeLabels: Record<string, string> = {
  "0_50k": "AED 0 – 50,000",
  "50_200k": "AED 50,000 – 200,000",
  "200k_plus": "AED 200,000+",
};

const locationLabels: Record<string, string> = {
  uae: "UAE",
  gcc: "GCC Region",
  international: "International",
};

const pepLabels: Record<string, string> = {
  no: "No",
  yes: "Yes",
  unsure: "Unsure",
};

export default function ReviewTab() {
  const { caseId } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companyProfile, isLoading: companyLoading } = useCompanyProfile(caseId);
  const { data: persons, isLoading: personsLoading } = useOnboardingPersons(caseId);
  const { data: compliance, isLoading: complianceLoading } = useComplianceAnswers(caseId);
  const { documents, isLoading: docsLoading } = useOnboardingDocuments(caseId);
  const { refetch: refetchCase } = useOnboardingCase(caseId);

  const isLoading = companyLoading || personsLoading || complianceLoading || docsLoading;
  const owner = persons?.[0];

  // Validation checks
  const companyComplete = companyProfile?.confirmed_by_user === true;
  const ownerComplete = owner?.full_name && owner?.dob && owner?.nationality && owner?.ownership_percent === 100;
  const complianceComplete =
    compliance?.account_use_purpose &&
    compliance?.expected_monthly_volume_band &&
    compliance?.customer_location &&
    compliance?.pep_confirmation;

  const requiredDocTypes = ["trade_license", "moa_aoa", "emirates_id_front", "emirates_id_back", "passport"];
  const allDocsAccepted = requiredDocTypes.every((type) =>
    documents?.some((d) => d.document_type === type && d.status === "accepted")
  );

  const canSubmit = companyComplete && ownerComplete && complianceComplete && allDocsAccepted;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      // Update case status to submitted
      const { error: updateError } = await supabase
        .from("onboarding_cases")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (updateError) throw updateError;

      // Create audit event
      await supabase.from("onboarding_events").insert({
        case_id: caseId,
        event_type: "case_submitted",
        actor: "user",
      });

      toast.success("Application submitted successfully!");
      
      // Refetch case and navigate to status
      await refetchCase();
      navigate(`/onboarding/${caseId}/status`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const ValidationBadge = ({ valid }: { valid: boolean }) => (
    <Badge variant={valid ? "default" : "destructive"} className="flex items-center gap-1">
      {valid ? (
        <>
          <CheckCircle2 className="w-3 h-3" />
          Complete
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3" />
          Incomplete
        </>
      )}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Review & Submit</h2>
        <p className="text-muted-foreground mt-1">
          Review your application before submitting for review.
        </p>
      </div>

      {/* Company Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Details
          </CardTitle>
          <div className="flex items-center gap-2">
            <ValidationBadge valid={companyComplete} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/onboarding/${caseId}/company`)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Company Name</span>
              <span className="font-medium">{companyProfile?.company_legal_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Legal Form</span>
              <span className="font-medium">{companyProfile?.legal_form || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trade License</span>
              <span className="font-medium">{companyProfile?.trade_license_number || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Activity</span>
              <span className="font-medium">{companyProfile?.business_activity || "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Owner Details
          </CardTitle>
          <div className="flex items-center gap-2">
            <ValidationBadge valid={!!ownerComplete} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/onboarding/${caseId}/ownership`)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-medium">{owner?.full_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nationality</span>
              <span className="font-medium">{owner?.nationality || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ownership</span>
              <span className="font-medium">{owner?.ownership_percent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Roles</span>
              <span className="font-medium">Owner, Director, Authorized Signatory</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compliance Information
          </CardTitle>
          <div className="flex items-center gap-2">
            <ValidationBadge valid={!!complianceComplete} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/onboarding/${caseId}/compliance`)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Purpose</span>
              <span className="font-medium">
                {compliance?.account_use_purpose ? purposeLabels[compliance.account_use_purpose] : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Volume</span>
              <span className="font-medium">
                {compliance?.expected_monthly_volume_band
                  ? volumeLabels[compliance.expected_monthly_volume_band]
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer Location</span>
              <span className="font-medium">
                {compliance?.customer_location ? locationLabels[compliance.customer_location] : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PEP Status</span>
              <span className="font-medium">
                {compliance?.pep_confirmation ? pepLabels[compliance.pep_confirmation] : "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
          </CardTitle>
          <div className="flex items-center gap-2">
            <ValidationBadge valid={allDocsAccepted} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/onboarding/${caseId}/documents`)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {requiredDocTypes.map((type) => {
              const doc = documents?.find((d) => d.document_type === type);
              const accepted = doc?.status === "accepted";
              return (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">
                    {type.replace(/_/g, " ")}
                  </span>
                  <Badge variant={accepted ? "default" : "secondary"}>
                    {accepted ? "Accepted" : doc?.status || "Missing"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Submit Section */}
      {!canSubmit && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Your application is not ready to submit
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Please complete all sections marked as incomplete before submitting.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate(`/onboarding/${caseId}/documents`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          size="lg"
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Submit for Review
        </Button>
      </div>
    </div>
  );
}

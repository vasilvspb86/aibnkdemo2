import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useLocalOnboarding, LocalOnboardingData, clearLocalOnboardingData } from "@/hooks/use-local-onboarding";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export default function ReviewTabLocal() {
  const navigate = useNavigate();
  const { data, markSubmitted, isLoading } = useLocalOnboarding();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is already logged in
  const isLoggedIn = !!user;

  // Validation checks
  const companyComplete = data.company.confirmed_by_user === true;
  const ownerComplete = data.owner.full_name && data.owner.dob && data.owner.nationality;
  const complianceComplete =
    data.compliance.account_use_purpose &&
    data.compliance.expected_monthly_volume_band &&
    data.compliance.customer_location &&
    data.compliance.pep_confirmation;

  const requiredDocTypes = ["trade_license", "moa_aoa", "emirates_id_front", "emirates_id_back", "passport"];
  const allDocsAccepted = requiredDocTypes.every((type) =>
    data.documents[type]?.status === "accepted"
  );

  const canSubmit = companyComplete && ownerComplete && complianceComplete && allDocsAccepted;

  // Save onboarding data to database for logged-in users
  const saveOnboardingToDatabase = async (userId: string, onboardingData: LocalOnboardingData) => {
    try {
      // 1. Create onboarding case
      const { data: caseData, error: caseError } = await supabase
        .from("onboarding_cases")
        .insert({
          user_id: userId,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          progress_percent: 100,
        })
        .select()
        .single();

      if (caseError) throw caseError;

      const caseId = caseData.id;

      // 2. Create company profile
      await supabase.from("company_profiles").insert({
        case_id: caseId,
        issuing_authority: onboardingData.company.issuing_authority,
        trade_license_number: onboardingData.company.trade_license_number,
        company_legal_name: onboardingData.company.company_legal_name,
        legal_form: onboardingData.company.legal_form,
        registered_address: onboardingData.company.registered_address,
        business_activity: onboardingData.company.business_activity,
        operating_address: onboardingData.company.operating_address || null,
        website: onboardingData.company.website || null,
        prefill_source: onboardingData.company.prefill_source,
        confirmed_by_user: onboardingData.company.confirmed_by_user,
      });

      // 3. Create onboarding person (owner)
      await supabase.from("onboarding_persons").insert({
        case_id: caseId,
        full_name: onboardingData.owner.full_name,
        dob: onboardingData.owner.dob || null,
        nationality: onboardingData.owner.nationality,
        email: onboardingData.owner.email || null,
        phone: onboardingData.owner.phone || null,
        emirates_id_number: onboardingData.owner.emirates_id_number || null,
        roles: onboardingData.owner.roles as any,
        ownership_percent: onboardingData.owner.ownership_percent,
        is_uae_resident: onboardingData.owner.is_uae_resident,
      });

      // 4. Create compliance answers
      await supabase.from("compliance_answers").insert({
        case_id: caseId,
        account_use_purpose: onboardingData.compliance.account_use_purpose as any,
        expected_monthly_volume_band: onboardingData.compliance.expected_monthly_volume_band as any,
        customer_location: onboardingData.compliance.customer_location as any,
        cash_activity: onboardingData.compliance.cash_activity,
        pep_confirmation: onboardingData.compliance.pep_confirmation as any,
        other_controllers: onboardingData.compliance.other_controllers,
      });

      // 5. Create document records
      const docPromises = Object.entries(onboardingData.documents).map(([docType, docData]) =>
        supabase.from("onboarding_documents").insert({
          case_id: caseId,
          document_type: docType as any,
          file_name: docData.file_name,
          status: "accepted" as any,
          uploaded_at: docData.uploaded_at,
        })
      );
      await Promise.all(docPromises);

      // 6. Create submitted event
      await supabase.from("onboarding_events").insert({
        case_id: caseId,
        event_type: "case_submitted",
        actor: "user",
        metadata: { source: "review_tab" },
      });

      // 7. Auto-progress to in_review after a short delay
      setTimeout(async () => {
        try {
          await supabase
            .from("onboarding_cases")
            .update({ status: "in_review" })
            .eq("id", caseId);
          
          await supabase.from("onboarding_events").insert({
            case_id: caseId,
            event_type: "case_in_review",
            actor: "system",
            metadata: { note: "Application moved to review queue" },
          });
        } catch (err) {
          console.error("Auto-progress error:", err);
        }
      }, 5000);

      return caseId;
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    
    if (isLoggedIn && user) {
      // User is logged in - save to database
      try {
        await saveOnboardingToDatabase(user.id, data);
        clearLocalOnboardingData();
        toast.success("Application submitted successfully!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to save onboarding:", error);
        toast.error("Failed to submit application. Please try again.");
        setIsSubmitting(false);
        return;
      }
    } else {
      // User is not registered - mark as submitted locally and go to signup
      markSubmitted();
      toast.success("Application submitted! Create your account to continue.");
      navigate("/signup");
    }
    
    setIsSubmitting(false);
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
          {isLoggedIn 
            ? "Review your application before submitting."
            : "Review your application before creating your account."
          }
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
              onClick={() => navigate("/onboarding-local/company")}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Company Name</span>
              <span className="font-medium">{data.company.company_legal_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Legal Form</span>
              <span className="font-medium">{data.company.legal_form || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trade License</span>
              <span className="font-medium">{data.company.trade_license_number || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Activity</span>
              <span className="font-medium">{data.company.business_activity || "—"}</span>
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
              onClick={() => navigate("/onboarding-local/ownership")}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-medium">{data.owner.full_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nationality</span>
              <span className="font-medium">{data.owner.nationality || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ownership</span>
              <span className="font-medium">{data.owner.ownership_percent}%</span>
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
              onClick={() => navigate("/onboarding-local/compliance")}
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
                {data.compliance.account_use_purpose ? purposeLabels[data.compliance.account_use_purpose] : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Volume</span>
              <span className="font-medium">
                {data.compliance.expected_monthly_volume_band
                  ? volumeLabels[data.compliance.expected_monthly_volume_band]
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer Location</span>
              <span className="font-medium">
                {data.compliance.customer_location ? locationLabels[data.compliance.customer_location] : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PEP Status</span>
              <span className="font-medium">
                {data.compliance.pep_confirmation ? pepLabels[data.compliance.pep_confirmation] : "—"}
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
              onClick={() => navigate("/onboarding-local/documents")}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {requiredDocTypes.map((type) => {
              const doc = data.documents[type];
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

      {canSubmit && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Ready to submit!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {isLoggedIn 
                ? "Your application will be submitted for review."
                : "After submitting, you'll create your account to track your application status."
              }
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/onboarding-local/documents")}
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
          {isLoggedIn ? "Submit Application" : "Submit & Create Account"}
        </Button>
      </div>
    </div>
  );
}

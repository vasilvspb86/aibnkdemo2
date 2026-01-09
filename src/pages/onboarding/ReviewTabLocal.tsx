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
import { useLocalOnboarding } from "@/hooks/use-local-onboarding";
import { useAuth } from "@/hooks/use-auth";
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

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mark as submitted in localStorage
    markSubmitted();
    
    if (isLoggedIn) {
      // User is already registered - complete onboarding and go to dashboard
      toast.success("Application submitted successfully!");
      navigate("/dashboard");
    } else {
      // User is not registered - go to signup
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

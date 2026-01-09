import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalOnboarding } from "@/hooks/use-local-onboarding";
import { 
  ArrowLeft, 
  Building2, 
  User, 
  FileText, 
  Shield, 
  CheckCircle2,
  Clock,
  Printer,
  Download
} from "lucide-react";

const purposeLabels: Record<string, string> = {
  invoice_clients: "Invoice clients / receive payments",
  pay_suppliers: "Pay suppliers / vendors",
  both: "Both receiving and sending payments",
};

const volumeLabels: Record<string, string> = {
  "0_50k": "AED 0 – 50,000",
  "50_200k": "AED 50,000 – 200,000",
  "200k_plus": "AED 200,000+",
};

const locationLabels: Record<string, string> = {
  uae: "Primarily UAE-based",
  gcc: "GCC region",
  international: "International",
};

const pepLabels: Record<string, string> = {
  no: "No",
  yes: "Yes",
  unsure: "Unsure",
};

const docTypeLabels: Record<string, string> = {
  trade_license: "Trade License",
  moa_aoa: "Memorandum of Association",
  emirates_id_front: "Emirates ID (Front)",
  emirates_id_back: "Emirates ID (Back)",
  passport: "Passport",
  proof_of_address: "Proof of Address",
};

const legalFormLabels: Record<string, string> = {
  fz_llc: "Free Zone LLC",
  llc: "LLC",
  sole_establishment: "Sole Establishment",
  branch: "Branch",
  free_zone: "Free Zone",
  other: "Other",
};

export default function ApplicationSummary() {
  const navigate = useNavigate();
  const { data, isLoading } = useLocalOnboarding();

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!data.submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Application Not Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Complete your application to view the summary.
            </p>
            <Button onClick={() => navigate("/onboarding-local/review")}>
              Continue Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const submittedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header - hidden in print */}
      <div className="print:hidden border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center print:text-left">
          <div className="flex items-center justify-center print:justify-start gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-display font-bold">
                {data.company.company_legal_name || "Business Application"}
              </h1>
              <p className="text-muted-foreground">Application Summary</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center print:justify-start gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Submitted on {submittedDate}</span>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Pending Review
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Company Information */}
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Legal Name</p>
                <p className="font-medium">{data.company.company_legal_name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trade License Number</p>
                <p className="font-medium">{data.company.trade_license_number || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issuing Authority</p>
                <p className="font-medium">{data.company.issuing_authority || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Legal Form</p>
                <p className="font-medium">
                  {data.company.legal_form ? legalFormLabels[data.company.legal_form] || data.company.legal_form : "—"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Business Activity</p>
                <p className="font-medium">{data.company.business_activity || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Registered Address</p>
                <p className="font-medium">{data.company.registered_address || "—"}</p>
              </div>
              {data.company.operating_address && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Operating Address</p>
                  <p className="font-medium">{data.company.operating_address}</p>
                </div>
              )}
              {data.company.website && (
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <p className="font-medium">{data.company.website}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Owner / Director Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{data.owner.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {data.owner.dob 
                    ? new Date(data.owner.dob).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nationality</p>
                <p className="font-medium">{data.owner.nationality || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">UAE Resident</p>
                <p className="font-medium">{data.owner.is_uae_resident ? "Yes" : "No"}</p>
              </div>
              {data.owner.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{data.owner.email}</p>
                </div>
              )}
              {data.owner.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{data.owner.phone}</p>
                </div>
              )}
              {data.owner.emirates_id_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Emirates ID</p>
                  <p className="font-medium">{data.owner.emirates_id_number}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Ownership</p>
                <p className="font-medium">{data.owner.ownership_percent}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Roles</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.owner.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs capitalize">
                      {role.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Profile */}
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Account Purpose</p>
                <p className="font-medium">
                  {data.compliance.account_use_purpose 
                    ? purposeLabels[data.compliance.account_use_purpose] || data.compliance.account_use_purpose 
                    : "—"
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Monthly Volume</p>
                <p className="font-medium">
                  {data.compliance.expected_monthly_volume_band 
                    ? volumeLabels[data.compliance.expected_monthly_volume_band] || data.compliance.expected_monthly_volume_band 
                    : "—"
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer Location</p>
                <p className="font-medium">
                  {data.compliance.customer_location 
                    ? locationLabels[data.compliance.customer_location] || data.compliance.customer_location 
                    : "—"
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cash Activity Expected</p>
                <p className="font-medium">{data.compliance.cash_activity ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PEP Status</p>
                <p className="font-medium">
                  {data.compliance.pep_confirmation 
                    ? pepLabels[data.compliance.pep_confirmation] || data.compliance.pep_confirmation 
                    : "—"
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Other Controllers</p>
                <p className="font-medium">{data.compliance.other_controllers ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Submitted Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data.documents).length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(data.documents).map(([docType, doc]) => (
                  <div 
                    key={docType} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {docTypeLabels[docType] || docType}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.file_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No documents uploaded</p>
                {data.documentsSkipped && (
                  <p className="text-sm mt-1">Documents were skipped during submission</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground py-4 print:py-8">
          <p>
            This application is pending review. You will be notified once our team has processed your submission.
          </p>
          <p className="mt-2">
            Reference: APP-{data.created_at ? new Date(data.created_at).getTime().toString(36).toUpperCase() : "PENDING"}
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-0 { border: none !important; }
          .print\\:text-left { text-align: left !important; }
          .print\\:justify-start { justify-content: flex-start !important; }
          .print\\:py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
        }
      `}</style>
    </div>
  );
}

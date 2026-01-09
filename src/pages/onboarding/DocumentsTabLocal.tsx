import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  User,
  SkipForward,
} from "lucide-react";
import { useLocalOnboarding } from "@/hooks/use-local-onboarding";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type DocType = "trade_license" | "moa_aoa" | "emirates_id_front" | "emirates_id_back" | "passport" | "proof_of_address";

const documentConfig: {
  type: DocType;
  label: string;
  description: string;
  required: boolean;
  section: "company" | "owner" | "optional";
}[] = [
  {
    type: "trade_license",
    label: "Trade License",
    description: "Your valid Dubai trade license",
    required: true,
    section: "company",
  },
  {
    type: "moa_aoa",
    label: "MOA / AOA",
    description: "Memorandum or Articles of Association",
    required: true,
    section: "company",
  },
  {
    type: "emirates_id_front",
    label: "Emirates ID (Front)",
    description: "Front side of your Emirates ID",
    required: true,
    section: "owner",
  },
  {
    type: "emirates_id_back",
    label: "Emirates ID (Back)",
    description: "Back side of your Emirates ID",
    required: true,
    section: "owner",
  },
  {
    type: "passport",
    label: "Passport",
    description: "Data page of your valid passport",
    required: true,
    section: "owner",
  },
  {
    type: "proof_of_address",
    label: "Proof of Address",
    description: "Utility bill or bank statement (last 3 months)",
    required: false,
    section: "optional",
  },
];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  missing: { label: "Missing", icon: AlertCircle, className: "text-muted-foreground" },
  uploaded: { label: "Uploaded", icon: Clock, className: "text-blue-500" },
  validating: { label: "Validating", icon: Loader2, className: "text-amber-500" },
  accepted: { label: "Accepted", icon: CheckCircle2, className: "text-green-500" },
  rejected: { label: "Rejected", icon: AlertCircle, className: "text-destructive" },
};

export default function DocumentsTabLocal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, addDocument, skipDocuments, isLoading } = useLocalOnboarding();
  const [uploadingType, setUploadingType] = useState<DocType | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getDocumentStatus = (type: DocType) => {
    return data.documents[type]?.status || "missing";
  };

  const getDocumentData = (type: DocType) => {
    return data.documents[type];
  };

  const handleUpload = async (type: DocType, file: File) => {
    setUploadingType(type);
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      addDocument(type, file.name, base64);
      toast.success(`${documentConfig.find((d) => d.type === type)?.label} uploaded`);
      setUploadingType(null);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setUploadingType(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (type: DocType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(type, file);
    }
  };

  const triggerFileInput = (type: DocType) => {
    fileInputRefs.current[type]?.click();
  };

  // Check if all required documents are accepted
  const requiredDocs = documentConfig.filter((d) => d.required);
  const allRequiredAccepted = requiredDocs.every(
    (d) => getDocumentStatus(d.type) === "accepted"
  );

  const companyDocs = documentConfig.filter((d) => d.section === "company");
  const ownerDocs = documentConfig.filter((d) => d.section === "owner");
  const optionalDocs = documentConfig.filter((d) => d.section === "optional");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const renderDocumentRow = (config: typeof documentConfig[0]) => {
    const status = getDocumentStatus(config.type);
    const doc = getDocumentData(config.type);
    const statusInfo = statusConfig[status];
    const StatusIcon = statusInfo.icon;
    const isCurrentlyUploading = uploadingType === config.type;

    return (
      <div
        key={config.type}
        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            status === "accepted" ? "bg-green-100 dark:bg-green-950" :
            status === "rejected" ? "bg-red-100 dark:bg-red-950" :
            "bg-muted"
          }`}>
            <FileText className={`w-5 h-5 ${statusInfo.className}`} />
          </div>
          <div>
            <p className="font-medium text-sm">
              {config.label}
              {config.required && <span className="text-destructive ml-1">*</span>}
            </p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
            {doc?.file_name && status !== "missing" && (
              <p className="text-xs text-muted-foreground mt-1">
                {doc.file_name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={status === "accepted" ? "default" : status === "rejected" ? "destructive" : "secondary"}
            className="flex items-center gap-1"
          >
            <StatusIcon className={`w-3 h-3 ${status === "validating" ? "animate-spin" : ""}`} />
            {statusInfo.label}
          </Badge>

          <input
            type="file"
            ref={(el) => (fileInputRefs.current[config.type] = el)}
            onChange={handleFileSelect(config.type)}
            accept="image/*,.pdf"
            className="hidden"
          />

          <Button
            variant={status === "missing" ? "default" : "outline"}
            size="sm"
            onClick={() => triggerFileInput(config.type)}
            disabled={isCurrentlyUploading || status === "validating"}
          >
            {isCurrentlyUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4 mr-1" />
                {status === "missing" ? "Upload" : "Replace"}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
        <p className="text-muted-foreground mt-1">
          Uploaded files are checked instantly. If something needs attention, you'll see exactly what to fix.
        </p>
      </div>

      {/* Company Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {companyDocs.map(renderDocumentRow)}
        </CardContent>
      </Card>

      {/* Owner Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Owner Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ownerDocs.map(renderDocumentRow)}
        </CardContent>
      </Card>

      {/* Optional Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Optional Documents
            <Badge variant="secondary" className="ml-2">Recommended</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {optionalDocs.map(renderDocumentRow)}
        </CardContent>
      </Card>

      {/* Validation Status */}
      {!allRequiredAccepted && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>
            Please upload all required documents to proceed, or skip for now and upload them later from your profile settings.
          </span>
        </div>
      )}

      {/* Skip for now option */}
      {!allRequiredAccepted && (
        <div className="flex items-center justify-between p-4 rounded-lg border border-dashed bg-muted/30">
          <div>
            <p className="font-medium text-sm">Don't have all documents ready?</p>
            <p className="text-xs text-muted-foreground">
              You can skip this step and upload documents later. Your account will have limited functionality until verification is complete.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              skipDocuments();
              // Redirect to settings if logged in, otherwise to signup
              navigate(user ? "/settings" : "/signup");
            }}
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip for now
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/onboarding-local/compliance")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => navigate("/onboarding-local/review")}
          disabled={!allRequiredAccepted}
          size="lg"
        >
          Continue to Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

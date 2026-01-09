import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Building2,
  User,
} from "lucide-react";
import { useLocalOnboarding } from "@/hooks/use-local-onboarding";
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

export default function DocumentsVerification() {
  const { data, addDocument, isLoading } = useLocalOnboarding();
  const [uploadingType, setUploadingType] = useState<DocType | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Check if user skipped documents during onboarding
  const hasSkippedDocuments = data.documentsSkipped;

  const getDocumentStatus = (type: DocType) => {
    return data.documents[type]?.status || "missing";
  };

  const getDocumentData = (type: DocType) => {
    return data.documents[type];
  };

  const handleUpload = async (type: DocType, file: File) => {
    setUploadingType(type);
    
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

  // Check verification status
  const requiredDocs = documentConfig.filter((d) => d.required);
  const acceptedDocs = requiredDocs.filter((d) => getDocumentStatus(d.type) === "accepted");
  const allRequiredAccepted = acceptedDocs.length === requiredDocs.length;

  const companyDocs = documentConfig.filter((d) => d.section === "company");
  const ownerDocs = documentConfig.filter((d) => d.section === "owner");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if user didn't skip documents and hasn't started onboarding
  if (!hasSkippedDocuments && Object.keys(data.documents).length === 0 && !data.company.confirmed_by_user) {
    return null;
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
        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            status === "accepted" ? "bg-green-100 dark:bg-green-950" :
            status === "rejected" ? "bg-red-100 dark:bg-red-950" :
            "bg-muted"
          }`}>
            <FileText className={`w-4 h-4 ${statusInfo.className}`} />
          </div>
          <div>
            <p className="font-medium text-sm">
              {config.label}
              {config.required && <span className="text-destructive ml-1">*</span>}
            </p>
            {doc?.file_name && status !== "missing" && (
              <p className="text-xs text-muted-foreground">
                {doc.file_name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={status === "accepted" ? "default" : status === "rejected" ? "destructive" : "secondary"}
            className="flex items-center gap-1 text-xs"
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Document Verification</CardTitle>
            <CardDescription>
              {allRequiredAccepted 
                ? "All required documents verified"
                : `${acceptedDocs.length}/${requiredDocs.length} required documents verified`
              }
            </CardDescription>
          </div>
          {allRequiredAccepted ? (
            <Badge className="bg-green-500/10 text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending verification notice */}
        {!allRequiredAccepted && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Upload all required documents to complete verification and unlock full account features.
            </span>
          </div>
        )}

        {/* Company Documents */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building2 className="w-4 h-4" />
            Company Documents
          </div>
          <div className="space-y-2">
            {companyDocs.map(renderDocumentRow)}
          </div>
        </div>

        {/* Owner Documents */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <User className="w-4 h-4" />
            Owner Documents
          </div>
          <div className="space-y-2">
            {ownerDocs.map(renderDocumentRow)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

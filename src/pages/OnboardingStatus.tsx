import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  User,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  XCircle,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Globe,
  CreditCard
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Clock, description: "Your application is saved as a draft" },
  submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-600", icon: Clock, description: "Your application is awaiting review" },
  in_review: { label: "In Review", color: "bg-amber-500/10 text-amber-600", icon: RefreshCw, description: "Our team is reviewing your application" },
  needs_info: { label: "Needs Information", color: "bg-orange-500/10 text-orange-600", icon: AlertCircle, description: "Additional information is required" },
  approved: { label: "Approved", color: "bg-green-500/10 text-green-600", icon: CheckCircle2, description: "Your application has been approved" },
  not_approved: { label: "Not Approved", color: "bg-destructive/10 text-destructive", icon: XCircle, description: "Your application was not approved" },
};

const docTypeLabels: Record<string, string> = {
  trade_license: "Trade License",
  moa_aoa: "Memorandum of Association",
  emirates_id_front: "Emirates ID (Front)",
  emirates_id_back: "Emirates ID (Back)",
  passport: "Passport",
  proof_of_address: "Proof of Address",
};

const volumeBandLabels: Record<string, string> = {
  "0_50k": "AED 0 - 50,000",
  "50_200k": "AED 50,000 - 200,000",
  "200k_plus": "AED 200,000+",
};

const accountPurposeLabels: Record<string, string> = {
  invoice_clients: "Invoice Clients",
  pay_suppliers: "Pay Suppliers",
  both: "Both",
};

const customerLocationLabels: Record<string, string> = {
  uae: "UAE",
  gcc: "GCC Region",
  international: "International",
};

export default function OnboardingStatus() {
  const { user } = useAuth();

  // Fetch onboarding case
  const { data: onboardingCase, isLoading: caseLoading } = useQuery({
    queryKey: ["onboarding-case-status", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_cases")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch company profile
  const { data: companyProfile, isLoading: companyLoading } = useQuery({
    queryKey: ["company-profile-status", onboardingCase?.id],
    enabled: !!onboardingCase?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("case_id", onboardingCase!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch owner/person
  const { data: owner, isLoading: ownerLoading } = useQuery({
    queryKey: ["owner-status", onboardingCase?.id],
    enabled: !!onboardingCase?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_persons")
        .select("*")
        .eq("case_id", onboardingCase!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch compliance answers
  const { data: compliance, isLoading: complianceLoading } = useQuery({
    queryKey: ["compliance-status", onboardingCase?.id],
    enabled: !!onboardingCase?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_answers")
        .select("*")
        .eq("case_id", onboardingCase!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch documents
  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ["documents-status", onboardingCase?.id],
    enabled: !!onboardingCase?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_documents")
        .select("*")
        .eq("case_id", onboardingCase!.id);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch events for timeline
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["onboarding-events-status", onboardingCase?.id],
    enabled: !!onboardingCase?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_events")
        .select("*")
        .eq("case_id", onboardingCase!.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = caseLoading || companyLoading || ownerLoading || complianceLoading || docsLoading || eventsLoading;
  const currentStatus = onboardingCase?.status || "draft";
  const config = statusConfig[currentStatus] || statusConfig.draft;
  const StatusIcon = config.icon;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!onboardingCase) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Application Status</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No application found.</p>
            <Button asChild className="mt-4 gradient-primary">
              <Link to="/start">Start Application</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Application Status</h1>
        <p className="text-muted-foreground mt-1">View your submitted application details</p>
      </div>

      {/* Status Banner */}
      <Card className={`border-primary/30 ${config.color.replace('text-', 'bg-').split(' ')[0]}/5`}>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${config.color}`}>
                <StatusIcon className={`h-6 w-6 ${currentStatus === "in_review" ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
              </div>
              <div>
                <Badge className={`${config.color} border-0 mb-2`}>{config.label}</Badge>
                <h2 className="font-display font-bold text-xl">
                  {currentStatus === "submitted" && "Application Submitted"}
                  {currentStatus === "in_review" && "We're reviewing your application"}
                  {currentStatus === "approved" && "Congratulations! You're approved"}
                  {currentStatus === "needs_info" && "We need more information"}
                  {currentStatus === "not_approved" && "Application not approved"}
                  {currentStatus === "draft" && "Complete your application"}
                </h2>
                <p className="text-muted-foreground mt-1">{config.description}</p>
                {onboardingCase.sla_text && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {onboardingCase.sla_text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Application ID</p>
              <p className="font-medium font-mono text-sm">{onboardingCase.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="font-medium">
                {onboardingCase.submitted_at 
                  ? format(new Date(onboardingCase.submitted_at), "PPP 'at' p")
                  : "Not yet submitted"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Entity Type</p>
              <p className="font-medium">Dubai Single Owner (UAE Resident)</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Risk Level</p>
              <Badge variant="outline" className="capitalize">{onboardingCase.risk_level}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      {companyProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{companyProfile.company_legal_name || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Trade License</p>
                <p className="font-medium">{companyProfile.trade_license_number || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Issuing Authority</p>
                <p className="font-medium">{companyProfile.issuing_authority || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Legal Form</p>
                <p className="font-medium">{companyProfile.legal_form || "—"}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm text-muted-foreground">Business Activity</p>
                <p className="font-medium">{companyProfile.business_activity || "—"}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Registered Address
                </p>
                <p className="font-medium">{companyProfile.registered_address || "—"}</p>
              </div>
              {companyProfile.operating_address && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground">Operating Address</p>
                  <p className="font-medium">{companyProfile.operating_address}</p>
                </div>
              )}
              {companyProfile.website && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Website
                  </p>
                  <p className="font-medium">{companyProfile.website}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Owner Information */}
      {owner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{owner.full_name || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nationality</p>
                <p className="font-medium">{owner.nationality || "—"}</p>
              </div>
              {owner.dob && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{format(new Date(owner.dob), "PPP")}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">UAE Resident</p>
                <p className="font-medium">{owner.is_uae_resident ? "Yes" : "No"}</p>
              </div>
              {owner.email && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium">{owner.email}</p>
                </div>
              )}
              {owner.phone && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium">{owner.phone}</p>
                </div>
              )}
              {owner.emirates_id_number && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Emirates ID
                  </p>
                  <p className="font-medium font-mono">{owner.emirates_id_number}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ownership</p>
                <p className="font-medium">{owner.ownership_percent}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Roles</p>
                <div className="flex flex-wrap gap-1">
                  {owner.roles?.map((role: string) => (
                    <Badge key={role} variant="secondary" className="capitalize text-xs">
                      {role.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Information */}
      {compliance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Account Purpose</p>
                <p className="font-medium">{accountPurposeLabels[compliance.account_use_purpose || ""] || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Expected Monthly Volume</p>
                <p className="font-medium">{volumeBandLabels[compliance.expected_monthly_volume_band || ""] || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Customer Location</p>
                <p className="font-medium">{customerLocationLabels[compliance.customer_location || ""] || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cash Activity</p>
                <p className="font-medium">{compliance.cash_activity ? "Yes" : "No"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">PEP Status</p>
                <p className="font-medium capitalize">{compliance.pep_confirmation || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Other Controllers</p>
                <p className="font-medium">{compliance.other_controllers ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Submitted */}
      {documents && documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{docTypeLabels[doc.document_type] || doc.document_type}</span>
                      {doc.file_name && (
                        <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      doc.status === "accepted" 
                        ? "bg-accent/10 text-accent border-accent/20 gap-1"
                        : doc.status === "rejected"
                        ? "bg-destructive/10 text-destructive border-destructive/20 gap-1"
                        : "gap-1"
                    }
                  >
                    {doc.status === "accepted" && <CheckCircle2 className="h-3 w-3" />}
                    {doc.status === "rejected" && <XCircle className="h-3 w-3" />}
                    <span className="capitalize">{doc.status}</span>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {events && events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Timeline</CardTitle>
            <CardDescription>Track your application progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {events.map((event, index) => (
                <div key={event.id} className="flex gap-4 pb-6 last:pb-0">
                  {index !== events.length - 1 && (
                    <div className="absolute left-[15px] top-8 w-0.5 h-[calc(100%-2rem)] bg-border" />
                  )}
                  
                  <div className="relative z-10 h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">{event.event_type.replace(/_/g, " ")}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.created_at), "PPp")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      By {event.actor === "user" ? "You" : "System"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="bg-muted/50">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Need assistance?</p>
                <p className="text-sm text-muted-foreground">
                  Our team is here to help if you have any questions.
                </p>
              </div>
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/assistant">
                Contact Support <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

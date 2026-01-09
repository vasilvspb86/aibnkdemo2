import { useEffect } from "react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Shield,
  FileText,
  CheckSquare,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useOnboardingCase } from "@/hooks/use-onboarding-case";
import { useOnboardingProgress } from "@/hooks/use-onboarding-progress";

const tabs = [
  { id: "company", label: "Company", icon: Building2, path: "company" },
  { id: "ownership", label: "Owner & Roles", icon: Users, path: "ownership" },
  { id: "compliance", label: "Compliance", icon: Shield, path: "compliance" },
  { id: "documents", label: "Documents", icon: FileText, path: "documents" },
  { id: "review", label: "Review", icon: CheckSquare, path: "review" },
];

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  submitted: { label: "Submitted", variant: "default" },
  in_review: { label: "In Review", variant: "default" },
  needs_info: { label: "Needs Info", variant: "destructive" },
  approved: { label: "Approved", variant: "default" },
  not_approved: { label: "Not Approved", variant: "destructive" },
};

export default function OnboardingHub() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: onboardingCase, isLoading, error } = useOnboardingCase(caseId!);
  const progress = useOnboardingProgress(caseId!);

  // Get current tab from path
  const currentTab = location.pathname.split("/").pop() || "company";

  // Redirect to status page if case is submitted
  useEffect(() => {
    if (onboardingCase && onboardingCase.status !== "draft") {
      navigate(`/onboarding/${caseId}/status`);
    }
  }, [onboardingCase, caseId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !onboardingCase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Onboarding case not found</p>
          <Button onClick={() => navigate("/start")}>Start over</Button>
        </div>
      </div>
    );
  }

  const status = statusLabels[onboardingCase.status] || statusLabels.draft;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Status */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-primary">AI</span>BNK
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>

            {/* Help button */}
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4 mr-2" />
              Need help?
            </Button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Application progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Tabs */}
        <div className="container max-w-5xl mx-auto px-4">
          <Tabs value={currentTab} className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-0 gap-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  onClick={() => navigate(`/onboarding/${caseId}/${tab.path}`)}
                  className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <Outlet context={{ caseId, onboardingCase }} />
      </main>
    </div>
  );
}

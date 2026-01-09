import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
import { useLocalOnboarding } from "@/hooks/use-local-onboarding";

const tabs = [
  { id: "company", label: "Company", icon: Building2, path: "company" },
  { id: "ownership", label: "Owner & Roles", icon: Users, path: "ownership" },
  { id: "compliance", label: "Compliance", icon: Shield, path: "compliance" },
  { id: "documents", label: "Documents", icon: FileText, path: "documents" },
  { id: "review", label: "Review", icon: CheckSquare, path: "review" },
];

export default function OnboardingHubLocal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading, progress } = useLocalOnboarding();

  // Get current tab from path
  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[pathParts.length - 1] || "company";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If already submitted, redirect to signup
  if (data.submitted) {
    navigate("/signup");
    return null;
  }

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
              <Badge variant="secondary">Draft</Badge>
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
                  onClick={() => navigate(`/onboarding-local/${tab.path}`)}
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
        <Outlet />
      </main>
    </div>
  );
}

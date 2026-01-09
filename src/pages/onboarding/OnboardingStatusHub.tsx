import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle2,
  Clock,
  FileSearch,
  Building2,
  CreditCard,
  MessageSquare,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { useOnboardingCase } from "@/hooks/use-onboarding-case";
import { useOnboardingEvents } from "@/hooks/use-onboarding-events";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const statusLabels: Record<string, { label: string; description: string; variant: "default" | "secondary" | "destructive" }> = {
  submitted: {
    label: "Submitted",
    description: "Your application has been received and is awaiting review.",
    variant: "secondary",
  },
  in_review: {
    label: "In Review",
    description: "Our team is reviewing your application.",
    variant: "default",
  },
  needs_info: {
    label: "Needs Information",
    description: "We need additional information to proceed.",
    variant: "destructive",
  },
  approved: {
    label: "Approved",
    description: "Congratulations! Your application has been approved.",
    variant: "default",
  },
  not_approved: {
    label: "Not Approved",
    description: "Unfortunately, we couldn't approve your application at this time.",
    variant: "destructive",
  },
};

const timelineSteps = [
  { id: "submitted", label: "Application Submitted", icon: CheckCircle2 },
  { id: "validation", label: "Document Validation", icon: FileSearch },
  { id: "compliance", label: "Compliance Review", icon: Building2 },
  { id: "account_setup", label: "Account Setup", icon: CreditCard },
];

export default function OnboardingStatusHub() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { data: onboardingCase, isLoading, refetch } = useOnboardingCase(caseId!);
  const { events, isLoading: eventsLoading } = useOnboardingEvents(caseId!);
  const [currentStep, setCurrentStep] = useState(0);

  // Simulate status progression for demo
  useEffect(() => {
    if (onboardingCase?.status === "submitted") {
      // Auto-transition to in_review after 5 seconds
      const timer = setTimeout(async () => {
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

        refetch();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [onboardingCase?.status, caseId, refetch]);

  // Update timeline step based on status
  useEffect(() => {
    if (onboardingCase) {
      switch (onboardingCase.status) {
        case "submitted":
          setCurrentStep(0);
          break;
        case "in_review":
          setCurrentStep(1);
          break;
        case "approved":
          setCurrentStep(3);
          break;
        default:
          setCurrentStep(1);
      }
    }
  }, [onboardingCase?.status]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!onboardingCase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Application not found</p>
          <Button onClick={() => navigate("/start")}>Start new application</Button>
        </div>
      </div>
    );
  }

  const status = statusLabels[onboardingCase.status] || statusLabels.submitted;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-primary">AI</span>BNK
            </h1>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4 mr-2" />
              Need help?
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Status Banner */}
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Badge variant={status.variant} className="text-sm px-3 py-1">
                    {status.label}
                  </Badge>
                </div>
                <p className="text-lg font-medium mt-2">{status.description}</p>
                <p className="text-sm text-muted-foreground">
                  {onboardingCase.sla_text}
                </p>
              </div>
              {onboardingCase.status === "approved" && (
                <Button onClick={() => navigate("/dashboard")} size="lg">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted" />

              <div className="space-y-6">
                {timelineSteps.map((step, index) => {
                  const isComplete = index < currentStep;
                  const isCurrent = index === currentStep;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.id} className="relative flex gap-4">
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          isComplete
                            ? "border-primary bg-primary text-primary-foreground"
                            : isCurrent
                            ? "border-primary bg-background"
                            : "border-muted bg-background"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isCurrent ? (
                          <Clock className="w-5 h-5 text-primary" />
                        ) : (
                          <StepIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <p
                          className={`font-medium ${
                            isComplete || isCurrent ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            In progress
                          </p>
                        )}
                        {isComplete && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">
                            Complete
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Inbox */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            {onboardingCase.status === "needs_info" ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We need additional information to proceed with your application.
                </p>
                <Button>View Required Actions</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Nothing needed right now. We'll notify you if anything changes.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {!eventsLoading && events && events.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium capitalize">
                        {event.event_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-muted-foreground">
                        {format(new Date(event.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.actor}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Help Section */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            If we need anything, it will appear here—no email chasing.
          </p>
          <Button variant="link" className="text-primary">
            Contact Support
          </Button>
        </div>
      </main>
    </div>
  );
}

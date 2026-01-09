import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, User, CreditCard, CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";
import { useLocalOnboarding, clearLocalOnboardingData } from "@/hooks/use-local-onboarding";

const requirements = [
  {
    icon: FileText,
    title: "Trade License",
    description: "Your valid Dubai trade license number",
  },
  {
    icon: User,
    title: "Emirates ID",
    description: "Front and back of your Emirates ID",
  },
  {
    icon: CreditCard,
    title: "Passport",
    description: "Your valid passport (data page)",
  },
];

export default function OnboardingWelcome() {
  const navigate = useNavigate();
  const { data, progress } = useLocalOnboarding();
  
  // Check if there's existing onboarding data
  const hasExistingData = data.company.confirmed_by_user || 
                          data.owner.full_name || 
                          Object.keys(data.documents).length > 0;

  const handleStartFresh = () => {
    clearLocalOnboardingData();
    // Force reload to reset state
    window.location.href = "/onboarding-local/company";
  };

  const handleContinue = () => {
    navigate("/onboarding-local/company");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">AI</span>BNK
          </h1>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Open your business account
              </h2>
              <p className="text-muted-foreground">
                Most single-owner UAE businesses submit in ~10 minutes.
              </p>
            </div>

            {/* Requirements */}
            <div className="space-y-4 py-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                What you'll need
              </p>
              <div className="space-y-3">
                {requirements.map((req) => (
                  <div
                    key={req.title}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <req.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{req.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            {hasExistingData ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    You have a saved application ({progress}% complete)
                  </p>
                </div>
                <Button
                  onClick={handleContinue}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  Continue Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={handleStartFresh}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start Fresh
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleContinue}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                Start
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {/* Trust message */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No repeated uploads. If we need anything, you'll see it in the app.</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Already started?{" "}
          <button
            onClick={() => navigate("/signin")}
            className="text-primary hover:underline font-medium"
          >
            Sign in to continue
          </button>
        </p>
      </div>
    </div>
  );
}

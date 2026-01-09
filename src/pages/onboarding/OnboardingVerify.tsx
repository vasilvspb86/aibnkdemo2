import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = "contact" | "otp";

export default function OnboardingVerify() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("contact");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // If user is already logged in, create case and redirect
  const handleCreateCase = async (userId: string) => {
    try {
      // Create onboarding case
      const { data: caseData, error: caseError } = await supabase
        .from("onboarding_cases")
        .insert({ user_id: userId })
        .select()
        .single();

      if (caseError) throw caseError;

      // Create empty company profile
      const { error: profileError } = await supabase
        .from("company_profiles")
        .insert({ case_id: caseData.id });

      if (profileError) throw profileError;

      // Create empty compliance answers
      const { error: complianceError } = await supabase
        .from("compliance_answers")
        .insert({ case_id: caseData.id });

      if (complianceError) throw complianceError;

      // Create onboarding event
      await supabase.from("onboarding_events").insert({
        case_id: caseData.id,
        event_type: "case_created",
        actor: "user",
      });

      toast.success("Verification complete!");
      navigate(`/onboarding/${caseData.id}/company`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create onboarding case");
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      // For demo: simulate OTP send
      // In production, this would use Supabase Auth OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOtpSent(true);
      setStep("otp");
      toast.success("Verification code sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      // For demo: accept any 6-digit code and sign up/in the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password: `temp-${Date.now()}-${Math.random().toString(36)}`,
        options: {
          data: {
            phone,
          },
        },
      });

      if (error) {
        // If user exists, try to sign in (demo mode - would use magic link in production)
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in.");
          navigate("/signin");
          return;
        }
        throw error;
      }

      if (data.user) {
        await handleCreateCase(data.user.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // If already logged in, check for existing case or create new one
  if (user && !authLoading) {
    const checkExistingCase = async () => {
      const { data: existingCase } = await supabase
        .from("onboarding_cases")
        .select("id, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingCase) {
        if (existingCase.status === "draft") {
          navigate(`/onboarding/${existingCase.id}/company`);
        } else {
          navigate(`/onboarding/${existingCase.id}/status`);
        }
      } else {
        handleCreateCase(user.id);
      }
    };
    checkExistingCase();
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">AI</span>BNK
          </h1>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
          <CardContent className="p-8 space-y-6">
            {step === "contact" ? (
              <>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Verify your identity
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    We'll send you a verification code to get started.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="sara@company.ae"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+971 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/start")}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSendOtp}
                    className="flex-1"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Send code
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Enter verification code
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <div className="flex justify-center py-4">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("contact");
                      setOtp("");
                    }}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    className="flex-1"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Verify
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive the code?{" "}
                  <button
                    onClick={handleSendOtp}
                    className="text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Resend
                  </button>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

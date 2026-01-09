import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { getLocalOnboardingData, clearLocalOnboardingData, LocalOnboardingData } from "@/hooks/use-local-onboarding";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Check for pending onboarding data
  const onboardingData = getLocalOnboardingData();
  const hasOnboardingData = onboardingData?.submitted === true;

  // Pre-fill name from onboarding if available
  useEffect(() => {
    if (onboardingData?.owner?.full_name && !displayName) {
      setDisplayName(onboardingData.owner.full_name);
    }
    if (onboardingData?.owner?.email && !email) {
      setEmail(onboardingData.owner.email);
    }
  }, [onboardingData]);

  // Save onboarding data to database
  const saveOnboardingToDatabase = async (userId: string, data: LocalOnboardingData) => {
    try {
      // 1. Create onboarding case
      const { data: caseData, error: caseError } = await supabase
        .from("onboarding_cases")
        .insert({
          user_id: userId,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          progress_percent: 100,
        })
        .select()
        .single();

      if (caseError) throw caseError;

      const caseId = caseData.id;

      // 2. Create company profile
      await supabase.from("company_profiles").insert({
        case_id: caseId,
        issuing_authority: data.company.issuing_authority,
        trade_license_number: data.company.trade_license_number,
        company_legal_name: data.company.company_legal_name,
        legal_form: data.company.legal_form,
        registered_address: data.company.registered_address,
        business_activity: data.company.business_activity,
        operating_address: data.company.operating_address || null,
        website: data.company.website || null,
        prefill_source: data.company.prefill_source,
        confirmed_by_user: data.company.confirmed_by_user,
      });

      // 3. Create onboarding person (owner)
      await supabase.from("onboarding_persons").insert({
        case_id: caseId,
        full_name: data.owner.full_name,
        dob: data.owner.dob || null,
        nationality: data.owner.nationality,
        email: data.owner.email || null,
        phone: data.owner.phone || null,
        emirates_id_number: data.owner.emirates_id_number || null,
        roles: data.owner.roles as any,
        ownership_percent: data.owner.ownership_percent,
        is_uae_resident: data.owner.is_uae_resident,
      });

      // 4. Create compliance answers
      await supabase.from("compliance_answers").insert({
        case_id: caseId,
        account_use_purpose: data.compliance.account_use_purpose as any,
        expected_monthly_volume_band: data.compliance.expected_monthly_volume_band as any,
        customer_location: data.compliance.customer_location as any,
        cash_activity: data.compliance.cash_activity,
        pep_confirmation: data.compliance.pep_confirmation as any,
        other_controllers: data.compliance.other_controllers,
      });

      // 5. Create document records (without actual file upload for now)
      const docPromises = Object.entries(data.documents).map(([docType, docData]) =>
        supabase.from("onboarding_documents").insert({
          case_id: caseId,
          document_type: docType as any,
          file_name: docData.file_name,
          status: "accepted" as any,
          uploaded_at: docData.uploaded_at,
        })
      );
      await Promise.all(docPromises);

      // 6. Create audit event
      await supabase.from("onboarding_events").insert({
        case_id: caseId,
        event_type: "case_submitted",
        actor: "user",
        metadata: { source: "signup_flow" },
      });

      // 7. Auto-progress to in_review after a short delay (simulated)
      setTimeout(async () => {
        try {
          // Update case status to in_review
          await supabase
            .from("onboarding_cases")
            .update({ status: "in_review" })
            .eq("id", caseId);
          
          // Create in_review event
          await supabase.from("onboarding_events").insert({
            case_id: caseId,
            event_type: "case_in_review",
            actor: "system",
            metadata: { note: "Application moved to review queue" },
          });
        } catch (err) {
          console.error("Auto-progress error:", err);
        }
      }, 5000); // 5 seconds delay

      // 7. Update user profile with phone if available
      if (data.owner.phone) {
        await supabase.from("profiles").upsert({
          user_id: userId,
          display_name: data.owner.full_name,
          phone: data.owner.phone,
        });
      }

      return caseId;
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, displayName);

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Wait a moment for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (user && hasOnboardingData && onboardingData) {
        try {
          await saveOnboardingToDatabase(user.id, onboardingData);
          clearLocalOnboardingData();
          toast.success("Account created! Your business application has been submitted.");
        } catch (saveError) {
          console.error("Failed to save onboarding:", saveError);
          toast.success("Account created! Some onboarding data may need to be re-entered.");
        }
      } else {
        toast.success("Account created successfully!");
      }

      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="glass border-border/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold">AIBNK</span>
            </div>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              {hasOnboardingData 
                ? "Complete your registration to submit your application" 
                : "Enter your details to get started"}
            </CardDescription>
          </CardHeader>

          {/* Show onboarding summary if available */}
          {hasOnboardingData && onboardingData && (
            <div className="px-6 pb-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Application Ready
                  </span>
                </div>
                <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <p><span className="font-medium">Company:</span> {onboardingData.company.company_legal_name}</p>
                  <p><span className="font-medium">Owner:</span> {onboardingData.owner.full_name}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {Object.keys(onboardingData.documents).length} documents
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Ready to submit
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full gradient-primary"
                disabled={loading}
              >
                {loading 
                  ? "Creating account..." 
                  : hasOnboardingData 
                    ? "Create Account & Submit Application" 
                    : "Create account"}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link to="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

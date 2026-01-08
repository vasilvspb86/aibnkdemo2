import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Building2, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a valid recovery session
    if (!session) {
      // Give it a moment for the auth state to load
      const timer = setTimeout(() => {
        if (!session) {
          toast.error("Invalid or expired reset link");
          navigate("/forgot-password");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Password updated successfully!");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glass border-border/50">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl">Password updated!</CardTitle>
              <CardDescription>
                Your password has been successfully reset
              </CardDescription>
            </CardHeader>
            
            <CardFooter>
              <Button 
                className="w-full gradient-primary"
                onClick={() => navigate("/dashboard")}
              >
                Continue to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass border-border/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold">AIBNK</span>
            </div>
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                className="w-full gradient-primary"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

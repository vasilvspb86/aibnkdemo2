import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";

export default function SignIn() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 gradient-primary p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32" />
        
        <Link to="/" className="flex items-center gap-3 relative">
          <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-xl">AIBNK</span>
        </Link>

        <div className="relative">
          <h1 className="text-4xl font-display font-bold leading-tight">
            Banking designed for modern businesses
          </h1>
          <p className="text-white/80 mt-4 text-lg">
            Manage your accounts, cards, payments, and credit — all from one powerful platform.
          </p>
        </div>

        <p className="text-white/60 text-sm relative">
          © 2024 AIBNK. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">AIBNK</span>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
              <CardDescription>Sign in to your AIBNK account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@company.com" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Password</Label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Link to="/dashboard" className="block">
                <Button className="w-full gradient-primary gap-2">
                  Sign In <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/onboarding" className="text-primary hover:underline">
                  Open account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

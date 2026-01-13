import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ArrowRight, CheckCircle2, Zap, Shield, TrendingUp, CreditCard, FileText, Sparkles, Globe, Clock, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const features = [{
  icon: Zap,
  title: "60-Second Onboarding",
  description: "Get your business account up and running in under a minute with our streamlined KYB process."
}, {
  icon: CreditCard,
  title: "Smart Business Cards",
  description: "Issue virtual and physical cards with granular spending controls and real-time tracking."
}, {
  icon: FileText,
  title: "Invoicing & Expenses",
  description: "Create professional invoices and track expenses with AI-powered categorization."
}, {
  icon: TrendingUp,
  title: "Working Capital",
  description: "Access credit facilities based on your business performance, not just paperwork."
}, {
  icon: Sparkles,
  title: "AI Assistant",
  description: "Your intelligent banking companion that helps manage finances through conversation."
}, {
  icon: Globe,
  title: "Multi-Currency Ready",
  description: "Send and receive payments globally with competitive FX rates."
}];

const stats = [{
  value: "< 10 min",
  label: "Account Opening"
}, {
  value: "24/7",
  label: "AI Support"
}, {
  value: "150+",
  label: "Countries Supported"
}];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (user) {
      navigate("/dashboard");
    }
  };

  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={handleLogoClick}
            className={`flex items-center gap-3 ${user ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          >
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">AIBNK</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            {user ? (
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            ) : (
              <Link to="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            )}
            <Link to="/onboarding">
              <Button className="gradient-primary">Get Started</Button>
            </Link>
          </nav>
          <Link to="/onboarding" className="md:hidden">
            <Button size="sm" className="gradient-primary">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-accent/10 text-accent border-0">
              Now accepting applications in UAE
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              The all-in-one platform for{" "}
              <span className="text-gradient">SME banking</span>
            </h1>
            <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
              Open your business account in under a minute. Manage payments, cards, invoices, and credit — 
              all powered by AI.
            </p>
            <div className="flex justify-center mt-10">
              <Link to="/onboarding">
                <Button size="lg" className="gradient-primary gap-2">
                  Open Free Account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto">
            {stats.map(stat => <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <p className="text-3xl font-display font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Everything your business needs
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              From day-to-day operations to growth financing, AIBNK provides the complete 
              financial toolkit for modern SMEs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map(feature => <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto gradient-primary text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
            <CardContent className="py-12 md:py-16 relative">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-display font-bold">
                  Ready to transform your business banking?
                </h2>
                <p className="text-white/80 mt-4 max-w-xl mx-auto">
                  Join thousands of SMEs who trust AIBNK for their financial operations. 
                  No paperwork, no waiting.
                </p>
                <Link to="/onboarding">
                  <Button size="lg" variant="secondary" className="mt-8 gap-2">
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">AIBNK</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 AIBNK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
}
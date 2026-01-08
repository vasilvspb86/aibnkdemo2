import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ArrowRight,
  Sparkles,
  Building2
} from "lucide-react";
import { useState } from "react";

const eligibilityFactors = [
  { name: "Account Age", score: 85, status: "good", description: "Active for 6+ months" },
  { name: "Transaction Volume", score: 72, status: "good", description: "Healthy monthly activity" },
  { name: "Payment History", score: 95, status: "excellent", description: "No late payments" },
  { name: "Cash Flow", score: 68, status: "fair", description: "Moderate stability" },
];

export default function Credit() {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const overallScore = 80;
  const maxCredit = 250000;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Working Capital</h1>
          <p className="text-muted-foreground mt-1">Access credit facilities for your business growth.</p>
        </div>
      </div>

      {/* Pre-Qualification Banner */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <Badge className="bg-accent/20 text-accent border-0 mb-2">Pre-Qualified</Badge>
                <h2 className="font-display font-bold text-xl">
                  You're eligible for up to AED {maxCredit.toLocaleString()}
                </h2>
                <p className="text-muted-foreground mt-1">
                  Based on your account performance and transaction history.
                </p>
              </div>
            </div>
            <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gradient-primary gap-2">
                  Apply Now <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Apply for Working Capital</DialogTitle>
                  <DialogDescription>
                    Tell us about your funding needs. This is indicative only and not a binding offer.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Requested Amount (AED)</Label>
                    <Input type="number" placeholder="e.g., 100000" />
                    <p className="text-xs text-muted-foreground">
                      You're pre-qualified for up to AED {maxCredit.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="What will you use the funds for?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inventory">Inventory Purchase</SelectItem>
                        <SelectItem value="equipment">Equipment & Assets</SelectItem>
                        <SelectItem value="expansion">Business Expansion</SelectItem>
                        <SelectItem value="cashflow">Cash Flow Management</SelectItem>
                        <SelectItem value="marketing">Marketing & Growth</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Repayment Period</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      This is an indicative pre-qualification. Final terms and approval are subject to 
                      additional review and documentation.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsApplyOpen(false)}>Cancel</Button>
                  <Button className="gradient-primary" onClick={() => setIsApplyOpen(false)}>
                    Submit Application
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Eligibility Score */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Eligibility Assessment
            </CardTitle>
            <CardDescription>
              Factors that determine your credit eligibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8 mb-8">
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - overallScore / 100)}
                    className="text-primary"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-display font-bold">{overallScore}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              </div>
              <div>
                <Badge className="bg-accent/20 text-accent border-0 mb-2">Excellent</Badge>
                <p className="text-lg font-medium">Your business is in great shape</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Strong performance across all key metrics
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {eligibilityFactors.map((factor) => (
                <div key={factor.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{factor.name}</p>
                      <p className="text-sm text-muted-foreground">{factor.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{factor.score}%</span>
                      {factor.status === "excellent" && <CheckCircle2 className="h-4 w-4 text-accent" />}
                      {factor.status === "good" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      {factor.status === "fair" && <Clock className="h-4 w-4 text-warning" />}
                    </div>
                  </div>
                  <Progress value={factor.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Check Eligibility</p>
                  <p className="text-xs text-muted-foreground">Instant pre-qualification based on your account</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Apply Online</p>
                  <p className="text-xs text-muted-foreground">Simple application, no paperwork</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Get Funded</p>
                  <p className="text-xs text-muted-foreground">Funds in your account within 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Active AIBNK account (6+ months)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Valid trade license
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Minimum monthly turnover
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  No outstanding defaults
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <Building2 className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="font-medium">Need a larger facility?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact our business banking team for customized solutions.
              </p>
              <Button variant="outline" className="mt-4 w-full">
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

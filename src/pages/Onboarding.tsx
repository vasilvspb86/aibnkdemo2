import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  User, 
  FileText, 
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const steps = [
  { id: 1, title: "Company Details", icon: Building2 },
  { id: 2, title: "People & UBO", icon: User },
  { id: 3, title: "Documents", icon: FileText },
  { id: 4, title: "Review", icon: CheckCircle2 },
];

export default function Onboarding() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const progress = (currentStep / steps.length) * 100;
  const logoLink = user ? "/dashboard" : "/";

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/onboarding/status");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="hidden lg:flex w-80 bg-sidebar p-8 flex-col">
        <Link to={logoLink} className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">AIBNK</h1>
            <p className="text-xs text-sidebar-foreground/60">Business Banking</p>
          </div>
        </Link>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                currentStep === step.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : currentStep > step.id
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/50"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  currentStep === step.id
                    ? "gradient-primary"
                    : currentStep > step.id
                    ? "bg-sidebar-primary/20"
                    : "bg-sidebar-accent"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-4 w-4 text-sidebar-primary" />
                ) : (
                  <step.icon className={`h-4 w-4 ${currentStep === step.id ? "text-white" : ""}`} />
                )}
              </div>
              <span className="font-medium text-sm">{step.title}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <Card className="bg-sidebar-accent border-sidebar-border">
            <CardContent className="pt-6">
              <Sparkles className="h-8 w-8 text-sidebar-primary mb-3" />
              <p className="font-medium text-sidebar-foreground">Need help?</p>
              <p className="text-sm text-sidebar-foreground/60 mt-1">
                Our team is here to assist you through the process.
              </p>
              <Button variant="outline" className="mt-4 w-full border-sidebar-border text-sidebar-foreground">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12">
        <div className="max-w-2xl mx-auto">
          {/* Mobile Progress */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
              <span className="text-sm text-muted-foreground">{steps[currentStep - 1].title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Company Details */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-display font-bold">Company Details</h1>
              <p className="text-muted-foreground mt-2 mb-8">
                Tell us about your business to get started.
              </p>

              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Company Legal Name</Label>
                    <Input placeholder="e.g., Acme Startup FZ-LLC" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Legal Form</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fzllc">Free Zone LLC</SelectItem>
                          <SelectItem value="llc">Limited Liability Company</SelectItem>
                          <SelectItem value="branch">Branch Office</SelectItem>
                          <SelectItem value="sole">Sole Proprietorship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Jurisdiction</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="difc">DIFC</SelectItem>
                          <SelectItem value="adgm">ADGM</SelectItem>
                          <SelectItem value="dmcc">DMCC</SelectItem>
                          <SelectItem value="jafza">JAFZA</SelectItem>
                          <SelectItem value="mainland">UAE Mainland</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Trade License Number</Label>
                    <Input placeholder="Enter your license number" />
                  </div>

                  <div className="space-y-2">
                    <Label>Business Activity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary activity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Technology & Software</SelectItem>
                        <SelectItem value="consulting">Consulting & Professional Services</SelectItem>
                        <SelectItem value="trading">General Trading</SelectItem>
                        <SelectItem value="ecommerce">E-commerce & Retail</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Registered Address</Label>
                    <Input placeholder="Building, Street, City" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expected Monthly Volume (AED)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50k">Less than 50,000</SelectItem>
                          <SelectItem value="100k">50,000 - 100,000</SelectItem>
                          <SelectItem value="500k">100,000 - 500,000</SelectItem>
                          <SelectItem value="1m">500,000 - 1,000,000</SelectItem>
                          <SelectItem value="1m+">More than 1,000,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Employees</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1-5</SelectItem>
                          <SelectItem value="6-20">6-20</SelectItem>
                          <SelectItem value="21-50">21-50</SelectItem>
                          <SelectItem value="51+">51+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: People & UBO */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-display font-bold">People & Ownership</h1>
              <p className="text-muted-foreground mt-2 mb-8">
                Provide details about directors and ultimate beneficial owners.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Primary Contact (You)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input placeholder="First name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input placeholder="Last name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="you@company.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input type="tel" placeholder="+971 50 123 4567" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ceo">CEO / Managing Director</SelectItem>
                          <SelectItem value="cfo">CFO / Finance Director</SelectItem>
                          <SelectItem value="director">Director</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ownership %</Label>
                      <Input type="number" placeholder="e.g., 100" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full gap-2">
                <User className="h-4 w-4" />
                Add Another Owner/Director
              </Button>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-display font-bold">Upload Documents</h1>
              <p className="text-muted-foreground mt-2 mb-8">
                We need these documents to verify your business.
              </p>

              <div className="space-y-4">
                {[
                  { name: "Trade License", required: true, description: "Valid UAE trade license" },
                  { name: "Memorandum of Association", required: true, description: "Company MoA/AoA" },
                  { name: "Passport / Emirates ID", required: true, description: "For all shareholders" },
                  { name: "Proof of Address", required: true, description: "Utility bill or bank statement" },
                  { name: "Bank Statements", required: false, description: "Last 6 months (optional)" },
                ].map((doc) => (
                  <Card key={doc.name}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{doc.name}</p>
                          {doc.required && (
                            <span className="text-xs text-destructive">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-display font-bold">Review & Submit</h1>
              <p className="text-muted-foreground mt-2 mb-8">
                Please review your information before submitting.
              </p>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company Name</span>
                      <span className="font-medium">Acme Startup FZ-LLC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Legal Form</span>
                      <span className="font-medium">Free Zone LLC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jurisdiction</span>
                      <span className="font-medium">DIFC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Activity</span>
                      <span className="font-medium">Technology & Software</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {["Trade License", "Memorandum of Association", "Passport", "Proof of Address"].map((doc) => (
                      <div key={doc} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      By submitting this application, you confirm that all information provided is accurate 
                      and you agree to AIBNK's Terms of Service and Privacy Policy.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={nextStep} className="gradient-primary gap-2">
              {currentStep === steps.length ? "Submit Application" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

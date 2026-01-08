import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  User,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";

const timelineEvents = [
  { 
    id: 1, 
    title: "Application Submitted", 
    description: "Your application has been received",
    status: "completed",
    date: "Jan 8, 2024 - 10:30 AM",
  },
  { 
    id: 2, 
    title: "Documents Verified", 
    description: "All documents have been verified",
    status: "completed",
    date: "Jan 8, 2024 - 11:45 AM",
  },
  { 
    id: 3, 
    title: "KYB Review", 
    description: "Our compliance team is reviewing your application",
    status: "in_progress",
    date: "In progress",
  },
  { 
    id: 4, 
    title: "Account Activation", 
    description: "Your account will be ready to use",
    status: "pending",
    date: "Pending",
  },
];

export default function OnboardingStatus() {
  const currentStatus = "in_review"; // draft, submitted, in_review, needs_info, approved, rejected

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">AIBNK</h1>
              <p className="text-xs text-muted-foreground">Business Banking</p>
            </div>
          </Link>
        </div>

        {/* Status Banner */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-primary animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <div>
                  <Badge className="bg-primary/20 text-primary border-0 mb-2">In Review</Badge>
                  <h2 className="font-display font-bold text-xl">We're reviewing your application</h2>
                  <p className="text-muted-foreground mt-1">
                    This typically takes 1-2 business days. We'll notify you once it's complete.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">Acme Startup FZ-LLC</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Application ID</p>
                <p className="font-medium font-mono">APP-2024-00847</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium">January 8, 2024</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Expected Completion</p>
                <p className="font-medium">January 10, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Status Timeline</CardTitle>
            <CardDescription>Track your application progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4 pb-8 last:pb-0">
                  {/* Line */}
                  {index !== timelineEvents.length - 1 && (
                    <div className="absolute left-[15px] top-8 w-0.5 h-[calc(100%-2rem)] bg-border" />
                  )}
                  
                  {/* Icon */}
                  <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    event.status === "completed" 
                      ? "bg-accent text-accent-foreground" 
                      : event.status === "in_progress"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {event.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : event.status === "in_progress" ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-current" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${event.status === "pending" ? "text-muted-foreground" : ""}`}>
                        {event.title}
                      </p>
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents Checklist */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Documents Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Trade License", status: "verified" },
                { name: "Memorandum of Association", status: "verified" },
                { name: "Passport - John Doe", status: "verified" },
                { name: "Proof of Address", status: "verified" },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>{doc.name}</span>
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-muted/50">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Need assistance?</p>
                  <p className="text-sm text-muted-foreground">
                    Our team is here to help if you have any questions.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                Contact Support <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

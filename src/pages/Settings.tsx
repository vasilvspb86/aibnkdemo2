import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/use-theme";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams } from "react-router-dom";
import DocumentsVerification from "@/components/settings/DocumentsVerification";
import { useLocalOnboarding } from "@/hooks/use-local-onboarding";
import { toast } from "sonner";
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Users,
  Plus,
  MoreHorizontal,
  Mail,
  Smartphone,
  Key,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  Loader2
} from "lucide-react";

const teamMembers = [
  { id: 1, name: "John Doe", email: "john@acme.com", role: "Admin", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@acme.com", role: "Finance Manager", status: "active" },
  { id: 3, name: "Mike Johnson", email: "mike@acme.com", role: "Employee", status: "pending" },
];

const kybStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Clock, description: "Your application is saved as a draft" },
  submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-600", icon: Clock, description: "Your application is awaiting review" },
  in_review: { label: "In Review", color: "bg-amber-500/10 text-amber-600", icon: Clock, description: "Our team is reviewing your application" },
  needs_info: { label: "Needs Information", color: "bg-orange-500/10 text-orange-600", icon: AlertCircle, description: "Additional information is required" },
  approved: { label: "Approved", color: "bg-green-500/10 text-green-600", icon: CheckCircle2, description: "Your application has been approved" },
  account_ready: { label: "Account Ready", color: "bg-accent/10 text-accent", icon: CheckCircle2, description: "Your account is active and ready to use" },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle, description: "Your application was not approved" },
};

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { organization, kybApplication, companyProfile, isLoading } = useDashboardData();
  const { user } = useAuth();
  const { data: localOnboardingData, progress: localProgress } = useLocalOnboarding();
  const [searchParams] = useSearchParams();
  
  // Determine default tab from URL params
  const defaultTab = searchParams.get("tab") || "profile";
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("display_name, phone")
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        const names = (data.display_name || "").split(" ");
        setFirstName(names[0] || "");
        setLastName(names.slice(1).join(" ") || "");
        setPhone(data.phone || "");
      }
    };
    
    loadProfile();
  }, [user?.id]);
  
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setProfileLoading(true);
    try {
      const displayName = `${firstName} ${lastName}`.trim();
      
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          display_name: displayName,
          phone: phone,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };
  
  const kybStatus = kybApplication?.status || null;
  const statusConfig = kybStatus ? kybStatusConfig[kybStatus] : null;
  
  // Check if user has local onboarding data in progress
  const hasLocalOnboarding = localOnboardingData.company.confirmed_by_user || 
                             localOnboardingData.owner.full_name || 
                             Object.keys(localOnboardingData.documents).length > 0;
  
  // Determine the next step in local onboarding
  const getOnboardingNextStep = () => {
    if (!localOnboardingData.company.confirmed_by_user) return "/onboarding-local/company";
    if (!localOnboardingData.owner.full_name) return "/onboarding-local/ownership";
    if (!localOnboardingData.compliance.account_use_purpose) return "/onboarding-local/compliance";
    return "/onboarding-local/documents";
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-medium text-primary">JD</span>
                </div>
                <Button variant="outline">Change Photo</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={user?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                />
              </div>
              <Button 
                className="gradient-primary" 
                onClick={handleSaveProfile}
                disabled={profileLoading}
              >
                {profileLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-blue-600 flex items-center justify-center overflow-hidden">
                    <Sun className={`h-5 w-5 text-white absolute transition-all duration-500 ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                    <Moon className={`h-5 w-5 text-white absolute transition-all duration-500 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={theme === 'dark'} 
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Transaction Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified for all transactions</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          {/* Onboarding Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Status</CardTitle>
              <CardDescription>Your business verification status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ) : !kybStatus ? (
                // Check for local onboarding - submitted vs in progress
                localOnboardingData.submitted ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/20">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Application Submitted</p>
                          <Badge className="bg-primary/10 text-primary border-primary/20">Submitted</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Your application is awaiting review
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                      <Link to="/onboarding-local/review">
                        Review Application
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : hasLocalOnboarding ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Continue your application</p>
                        <Badge variant="secondary">{localProgress}% complete</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {localOnboardingData.documentsSkipped 
                          ? "Upload required documents to complete verification"
                          : "Pick up where you left off to complete verification"
                        }
                      </p>
                    </div>
                    <Button asChild className="gradient-primary gap-2">
                      <Link to={localOnboardingData.documentsSkipped ? "/onboarding-local/documents" : getOnboardingNextStep()}>
                        Continue Application
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Complete your business verification</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start the onboarding process to unlock all features
                      </p>
                    </div>
                    <Button asChild className="gradient-primary gap-2">
                      <Link to="/onboarding-local/welcome">
                        Start Onboarding
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {statusConfig && (
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${statusConfig.color}`}>
                          <statusConfig.icon className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Application Status</p>
                          {statusConfig && (
                            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {statusConfig?.description}
                        </p>
                      </div>
                    </div>
                    {(kybStatus === "draft" || kybStatus === "needs_info") && (
                      <Button asChild variant="outline" className="gap-2">
                        <Link to="/onboarding">
                          {kybStatus === "draft" ? "Continue" : "Update Info"}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {(kybStatus !== "draft" && kybStatus !== "needs_info") && (
                      <Button asChild variant="outline" className="gap-2">
                        <Link to="/onboarding-status">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(kybStatus === "approved" || kybStatus === "account_ready" || kybStatus === "submitted" || kybStatus === "in_review") && (
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Your registered business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input 
                    value={companyProfile?.company_legal_name || organization?.name || "—"} 
                    disabled 
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trade License</Label>
                    <Input 
                      value={companyProfile?.trade_license_number || organization?.trade_license_number || "—"} 
                      disabled 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issuing Authority</Label>
                    <Input 
                      value={companyProfile?.issuing_authority || organization?.jurisdiction || "—"} 
                      disabled 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Legal Form</Label>
                  <Input 
                    value={companyProfile?.legal_form || organization?.legal_form || "—"} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Activity</Label>
                  <Input 
                    value={companyProfile?.business_activity || organization?.business_activity || "—"} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registered Address</Label>
                  <Input 
                    value={companyProfile?.registered_address || organization?.registered_address || "—"} 
                    disabled 
                  />
                </div>
                {companyProfile?.operating_address && (
                  <div className="space-y-2">
                    <Label>Operating Address</Label>
                    <Input value={companyProfile.operating_address} disabled />
                  </div>
                )}
                {(companyProfile?.website || organization?.website) && (
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input 
                      value={companyProfile?.website || organization?.website || "—"} 
                      disabled 
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  To update company information, please contact support.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Documents Verification Section - only show if not submitted */}
          {!localOnboardingData.submitted && <DocumentsVerification />}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage who has access to your account</CardDescription>
              </div>
              <Button className="gradient-primary gap-2">
                <Plus className="h-4 w-4" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name}</p>
                          {member.status === "pending" && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{member.role}</Badge>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" />
              </div>
              <Button className="gradient-primary">Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Key className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">Use an app to generate codes</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your active login sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">Dubai, UAE • Chrome on MacOS</p>
                  </div>
                  <Badge className="bg-accent/20 text-accent border-0">Active Now</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Sign Out All Other Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

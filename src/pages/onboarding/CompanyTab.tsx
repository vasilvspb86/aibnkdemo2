import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Loader2, Search, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { toast } from "sonner";

const issuingAuthorities = [
  { value: "ded_dubai", label: "DED Dubai (Department of Economic Development)" },
  { value: "dmcc", label: "DMCC (Dubai Multi Commodities Centre)" },
  { value: "difc", label: "DIFC (Dubai International Financial Centre)" },
  { value: "jafza", label: "JAFZA (Jebel Ali Free Zone)" },
  { value: "dafza", label: "DAFZA (Dubai Airport Free Zone)" },
  { value: "tecom", label: "TECOM (Technology, Electronic Commerce and Media)" },
  { value: "dso", label: "DSO (Dubai Silicon Oasis)" },
  { value: "rakez", label: "RAKEZ (Ras Al Khaimah Economic Zone)" },
  { value: "other", label: "Other" },
];

// Demo company data for prefill simulation
const DEMO_COMPANY = {
  company_legal_name: "TechServe Solutions LLC",
  legal_form: "Limited Liability Company",
  registered_address: "Office 1205, Business Bay Tower, Dubai, UAE",
  business_activity: "IT Consulting and Software Development Services",
};

type OutletContext = {
  caseId: string;
  onboardingCase: any;
};

export default function CompanyTab() {
  const { caseId } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const { data: companyProfile, isLoading, updateProfile, isUpdating } = useCompanyProfile(caseId);

  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState("");
  const [companyLegalName, setCompanyLegalName] = useState("");
  const [legalForm, setLegalForm] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [businessActivity, setBusinessActivity] = useState("");
  const [confirmedByUser, setConfirmedByUser] = useState(false);
  const [prefillSource, setPrefillSource] = useState<"registry_lookup" | "manual_entry" | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);

  // Load existing data
  useEffect(() => {
    if (companyProfile) {
      setIssuingAuthority(companyProfile.issuing_authority || "");
      setTradeLicenseNumber(companyProfile.trade_license_number || "");
      setCompanyLegalName(companyProfile.company_legal_name || "");
      setLegalForm(companyProfile.legal_form || "");
      setRegisteredAddress(companyProfile.registered_address || "");
      setBusinessActivity(companyProfile.business_activity || "");
      setConfirmedByUser(companyProfile.confirmed_by_user || false);
      setPrefillSource(companyProfile.prefill_source as any);
      setLookupDone(!!companyProfile.company_legal_name);
    }
  }, [companyProfile]);

  const handleLookup = async () => {
    if (!issuingAuthority || !tradeLicenseNumber) {
      toast.error("Please enter issuing authority and license number");
      return;
    }

    setIsLookingUp(true);
    
    // Simulate API lookup delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Demo: If license contains "DEMO" or "12345", use demo data
    if (tradeLicenseNumber.includes("DEMO") || tradeLicenseNumber.includes("12345")) {
      setCompanyLegalName(DEMO_COMPANY.company_legal_name);
      setLegalForm(DEMO_COMPANY.legal_form);
      setRegisteredAddress(DEMO_COMPANY.registered_address);
      setBusinessActivity(DEMO_COMPANY.business_activity);
      setPrefillSource("registry_lookup");
      toast.success("Company details retrieved successfully");
    } else {
      // For any other license, show "not found" and allow manual entry
      toast.info("Company not found in registry. Please enter details manually.");
      setPrefillSource("manual_entry");
    }

    setLookupDone(true);
    setIsLookingUp(false);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        issuing_authority: issuingAuthority,
        trade_license_number: tradeLicenseNumber,
        company_legal_name: companyLegalName,
        legal_form: legalForm,
        registered_address: registeredAddress,
        business_activity: businessActivity,
        confirmed_by_user: confirmedByUser,
        prefill_source: prefillSource,
      });

      toast.success("Company details saved");
      navigate(`/onboarding/${caseId}/ownership`);
    } catch (error: any) {
      toast.error(error.message || "Failed to save company details");
    }
  };

  const canProceed =
    issuingAuthority &&
    tradeLicenseNumber &&
    companyLegalName &&
    legalForm &&
    registeredAddress &&
    businessActivity &&
    confirmedByUser;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Company Details</h2>
        <p className="text-muted-foreground mt-1">
          Enter your trade license number to auto-fill your company information.
        </p>
      </div>

      {/* License Lookup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            License Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issuing_authority">Issuing Authority</Label>
              <Select value={issuingAuthority} onValueChange={setIssuingAuthority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select authority" />
                </SelectTrigger>
                <SelectContent>
                  {issuingAuthorities.map((auth) => (
                    <SelectItem key={auth.value} value={auth.value}>
                      {auth.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade_license">Trade License Number</Label>
              <div className="flex gap-2">
                <Input
                  id="trade_license"
                  placeholder="e.g., 12345-DEMO"
                  value={tradeLicenseNumber}
                  onChange={(e) => setTradeLicenseNumber(e.target.value)}
                />
                <Button
                  onClick={handleLookup}
                  disabled={isLookingUp || !issuingAuthority || !tradeLicenseNumber}
                  variant="secondary"
                >
                  {isLookingUp ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Fetch"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {prefillSource === "registry_lookup" && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Company details retrieved from registry</span>
            </div>
          )}

          {prefillSource === "manual_entry" && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>Please enter your company details manually below</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Details Section */}
      {lookupDone && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Legal Name</Label>
                <Input
                  id="company_name"
                  value={companyLegalName}
                  onChange={(e) => setCompanyLegalName(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_form">Legal Form</Label>
                <Input
                  id="legal_form"
                  value={legalForm}
                  onChange={(e) => setLegalForm(e.target.value)}
                  placeholder="e.g., LLC, Free Zone LLC"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registered_address">Registered Address</Label>
              <Input
                id="registered_address"
                value={registeredAddress}
                onChange={(e) => setRegisteredAddress(e.target.value)}
                placeholder="Enter registered address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_activity">Business Activity</Label>
              <Input
                id="business_activity"
                value={businessActivity}
                onChange={(e) => setBusinessActivity(e.target.value)}
                placeholder="e.g., IT Consulting"
              />
            </div>

            {/* Confirmation */}
            <div className="flex items-start space-x-3 pt-4 border-t">
              <Checkbox
                id="confirm"
                checked={confirmedByUser}
                onCheckedChange={(checked) => setConfirmedByUser(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="confirm"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  These details are correct
                </label>
                <p className="text-sm text-muted-foreground">
                  I confirm the company information above is accurate and matches my trade license.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!canProceed || isUpdating}
          size="lg"
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Save & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

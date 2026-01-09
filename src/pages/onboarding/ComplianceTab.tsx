import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Loader2, Shield } from "lucide-react";
import { useComplianceAnswers } from "@/hooks/use-compliance-answers";
import { toast } from "sonner";

type OutletContext = {
  caseId: string;
  onboardingCase: any;
};

export default function ComplianceTab() {
  const { caseId } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const { data: compliance, isLoading, updateCompliance, isUpdating } = useComplianceAnswers(caseId);

  const [accountUsePurpose, setAccountUsePurpose] = useState<string>("");
  const [expectedVolumeBand, setExpectedVolumeBand] = useState<string>("");
  const [customerLocation, setCustomerLocation] = useState<string>("");
  const [cashActivity, setCashActivity] = useState(false);
  const [pepConfirmation, setPepConfirmation] = useState<string>("");
  const [otherControllers, setOtherControllers] = useState(false);

  // Load existing data
  useEffect(() => {
    if (compliance) {
      setAccountUsePurpose(compliance.account_use_purpose || "");
      setExpectedVolumeBand(compliance.expected_monthly_volume_band || "");
      setCustomerLocation(compliance.customer_location || "");
      setCashActivity(compliance.cash_activity || false);
      setPepConfirmation(compliance.pep_confirmation || "");
      setOtherControllers(compliance.other_controllers || false);
    }
  }, [compliance]);

  const handleSave = async () => {
    try {
      await updateCompliance({
        account_use_purpose: accountUsePurpose as any,
        expected_monthly_volume_band: expectedVolumeBand as any,
        customer_location: customerLocation as any,
        cash_activity: cashActivity,
        pep_confirmation: pepConfirmation as any,
        other_controllers: otherControllers,
      });

      toast.success("Compliance information saved");
      navigate(`/onboarding/${caseId}/documents`);
    } catch (error: any) {
      toast.error(error.message || "Failed to save compliance information");
    }
  };

  const canProceed =
    accountUsePurpose &&
    expectedVolumeBand &&
    customerLocation &&
    pepConfirmation;

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
        <h2 className="text-2xl font-semibold tracking-tight">Compliance</h2>
        <p className="text-muted-foreground mt-1">
          We ask only what's needed for regulatory checks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Account Use Purpose */}
          <div className="space-y-3">
            <Label className="text-base">
              What will you primarily use this account for?
            </Label>
            <RadioGroup
              value={accountUsePurpose}
              onValueChange={setAccountUsePurpose}
              className="grid gap-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="invoice_clients" id="invoice" />
                <Label htmlFor="invoice" className="flex-1 cursor-pointer">
                  Invoice clients and receive payments
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="pay_suppliers" id="suppliers" />
                <Label htmlFor="suppliers" className="flex-1 cursor-pointer">
                  Pay suppliers and vendors
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex-1 cursor-pointer">
                  Both — invoice clients and pay suppliers
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Expected Monthly Volume */}
          <div className="space-y-3">
            <Label className="text-base">
              Expected monthly transaction volume (AED)
            </Label>
            <RadioGroup
              value={expectedVolumeBand}
              onValueChange={setExpectedVolumeBand}
              className="grid gap-3 sm:grid-cols-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="0_50k" id="vol_low" />
                <Label htmlFor="vol_low" className="cursor-pointer">
                  0 – 50,000
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="50_200k" id="vol_mid" />
                <Label htmlFor="vol_mid" className="cursor-pointer">
                  50,000 – 200,000
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="200k_plus" id="vol_high" />
                <Label htmlFor="vol_high" className="cursor-pointer">
                  200,000+
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Customer Location */}
          <div className="space-y-3">
            <Label className="text-base">
              Where are your customers primarily located?
            </Label>
            <RadioGroup
              value={customerLocation}
              onValueChange={setCustomerLocation}
              className="grid gap-3 sm:grid-cols-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="uae" id="loc_uae" />
                <Label htmlFor="loc_uae" className="cursor-pointer">
                  UAE
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="gcc" id="loc_gcc" />
                <Label htmlFor="loc_gcc" className="cursor-pointer">
                  GCC Region
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="international" id="loc_intl" />
                <Label htmlFor="loc_intl" className="cursor-pointer">
                  International
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Cash Activity */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label className="text-base">Cash Activity</Label>
              <p className="text-sm text-muted-foreground">
                Will your business handle physical cash transactions?
              </p>
            </div>
            <Switch
              checked={cashActivity}
              onCheckedChange={setCashActivity}
            />
          </div>

          {/* PEP Confirmation */}
          <div className="space-y-3">
            <Label className="text-base">
              Are you a Politically Exposed Person (PEP)?
            </Label>
            <p className="text-sm text-muted-foreground">
              A PEP is someone who holds or has held a prominent public position.
            </p>
            <RadioGroup
              value={pepConfirmation}
              onValueChange={setPepConfirmation}
              className="grid gap-3 sm:grid-cols-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="no" id="pep_no" />
                <Label htmlFor="pep_no" className="cursor-pointer">
                  No
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="yes" id="pep_yes" />
                <Label htmlFor="pep_yes" className="cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="unsure" id="pep_unsure" />
                <Label htmlFor="pep_unsure" className="cursor-pointer">
                  Unsure
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Other Controllers */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label className="text-base">Other Controllers</Label>
              <p className="text-sm text-muted-foreground">
                Are there other individuals who control the company's finances or decisions?
              </p>
            </div>
            <Switch
              checked={otherControllers}
              onCheckedChange={setOtherControllers}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate(`/onboarding/${caseId}/ownership`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Loader2, User, CheckCircle2 } from "lucide-react";
import { useLocalOnboarding } from "@/hooks/use-local-onboarding";
import { toast } from "sonner";

const nationalities = [
  "United Arab Emirates",
  "Saudi Arabia",
  "India",
  "Pakistan",
  "United Kingdom",
  "United States",
  "Egypt",
  "Jordan",
  "Lebanon",
  "Philippines",
  "Other",
];

export default function OwnershipTabLocal() {
  const navigate = useNavigate();
  const { data, updateOwner, isLoading } = useLocalOnboarding();

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emiratesIdNumber, setEmiratesIdNumber] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  // Load existing data
  useEffect(() => {
    if (data.owner) {
      setFullName(data.owner.full_name || "");
      setDob(data.owner.dob || "");
      setNationality(data.owner.nationality || "");
      setEmail(data.owner.email || "");
      setPhone(data.owner.phone || "");
      setEmiratesIdNumber(data.owner.emirates_id_number || "");
      if (data.owner.full_name && data.owner.dob && data.owner.nationality) {
        setConfirmed(true);
      }
    }
  }, [data.owner]);

  const handleSave = () => {
    if (!fullName || !dob || !nationality) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateOwner({
      full_name: fullName,
      dob,
      nationality,
      email: email || undefined,
      phone: phone || undefined,
      emirates_id_number: emiratesIdNumber || undefined,
    });

    toast.success("Owner details saved");
    navigate("/onboarding-local/compliance");
  };

  const canProceed = fullName && dob && nationality && confirmed;

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
        <h2 className="text-2xl font-semibold tracking-tight">Owner & Roles</h2>
        <p className="text-muted-foreground mt-1">
          Since you're the only owner, this step takes seconds.
        </p>
      </div>

      {/* Owner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Owner Details
            </div>
            <Badge variant="secondary">100% Ownership</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Roles */}
          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Owner</Badge>
              <Badge variant="default">Director</Badge>
              <Badge variant="default">Authorized Signatory</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              As the sole owner, you automatically hold all key roles.
            </p>
          </div>

          {/* Personal Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="As per passport"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">
                Nationality <span className="text-destructive">*</span>
              </Label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  {nationalities.map((nat) => (
                    <SelectItem key={nat} value={nat}>
                      {nat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emirates_id">Emirates ID Number</Label>
              <Input
                id="emirates_id"
                value={emiratesIdNumber}
                onChange={(e) => setEmiratesIdNumber(e.target.value)}
                placeholder="784-XXXX-XXXXXXX-X"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@company.ae"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 123 4567"
              />
            </div>
          </div>

          {/* Confirmation */}
          <div className="flex items-start space-x-3 pt-4 border-t">
            <Checkbox
              id="confirm_owner"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="confirm_owner"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Yes, I'm the only owner and authorized signatory
              </label>
              <p className="text-sm text-muted-foreground">
                I confirm I own 100% of this company and am authorized to open a bank account on its behalf.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/onboarding-local/company")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canProceed}
          size="lg"
        >
          Save & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

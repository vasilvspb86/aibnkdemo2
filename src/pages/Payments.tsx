import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus, 
  ArrowUpRight, 
  Link2, 
  Users, 
  Copy,
  Check,
  Clock,
  XCircle,
  Building,
  User
} from "lucide-react";

const beneficiaries = [
  { id: 1, name: "AWS Cloud Services", bank: "First Abu Dhabi Bank", iban: "AE45...7890", type: "business" },
  { id: 2, name: "John Doe", bank: "Emirates NBD", iban: "AE12...3456", type: "individual" },
  { id: 3, name: "Marketing Agency LLC", bank: "Mashreq Bank", iban: "AE78...2345", type: "business" },
  { id: 4, name: "Office Supplies Co", bank: "ADCB", iban: "AE90...6789", type: "business" },
];

const paymentHistory = [
  { id: 1, recipient: "AWS Cloud Services", amount: 2340, status: "completed", date: "2024-01-08", reference: "PAY-001" },
  { id: 2, recipient: "Marketing Agency LLC", amount: 3200, status: "pending", date: "2024-01-08", reference: "PAY-002" },
  { id: 3, recipient: "John Doe", amount: 8500, status: "completed", date: "2024-01-07", reference: "PAY-003" },
  { id: 4, recipient: "Office Supplies Co", amount: 450, status: "failed", date: "2024-01-06", reference: "PAY-004" },
];

const paymentLinks = [
  { id: 1, description: "Invoice #2024-001", amount: 12500, status: "paid", created: "2024-01-05", link: "pay.aibnk.com/abc123" },
  { id: 2, description: "Consultation Fee", amount: 5000, status: "pending", created: "2024-01-07", link: "pay.aibnk.com/def456" },
  { id: 3, description: "Deposit - Project X", amount: 25000, status: "pending", created: "2024-01-08", link: "pay.aibnk.com/ghi789" },
];

export default function Payments() {
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(`https://${link}`);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      completed: { icon: Check, className: "bg-accent/10 text-accent border-accent/20" },
      pending: { icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
      failed: { icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
      paid: { icon: Check, className: "bg-accent/10 text-accent border-accent/20" },
    }[status] || { icon: Clock, className: "" };

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.className} gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">Send money and manage payment links.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Link2 className="h-4 w-4" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Payment Link</DialogTitle>
                <DialogDescription>
                  Generate a link to receive payments from clients.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="e.g., Invoice #2024-001" />
                </div>
                <div className="space-y-2">
                  <Label>Amount (AED)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea placeholder="Additional details for the payer..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsLinkOpen(false)}>Cancel</Button>
                <Button className="gradient-primary" onClick={() => setIsLinkOpen(false)}>Create Link</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isPayoutOpen} onOpenChange={setIsPayoutOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Send Money
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Send Money</DialogTitle>
                <DialogDescription>
                  Transfer funds to a beneficiary.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Beneficiary</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select beneficiary" />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaries.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          <div className="flex items-center gap-2">
                            {b.type === "business" ? (
                              <Building className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            {b.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select defaultValue="AED">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reference</Label>
                  <Input placeholder="e.g., Invoice payment" />
                </div>
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier">Supplier Payment</SelectItem>
                      <SelectItem value="salary">Salary/Wages</SelectItem>
                      <SelectItem value="services">Professional Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPayoutOpen(false)}>Cancel</Button>
                <Button className="gradient-primary" onClick={() => setIsPayoutOpen(false)}>
                  Review & Send
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Payment History
          </TabsTrigger>
          <TabsTrigger value="links" className="gap-2">
            <Link2 className="h-4 w-4" />
            Payment Links
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="gap-2">
            <Users className="h-4 w-4" />
            Beneficiaries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Outgoing payments from your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentHistory.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.recipient}</p>
                        <p className="text-sm text-muted-foreground">{payment.reference} • {payment.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">AED {payment.amount.toLocaleString()}</p>
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Payment Links</CardTitle>
              <CardDescription>Share links to receive payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentLinks.map((link) => (
                  <div 
                    key={link.id} 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Link2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{link.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">{link.link}</code>
                          <button 
                            onClick={() => copyLink(link.link)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {copiedLink === link.link ? (
                              <Check className="h-3.5 w-3.5 text-accent" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">AED {link.amount.toLocaleString()}</p>
                      <StatusBadge status={link.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beneficiaries">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Beneficiaries</CardTitle>
                <CardDescription>Saved payment recipients</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Beneficiary
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {beneficiaries.map((beneficiary) => (
                  <div 
                    key={beneficiary.id} 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {beneficiary.type === "business" ? (
                          <Building className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{beneficiary.name}</p>
                        <p className="text-sm text-muted-foreground">{beneficiary.bank} • {beneficiary.iban}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {beneficiary.type === "business" ? "Business" : "Individual"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

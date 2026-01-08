import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
  User,
  Loader2,
  Pencil,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePaymentsData, formatPaymentDate } from "@/hooks/use-payments-data";
import { toast } from "sonner";

export default function Payments() {
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isBeneficiaryOpen, setIsBeneficiaryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  // Payment form state
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("AED");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentPurpose, setPaymentPurpose] = useState("");
  
  // Payment link form state
  const [linkDescription, setLinkDescription] = useState("");
  const [linkAmount, setLinkAmount] = useState("");
  
  // Beneficiary form state
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryBank, setBeneficiaryBank] = useState("");
  const [beneficiaryIban, setBeneficiaryIban] = useState("");
  const [beneficiaryType, setBeneficiaryType] = useState("");

  const {
    beneficiaries,
    payments,
    paymentLinks,
    isLoading,
    createPayment,
    createPaymentLink,
    createBeneficiary,
    updatePayment,
    approvePayment,
    cancelPayment,
  } = usePaymentsData();

  const copyLink = (linkCode: string) => {
    const fullLink = `https://pay.aibnk.com/${linkCode}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedLink(linkCode);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCreatePayment = async () => {
    if (!selectedBeneficiary || !paymentAmount || !paymentPurpose) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Find beneficiary name
    const beneficiary = beneficiaries?.find(b => b.id === selectedBeneficiary);
    
    await createPayment.mutateAsync({
      beneficiary_id: selectedBeneficiary,
      beneficiary_name: beneficiary?.name || "Unknown",
      amount: parseFloat(paymentAmount),
      currency: paymentCurrency,
      reference: paymentReference,
      purpose: paymentPurpose,
    });
    
    // Reset form
    setSelectedBeneficiary("");
    setPaymentAmount("");
    setPaymentReference("");
    setPaymentPurpose("");
    setIsPayoutOpen(false);
  };

  const handleCreatePaymentLink = async () => {
    if (!linkAmount || !linkDescription) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    await createPaymentLink.mutateAsync({
      amount: parseFloat(linkAmount),
      description: linkDescription,
    });
    
    // Reset form
    setLinkDescription("");
    setLinkAmount("");
    setIsLinkOpen(false);
  };

  const handleCreateBeneficiary = async () => {
    if (!beneficiaryName || !beneficiaryBank || !beneficiaryIban || !beneficiaryType) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    await createBeneficiary.mutateAsync({
      name: beneficiaryName,
      bank_name: beneficiaryBank,
      iban: beneficiaryIban,
      vendor_type: beneficiaryType,
    });
    
    // Reset form
    setBeneficiaryName("");
    setBeneficiaryBank("");
    setBeneficiaryIban("");
    setBeneficiaryType("");
    setIsBeneficiaryOpen(false);
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setSelectedBeneficiary(payment.beneficiary_id || "");
    setPaymentAmount(String(payment.amount));
    setPaymentCurrency(payment.currency);
    setPaymentReference(payment.reference || "");
    setPaymentPurpose(payment.purpose || "");
    setIsEditOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;
    
    await updatePayment.mutateAsync({
      id: editingPayment.id,
      beneficiary_id: selectedBeneficiary || undefined,
      amount: parseFloat(paymentAmount),
      currency: paymentCurrency,
      reference: paymentReference,
      purpose: paymentPurpose,
    });
    
    setIsEditOpen(false);
    setEditingPayment(null);
    resetPaymentForm();
  };

  const handleSubmitForApproval = async (paymentId: string) => {
    await updatePayment.mutateAsync({
      id: paymentId,
      status: "pending_approval",
    });
  };

  const handleApprovePayment = async (paymentId: string) => {
    await approvePayment.mutateAsync(paymentId);
  };

  const handleCancelPayment = async (paymentId: string) => {
    await cancelPayment.mutateAsync(paymentId);
  };

  const resetPaymentForm = () => {
    setSelectedBeneficiary("");
    setPaymentAmount("");
    setPaymentCurrency("AED");
    setPaymentReference("");
    setPaymentPurpose("");
  };

  // Filter payments by status for the pending approvals section
  const pendingApprovalPayments = payments?.filter(p => p.status === "pending_approval") || [];
  const draftPayments = payments?.filter(p => p.status === "draft") || [];

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { icon: any; className: string }> = {
      completed: { icon: Check, className: "bg-accent/10 text-accent border-accent/20" },
      pending: { icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
      pending_approval: { icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
      processing: { icon: Clock, className: "bg-primary/10 text-primary border-primary/20" },
      failed: { icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
      cancelled: { icon: XCircle, className: "bg-muted text-muted-foreground border-muted" },
      paid: { icon: Check, className: "bg-accent/10 text-accent border-accent/20" },
      draft: { icon: Clock, className: "bg-muted text-muted-foreground border-muted" },
    };
    
    const defaultConfig = { icon: Clock, className: "bg-muted text-muted-foreground" };
    const { icon: Icon, className } = config[status] || defaultConfig;
    
    const displayStatus = status === "pending_approval" ? "Pending Approval" : 
      status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
      <Badge variant="outline" className={`${className} gap-1`}>
        <Icon className="h-3 w-3" />
        {displayStatus}
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
                  <Label>Description *</Label>
                  <Input 
                    placeholder="e.g., Invoice #2024-001"
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (AED) *</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={linkAmount}
                    onChange={(e) => setLinkAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsLinkOpen(false)}>Cancel</Button>
                <Button 
                  className="gradient-primary" 
                  onClick={handleCreatePaymentLink}
                  disabled={createPaymentLink.isPending}
                >
                  {createPaymentLink.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Link
                </Button>
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
                  <Label>Beneficiary *</Label>
                  <Select value={selectedBeneficiary} onValueChange={setSelectedBeneficiary}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select beneficiary" />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaries?.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          <div className="flex items-center gap-2">
                            {b.vendor_type === "Employee" ? (
                              <User className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Building className="h-4 w-4 text-muted-foreground" />
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
                    <Label>Amount *</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
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
                  <Input 
                    placeholder="e.g., Invoice payment"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purpose *</Label>
                  <Select value={paymentPurpose} onValueChange={setPaymentPurpose}>
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
                <Button 
                  className="gradient-primary" 
                  onClick={handleCreatePayment}
                  disabled={createPayment.isPending}
                >
                  {createPayment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Review & Send
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Payment Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Payment</DialogTitle>
              <DialogDescription>
                Update the payment details before submitting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Beneficiary *</Label>
                <Select value={selectedBeneficiary} onValueChange={setSelectedBeneficiary}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select beneficiary" />
                  </SelectTrigger>
                  <SelectContent>
                    {beneficiaries?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        <div className="flex items-center gap-2">
                          {b.vendor_type === "Employee" ? (
                            <User className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Building className="h-4 w-4 text-muted-foreground" />
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
                  <Label>Amount *</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
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
                <Input 
                  placeholder="e.g., Invoice payment"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Purpose *</Label>
                <Select value={paymentPurpose} onValueChange={setPaymentPurpose}>
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
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button 
                className="gradient-primary" 
                onClick={handleUpdatePayment}
                disabled={updatePayment.isPending}
              >
                {updatePayment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

        <TabsContent value="history" className="space-y-4">
          {/* Pending Approvals Section */}
          {pendingApprovalPayments.length > 0 && (
            <Card className="border-warning/30 bg-warning/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Pending Approval</CardTitle>
                    <CardDescription>
                      {pendingApprovalPayments.length} payment{pendingApprovalPayments.length > 1 ? "s" : ""} awaiting your approval
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingApprovalPayments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-background border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {(payment as any).beneficiary?.name || "Unknown Beneficiary"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.purpose || payment.reference || "Payment"} • {formatPaymentDate(payment.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-lg">
                          {payment.currency} {Number(payment.amount).toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleCancelPayment(payment.id)}
                            disabled={cancelPayment.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => handleApprovePayment(payment.id)}
                            disabled={approvePayment.isPending}
                          >
                            {approvePayment.isPending ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Draft Payments Section */}
          {draftPayments.length > 0 && (
            <Card className="border-muted">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Pencil className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Draft Payments</CardTitle>
                    <CardDescription>
                      {draftPayments.length} draft{draftPayments.length > 1 ? "s" : ""} ready to submit
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {draftPayments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-background border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {(payment as any).beneficiary?.name || "Unknown Beneficiary"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.purpose || payment.reference || "Payment"} • {formatPaymentDate(payment.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-lg">
                          {payment.currency} {Number(payment.amount).toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditPayment(payment)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            className="gradient-primary"
                            onClick={() => handleSubmitForApproval(payment.id)}
                            disabled={updatePayment.isPending}
                          >
                            Submit for Approval
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All outgoing payments from your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-40 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  ))
                ) : payments && payments.length > 0 ? (
                  payments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {(payment as any).beneficiary?.name || "Unknown Beneficiary"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.reference || "—"} • {formatPaymentDate(payment.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">{payment.currency} {Number(payment.amount).toLocaleString()}</p>
                        <StatusBadge status={payment.status} />
                        {(payment.status === "draft" || payment.status === "pending_approval") && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {payment.status === "draft" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSubmitForApproval(payment.id)}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Submit for Approval
                                  </DropdownMenuItem>
                                </>
                              )}
                              {payment.status === "pending_approval" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApprovePayment(payment.id)}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleCancelPayment(payment.id)}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ArrowUpRight className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No payments yet</p>
                    <p className="text-sm">Click "Send Money" to make your first payment</p>
                  </div>
                )}
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
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-40 mb-1" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))
                ) : paymentLinks && paymentLinks.length > 0 ? (
                  paymentLinks.map((link) => (
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
                            <code className="text-xs bg-muted px-2 py-0.5 rounded">
                              pay.aibnk.com/{link.link_code}
                            </code>
                            <button 
                              onClick={() => copyLink(link.link_code)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {copiedLink === link.link_code ? (
                                <Check className="h-3.5 w-3.5 text-accent" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">{link.currency} {Number(link.amount).toLocaleString()}</p>
                        <StatusBadge status={link.is_paid ? "paid" : "pending"} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Link2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No payment links yet</p>
                    <p className="text-sm">Click "Create Link" to generate a payment link</p>
                  </div>
                )}
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
              <Dialog open={isBeneficiaryOpen} onOpenChange={setIsBeneficiaryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Beneficiary
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Beneficiary</DialogTitle>
                    <DialogDescription>
                      Add a new payment recipient to your saved beneficiaries.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input 
                        placeholder="e.g., ABC Company LLC"
                        value={beneficiaryName}
                        onChange={(e) => setBeneficiaryName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Name *</Label>
                      <Input 
                        placeholder="e.g., Emirates NBD"
                        value={beneficiaryBank}
                        onChange={(e) => setBeneficiaryBank(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IBAN *</Label>
                      <Input 
                        placeholder="e.g., AE070331234567890123456"
                        value={beneficiaryIban}
                        onChange={(e) => setBeneficiaryIban(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select value={beneficiaryType} onValueChange={setBeneficiaryType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vendor">Vendor / Supplier</SelectItem>
                          <SelectItem value="Employee">Employee</SelectItem>
                          <SelectItem value="Client">Client</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBeneficiaryOpen(false)}>Cancel</Button>
                    <Button 
                      className="gradient-primary" 
                      onClick={handleCreateBeneficiary}
                      disabled={createBeneficiary.isPending}
                    >
                      {createBeneficiary.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Beneficiary
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-40 mb-1" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))
                ) : beneficiaries && beneficiaries.length > 0 ? (
                  beneficiaries.map((beneficiary) => (
                    <div 
                      key={beneficiary.id} 
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {beneficiary.vendor_type === "Employee" ? (
                            <User className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Building className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{beneficiary.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {beneficiary.bank_name} • {beneficiary.iban?.slice(0, 4)}...{beneficiary.iban?.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {beneficiary.vendor_type || "Other"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No beneficiaries yet</p>
                    <p className="text-sm">Click "Add Beneficiary" to add a payment recipient</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

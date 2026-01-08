import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  FileText, 
  Send, 
  Download,
  MoreHorizontal,
  Search,
  Filter,
  Check,
  Clock,
  AlertCircle,
  Trash2,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvoicesData, formatInvoiceDate, type LineItem, type InvoiceStatus } from "@/hooks/use-invoices-data";

export default function Invoices() {
  const { invoices, stats, isLoading, createInvoice, updateInvoiceStatus } = useInvoicesData();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString().split("T")[0];
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0, amount: 0 },
  ]);
  const [taxRate, setTaxRate] = useState("5");
  const [currency, setCurrency] = useState("AED");
  const [notes, setNotes] = useState("");

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    if (field === "description") {
      updated[index].description = value as string;
    } else {
      const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
      updated[index][field] = numValue;
      
      if (field === "quantity" || field === "unit_price") {
        updated[index].amount = updated[index].quantity * updated[index].unit_price;
      }
    }
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (parseFloat(taxRate) / 100);
  const total = subtotal + taxAmount;

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 15);
    setDueDate(defaultDue.toISOString().split("T")[0]);
    setLineItems([{ description: "", quantity: 1, unit_price: 0, amount: 0 }]);
    setTaxRate("5");
    setCurrency("AED");
    setNotes("");
  };

  const handleCreate = async (sendImmediately: boolean) => {
    if (!clientName || lineItems.every((item) => !item.description)) {
      return;
    }

    await createInvoice.mutateAsync({
      client_name: clientName,
      client_email: clientEmail,
      issue_date: issueDate,
      due_date: dueDate,
      line_items: lineItems.filter((item) => item.description),
      tax_rate: parseFloat(taxRate),
      currency,
      notes: notes || undefined,
      send_immediately: sendImmediately,
    });

    resetForm();
    setIsCreateOpen(false);
  };

  const handleStatusChange = (invoiceId: string, newStatus: InvoiceStatus) => {
    updateInvoiceStatus.mutate({ invoiceId, status: newStatus });
  };

  const filteredInvoices = invoices?.filter((invoice) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(query) ||
      invoice.client_name.toLowerCase().includes(query)
    );
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { icon: typeof Check; className: string }> = {
      paid: { icon: Check, className: "bg-accent/10 text-accent border-accent/20" },
      sent: { icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
      viewed: { icon: Eye, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      overdue: { icon: AlertCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
      draft: { icon: FileText, className: "bg-muted text-muted-foreground border-muted" },
      cancelled: { icon: AlertCircle, className: "bg-muted text-muted-foreground border-muted" },
    };

    const { icon: Icon, className } = config[status] || config.draft;
    return (
      <Badge variant="outline" className={`${className} gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">Create and manage invoices for your clients.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary gap-2">
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Fill in the details to generate a professional invoice.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input 
                    placeholder="Client or company name" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input 
                    type="email" 
                    placeholder="billing@client.com" 
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input 
                    type="date" 
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Line Items</Label>
                  <Button variant="ghost" size="sm" onClick={addLineItem} className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Input 
                      className="col-span-6" 
                      placeholder="Description" 
                      value={item.description}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                    />
                    <Input 
                      className="col-span-2" 
                      type="number" 
                      placeholder="Qty"
                      value={item.quantity || ""}
                      onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                    />
                    <Input 
                      className="col-span-3" 
                      type="number" 
                      placeholder="Rate"
                      value={item.unit_price || ""}
                      onChange={(e) => updateLineItem(index, "unit_price", e.target.value)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="col-span-1"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{currency} {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT ({taxRate}%)</span>
                    <span>{currency} {taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{currency} {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>VAT (%)</Label>
                  <Select value={taxRate} onValueChange={setTaxRate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% - No VAT</SelectItem>
                      <SelectItem value="5">5% - Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
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
                <Label>Notes (Optional)</Label>
                <Textarea 
                  placeholder="Payment terms, bank details, or other notes..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleCreate(false)}
                disabled={createInvoice.isPending || !clientName}
              >
                Save as Draft
              </Button>
              <Button 
                className="gradient-primary gap-2" 
                onClick={() => handleCreate(true)}
                disabled={createInvoice.isPending || !clientName}
              >
                <Send className="h-4 w-4" />
                {createInvoice.isPending ? "Creating..." : "Create & Send"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-display font-bold mt-1">
              AED {stats.totalOutstanding.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Paid (30 days)</p>
            <p className="text-2xl font-display font-bold mt-1 text-accent">
              AED {stats.paidLast30Days.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-display font-bold mt-1 text-destructive">
              AED {stats.overdue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>Manage and track your invoices</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search invoices..." 
                  className="pl-10 w-64" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredInvoices && filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <StatusBadge status={invoice.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.client_name} • Due {formatInvoiceDate(invoice.due_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">
                      {invoice.currency} {Number(invoice.total).toLocaleString()}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status === "draft" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleStatusChange(invoice.id, "sent")}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invoice.status !== "paid" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "paid")}>
                              <Check className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          {invoice.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "sent")}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Invoice
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No invoices found</p>
                <p className="text-sm">Create your first invoice to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
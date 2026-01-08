import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  FileText, 
  Send, 
  Download,
  MoreHorizontal,
  Search,
  Filter,
  Check,
  Clock,
  AlertCircle,
  Trash2
} from "lucide-react";

const invoices = [
  { id: "INV-2024-001", client: "Tech Solutions Ltd", amount: 12500, status: "paid", date: "2024-01-05", dueDate: "2024-01-20" },
  { id: "INV-2024-002", client: "Global Traders FZ", amount: 8900, status: "pending", date: "2024-01-07", dueDate: "2024-01-22" },
  { id: "INV-2024-003", client: "Creative Agency LLC", amount: 5600, status: "pending", date: "2024-01-08", dueDate: "2024-01-23" },
  { id: "INV-2024-004", client: "Startup Hub Inc", amount: 15000, status: "overdue", date: "2023-12-15", dueDate: "2024-01-01" },
  { id: "INV-2024-005", client: "Consulting Group", amount: 7500, status: "draft", date: "2024-01-08", dueDate: "2024-01-23" },
];

const stats = [
  { label: "Total Outstanding", value: "AED 37,000", change: "+5.2%", color: "text-foreground" },
  { label: "Paid (30 days)", value: "AED 45,200", change: "+12.5%", color: "text-accent" },
  { label: "Overdue", value: "AED 15,000", change: "-8.3%", color: "text-destructive" },
];

export default function Invoices() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [lineItems, setLineItems] = useState([{ description: "", quantity: 1, rate: 0 }]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, rate: 0 }]);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      paid: { icon: Check, className: "bg-accent/10 text-accent border-accent/20" },
      pending: { icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
      overdue: { icon: AlertCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
      draft: { icon: FileText, className: "bg-muted text-muted-foreground border-muted" },
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
                  <Label>Client Name</Label>
                  <Input placeholder="Client or company name" />
                </div>
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input type="email" placeholder="billing@client.com" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" />
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
                    />
                    <Input 
                      className="col-span-2" 
                      type="number" 
                      placeholder="Qty" 
                    />
                    <Input 
                      className="col-span-3" 
                      type="number" 
                      placeholder="Rate" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="col-span-1"
                      onClick={() => setLineItems(lineItems.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>VAT (%)</Label>
                  <Select defaultValue="5">
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
                <Label>Notes (Optional)</Label>
                <Textarea placeholder="Payment terms, bank details, or other notes..." />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Save as Draft
              </Button>
              <Button className="gradient-primary gap-2" onClick={() => setIsCreateOpen(false)}>
                <Send className="h-4 w-4" />
                Create & Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-display font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
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
                <Input placeholder="Search invoices..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((invoice) => (
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
                      <p className="font-medium">{invoice.id}</p>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.client} • Due {invoice.dueDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">AED {invoice.amount.toLocaleString()}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

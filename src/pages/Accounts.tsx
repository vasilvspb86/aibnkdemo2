import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Copy, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const accountDetails = {
  name: "Acme Startup FZ-LLC",
  accountNumber: "1234567890123456",
  iban: "AE070331234567890123456",
  swift: "AIBNAEXX",
  currency: "AED",
  balance: 142580.50,
};

const transactions = [
  { id: 1, description: "Payment from Client A", reference: "INV-2024-001", amount: 12500, type: "credit", date: "2024-01-08", status: "Completed" },
  { id: 2, description: "AWS Cloud Services", reference: "SUB-AWS-JAN", amount: -2340, type: "debit", date: "2024-01-08", status: "Completed" },
  { id: 3, description: "Salary - John Doe", reference: "PAY-EMP-001", amount: -8500, type: "debit", date: "2024-01-07", status: "Completed" },
  { id: 4, description: "Payment from Client B", reference: "INV-2024-002", amount: 5600, type: "credit", date: "2024-01-07", status: "Completed" },
  { id: 5, description: "Office Supplies", reference: "PO-2024-015", amount: -450, type: "debit", date: "2024-01-06", status: "Completed" },
  { id: 6, description: "Marketing Agency", reference: "INV-MKT-001", amount: -3200, type: "debit", date: "2024-01-05", status: "Pending" },
  { id: 7, description: "Payment from Client C", reference: "INV-2024-003", amount: 8900, type: "credit", date: "2024-01-05", status: "Completed" },
  { id: 8, description: "Software License", reference: "LIC-2024-Q1", amount: -1500, type: "debit", date: "2024-01-04", status: "Completed" },
];

export default function Accounts() {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your business accounts and view transactions.</p>
        </div>
        <Button className="gradient-primary gap-2">
          <Download className="h-4 w-4" />
          Download Statement
        </Button>
      </div>

      {/* Account Card */}
      <Card className="overflow-hidden">
        <div className="gradient-primary p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80">Primary Account</p>
              <h2 className="font-display font-bold text-xl mt-1">{accountDetails.name}</h2>
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-sm opacity-80">Available Balance</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="font-display font-bold text-3xl">
                {showBalance 
                  ? `AED ${accountDetails.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : "AED ••••••••"
                }
              </p>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            <div>
              <p className="text-xs opacity-60">Account Number</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono text-sm">•••• {accountDetails.accountNumber.slice(-4)}</p>
                <button 
                  onClick={() => copyToClipboard(accountDetails.accountNumber, 'account')}
                  className="opacity-60 hover:opacity-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {copied === 'account' && <span className="text-xs">Copied!</span>}
              </div>
            </div>
            <div>
              <p className="text-xs opacity-60">IBAN</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono text-sm">{accountDetails.iban.slice(0, 4)}...{accountDetails.iban.slice(-4)}</p>
                <button 
                  onClick={() => copyToClipboard(accountDetails.iban, 'iban')}
                  className="opacity-60 hover:opacity-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {copied === 'iban' && <span className="text-xs">Copied!</span>}
              </div>
            </div>
            <div>
              <p className="text-xs opacity-60">SWIFT/BIC</p>
              <p className="font-mono text-sm mt-1">{accountDetails.swift}</p>
            </div>
            <div>
              <p className="text-xs opacity-60">Currency</p>
              <p className="font-mono text-sm mt-1">{accountDetails.currency}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View and filter your account transactions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
              <TabsTrigger value="debits">Debits</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-0">
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === "credit" ? "bg-accent/10" : "bg-muted"
                      }`}>
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="h-5 w-5 text-accent" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.reference} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === "credit" ? "text-accent" : ""}`}>
                          {tx.type === "credit" ? "+" : ""}AED {Math.abs(tx.amount).toLocaleString()}
                        </p>
                        <Badge 
                          variant={tx.status === "Completed" ? "outline" : "secondary"}
                          className="text-xs"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="credits">
              <div className="space-y-2">
                {transactions.filter(tx => tx.type === "credit").map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <ArrowDownLeft className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{tx.reference} • {tx.date}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-accent">+AED {tx.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="debits">
              <div className="space-y-2">
                {transactions.filter(tx => tx.type === "debit").map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{tx.reference} • {tx.date}</p>
                      </div>
                    </div>
                    <p className="font-semibold">AED {Math.abs(tx.amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

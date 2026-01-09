import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  Copy, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  CreditCard,
  Receipt
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAccountData, formatTransactionDate, TransactionType } from "@/hooks/use-account-data";
import { toast } from "sonner";

export default function Accounts() {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  
  const {
    account,
    transactions,
    stats,
    isLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
  } = useAccountData();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTabChange = (value: string) => {
    setTypeFilter(value as TransactionType);
  };

  const orgName = (account as any)?.organization?.name || "Business Account";
  const accountNumber = account?.account_number || "";
  const iban = account?.iban || "";
  const balance = Number(account?.balance || 0);
  const availableBalance = Number(account?.available_balance || 0);

  const TransactionRow = ({ tx }: { tx: any }) => (
    <div 
      className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          tx.type === "credit" ? "bg-accent/10" : "bg-muted"
        }`}>
          {tx.source === "card" ? (
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          ) : tx.source === "expense" ? (
            <Receipt className="h-5 w-5 text-muted-foreground" />
          ) : tx.type === "credit" ? (
            <ArrowDownLeft className="h-5 w-5 text-accent" />
          ) : (
            <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium">{tx.description}</p>
          <p className="text-sm text-muted-foreground">
            {tx.reference || tx.counterparty_name || "—"} • {formatTransactionDate(tx.created_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`font-semibold ${tx.type === "credit" ? "text-accent" : ""}`}>
            {tx.type === "credit" ? "+" : "-"}AED {Number(tx.amount).toLocaleString()}
          </p>
          <Badge 
            variant={tx.status === "completed" ? "outline" : "secondary"}
            className="text-xs capitalize"
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
  );

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
              {isLoading ? (
                <Skeleton className="h-7 w-48 bg-white/20 mt-1" />
              ) : (
                <h2 className="font-display font-bold text-xl mt-1">{orgName}</h2>
              )}
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-sm opacity-80">Available Balance</p>
            <div className="flex items-center gap-3 mt-1">
              {isLoading ? (
                <Skeleton className="h-9 w-48 bg-white/20" />
              ) : (
                <p className="font-display font-bold text-3xl">
                  {showBalance 
                    ? `AED ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : "AED ••••••••"
                  }
                </p>
              )}
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {!isLoading && balance !== availableBalance && (
              <p className="text-sm opacity-60 mt-1">
                Total balance: AED {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            <div>
              <p className="text-xs opacity-60">Account Number</p>
              <div className="flex items-center gap-2 mt-1">
                {isLoading ? (
                  <Skeleton className="h-5 w-24 bg-white/20" />
                ) : (
                  <>
                    <p className="font-mono text-sm">•••• {accountNumber.slice(-4)}</p>
                    <button 
                      onClick={() => copyToClipboard(accountNumber, 'account')}
                      className="opacity-60 hover:opacity-100"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {copied === 'account' && <span className="text-xs">Copied!</span>}
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs opacity-60">IBAN</p>
              <div className="flex items-center gap-2 mt-1">
                {isLoading ? (
                  <Skeleton className="h-5 w-32 bg-white/20" />
                ) : (
                  <>
                    <p className="font-mono text-sm">{iban.replace(/(.{4})/g, '$1 ').trim()}</p>
                    <button 
                      onClick={() => copyToClipboard(iban, 'iban')}
                      className="opacity-60 hover:opacity-100"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {copied === 'iban' && <span className="text-xs">Copied!</span>}
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs opacity-60">SWIFT/BIC</p>
              <p className="font-mono text-sm mt-1">AIBNAEXX</p>
            </div>
            <div>
              <p className="text-xs opacity-60">Currency</p>
              <p className="font-mono text-sm mt-1">{account?.currency || "AED"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-32 mt-1" />
                ) : (
                  <p className="text-2xl font-display font-bold text-accent">
                    +AED {stats.credits.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stats.creditCount} transactions</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <ArrowDownLeft className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Debits</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-32 mt-1" />
                ) : (
                  <p className="text-2xl font-display font-bold">
                    -AED {stats.debits.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stats.debitCount} transactions</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <Input 
                  placeholder="Search transactions..." 
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={typeFilter} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="credit">Credits</TabsTrigger>
              <TabsTrigger value="debit">Debits</TabsTrigger>
            </TabsList>
            
            <TabsContent value={typeFilter} className="mt-0">
              <div className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-48 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-5 w-24 mb-1" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? (
                      <p>No transactions found matching "{searchQuery}"</p>
                    ) : (
                      <p>No transactions yet</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

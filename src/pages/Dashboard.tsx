import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  CreditCard, 
  FileText, 
  ArrowRight,
  Building2,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardData, formatRelativeTime } from "@/hooks/use-dashboard-data";

const quickActions = [
  { label: "Send Money", icon: ArrowUpRight, path: "/payments", color: "bg-primary" },
  { label: "Request Payment", icon: ArrowDownLeft, path: "/payments", color: "bg-accent" },
  { label: "New Invoice", icon: FileText, path: "/invoices", color: "bg-chart-3" },
  { label: "New Card", icon: CreditCard, path: "/cards", color: "bg-chart-4" },
];

export default function Dashboard() {
  const { 
    account, 
    transactions, 
    transactionSummary, 
    pendingInvoices, 
    organization,
    isLoading 
  } = useDashboardData();

  const companyName = organization?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            Good {getTimeOfDay()}, {companyName}
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your business today.</p>
        </div>
        <Link to="/assistant">
          <Button className="gradient-primary gap-2">
            <Sparkles className="h-4 w-4" />
            Ask AI Assistant
          </Button>
        </Link>
      </div>

      {/* KYB Status Banner */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium">Account verified</p>
              <p className="text-sm text-muted-foreground">Your business account is fully active</p>
            </div>
          </div>
          <Badge variant="outline" className="border-accent text-accent">Active</Badge>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <p className="text-2xl font-display font-bold">
                  AED {Number(account?.balance || 0).toLocaleString()}
                </p>
                <p className="text-xs text-accent flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +12.5% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Incoming (30d)</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <p className="text-2xl font-display font-bold">
                  AED {(transactionSummary?.incomingTotal || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {transactionSummary?.incomingCount || 0} transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outgoing (30d)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <p className="text-2xl font-display font-bold">
                  AED {(transactionSummary?.outgoingTotal || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {transactionSummary?.outgoingCount || 0} transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <p className="text-2xl font-display font-bold">
                  AED {(pendingInvoices?.total || 0).toLocaleString()}
                </p>
                <p className="text-xs text-warning mt-1">
                  {pendingInvoices?.count || 0} invoices awaiting payment
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link key={action.label} to={action.path}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="flex items-center gap-3 py-4">
                <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest account activity</CardDescription>
          </div>
          <Link to="/accounts">
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))
            ) : transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
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
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(tx.created_at)} • {tx.category || "General"}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${tx.type === "credit" ? "text-accent" : ""}`}>
                    {tx.type === "credit" ? "+" : "-"}AED {Number(tx.amount).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

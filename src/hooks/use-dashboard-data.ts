import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

// For demo purposes, we use a fixed organization ID
// In production, this would come from the user's session/profile
const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_ACCOUNT_ID = "22222222-2222-2222-2222-222222222222";

export function useDashboardData() {
  const { user } = useAuth();

  // Fetch account balance
  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ["account", DEMO_ACCOUNT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", DEMO_ACCOUNT_ID)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent account transactions
  const { data: accountTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions", DEMO_ACCOUNT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", DEMO_ACCOUNT_ID)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent card transactions
  const { data: cardTransactions, isLoading: cardTransactionsLoading } = useQuery({
    queryKey: ["card-transactions-dashboard", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_transactions")
        .select(`
          *,
          cards!inner(organization_id, cardholder_name)
        `)
        .eq("cards.organization_id", DEMO_ORG_ID)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Combine and sort all transactions
  const transactions = (() => {
    const accountTxs = (accountTransactions || []).map(tx => ({
      id: tx.id,
      type: tx.type as "credit" | "debit",
      amount: Number(tx.amount),
      currency: tx.currency,
      description: tx.description || tx.counterparty_name || "Transaction",
      category: tx.category,
      created_at: tx.created_at,
      source: "account" as const,
    }));

    const cardTxs = (cardTransactions || []).map(tx => ({
      id: tx.id,
      type: "debit" as const,
      amount: Number(tx.amount),
      currency: tx.currency,
      description: tx.merchant_name || "Card Transaction",
      category: tx.merchant_category,
      created_at: tx.created_at,
      source: "card" as const,
    }));

    return [...accountTxs, ...cardTxs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  })();

  // Fetch 30-day transaction summary
  const { data: transactionSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["transaction-summary", DEMO_ACCOUNT_ID],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("transactions")
        .select("type, amount")
        .eq("account_id", DEMO_ACCOUNT_ID)
        .gte("created_at", thirtyDaysAgo.toISOString());
      
      if (error) throw error;

      const incoming = data?.filter(t => t.type === "credit") || [];
      const outgoing = data?.filter(t => t.type === "debit") || [];

      return {
        incomingTotal: incoming.reduce((sum, t) => sum + Number(t.amount), 0),
        incomingCount: incoming.length,
        outgoingTotal: outgoing.reduce((sum, t) => sum + Number(t.amount), 0),
        outgoingCount: outgoing.length,
      };
    },
  });

  // Fetch pending invoices
  const { data: pendingInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["pending-invoices", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, total")
        .eq("organization_id", DEMO_ORG_ID)
        .in("status", ["sent", "viewed", "overdue"]);
      
      if (error) throw error;

      return {
        total: data?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0,
        count: data?.length || 0,
      };
    },
  });

  // Fetch organization info
  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ["organization", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", DEMO_ORG_ID)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch KYB status
  const { data: kybApplication, isLoading: kybLoading } = useQuery({
    queryKey: ["kyb-application", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kyb_applications")
        .select("status")
        .eq("organization_id", DEMO_ORG_ID)
        .order("created_at", { ascending: false })
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const isLoading = accountLoading || transactionsLoading || cardTransactionsLoading || summaryLoading || invoicesLoading || orgLoading;

  return {
    account,
    transactions,
    transactionSummary,
    pendingInvoices,
    organization,
    kybApplication,
    isLoading,
  };
}

// Helper to format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

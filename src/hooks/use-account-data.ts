import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";

// Demo IDs - in production these would come from user session
const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_ACCOUNT_ID = "22222222-2222-2222-2222-222222222222";

export type TransactionType = "all" | "credit" | "debit";

export function useAccountData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType>("all");

  // Fetch account details
  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ["account-details", DEMO_ACCOUNT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select(`
          *,
          organization:organizations(name)
        `)
        .eq("id", DEMO_ACCOUNT_ID)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch all account transactions
  const { data: accountTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["account-transactions", DEMO_ACCOUNT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", DEMO_ACCOUNT_ID)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch card transactions
  const { data: cardTransactions, isLoading: cardTransactionsLoading } = useQuery({
    queryKey: ["card-transactions-account", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_transactions")
        .select(`
          *,
          cards!inner(organization_id, cardholder_name, card_number_last4)
        `)
        .eq("cards.organization_id", DEMO_ORG_ID)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch approved expenses
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses-account", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("organization_id", DEMO_ORG_ID)
        .eq("status", "approved")
        .order("expense_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Combine and normalize all transactions
  const allTransactions = useMemo(() => {
    const accountTxs = (accountTransactions || []).map(tx => ({
      id: tx.id,
      type: tx.type as "credit" | "debit",
      amount: Number(tx.amount),
      currency: tx.currency,
      description: tx.description || tx.counterparty_name || "Transaction",
      counterparty_name: tx.counterparty_name,
      reference: tx.reference,
      category: tx.category,
      created_at: tx.created_at,
      status: tx.status,
      source: "account" as const,
    }));

    const cardTxs = (cardTransactions || []).map(tx => ({
      id: tx.id,
      type: "debit" as const,
      amount: Number(tx.amount),
      currency: tx.currency,
      description: tx.merchant_name || "Card Transaction",
      counterparty_name: tx.merchant_name,
      reference: `Card •••• ${tx.cards?.card_number_last4 || "****"}`,
      category: tx.merchant_category,
      created_at: tx.created_at,
      status: tx.status,
      source: "card" as const,
    }));

    const expenseTxs = (expenses || []).map(exp => ({
      id: exp.id,
      type: "debit" as const,
      amount: Number(exp.amount),
      currency: exp.currency,
      description: exp.description || exp.vendor || "Expense",
      counterparty_name: exp.vendor,
      reference: `Expense`,
      category: exp.category,
      created_at: exp.expense_date,
      status: exp.status,
      source: "expense" as const,
    }));

    return [...accountTxs, ...cardTxs, ...expenseTxs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [accountTransactions, cardTransactions, expenses]);

  // Filter transactions based on search and type
  const transactions = useMemo(() => {
    if (!allTransactions) return [];
    
    return allTransactions.filter((tx) => {
      // Type filter
      if (typeFilter !== "all" && tx.type !== typeFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDescription = tx.description?.toLowerCase().includes(query);
        const matchesReference = tx.reference?.toLowerCase().includes(query);
        const matchesCounterparty = tx.counterparty_name?.toLowerCase().includes(query);
        const matchesCategory = tx.category?.toLowerCase().includes(query);
        
        return matchesDescription || matchesReference || matchesCounterparty || matchesCategory;
      }
      
      return true;
    });
  }, [allTransactions, searchQuery, typeFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!allTransactions) return { credits: 0, debits: 0, creditCount: 0, debitCount: 0 };
    
    const credits = allTransactions.filter(t => t.type === "credit");
    const debits = allTransactions.filter(t => t.type === "debit");
    
    return {
      credits: credits.reduce((sum, t) => sum + Number(t.amount), 0),
      debits: debits.reduce((sum, t) => sum + Number(t.amount), 0),
      creditCount: credits.length,
      debitCount: debits.length,
    };
  }, [allTransactions]);

  return {
    account,
    transactions,
    allTransactions,
    stats,
    isLoading: accountLoading || transactionsLoading || cardTransactionsLoading || expensesLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
  };
}

// Format date for display
export function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

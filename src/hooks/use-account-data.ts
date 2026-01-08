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

  // Fetch all transactions
  const { data: allTransactions, isLoading: transactionsLoading } = useQuery({
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
    isLoading: accountLoading || transactionsLoading,
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

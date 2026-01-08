import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Demo IDs
const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_ACCOUNT_ID = "22222222-2222-2222-2222-222222222222";

export function useCardsData() {
  const queryClient = useQueryClient();

  // Fetch cards
  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ["cards", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select(`
          *,
          card_controls(*)
        `)
        .eq("organization_id", DEMO_ORG_ID)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch card transactions for a specific card
  const { data: allCardTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["card-transactions", DEMO_ORG_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create card mutation
  const createCard = useMutation({
    mutationFn: async (cardData: {
      card_type: "virtual" | "physical";
      cardholder_name: string;
      monthly_limit: number;
    }) => {
      // Generate last 4 digits
      const last4 = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Set expiry date 3 years from now
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 3);

      const { data: card, error: cardError } = await supabase
        .from("cards")
        .insert({
          organization_id: DEMO_ORG_ID,
          account_id: DEMO_ACCOUNT_ID,
          card_type: cardData.card_type,
          cardholder_name: cardData.cardholder_name,
          card_number_last4: last4,
          monthly_limit: cardData.monthly_limit,
          spending_limit: cardData.monthly_limit,
          expires_at: expiryDate.toISOString().split('T')[0],
          status: cardData.card_type === "virtual" ? "active" : "requested",
        })
        .select()
        .single();

      if (cardError) throw cardError;

      // Create default card controls
      const { error: controlsError } = await supabase
        .from("card_controls")
        .insert({
          card_id: card.id,
          daily_limit: cardData.monthly_limit / 5,
          monthly_limit: cardData.monthly_limit,
          per_transaction_limit: cardData.monthly_limit / 10,
          online_enabled: true,
          contactless_enabled: true,
          atm_enabled: true,
          international_enabled: false,
          allowed_categories: ["shopping", "travel", "dining", "transport"],
          blocked_categories: [],
        });

      if (controlsError) throw controlsError;

      return card;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Card requested successfully");
    },
    onError: (error) => {
      toast.error(`Failed to request card: ${error.message}`);
    },
  });

  // Update card controls mutation
  const updateCardControls = useMutation({
    mutationFn: async ({
      cardId,
      controls,
    }: {
      cardId: string;
      controls: {
        monthly_limit?: number;
        per_transaction_limit?: number;
        online_enabled?: boolean;
        contactless_enabled?: boolean;
        atm_enabled?: boolean;
        international_enabled?: boolean;
        allowed_categories?: string[];
      };
    }) => {
      const { data, error } = await supabase
        .from("card_controls")
        .update(controls)
        .eq("card_id", cardId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Card controls updated");
    },
    onError: (error) => {
      toast.error(`Failed to update controls: ${error.message}`);
    },
  });

  // Freeze/unfreeze card mutation
  const toggleCardFreeze = useMutation({
    mutationFn: async ({ cardId, freeze }: { cardId: string; freeze: boolean }) => {
      const { data, error } = await supabase
        .from("cards")
        .update({ status: freeze ? "frozen" : "active" })
        .eq("id", cardId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success(data.status === "frozen" ? "Card frozen" : "Card unfrozen");
    },
    onError: (error) => {
      toast.error(`Failed to update card: ${error.message}`);
    },
  });

  // Get transactions for a specific card
  const getCardTransactions = (cardId: string) => {
    return allCardTransactions?.filter((tx) => tx.card_id === cardId) || [];
  };

  // Calculate spending stats for a card
  const getCardStats = (cardId: string) => {
    const transactions = getCardTransactions(cardId);
    const totalSpent = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const avgTransaction = transactions.length > 0 ? totalSpent / transactions.length : 0;
    
    return {
      totalSpent,
      transactionCount: transactions.length,
      avgTransaction: Math.round(avgTransaction),
    };
  };

  return {
    cards,
    allCardTransactions,
    isLoading: cardsLoading || transactionsLoading,
    createCard,
    updateCardControls,
    toggleCardFreeze,
    getCardTransactions,
    getCardStats,
  };
}

export function formatCardExpiry(dateString: string | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
}

export function formatRelativeDate(dateString: string): string {
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
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  CreditCard, 
  Plus, 
  Lock, 
  Unlock,
  ShoppingCart,
  Plane,
  Utensils,
  Car,
  Settings,
  Eye,
  EyeOff,
  Snowflake
} from "lucide-react";
import { useCardsData, formatCardExpiry, formatRelativeDate } from "@/hooks/use-cards-data";

const categoryIcons: Record<string, React.ElementType> = {
  shopping: ShoppingCart,
  travel: Plane,
  dining: Utensils,
  transport: Car,
};

const categoryLabels: Record<string, string> = {
  shopping: "Online Shopping",
  travel: "Travel & Airlines",
  dining: "Restaurants & Dining",
  transport: "Transport & Ride-sharing",
};

export default function Cards() {
  const {
    cards,
    isLoading,
    createCard,
    updateCardControls,
    toggleCardFreeze,
    getCardTransactions,
    getCardStats,
  } = useCardsData();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  
  // Form state
  const [cardType, setCardType] = useState<"virtual" | "physical">("virtual");
  const [cardholderName, setCardholderName] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  // Set first card as selected when cards load
  useEffect(() => {
    if (cards && cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  const selectedCard = cards?.find((c) => c.id === selectedCardId);
  const cardControls = selectedCard?.card_controls?.[0];
  const cardTransactions = selectedCardId ? getCardTransactions(selectedCardId) : [];
  const cardStats = selectedCardId ? getCardStats(selectedCardId) : { totalSpent: 0, transactionCount: 0, avgTransaction: 0 };
  
  const [spendLimit, setSpendLimit] = useState<number[]>([cardControls?.monthly_limit || 50000]);

  // Update spend limit when card changes
  useEffect(() => {
    if (cardControls?.monthly_limit) {
      setSpendLimit([cardControls.monthly_limit]);
    }
  }, [cardControls?.monthly_limit]);

  const handleCreateCard = async () => {
    if (!cardholderName || !monthlyLimit) return;
    
    await createCard.mutateAsync({
      card_type: cardType,
      cardholder_name: cardholderName.toUpperCase(),
      monthly_limit: parseFloat(monthlyLimit),
    });
    
    setIsRequestOpen(false);
    setCardholderName("");
    setMonthlyLimit("");
    setCardType("virtual");
  };

  const handleToggleFreeze = () => {
    if (!selectedCard) return;
    toggleCardFreeze.mutate({
      cardId: selectedCard.id,
      freeze: selectedCard.status !== "frozen",
    });
  };

  const handleLimitChange = (newLimit: number[]) => {
    setSpendLimit(newLimit);
  };

  const handleLimitCommit = () => {
    if (!selectedCard || !cardControls) return;
    updateCardControls.mutate({
      cardId: selectedCard.id,
      controls: { monthly_limit: spendLimit[0] },
    });
  };

  const handleCategoryToggle = (category: string, enabled: boolean) => {
    if (!selectedCard || !cardControls) return;
    
    const currentCategories = cardControls.allowed_categories || [];
    const newCategories = enabled
      ? [...currentCategories, category]
      : currentCategories.filter((c: string) => c !== category);
    
    updateCardControls.mutate({
      cardId: selectedCard.id,
      controls: { allowed_categories: newCategories },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-4">
              <Skeleton className="w-80 h-48 rounded-2xl" />
              <Skeleton className="w-80 h-48 rounded-2xl" />
            </div>
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Cards</h1>
          <p className="text-muted-foreground mt-1">Manage business cards and spending controls.</p>
        </div>
        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary gap-2">
              <Plus className="h-4 w-4" />
              Request New Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request New Card</DialogTitle>
              <DialogDescription>
                Request a new business card for yourself or a team member.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Card Type</Label>
                <Select value={cardType} onValueChange={(v) => setCardType(v as "virtual" | "physical")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual Card (Instant)</SelectItem>
                    <SelectItem value="physical">Physical Card (5-7 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cardholder Name</Label>
                <Input 
                  placeholder="Name as it appears on card" 
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Spending Limit (AED)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 10000" 
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                />
              </div>
              {cardType === "physical" && (
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <Input placeholder="Building, Street, City" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRequestOpen(false)}>Cancel</Button>
              <Button 
                className="gradient-primary" 
                onClick={handleCreateCard}
                disabled={createCard.isPending || !cardholderName || !monthlyLimit}
              >
                {createCard.isPending ? "Requesting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Card Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {cards && cards.length > 0 ? (
              cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`flex-shrink-0 w-80 h-48 rounded-2xl p-6 text-white relative overflow-hidden transition-transform hover:scale-[1.02] ${
                    card.card_type === "virtual" ? "gradient-primary" : "bg-sidebar"
                  } ${selectedCardId === card.id ? "ring-2 ring-offset-2 ring-primary" : ""} ${
                    card.status === "frozen" ? "opacity-60" : ""
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-white/30 text-white text-xs">
                          {card.card_type === "virtual" ? "Virtual" : "Physical"}
                        </Badge>
                        {card.status === "frozen" && (
                          <Snowflake className="h-4 w-4 text-blue-200" />
                        )}
                        {card.status === "requested" && (
                          <Badge variant="outline" className="border-yellow-300/50 text-yellow-200 text-xs">
                            Requested
                          </Badge>
                        )}
                      </div>
                      <CreditCard className="h-8 w-8 opacity-80" />
                    </div>
                    
                    <div>
                      <p className="font-mono text-lg tracking-widest">
                        •••• •••• •••• {card.card_number_last4 || "****"}
                      </p>
                      <div className="flex justify-between mt-4">
                        <div>
                          <p className="text-xs opacity-60">Cardholder</p>
                          <p className="text-sm font-medium">{card.cardholder_name}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-60">Expires</p>
                          <p className="text-sm font-medium">{formatCardExpiry(card.expires_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="w-80 h-48 rounded-2xl border-2 border-dashed border-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No cards yet</p>
                  <p className="text-sm">Request your first card</p>
                </div>
              </div>
            )}
          </div>

          {/* Card Stats */}
          {selectedCard && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spending Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Spent this month</span>
                      <span className="font-medium">
                        AED {cardStats.totalSpent.toLocaleString()} / {(selectedCard.monthly_limit || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((cardStats.totalSpent / (selectedCard.monthly_limit || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-display font-bold">{cardStats.transactionCount}</p>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-display font-bold">AED {cardStats.avgTransaction.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cardTransactions.length > 0 ? (
                  cardTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.merchant_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeDate(tx.created_at)} • {tx.merchant_category}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">AED {Number(tx.amount).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No transactions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Card Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => setShowCardDetails(!showCardDetails)}
                >
                  {showCardDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showCardDetails ? "Hide" : "Show"} Details
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={handleToggleFreeze}
                  disabled={!selectedCard || toggleCardFreeze.isPending}
                >
                  {selectedCard?.status === "frozen" ? (
                    <>
                      <Unlock className="h-4 w-4" />
                      Unfreeze
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Freeze
                    </>
                  )}
                </Button>
              </div>

              {/* Spending Limit */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Monthly Limit</Label>
                  <span className="text-sm font-medium">AED {spendLimit[0].toLocaleString()}</span>
                </div>
                <Slider
                  value={spendLimit}
                  onValueChange={handleLimitChange}
                  onValueCommit={handleLimitCommit}
                  max={100000}
                  min={1000}
                  step={1000}
                  className="w-full"
                  disabled={!selectedCard}
                />
              </div>

              {/* Per-Transaction Limit */}
              <div className="space-y-2">
                <Label>Per-Transaction Limit</Label>
                <Input 
                  type="number" 
                  placeholder="AED 5,000" 
                  defaultValue={cardControls?.per_transaction_limit || ""}
                  disabled={!selectedCard}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Controls</CardTitle>
              <CardDescription>Enable or disable spending categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {["shopping", "travel", "dining", "transport"].map((category) => {
                const Icon = categoryIcons[category] || ShoppingCart;
                const isEnabled = cardControls?.allowed_categories?.includes(category) ?? true;
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm">{categoryLabels[category]}</span>
                    </div>
                    <Switch 
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleCategoryToggle(category, checked)}
                      disabled={!selectedCard}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
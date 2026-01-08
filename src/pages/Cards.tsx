import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  EyeOff
} from "lucide-react";

const cards = [
  {
    id: 1,
    type: "Virtual",
    lastFour: "4829",
    holder: "ACME STARTUP",
    expiry: "12/27",
    limit: 50000,
    spent: 12340,
    status: "active",
    color: "gradient-primary",
  },
  {
    id: 2,
    type: "Physical",
    lastFour: "7156",
    holder: "JOHN DOE",
    expiry: "06/26",
    limit: 15000,
    spent: 8900,
    status: "active",
    color: "bg-sidebar",
  },
];

const recentCardTransactions = [
  { id: 1, merchant: "Amazon Web Services", amount: 1250, date: "Today", category: "Software" },
  { id: 2, merchant: "Starbucks DIFC", amount: 85, date: "Today", category: "Food & Dining" },
  { id: 3, merchant: "Emirates Airlines", amount: 3500, date: "Yesterday", category: "Travel" },
  { id: 4, merchant: "Uber Technologies", amount: 120, date: "Yesterday", category: "Transport" },
];

const categoryControls = [
  { name: "Online Shopping", icon: ShoppingCart, enabled: true },
  { name: "Travel & Airlines", icon: Plane, enabled: true },
  { name: "Restaurants & Dining", icon: Utensils, enabled: true },
  { name: "Transport & Ride-sharing", icon: Car, enabled: true },
];

export default function Cards() {
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [spendLimit, setSpendLimit] = useState([selectedCard.limit]);

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
                <Select>
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
                <Input placeholder="Name as it appears on card" />
              </div>
              <div className="space-y-2">
                <Label>Monthly Spending Limit (AED)</Label>
                <Input type="number" placeholder="e.g., 10000" />
              </div>
              <div className="space-y-2">
                <Label>Delivery Address (Physical cards only)</Label>
                <Input placeholder="Building, Street, City" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRequestOpen(false)}>Cancel</Button>
              <Button className="gradient-primary" onClick={() => setIsRequestOpen(false)}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Card Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`flex-shrink-0 w-80 h-48 rounded-2xl p-6 text-white relative overflow-hidden transition-transform hover:scale-[1.02] ${
                  card.color
                } ${selectedCard.id === card.id ? "ring-2 ring-offset-2 ring-primary" : ""}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
                
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="border-white/30 text-white text-xs">
                        {card.type}
                      </Badge>
                    </div>
                    <CreditCard className="h-8 w-8 opacity-80" />
                  </div>
                  
                  <div>
                    <p className="font-mono text-lg tracking-widest">
                      •••• •••• •••• {card.lastFour}
                    </p>
                    <div className="flex justify-between mt-4">
                      <div>
                        <p className="text-xs opacity-60">Cardholder</p>
                        <p className="text-sm font-medium">{card.holder}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-60">Expires</p>
                        <p className="text-sm font-medium">{card.expiry}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Card Stats */}
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
                      AED {selectedCard.spent.toLocaleString()} / {selectedCard.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(selectedCard.spent / selectedCard.limit) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-display font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-display font-bold">AED 1,028</p>
                    <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCardTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.merchant}</p>
                        <p className="text-xs text-muted-foreground">{tx.date} • {tx.category}</p>
                      </div>
                    </div>
                    <p className="font-semibold">AED {tx.amount.toLocaleString()}</p>
                  </div>
                ))}
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
                <Button variant="outline" className="flex-1 gap-2">
                  {showCardDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showCardDetails ? "Hide" : "Show"} Details
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Lock className="h-4 w-4" />
                  Freeze
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
                  onValueChange={setSpendLimit}
                  max={100000}
                  min={1000}
                  step={1000}
                  className="w-full"
                />
              </div>

              {/* Per-Transaction Limit */}
              <div className="space-y-2">
                <Label>Per-Transaction Limit</Label>
                <Input type="number" placeholder="AED 5,000" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Controls</CardTitle>
              <CardDescription>Enable or disable spending categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryControls.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <category.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <Switch defaultChecked={category.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

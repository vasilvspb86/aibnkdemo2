import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Lock, Star, Sparkles } from "lucide-react";

export default function Rewards() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Rewards</h1>
        <p className="text-muted-foreground mt-1">Earn rewards for using AIBNK.</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Gift className="h-8 w-8 text-muted-foreground" />
          </div>
          <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
          <h2 className="text-xl font-display font-semibold">Rewards Program</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Earn cashback, loyalty points, and exclusive benefits on your business spending. 
            Stay tuned for our upcoming rewards program.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            <Card className="bg-muted/50">
              <CardContent className="pt-6 text-center">
                <Star className="h-6 w-6 text-warning mx-auto mb-2" />
                <p className="font-medium text-sm">Cashback</p>
                <p className="text-xs text-muted-foreground">Up to 2% back</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6 text-center">
                <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm">Points</p>
                <p className="text-xs text-muted-foreground">Earn on every transaction</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6 text-center">
                <Lock className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="font-medium text-sm">Exclusive Perks</p>
                <p className="text-xs text-muted-foreground">Partner discounts</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

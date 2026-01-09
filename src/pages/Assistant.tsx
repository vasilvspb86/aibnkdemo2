import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Sparkles, 
  User,
  FileText,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Check,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useAIChat, ChatAction } from "@/hooks/use-ai-chat";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";

interface SuggestedPrompt {
  icon: typeof TrendingUp;
  text: string;
}

const defaultPrompts: SuggestedPrompt[] = [
  { icon: TrendingUp, text: "What's my current account balance and recent activity?" },
  { icon: CreditCard, text: "Show my card spending breakdown" },
];

const actionIcons: Record<string, typeof FileText> = {
  create_invoice: FileText,
  create_payment: ArrowUpRight,
  approve_expense: Check,
  view_account: CreditCard,
  navigate: ExternalLink,
};

export default function Assistant() {
  const { messages, isLoading, sendMessage, executeAction, clearChat } = useAIChat();
  const [input, setInput] = useState("");
  const [executingActions, setExecutingActions] = useState<Record<string, boolean>>({});
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>(defaultPrompts);
  const navigate = useNavigate();

  // Fetch real counterparty data for suggested prompts
  useEffect(() => {
    const fetchCounterparties = async () => {
      try {
        // Fetch beneficiaries for payment suggestions
        const { data: beneficiaries } = await supabase
          .from("beneficiaries")
          .select("name")
          .eq("organization_id", DEMO_ORG_ID)
          .eq("is_active", true)
          .limit(1);

        // Fetch invoice clients for invoice suggestions
        const { data: invoices } = await supabase
          .from("invoices")
          .select("client_name")
          .eq("organization_id", DEMO_ORG_ID)
          .order("created_at", { ascending: false })
          .limit(5);

        const prompts: SuggestedPrompt[] = [
          { icon: TrendingUp, text: "What's my current account balance and recent activity?" },
        ];

        // Add invoice suggestion with real client name
        if (invoices && invoices.length > 0) {
          const uniqueClients = [...new Set(invoices.map(inv => inv.client_name))];
          if (uniqueClients[0]) {
            prompts.push({
              icon: FileText,
              text: `Create an invoice for ${uniqueClients[0]} for AED 5,000`,
            });
          }
        }

        // Add payment suggestion with real beneficiary name
        if (beneficiaries && beneficiaries.length > 0) {
          prompts.push({
            icon: ArrowUpRight,
            text: `Prepare a payment of AED 2,500 for ${beneficiaries[0].name}`,
          });
        }

        prompts.push({ icon: CreditCard, text: "Show my card spending breakdown" });

        setSuggestedPrompts(prompts);
      } catch (error) {
        console.error("Failed to fetch counterparties:", error);
      }
    };

    fetchCounterparties();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleActionClick = async (messageId: string, actionIndex: number, action: ChatAction) => {
    // Handle navigation action directly without calling executeAction
    if (action.type === "navigate" && action.data?.path) {
      navigate(action.data.path);
      return;
    }
    
    const key = `${messageId}-${actionIndex}`;
    setExecutingActions(prev => ({ ...prev, [key]: true }));
    
    const success = await executeAction(messageId, actionIndex);
    
    setExecutingActions(prev => ({ ...prev, [key]: false }));
    
    // Navigate to relevant page after action
    if (success) {
      setTimeout(() => {
        if (action.type === "create_invoice") {
          navigate("/invoices");
        } else if (action.type === "create_payment") {
          navigate("/payments");
        }
      }, 1500);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">AI Assistant</h1>
          <p className="text-muted-foreground mt-1">Your intelligent banking companion</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={clearChat}>
          <RefreshCw className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  
                  {/* Action Buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                      {message.actions.map((action, idx) => {
                        const ActionIcon = actionIcons[action.type] || FileText;
                        const key = `${message.id}-${idx}`;
                        const isExecuting = executingActions[key];
                        const isExecuted = action.executed;
                        
                        return (
                          <Button
                            key={idx}
                            size="sm"
                            variant={isExecuted ? "outline" : "default"}
                            className={`gap-2 ${isExecuted ? "bg-accent/20 text-accent border-accent/30" : "gradient-accent"}`}
                            onClick={() => handleActionClick(message.id, idx, action)}
                            disabled={isExecuting || isExecuted}
                          >
                            {isExecuting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isExecuted ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <ActionIcon className="h-4 w-4" />
                            )}
                            {isExecuted ? "Done" : action.label}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl p-4">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="p-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-3xl mx-auto">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(prompt.text)}
                  disabled={isLoading}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted text-left text-sm transition-colors disabled:opacity-50"
                >
                  <prompt.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="line-clamp-2">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask me anything about your finances..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gradient-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Powered by AIBNK AI • Actions require confirmation before execution
          </p>
        </div>
      </Card>
    </div>
  );
}

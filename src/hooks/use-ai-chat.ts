import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ChatAction {
  type: "create_invoice" | "create_payment" | "approve_expense" | "view_account" | "navigate" | "create_alert" | "delete_alert";
  label: string;
  data?: Record<string, any>;
  executed?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";

// Parse AI response for action suggestions
function parseActionsFromResponse(content: string, navigationTarget?: { path: string; label: string; id?: string }): ChatAction[] {
  const actions: ChatAction[] = [];
  
  // If we have a navigation target, add that first
  if (navigationTarget) {
    actions.push({
      type: "navigate",
      label: navigationTarget.label,
      data: { 
        path: navigationTarget.path,
        id: navigationTarget.id,
      },
    });
  }
  
  // Detect alert creation intent
  const alertMatch = content.match(/\[ALERT:\s*type=([^,]+),\s*amount=(\d+(?:\.\d+)?),\s*category=([^\]]+)\]/i);
  if (alertMatch) {
    const alertType = alertMatch[1].trim();
    const amount = parseFloat(alertMatch[2]);
    const category = alertMatch[3].trim() === "null" ? null : alertMatch[3].trim();
    
    const typeLabels: Record<string, string> = {
      daily_limit: "Daily Spending Alert",
      weekly_limit: "Weekly Spending Alert",
      monthly_limit: "Monthly Spending Alert",
      category_limit: `Category Alert${category ? ` (${category})` : ""}`,
      trend_warning: "Trend Warning Alert",
      large_transaction: "Large Transaction Alert",
    };
    
    actions.push({
      type: "create_alert",
      label: `Set ${typeLabels[alertType] || alertType}: AED ${amount.toLocaleString()}`,
      data: {
        alert_type: alertType,
        threshold_amount: amount,
        category,
      },
    });
  }
  
  // Detect alert deletion intent
  const deleteAlertMatch = content.match(/\[DELETE_ALERT:\s*type=([^,]+),\s*category=([^\]]+)\]/i);
  if (deleteAlertMatch) {
    const alertType = deleteAlertMatch[1].trim();
    const category = deleteAlertMatch[2].trim() === "null" ? null : deleteAlertMatch[2].trim();
    
    actions.push({
      type: "delete_alert",
      label: `Remove ${alertType.replace(/_/g, " ")} alert${category ? ` for ${category}` : ""}`,
      data: {
        alert_type: alertType,
        category,
      },
    });
  }
  
  // Detect invoice creation intent (only if not navigating and no alert action)
  if (!navigationTarget && !alertMatch && content.toLowerCase().includes("create") && content.toLowerCase().includes("invoice")) {
    const amountMatch = content.match(/(?:AED|USD|EUR)\s*([\d,]+(?:\.\d{2})?)/i);
    const clientMatch = content.match(/(?:for|to|client[:\s]+)([A-Za-z\s]+?)(?:\s*[-–—]|\s*for|\s*\.|,|\n|$)/i);
    
    actions.push({
      type: "create_invoice",
      label: "Create Invoice Draft",
      data: {
        amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : undefined,
        client: clientMatch ? clientMatch[1].trim() : undefined,
      },
    });
  }
  
  // Detect payment intent (only if not navigating and no alert action)
  if (!navigationTarget && !alertMatch && (content.toLowerCase().includes("pay") || content.toLowerCase().includes("payment")) && 
      (content.toLowerCase().includes("prepare") || content.toLowerCase().includes("create") || content.toLowerCase().includes("send"))) {
    const amountMatch = content.match(/(?:AED|USD|EUR)\s*([\d,]+(?:\.\d{2})?)/i);
    const vendorMatch = content.match(/(?:to|vendor|pay)\s+([A-Za-z\s]+?)(?:\s*[-–—]|\s*for|\s*\.|,|\n|$)/i);
    
    actions.push({
      type: "create_payment",
      label: "Prepare Payment",
      data: {
        amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : undefined,
        vendor: vendorMatch ? vendorMatch[1].trim() : undefined,
      },
    });
  }

  return actions;
}

// Detect navigation intent from user message and find matching entity
async function detectNavigationIntent(userMessage: string): Promise<{ path: string; label: string; id?: string } | null> {
  const msg = userMessage.toLowerCase();
  
  // Common navigation phrases
  const openPhrases = ["open", "show", "view", "go to", "take me to", "navigate to", "see", "find"];
  const hasOpenIntent = openPhrases.some(phrase => msg.includes(phrase));
  
  if (!hasOpenIntent) return null;
  
  // Detect invoice navigation
  if (msg.includes("invoice")) {
    // Try to find invoice by number pattern (INV-XXXXX)
    const invoiceNumberMatch = userMessage.match(/inv[-\s]?(\d+)/i);
    if (invoiceNumberMatch) {
      const searchPattern = `INV-${invoiceNumberMatch[1]}`;
      const { data: invoice } = await supabase
        .from("invoices")
        .select("id, invoice_number")
        .eq("organization_id", DEMO_ORG_ID)
        .ilike("invoice_number", `%${invoiceNumberMatch[1]}%`)
        .limit(1)
        .maybeSingle();
      
      if (invoice) {
        return {
          path: `/invoices?edit=${invoice.id}`,
          label: `Open Invoice ${invoice.invoice_number}`,
          id: invoice.id,
        };
      }
    }
    
    // Try to find by client name
    const clientMatch = userMessage.match(/(?:invoice\s+(?:for|from|to)\s+)([a-zA-Z\s]+?)(?:\s*$|[,.])/i);
    if (clientMatch) {
      const clientName = clientMatch[1].trim();
      const { data: invoice } = await supabase
        .from("invoices")
        .select("id, invoice_number, client_name")
        .eq("organization_id", DEMO_ORG_ID)
        .ilike("client_name", `%${clientName}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (invoice) {
        return {
          path: `/invoices?edit=${invoice.id}`,
          label: `Open Invoice for ${invoice.client_name}`,
          id: invoice.id,
        };
      }
    }
    
    // Just go to invoices page
    return { path: "/invoices", label: "Go to Invoices" };
  }
  
  // Detect payment navigation
  if (msg.includes("payment")) {
    // Try to find by beneficiary/vendor name
    const vendorMatch = userMessage.match(/(?:payment\s+(?:to|for)\s+)([a-zA-Z\s]+?)(?:\s*$|[,.])/i);
    if (vendorMatch) {
      const vendorName = vendorMatch[1].trim();
      const { data: payment } = await supabase
        .from("payments")
        .select("id, beneficiaries(name)")
        .eq("organization_id", DEMO_ORG_ID)
        .order("created_at", { ascending: false })
        .limit(20);
      
      // Find payment with matching beneficiary
      const matchingPayment = payment?.find((p: any) => 
        p.beneficiaries?.name?.toLowerCase().includes(vendorName.toLowerCase())
      );
      
      if (matchingPayment) {
        return {
          path: `/payments?view=${matchingPayment.id}`,
          label: `Open Payment to ${(matchingPayment as any).beneficiaries?.name}`,
          id: matchingPayment.id,
        };
      }
    }
    
    return { path: "/payments", label: "Go to Payments" };
  }
  
  // Detect beneficiary/counterparty navigation
  if (msg.includes("beneficiar") || msg.includes("counterpart") || msg.includes("vendor") || msg.includes("supplier")) {
    const nameMatch = userMessage.match(/(?:beneficiary|counterparty|vendor|supplier)\s+([a-zA-Z\s]+?)(?:\s*$|[,.])/i);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      const { data: beneficiary } = await supabase
        .from("beneficiaries")
        .select("id, name")
        .eq("organization_id", DEMO_ORG_ID)
        .ilike("name", `%${name}%`)
        .limit(1)
        .maybeSingle();
      
      if (beneficiary) {
        return {
          path: `/payments?beneficiary=${beneficiary.id}`,
          label: `View ${beneficiary.name}`,
          id: beneficiary.id,
        };
      }
    }
    
    return { path: "/payments", label: "Go to Payments" };
  }
  
  // Detect expense navigation
  if (msg.includes("expense")) {
    return { path: "/expenses", label: "Go to Expenses" };
  }
  
  // Detect card navigation
  if (msg.includes("card")) {
    return { path: "/cards", label: "Go to Cards" };
  }
  
  // Detect account navigation
  if (msg.includes("account") || msg.includes("balance") || msg.includes("transaction")) {
    return { path: "/accounts", label: "Go to Accounts" };
  }
  
  return null;
}

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  onDelta: (deltaText: string) => void;
  onDone: (fullContent: string) => void;
  onError: (error: Error) => void;
}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${resp.status}`);
    }

    if (!resp.body) {
      throw new Error("No response body");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let fullContent = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullContent += content;
            onDelta(content);
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullContent += content;
            onDelta(content);
          }
        } catch {
          /* ignore */
        }
      }
    }

    onDone(fullContent);
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Unknown error"));
  }
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      content: "Hello! I'm your AI banking assistant. I can help you manage your finances, create invoices, analyze spending, and more. What would you like to do today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Check for navigation intent before sending to AI
    const navigationTarget = await detectNavigationIntent(content);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id.startsWith("assistant-streaming")) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: "assistant-streaming",
            role: "assistant",
            content: assistantContent,
            timestamp: new Date(),
          },
        ];
      });
    };

    const apiMessages = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamChat({
      messages: apiMessages,
      onDelta: updateAssistant,
      onDone: (fullContent) => {
        // Parse for actions after streaming is complete, including navigation
        const actions = parseActionsFromResponse(fullContent, navigationTarget);
        
        setMessages((prev) =>
          prev.map((m) =>
            m.id === "assistant-streaming"
              ? { ...m, id: `assistant-${Date.now()}`, actions: actions.length > 0 ? actions : undefined }
              : m
          )
        );
        setIsLoading(false);
      },
      onError: (error) => {
        toast({
          title: "AI Error",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      },
    });
  }, [messages, isLoading]);

  const executeAction = useCallback(async (messageId: string, actionIndex: number): Promise<boolean> => {
    const message = messages.find(m => m.id === messageId);
    const action = message?.actions?.[actionIndex];
    
    if (!action) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      switch (action.type) {
        case "create_invoice": {
          const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
          const { error } = await supabase.from("invoices").insert({
            organization_id: DEMO_ORG_ID,
            invoice_number: invoiceNumber,
            client_name: action.data?.client || "New Client",
            total: action.data?.amount || 0,
            subtotal: action.data?.amount || 0,
            status: "draft",
            currency: "AED",
          });
          
          if (error) throw error;
          
          toast({
            title: "Invoice Created",
            description: `Draft invoice ${invoiceNumber} has been created. Go to Invoices to edit and send.`,
          });
          
          // Mark action as executed
          setMessages(prev => prev.map(m => {
            if (m.id === messageId && m.actions) {
              const newActions = [...m.actions];
              newActions[actionIndex] = { ...newActions[actionIndex], executed: true };
              return { ...m, actions: newActions };
            }
            return m;
          }));
          
          return true;
        }
        
        case "create_payment": {
          const { error } = await supabase.from("payments").insert({
            organization_id: DEMO_ORG_ID,
            amount: action.data?.amount || 0,
            currency: "AED",
            status: "draft",
            purpose: action.data?.vendor ? `Payment to ${action.data.vendor}` : "New payment",
            created_by: user?.id,
          });
          
          if (error) throw error;
          
          toast({
            title: "Payment Prepared",
            description: "Draft payment has been created. Go to Payments to review and approve.",
          });
          
          setMessages(prev => prev.map(m => {
            if (m.id === messageId && m.actions) {
              const newActions = [...m.actions];
              newActions[actionIndex] = { ...newActions[actionIndex], executed: true };
              return { ...m, actions: newActions };
            }
            return m;
          }));
          
          return true;
        }
        
        case "create_alert": {
          const { data: { user } } = await supabase.auth.getUser();
          
          const { error } = await supabase.from("spending_alerts").insert({
            organization_id: DEMO_ORG_ID,
            user_id: user?.id,
            alert_type: action.data?.alert_type,
            threshold_amount: action.data?.threshold_amount,
            category: action.data?.category || null,
            is_active: true,
          });
          
          if (error) throw error;
          
          toast({
            title: "Spending Alert Created",
            description: `Alert set for AED ${action.data?.threshold_amount?.toLocaleString()}. You'll be notified when this threshold is reached.`,
          });
          
          setMessages(prev => prev.map(m => {
            if (m.id === messageId && m.actions) {
              const newActions = [...m.actions];
              newActions[actionIndex] = { ...newActions[actionIndex], executed: true };
              return { ...m, actions: newActions };
            }
            return m;
          }));
          
          return true;
        }
        
        case "delete_alert": {
          let query = supabase
            .from("spending_alerts")
            .delete()
            .eq("organization_id", DEMO_ORG_ID)
            .eq("alert_type", action.data?.alert_type);
          
          if (action.data?.category) {
            query = query.eq("category", action.data.category);
          }
          
          const { error } = await query;
          
          if (error) throw error;
          
          toast({
            title: "Alert Removed",
            description: "The spending alert has been deleted.",
          });
          
          setMessages(prev => prev.map(m => {
            if (m.id === messageId && m.actions) {
              const newActions = [...m.actions];
              newActions[actionIndex] = { ...newActions[actionIndex], executed: true };
              return { ...m, actions: newActions };
            }
            return m;
          }));
          
          return true;
        }
        
        default:
          toast({
            title: "Action Not Supported",
            description: "This action type is not yet implemented.",
            variant: "destructive",
          });
          return false;
      }
    } catch (error) {
      console.error("Action execution error:", error);
      toast({
        title: "Action Failed",
        description: error instanceof Error ? error.message : "Failed to execute action",
        variant: "destructive",
      });
      return false;
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "initial",
        role: "assistant",
        content: "Hello! I'm your AI banking assistant. I can help you manage your finances, create invoices, analyze spending, and more. What would you like to do today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    executeAction,
    clearChat,
  };
}

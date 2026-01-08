import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ChatAction {
  type: "create_invoice" | "create_payment" | "approve_expense" | "view_account";
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
const DEMO_ACCOUNT_ID = "22222222-2222-2222-2222-222222222222";

// Parse AI response for action suggestions
function parseActionsFromResponse(content: string): ChatAction[] {
  const actions: ChatAction[] = [];
  
  // Detect invoice creation intent
  if (content.toLowerCase().includes("create") && content.toLowerCase().includes("invoice")) {
    // Try to extract client name and amount from context
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
  
  // Detect payment intent
  if ((content.toLowerCase().includes("pay") || content.toLowerCase().includes("payment")) && 
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
        // Parse for actions after streaming is complete
        const actions = parseActionsFromResponse(fullContent);
        
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

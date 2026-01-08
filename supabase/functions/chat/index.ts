import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchUserContext(supabase: any) {
  const context: string[] = [];

  // Fetch account data
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .limit(5);

  if (accounts?.length) {
    context.push("## Account Summary");
    accounts.forEach((acc: any) => {
      context.push(`- ${acc.account_name} (${acc.currency}): Balance ${acc.currency} ${Number(acc.balance).toLocaleString()}, Available: ${acc.currency} ${Number(acc.available_balance).toLocaleString()}`);
    });
  }

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (transactions?.length) {
    context.push("\n## Recent Transactions (Last 10)");
    let totalCredits = 0;
    let totalDebits = 0;
    transactions.forEach((tx: any) => {
      const sign = tx.type === "credit" ? "+" : "-";
      const amount = Number(tx.amount);
      if (tx.type === "credit") totalCredits += amount;
      else totalDebits += amount;
      context.push(`- ${sign}${tx.currency} ${amount.toLocaleString()} | ${tx.counterparty_name || tx.description || "Transaction"} | ${tx.status} | ${new Date(tx.created_at).toLocaleDateString()}`);
    });
    context.push(`\nRecent activity: +${transactions[0]?.currency || "AED"} ${totalCredits.toLocaleString()} credits, -${transactions[0]?.currency || "AED"} ${totalDebits.toLocaleString()} debits`);
  }

  // Fetch invoices summary
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (invoices?.length) {
    const unpaid = invoices.filter((inv: any) => inv.status !== "paid" && inv.status !== "cancelled");
    const paid = invoices.filter((inv: any) => inv.status === "paid");
    const totalUnpaid = unpaid.reduce((sum: number, inv: any) => sum + Number(inv.total), 0);
    const totalPaid = paid.reduce((sum: number, inv: any) => sum + Number(inv.total), 0);

    context.push("\n## Invoices Summary");
    context.push(`- Unpaid invoices: ${unpaid.length} totaling ${invoices[0]?.currency || "AED"} ${totalUnpaid.toLocaleString()}`);
    context.push(`- Paid invoices: ${paid.length} totaling ${invoices[0]?.currency || "AED"} ${totalPaid.toLocaleString()}`);
    
    if (unpaid.length > 0) {
      context.push("\nPending invoices:");
      unpaid.slice(0, 5).forEach((inv: any) => {
        context.push(`- ${inv.invoice_number}: ${inv.client_name} - ${inv.currency} ${Number(inv.total).toLocaleString()} (${inv.status})`);
      });
    }
  }

  // Fetch expenses with details
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

  if (expenses?.length) {
    const pending = expenses.filter((exp: any) => exp.status === "pending");
    const approved = expenses.filter((exp: any) => exp.status === "approved");
    const rejected = expenses.filter((exp: any) => exp.status === "rejected");
    const totalPending = pending.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    const totalApproved = approved.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    const totalAll = expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

    context.push("\n## Expenses Summary");
    context.push(`- Total expenses: ${expenses.length} totaling ${expenses[0]?.currency || "AED"} ${totalAll.toLocaleString()}`);
    context.push(`- Pending approval: ${pending.length} expenses (${expenses[0]?.currency || "AED"} ${totalPending.toLocaleString()})`);
    context.push(`- Approved: ${approved.length} expenses (${expenses[0]?.currency || "AED"} ${totalApproved.toLocaleString()})`);
    context.push(`- Rejected: ${rejected.length} expenses`);
    
    // Add detailed expense list
    context.push("\nRecent Expenses:");
    expenses.slice(0, 10).forEach((exp: any) => {
      const date = new Date(exp.expense_date).toLocaleDateString();
      context.push(`- ${exp.currency} ${Number(exp.amount).toLocaleString()} | ${exp.description || exp.category || "Expense"} | ${exp.vendor || "Unknown vendor"} | ${exp.status} | ${date}`);
    });
    
    // Group by category
    const byCategory: Record<string, number> = {};
    expenses.forEach((exp: any) => {
      const cat = exp.category || "Uncategorized";
      byCategory[cat] = (byCategory[cat] || 0) + Number(exp.amount);
    });
    
    if (Object.keys(byCategory).length > 0) {
      context.push("\nExpenses by Category:");
      Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, amount]) => {
          context.push(`- ${cat}: ${expenses[0]?.currency || "AED"} ${amount.toLocaleString()}`);
        });
    }
  } else {
    context.push("\n## Expenses");
    context.push("No expenses recorded yet.");
  }

  // Fetch payments summary
  const { data: payments } = await supabase
    .from("payments")
    .select("*, beneficiaries(name)")
    .order("created_at", { ascending: false })
    .limit(10);

  if (payments?.length) {
    const pending = payments.filter((p: any) => p.status === "pending_approval" || p.status === "scheduled");
    const completed = payments.filter((p: any) => p.status === "completed");
    
    context.push("\n## Payments Summary");
    context.push(`- Pending/scheduled: ${pending.length} payments`);
    context.push(`- Completed recently: ${completed.length} payments`);
    
    if (pending.length > 0) {
      context.push("\nUpcoming payments:");
      pending.slice(0, 3).forEach((p: any) => {
        context.push(`- ${p.beneficiaries?.name || "Unknown"}: ${p.currency} ${Number(p.amount).toLocaleString()} (${p.status})`);
      });
    }
  }

  // Fetch cards summary
  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .limit(5);

  if (cards?.length) {
    context.push("\n## Cards Summary");
    cards.forEach((card: any) => {
      const limitInfo = card.spending_limit ? `Limit: AED ${Number(card.spending_limit).toLocaleString()}` : "No limit set";
      context.push(`- ${card.cardholder_name} (${card.card_type}, ****${card.card_number_last4 || "****"}): ${card.status} | ${limitInfo}`);
    });
  }

  return context.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    
    // Create Supabase client with user's auth token
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Fetch user's financial context
    let userContext = "";
    try {
      userContext = await fetchUserContext(supabase);
    } catch (e) {
      console.error("Failed to fetch user context:", e);
    }

    const SYSTEM_PROMPT = `You are AIBNK's AI banking assistant, a helpful and knowledgeable financial companion for SME business owners.

Your capabilities include:
- Analyzing cashflow and financial patterns
- Helping create invoices and payments
- Explaining account balances and transactions
- Providing spending insights and recommendations
- Answering questions about banking operations

Guidelines:
- Be concise and professional, but friendly
- Use bullet points and formatting for clarity
- When discussing financial data, reference the ACTUAL data provided below
- Always clarify if you need more information
- Remind users that any financial actions require their confirmation
- Keep responses focused and actionable
- When you cite numbers, mention they are from "your account data"

${userContext ? `
--- USER'S CURRENT FINANCIAL DATA ---
${userContext}
--- END FINANCIAL DATA ---

Use this data to provide accurate, personalized responses. Reference specific numbers, transactions, and invoices when relevant.` : "No financial data available for this user."}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

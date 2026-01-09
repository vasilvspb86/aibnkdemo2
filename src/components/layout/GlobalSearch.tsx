import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, ArrowUpDown, CreditCard, Receipt, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "transaction" | "invoice" | "payment" | "card";
  path: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setIsLoading(true);
      const searchResults: SearchResult[] = [];

      try {
        // Search transactions
        const { data: transactions } = await supabase
          .from("transactions")
          .select("id, description, counterparty_name, amount, currency")
          .or(`description.ilike.%${query}%,counterparty_name.ilike.%${query}%`)
          .limit(5);

        if (transactions) {
          transactions.forEach((tx) => {
            searchResults.push({
              id: tx.id,
              title: tx.counterparty_name || tx.description || "Transaction",
              subtitle: `${tx.currency} ${tx.amount.toLocaleString()}`,
              type: "transaction",
              path: "/accounts",
            });
          });
        }

        // Search invoices
        const { data: invoices } = await supabase
          .from("invoices")
          .select("id, invoice_number, client_name, total, currency")
          .or(`invoice_number.ilike.%${query}%,client_name.ilike.%${query}%`)
          .limit(5);

        if (invoices) {
          invoices.forEach((inv) => {
            searchResults.push({
              id: inv.id,
              title: `${inv.invoice_number} - ${inv.client_name}`,
              subtitle: `${inv.currency} ${inv.total.toLocaleString()}`,
              type: "invoice",
              path: "/invoices",
            });
          });
        }

        // Search payments
        const { data: payments } = await supabase
          .from("payments")
          .select("id, reference, amount, currency, beneficiaries(name)")
          .or(`reference.ilike.%${query}%`)
          .limit(5);

        if (payments) {
          payments.forEach((pay) => {
            const beneficiaryName = (pay.beneficiaries as any)?.name || "Payment";
            searchResults.push({
              id: pay.id,
              title: pay.reference || beneficiaryName,
              subtitle: `${pay.currency} ${pay.amount.toLocaleString()}`,
              type: "payment",
              path: "/payments",
            });
          });
        }

        // Search cards
        const { data: cards } = await supabase
          .from("cards")
          .select("id, cardholder_name, card_number_last4")
          .ilike("cardholder_name", `%${query}%`)
          .limit(5);

        if (cards) {
          cards.forEach((card) => {
            searchResults.push({
              id: card.id,
              title: card.cardholder_name,
              subtitle: `**** ${card.card_number_last4 || "****"}`,
              type: "card",
              path: "/cards",
            });
          });
        }

        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    navigate(result.path);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "transaction":
        return <ArrowUpDown className="h-4 w-4" />;
      case "invoice":
        return <FileText className="h-4 w-4" />;
      case "payment":
        return <ArrowUpDown className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div 
        className="relative hidden md:block cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search transactions, invoices..." 
          className="w-80 pl-10 bg-secondary/50 border-0 focus-visible:ring-1 cursor-pointer"
          readOnly
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search transactions, invoices, payments, cards..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              {results.length > 0 && (
                <CommandGroup heading="Results">
                  {results.map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      onSelect={() => handleSelect(result)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {getIcon(result.type)}
                        </div>
                        <div>
                          <p className="font-medium">{result.title}</p>
                          <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

interface ProductSelectProps {
  products: Product[];
  value: Product | null;
  onChange: (product: Product | null) => void;
}

export function ProductSelect({ products, value, onChange }: ProductSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <div
        className="flex cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm"
        onClick={() => setOpen(!open)}
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        {value ? (
          <span className="flex-1 truncate">{value.name}</span>
        ) : (
          <span className="flex-1 text-muted-foreground">Select a product...</span>
        )}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-hidden rounded-md border bg-popover shadow-elevated animate-fade-in">
          <div className="p-2">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="h-8"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">No products found</div>
            )}
            {filtered.map((product) => (
              <button
                key={product.id}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                onClick={() => {
                  onChange(product);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.product_id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">${product.price}</span>
                  <Badge variant={product.stock < 10 ? "destructive" : product.stock < 30 ? "outline" : "secondary"} className="text-xs">
                    {product.stock < 10 ? `Low: ${product.stock}` : `${product.stock} in stock`}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProductSelect } from "@/components/ProductSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShoppingCart, Package } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

function generateOrderId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SA-${date}-${rand}`;
}

export default function Shop() {
  const { user, userEmail } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userEmail) {
      toast.error("You must be logged in to place an order");
      return;
    }
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    if (!customerName.trim() || !shippingAddress.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (quantity > selectedProduct.stock) {
      toast.error(`Only ${selectedProduct.stock} units available`);
      return;
    }

    setSubmitting(true);
    try {
      const orderId = generateOrderId();
      const payload = {
        order_id: orderId,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity,
        unit_price: selectedProduct.price,
        total_price: totalPrice,
        customer_name: customerName.trim(),
        customer_email: userEmail,
        shipping_address: shippingAddress.trim(),
        special_instructions: specialInstructions.trim() || null,
        user_id: user.id,
      };

      // Save to database
      const { error: dbError } = await supabase.from("orders").insert(payload);
      if (dbError) throw dbError;

      // Send to webhook proxy
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      await fetch(`https://${projectId}.supabase.co/functions/v1/webhook-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ type: "order", payload }),
      });

      toast.success(`Order ${orderId} placed successfully!`);
      setSelectedProduct(null);
      setQuantity(1);
      setCustomerName("");
      setShippingAddress("");
      setSpecialInstructions("");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-accent" />
          Product Catalog
        </h1>
        <p className="mt-2 text-muted-foreground">Browse and order from our smart product range</p>
      </div>

      {/* Product Grid Preview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Available Products
          <Badge variant="secondary">{products.length} items</Badge>
        </h2>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-72 overflow-y-auto pr-2">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-all hover:shadow-card ${
                  selectedProduct?.id === p.id ? "border-accent bg-accent/5 shadow-glow" : "bg-card"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.product_id}</div>
                </div>
                <div className="ml-2 text-right">
                  <div className="font-mono font-semibold">${p.price}</div>
                  <Badge variant={p.stock < 10 ? "destructive" : "secondary"} className="text-xs">
                    {p.stock < 10 ? `Low: ${p.stock}` : p.stock}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Form */}
      <Card className="animate-fade-in shadow-elevated">
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
          <CardDescription>
            {userEmail ? (
              <span>Ordering as <span className="font-medium text-foreground">{userEmail}</span></span>
            ) : (
              "You must be logged in to place an order"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOrder} className="space-y-4">
            <div className="space-y-2">
              <Label>Product *</Label>
              <ProductSelect products={products} value={selectedProduct} onChange={setSelectedProduct} />
            </div>

            {selectedProduct && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Unit Price:</span>
                  <span className="font-mono font-semibold">${selectedProduct.price}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Stock:</span>
                  <Badge variant={selectedProduct.stock < 10 ? "destructive" : "secondary"}>
                    {selectedProduct.stock} available
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={selectedProduct?.stock || 999}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 font-mono text-lg font-bold">
                  ${totalPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Your Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full name"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address *</Label>
              <Textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Full shipping address"
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special delivery instructions..."
                maxLength={500}
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-accent text-accent-foreground border-0 hover:opacity-90"
              disabled={submitting || !user}
              size="lg"
            >
              {submitting ? "Processing Order..." : `Place Order — $${totalPrice.toFixed(2)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

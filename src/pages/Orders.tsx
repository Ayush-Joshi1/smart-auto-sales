import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function Orders() {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8 text-accent" />
          My Orders
        </h1>
        <p className="mt-2 text-muted-foreground">Track your order history</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No orders yet. Visit the Shop to place your first order.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="animate-fade-in shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-mono">{order.order_id}</CardTitle>
                  <Badge variant={order.status === "pending" ? "outline" : order.status === "completed" ? "default" : "secondary"}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Product:</span>{" "}
                    <span className="font-medium">{order.product_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Qty:</span>{" "}
                    <span className="font-medium">{order.quantity} × ${order.unit_price}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>{" "}
                    <span className="font-mono font-bold">${order.total_price}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Ship to:</span>{" "}
                    <span>{order.shipping_address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package, Users, MessageSquare, Star, Download, LogOut, Shield,
  TrendingUp, AlertTriangle, Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function downloadCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(","), ...data.map((row) =>
    headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
  )].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadJSON(data: any[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch all data (owner sees everything via edge function or direct if policies allow)
  // For demo we use direct queries - in production use edge functions with service role
  const { data: orders = [] } = useQuery({
    queryKey: ["owner-orders"],
    queryFn: async () => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/owner-data?type=orders`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ["owner-complaints"],
    queryFn: async () => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/owner-data?type=complaints`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["owner-reviews"],
    queryFn: async () => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/owner-data?type=reviews`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0);
  const lowStockProducts = products.filter((p) => p.stock < 10);

  const filteredOrders = orders.filter((o: any) => {
    const matchSearch = !orderSearch || o.order_id?.includes(orderSearch) || o.product_name?.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer_email?.includes(orderSearch);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Group by customer
  const customerMap = new Map<string, { orders: any[]; complaints: any[]; reviews: any[]; revenue: number }>();
  orders.forEach((o: any) => {
    const email = o.customer_email;
    if (!customerMap.has(email)) customerMap.set(email, { orders: [], complaints: [], reviews: [], revenue: 0 });
    const c = customerMap.get(email)!;
    c.orders.push(o);
    c.revenue += Number(o.total_price || 0);
  });
  complaints.forEach((c: any) => {
    const email = c.customer_email;
    if (!customerMap.has(email)) customerMap.set(email, { orders: [], complaints: [], reviews: [], revenue: 0 });
    customerMap.get(email)!.complaints.push(c);
  });
  reviews.forEach((r: any) => {
    const email = r.customer_email;
    if (!customerMap.has(email)) customerMap.set(email, { orders: [], complaints: [], reviews: [], revenue: 0 });
    customerMap.get(email)!.reviews.push(r);
  });

  const handleLogout = () => {
    sessionStorage.removeItem("owner_authenticated");
    sessionStorage.removeItem("owner_email");
    navigate("/owner-login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Owner Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent">
              <Shield className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold">Owner CRM</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </nav>

      <div className="container py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4 animate-fade-in">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-brand">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <div className="text-xs text-muted-foreground">Total Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono">${totalRevenue.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <MessageSquare className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{complaints.length}</div>
                  <div className="text-xs text-muted-foreground">Complaints</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{lowStockProducts.length}</div>
                  <div className="text-xs text-muted-foreground">Low Stock</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="animate-fade-in">
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="gap-2"><Package className="h-4 w-4" />Orders</TabsTrigger>
            <TabsTrigger value="customers" className="gap-2"><Users className="h-4 w-4" />Customers</TabsTrigger>
            <TabsTrigger value="complaints" className="gap-2"><MessageSquare className="h-4 w-4" />Complaints</TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2"><Star className="h-4 w-4" />Reviews</TabsTrigger>
            <TabsTrigger value="exports" className="gap-2"><Download className="h-4 w-4" />Exports</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                className="rounded-md border bg-card px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Order ID</th>
                    <th className="px-4 py-3 text-left font-medium">Product</th>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-right font-medium">Qty</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o: any) => (
                    <tr key={o.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{o.order_id}</td>
                      <td className="px-4 py-3">{o.product_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.customer_email}</td>
                      <td className="px-4 py-3 text-right">{o.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">${o.total_price}</td>
                      <td className="px-4 py-3">
                        <Badge variant={o.status === "pending" ? "outline" : "default"}>{o.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <div className="space-y-4">
              {Array.from(customerMap.entries()).map(([email, data]) => (
                <Card key={email} className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{email}</CardTitle>
                      <span className="font-mono font-semibold text-accent">${data.revenue.toFixed(2)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <Badge variant="secondary">{data.orders.length} orders</Badge>
                      <Badge variant={data.complaints.length > 0 ? "destructive" : "secondary"}>{data.complaints.length} complaints</Badge>
                      <Badge variant="outline">{data.reviews.length} reviews</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {customerMap.size === 0 && (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No customers yet</CardContent></Card>
              )}
            </div>
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints">
            <div className="space-y-3">
              {complaints.map((c: any) => (
                <Card key={c.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{c.subject}</div>
                        <div className="text-sm text-muted-foreground mt-1">{c.customer_email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.sentiment && <Badge variant="outline">{c.sentiment}</Badge>}
                        <Badge variant={c.status === "open" ? "destructive" : "secondary"}>{c.status}</Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{c.description}</p>
                    {c.order_id && <div className="mt-2 text-xs text-muted-foreground font-mono">Order: {c.order_id}</div>}
                  </CardContent>
                </Card>
              ))}
              {complaints.length === 0 && (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No complaints</CardContent></Card>
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-3">
              {reviews.map((r: any) => (
                <Card key={r.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "fill-accent text-accent" : "text-muted"}`} />
                      ))}
                    </div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{r.customer_email}</div>
                    <p className="mt-1 text-sm">{r.review_text}</p>
                  </CardContent>
                </Card>
              ))}
              {reviews.length === 0 && (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No reviews</CardContent></Card>
              )}
            </div>
          </TabsContent>

          {/* Exports Tab */}
          <TabsContent value="exports">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base">Export Data</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { downloadCSV(orders, "orders.csv"); toast.success("Orders exported"); }}>
                    <Download className="h-4 w-4" /> Orders (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { downloadCSV(complaints, "complaints.csv"); toast.success("Complaints exported"); }}>
                    <Download className="h-4 w-4" /> Complaints (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => {
                    const customers = Array.from(customerMap.entries()).map(([email, d]) => ({ email, orders: d.orders.length, complaints: d.complaints.length, reviews: d.reviews.length, revenue: d.revenue }));
                    downloadCSV(customers, "customers.csv");
                    toast.success("Customer data exported");
                  }}>
                    <Download className="h-4 w-4" /> Customer Data (CSV)
                  </Button>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base">JSON Backup</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => {
                    downloadJSON([{ orders, complaints, reviews, products }], "smartauto-backup.json");
                    toast.success("Full backup downloaded");
                  }}>
                    <Download className="h-4 w-4" /> Full Backup (JSON)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

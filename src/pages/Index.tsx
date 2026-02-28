import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Shield, Zap, Package, Star, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { icon: ShoppingCart, title: "Smart Ordering", desc: "Auto-generated order IDs, stock validation, instant invoicing" },
  { icon: Zap, title: "Automation First", desc: "Powered by n8n workflows for seamless operations" },
  { icon: Shield, title: "Enterprise Security", desc: "Role-based access, protected routes, webhook proxying" },
  { icon: Package, title: "Inventory Tracking", desc: "Real-time stock monitoring with low-stock alerts" },
  { icon: Star, title: "Customer Reviews", desc: "Product reviews with AI-powered sentiment analysis" },
  { icon: MessageSquare, title: "Support System", desc: "Complaint tracking with automated processing" },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-24 md:py-32">
        <div className="container text-center">
          <div className="mx-auto max-w-3xl animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              <Zap className="h-4 w-4" />
              Automation-First E-Commerce
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
              Smart<span className="text-gradient">Auto</span> Sales
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/70 md:text-xl">
              Enterprise-grade automation platform powered by intelligent workflows.
              Streamline orders, invoicing, and customer management.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to={user ? "/shop" : "/auth"}>
                <Button size="lg" className="gradient-accent text-accent-foreground font-semibold gap-2 shadow-glow hover:opacity-90 transition-opacity border-0">
                  <ShoppingCart className="h-5 w-5" />
                  {user ? "Browse Products" : "Get Started"}
                </Button>
              </Link>
              <Link to="/owner-login">
                <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 bg-primary-foreground/5">
                  <Shield className="h-5 w-5" />
                  Owner Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Enterprise Features</h2>
            <p className="text-muted-foreground">Everything you need to run a professional e-commerce operation</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg gradient-brand">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 SmartAuto Sales By Unorthodox. Enterprise Automation Platform.
        </div>
      </footer>
    </div>
  );
};

export default Index;

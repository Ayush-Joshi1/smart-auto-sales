import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageSquare, Star, Package, LogOut, Shield, Menu, X } from "lucide-react";
import { useState } from "react";

const customerLinks = [
  { to: "/shop", label: "Shop", icon: ShoppingCart },
  { to: "/orders", label: "My Orders", icon: Package },
  { to: "/complaints", label: "Complaints", icon: MessageSquare },
  { to: "/reviews", label: "Reviews", icon: Star },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide navbar on owner routes
  if (location.pathname.startsWith("/owner")) return null;

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">SmartAuto Sales</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {customerLinks.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
              <Link to="/owner-login">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Owner
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-2">
            {customerLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            {user ? (
              <Button variant="ghost" onClick={() => { signOut(); setMobileOpen(false); }} className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <>
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Sign In</Button>
                </Link>
                <Link to="/owner-login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    <Shield className="h-4 w-4" />
                    Owner
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

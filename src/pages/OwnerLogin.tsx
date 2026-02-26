import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const OWNER_ID = "own1234";

export default function OwnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !ownerId.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (ownerId !== OWNER_ID) {
      toast.error("Invalid Owner ID. Access denied.");
      return;
    }

    setLoading(true);
    // For demo purposes, owner authentication is validated client-side with Owner ID
    // In production, this would go through a secure edge function
    try {
      // Store owner session
      sessionStorage.setItem("owner_authenticated", "true");
      sessionStorage.setItem("owner_email", email);
      toast.success("Owner access granted");
      navigate("/owner/dashboard");
    } catch {
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
            <Shield className="h-6 w-6 text-accent-foreground" />
          </div>
          <CardTitle className="text-2xl">Owner Portal</CardTitle>
          <CardDescription>Restricted access — authorized owners only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@smartauto.com"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerPassword">Password</Label>
              <Input
                id="ownerPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                maxLength={128}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner ID</Label>
              <Input
                id="ownerId"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="Enter your Owner ID"
                maxLength={20}
              />
            </div>
            <Button type="submit" className="w-full gradient-accent text-accent-foreground border-0 hover:opacity-90" disabled={loading}>
              {loading ? "Verifying..." : "Access Owner Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

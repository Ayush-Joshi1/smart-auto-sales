import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OwnerProtectedRoute } from "@/components/OwnerProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import OwnerLogin from "./pages/OwnerLogin";
import Shop from "./pages/Shop";
import Orders from "./pages/Orders";
import Complaints from "./pages/Complaints";
import Reviews from "./pages/Reviews";
import OwnerDashboard from "./pages/OwnerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/owner-login" element={<OwnerLogin />} />
            <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="/owner/dashboard" element={<OwnerProtectedRoute><OwnerDashboard /></OwnerProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

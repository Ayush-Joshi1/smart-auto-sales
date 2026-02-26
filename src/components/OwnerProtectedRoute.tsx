import { Navigate } from "react-router-dom";

export function OwnerProtectedRoute({ children }: { children: React.ReactNode }) {
  const isOwner = sessionStorage.getItem("owner_authenticated") === "true";
  if (!isOwner) return <Navigate to="/owner-login" replace />;
  return <>{children}</>;
}

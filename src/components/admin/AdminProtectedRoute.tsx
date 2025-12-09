import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Loader2 } from "lucide-react";

const AdminProtectedRoute = () => {
  const { isCodeVerified, user, isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Step 1: Code must be verified
  if (!isCodeVerified) {
    return <Navigate to="/admin" replace />;
  }

  // Step 2: User must be authenticated
  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  // Step 3: User must have admin role
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;

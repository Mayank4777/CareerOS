import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingState } from "@/components/ui/loading-state";
import { APP_ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app px-4">
        <LoadingState label="Preparing your workspace..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

import { Navigate, Outlet } from "react-router-dom";

import { LoadingState } from "@/components/ui/loading-state";
import { APP_ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app px-4">
        <LoadingState label="Preparing the authentication workspace..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={APP_ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}

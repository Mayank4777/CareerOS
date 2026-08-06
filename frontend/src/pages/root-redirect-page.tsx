import { Navigate } from "react-router-dom";

import { LoadingState } from "@/components/ui/loading-state";
import { APP_ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";

export function RootRedirectPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app px-4">
        <LoadingState label="Starting CareerOS..." />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? APP_ROUTES.dashboard : APP_ROUTES.login} replace />;
}

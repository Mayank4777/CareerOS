import { createBrowserRouter, type RouteObject } from "react-router-dom";

import { AuthLayout } from "@/layouts/auth-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/routes/protected";
import { PublicRoute } from "@/routes/public";
import { APP_ROUTES } from "@/constants/routes";
import { navigationItems } from "@/constants/navigation";
import { LoginPage } from "@/features/authentication/pages/login-page";
import { RegisterPage } from "@/features/authentication/pages/register-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { ModulePlaceholderPage } from "@/pages/module-placeholder-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { RootRedirectPage } from "@/pages/root-redirect-page";

function flattenNavigationRoutes() {
  const routes: RouteObject[] = [
    {
      path: APP_ROUTES.dashboard,
      element: <DashboardPage />,
    },
  ];

  for (const item of navigationItems) {
    if (item.path === APP_ROUTES.dashboard) {
      continue;
    }

    routes.push({
      path: item.path,
      element: (
        <ModulePlaceholderPage
          moduleName={item.label}
          sectionName="Overview"
          description={item.description}
        />
      ),
    });

    for (const child of item.children ?? []) {
      routes.push({
        path: child.path,
        element: (
          <ModulePlaceholderPage
            moduleName={item.label}
            sectionName={child.label}
            description={child.description}
          />
        ),
      });
    }
  }

  return routes;
}

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.root,
    element: <RootRedirectPage />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: APP_ROUTES.login,
        element: (
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        ),
      },
      {
        path: APP_ROUTES.register,
        element: (
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: flattenNavigationRoutes(),
      },
    ],
  },
  {
    path: APP_ROUTES.notFound,
    element: <NotFoundPage />,
  },
]);

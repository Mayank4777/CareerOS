import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_ROUTES } from "@/constants/routes";
import { Container } from "@/components/ui/container";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center bg-app">
      <Container>
        <Card className="mx-auto max-w-xl">
          <CardContent className="space-y-5 py-12 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-secondary">404</p>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-primary">Page not found</h1>
              <p className="text-sm leading-6 text-secondary">
                The page you are looking for does not exist or has moved.
              </p>
            </div>
            <div className="flex justify-center">
              <Button asChild variant="secondary">
                <Link to={APP_ROUTES.dashboard}>Return to dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/validation/auth";
import { useLoginMutation } from "@/services/auth-mutations";

function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as any;
  if (err?.code === "ERR_NETWORK" || !err?.response) {
    return "Cannot connect to backend server. Please verify that Django is running at http://127.0.0.1:8000.";
  }
  return err.response?.data?.message || err.response?.data?.detail || fallback;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const mutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(APP_ROUTES.dashboard, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    const session = await mutation.mutateAsync(values);
    const destination = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? APP_ROUTES.dashboard;
    navigate(destination, { replace: true });
    return session;
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue managing your career data and next opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input id="email" type="email" autoComplete="email" className="pl-9" {...register("email")} />
            </div>
            {errors.email ? <p className="text-sm text-danger">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="pl-9"
                {...register("password")}
              />
            </div>
            {errors.password ? <p className="text-sm text-danger">{errors.password.message}</p> : null}
          </div>

          {mutation.isError ? (
            <p className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
              {getErrorMessage(mutation.error, "Unable to sign in right now. Please verify your credentials and try again.")}
            </p>
          ) : null}

          <Button className="w-full" type="submit" loading={mutation.isPending}>
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary">Need an account?</span>
          <Link className="font-medium text-brand-500 hover:text-brand-600" to={APP_ROUTES.register}>
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail, Lock, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_ROUTES } from "@/constants/routes";
import { registerSchema, type RegisterFormValues } from "@/validation/auth";
import { useRegisterMutation } from "@/services/auth-mutations";

function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as any;
  if (err?.code === "ERR_NETWORK" || !err?.response) {
    return "Cannot connect to backend server. Please verify that Django is running at http://127.0.0.1:8000.";
  }
  return err.response?.data?.message || err.response?.data?.detail || fallback;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const mutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    navigate(APP_ROUTES.dashboard, { replace: true });
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start building a structured career workspace in a few minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary" htmlFor="first_name">
                First name
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input id="first_name" className="pl-9" autoComplete="given-name" {...register("first_name")} />
              </div>
              {errors.first_name ? <p className="text-sm text-danger">{errors.first_name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary" htmlFor="last_name">
                Last name
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input id="last_name" className="pl-9" autoComplete="family-name" {...register("last_name")} />
              </div>
              {errors.last_name ? <p className="text-sm text-danger">{errors.last_name.message}</p> : null}
            </div>
          </div>

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
              <Input id="password" type="password" autoComplete="new-password" className="pl-9" {...register("password")} />
            </div>
            {errors.password ? <p className="text-sm text-danger">{errors.password.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary" htmlFor="confirm_password">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                className="pl-9"
                {...register("confirm_password")}
              />
            </div>
            {errors.confirm_password ? (
              <p className="text-sm text-danger">{errors.confirm_password.message}</p>
            ) : null}
          </div>

          {mutation.isError ? (
            <p className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
              {getErrorMessage(mutation.error, "Unable to create your account right now. Please review the form and try again.")}
            </p>
          ) : null}

          <Button className="w-full" type="submit" loading={mutation.isPending}>
            Create account
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary">Already have an account?</span>
          <Link className="font-medium text-brand-500 hover:text-brand-600" to={APP_ROUTES.login}>
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

import { type ReactNode } from "react";

import { APP_NAME } from "@/constants/api";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto grid min-h-screen max-w-container lg:grid-cols-[1.1fr_minmax(360px,420px)]">
        <aside className="hidden flex-col justify-between border-r border-border bg-sidebar px-10 py-10 lg:flex">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm">
                CO
              </div>
              <div>
                <p className="text-base font-semibold text-primary">{APP_NAME}</p>
                <p className="text-sm text-secondary">AI-first career operating system</p>
              </div>
            </div>

            <div className="max-w-xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-primary">
                Structure your career with the same clarity as a modern SaaS product.
              </h1>
              <p className="text-base leading-7 text-secondary">
                Centralize profile data, resumes, applications, and career planning in one
                secure workspace designed for long-term growth.
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-primary">Built for the full professional lifecycle</p>
            <p className="text-sm leading-6 text-secondary">
              From profile foundations to AI-assisted decision making, CareerOS is designed to
              grow with the user rather than trap them in a single workflow.
            </p>
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}

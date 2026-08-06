import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/cards/section-card";
import { APP_ROUTES } from "@/constants/routes";

interface ModulePlaceholderPageProps {
  moduleName: string;
  sectionName: string;
  description?: string;
}

export function ModulePlaceholderPage({
  moduleName,
  sectionName,
  description,
}: ModulePlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: APP_ROUTES.dashboard },
          { label: moduleName },
          { label: sectionName },
        ]}
        title={`${moduleName} · ${sectionName}`}
        description={
          description ??
          "This section is prepared for the next vertical slice of the CareerOS frontend."
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <SectionCard
          title="Implementation ready"
          description="The shell, navigation, and data layer are in place for this section."
        >
          <div className="space-y-4 text-sm leading-6 text-secondary">
            <p>
              The frontend architecture now supports authenticated layouts, expandable navigation,
              reusable UI primitives, and API integration for the module.
            </p>
            <p>
              The next feature slice can swap this overview for real module data without changing
              the application structure.
            </p>
          </div>
        </SectionCard>

        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Next vertical slice</p>
                <p className="text-xs text-secondary">Module data, forms, and queries</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-secondary">
              Use this scaffold to replace the placeholder with the first real screen for{" "}
              {moduleName.toLowerCase()}.
            </p>
            <Button asChild variant="secondary">
              <Link to={APP_ROUTES.dashboard} className="inline-flex items-center gap-2">
                Back to dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

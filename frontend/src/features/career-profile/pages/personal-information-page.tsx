import { useEffect, useMemo, useState } from "react";
import { useBeforeUnload, useBlocker } from "react-router-dom";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/cards/section-card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { queryClient } from "@/lib/query-client";
import { APP_ROUTES } from "@/constants/routes";
import { useToast } from "@/components/ui/toast";
import {
  createCareerProfile,
  fetchCareerProfile,
  updateCareerProfile,
} from "@/features/career-profile/services/career-profile";
import type { ApiError } from "@/types/api";
import type { CareerProfile } from "@/features/career-profile/types/career-profile";
import {
  careerProfileFormSchema,
  type CareerProfileFormValues,
} from "@/features/career-profile/validation/career-profile";
import { Textarea } from "@/components/ui/textarea";

const CAREER_PROFILE_QUERY_KEY = ["career-profile"] as const;

const emptyProfileValues: CareerProfileFormValues = {
  firstName: "",
  lastName: "",
  headline: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
  summary: "",
};

const fieldErrorMap: Record<string, keyof CareerProfileFormValues> = {
  first_name: "firstName",
  last_name: "lastName",
  headline: "headline",
  phone: "phone",
  phone_number: "phone",
  location: "location",
  website: "website",
  website_url: "website",
  linkedin: "linkedin",
  linkedin_url: "linkedin",
  github: "github",
  github_url: "github",
  summary: "summary",
  about_me: "summary",
};

export function PersonalInformationPage() {
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: CAREER_PROFILE_QUERY_KEY,
    queryFn: fetchCareerProfile,
  });

  const form = useForm<CareerProfileFormValues>({
    resolver: zodResolver(careerProfileFormSchema),
    defaultValues: emptyProfileValues,
    mode: "onBlur",
  });

  const profile = profileQuery.data ?? null;
  const hasProfile = Boolean(profile);
  const isFormDirty = form.formState.isDirty;

  const saveMutation = useMutation({
    mutationFn: async (values: CareerProfileFormValues) => {
      return profile ? updateCareerProfile(values) : createCareerProfile(values);
    },
    onSuccess: (savedProfile) => {
      queryClient.setQueryData(CAREER_PROFILE_QUERY_KEY, savedProfile);
      form.reset(mapProfileToFormValues(savedProfile));
      setFormError(null);
      toast.success(
        profile ? "Career profile saved" : "Career profile created",
        "Your changes are now available across CareerOS."
      );
    },
    onError: (error: unknown) => {
      const response = axios.isAxiosError<ApiError>(error) ? error.response?.data : undefined;
      const generalMessage = response?.message ?? "We could not save your career profile right now.";
      const fieldErrors = response?.errors;

      form.clearErrors();

      if (fieldErrors && typeof fieldErrors === "object" && !Array.isArray(fieldErrors)) {
        let mappedFieldError = false;

        for (const [key, value] of Object.entries(fieldErrors)) {
          const formField = fieldErrorMap[key];
          const message = normalizeErrorMessage(value);

          if (formField && message) {
            form.setError(formField, { type: "server", message });
            mappedFieldError = true;
          }
        }

        if (mappedFieldError) {
          setFormError("Please fix the highlighted fields and try again.");
          toast.error("Profile needs attention", "Some fields still need to be corrected.");
          return;
        }
      }

      setFormError(generalMessage);
      toast.error("Could not save profile", generalMessage);
    },
  });

  useEffect(() => {
    if (profileQuery.isSuccess) {
      form.reset(profile ? mapProfileToFormValues(profile) : emptyProfileValues);
      setFormError(null);
    }
  }, [form, profile, profileQuery.isSuccess]);

  useBeforeUnload((event) => {
    if (isFormDirty && !saveMutation.isPending) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  const blocker = useBlocker(isFormDirty && !saveMutation.isPending);

  const sectionStatus = useMemo(() => {
    if (profileQuery.isFetching && profile) {
      return "Refreshing profile data";
    }

    if (profile) {
      return "Profile loaded";
    }

    return "Profile not created yet";
  }, [profile, profileQuery.isFetching]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    await saveMutation.mutateAsync(values);
  });

  if (profileQuery.isLoading) {
    return <LoadingState label="Loading personal information..." />;
  }

  if (profileQuery.isError) {
    return (
      <ErrorState
        description="We could not load your personal information right now. Please try again in a moment."
        onRetry={() => {
          void profileQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: APP_ROUTES.dashboard },
          { label: "Career Profile", href: APP_ROUTES.careerProfile },
          { label: "Personal Information" },
        ]}
        title="Personal Information"
        description="Core identity and contact details for the Career Profile workspace."
        actions={
          <Button
            form="career-profile-form"
            loading={saveMutation.isPending}
            type="submit"
            disabled={!isFormDirty || saveMutation.isPending}
          >
            {hasProfile ? "Save changes" : "Create profile"}
          </Button>
        }
      />

      <div className="space-y-6">
        {!hasProfile ? (
          <EmptyState
            title="No career profile yet"
            description="Start with your name, headline, and contact links. Save once to create the first version of your profile."
            actionLabel="Start editing"
            onAction={() => {
              form.setFocus("firstName");
            }}
          />
        ) : null}

        <form id="career-profile-form" className="space-y-6" onSubmit={onSubmit}>
          <SectionCard
            title="Profile Card"
            description="Core identity and contact details used across the product."
            footer={
              <div className="flex items-center justify-between gap-3 text-sm text-secondary">
                <span>{sectionStatus}</span>
                {profile?.updatedAt ? <span>Last updated {formatDate(profile.updatedAt)}</span> : null}
              </div>
            }
          >
            {formError ? (
              <div className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-6 text-primary">
                {formError}
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                htmlFor="firstName"
                label="First Name"
                error={form.formState.errors.firstName?.message}
                required
              >
                <Input id="firstName" autoComplete="given-name" {...form.register("firstName")} />
              </FormField>

              <FormField
                htmlFor="lastName"
                label="Last Name"
                error={form.formState.errors.lastName?.message}
                required
              >
                <Input id="lastName" autoComplete="family-name" {...form.register("lastName")} />
              </FormField>
            </div>

            <div className="mt-5 space-y-5">
              <FormField
                htmlFor="headline"
                label="Headline"
                description="Keep it clear and specific. This appears in profile summaries and future matching surfaces."
                error={form.formState.errors.headline?.message}
                required
              >
                <Input
                  id="headline"
                  autoComplete="organization-title"
                  placeholder="Product designer focused on AI-first SaaS"
                  {...form.register("headline")}
                />
              </FormField>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField htmlFor="phone" label="Phone" error={form.formState.errors.phone?.message}>
                  <Input
                    id="phone"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    {...form.register("phone")}
                  />
                </FormField>

                <FormField htmlFor="location" label="Location" error={form.formState.errors.location?.message}>
                  <Input
                    id="location"
                    autoComplete="address-level2"
                    placeholder="Bengaluru, India"
                    {...form.register("location")}
                  />
                </FormField>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <FormField htmlFor="website" label="Website" error={form.formState.errors.website?.message}>
                  <Input
                    id="website"
                    autoComplete="url"
                    placeholder="https://yourwebsite.com"
                    type="url"
                    {...form.register("website")}
                  />
                </FormField>

                <FormField htmlFor="linkedin" label="LinkedIn" error={form.formState.errors.linkedin?.message}>
                  <Input
                    id="linkedin"
                    autoComplete="url"
                    placeholder="https://linkedin.com/in/..."
                    type="url"
                    {...form.register("linkedin")}
                  />
                </FormField>

                <FormField htmlFor="github" label="GitHub" error={form.formState.errors.github?.message}>
                  <Input
                    id="github"
                    autoComplete="url"
                    placeholder="https://github.com/..."
                    type="url"
                    {...form.register("github")}
                  />
                </FormField>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="About Me" description="A short summary that helps you tell your story in one place.">
            <FormField
              htmlFor="summary"
              label="Summary"
              description="Share the shape of your experience, what you care about, and the kind of roles you want next."
              error={form.formState.errors.summary?.message}
              required
            >
              <Textarea id="summary" rows={7} placeholder="I build..." {...form.register("summary")} />
            </FormField>
          </SectionCard>
        </form>
      </div>

      <ConfirmationDialog
        cancelLabel="Stay on page"
        confirmLabel="Leave page"
        description="You have unsaved changes. Leaving now will discard them."
        onCancel={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
        open={blocker.state === "blocked"}
        title="Discard unsaved changes?"
      />
    </div>
  );
}

function mapProfileToFormValues(profile: CareerProfile): CareerProfileFormValues {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    headline: profile.headline,
    phone: profile.phone,
    location: profile.location,
    website: profile.website,
    linkedin: profile.linkedin,
    github: profile.github,
    summary: profile.summary,
  };
}

function normalizeErrorMessage(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

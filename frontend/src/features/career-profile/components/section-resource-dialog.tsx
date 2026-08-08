import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ModalShell } from "@/components/ui/modal-shell";
import { Textarea } from "@/components/ui/textarea";
import type { ApiError } from "@/types/api";
import type {
  ChoiceOption,
  SectionFieldConfig,
  SectionFormValues,
  SectionRecord,
  SectionResourceDialogProps,
} from "@/features/career-profile/types/section";
import { buildSectionDefaultValues, buildSectionSchema } from "@/features/career-profile/validation/section";

export function SectionResourceDialog<TRecord extends SectionRecord>({
  open,
  record,
  config,
  onClose,
  onSubmit,
}: SectionResourceDialogProps<TRecord>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(buildSectionSchema(config.fields, config.validationRules)),
    defaultValues: buildSectionDefaultValues(config.fields),
    mode: "onBlur",
    shouldUnregister: true,
  });

  const mode = record ? "edit" : "create";
  const title = useMemo(
    () => (mode === "edit" ? `Edit ${config.singularLabel.toLowerCase()}` : `Add ${config.singularLabel.toLowerCase()}`),
    [config.singularLabel, mode]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(buildSectionDefaultValues(config.fields, record));
    setSubmitError(null);
  }, [config.fields, form, open, record]);

  useEffect(() => {
    if (!open) {
      form.reset(buildSectionDefaultValues(config.fields));
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [config.fields, form, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);
    form.clearErrors();

    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      const response = axios.isAxiosError<ApiError>(error) ? error.response?.data : undefined;
      const generalMessage =
        response?.message ??
        (error instanceof Error && error.message
          ? error.message
          : `We could not save this ${config.singularLabel.toLowerCase()} right now.`);
      const fieldErrors = response?.errors;

      if (fieldErrors && typeof fieldErrors === "object" && !Array.isArray(fieldErrors)) {
        let mappedFieldError = false;

        for (const [key, value] of Object.entries(fieldErrors)) {
          const formField = config.fields.find((field) => field.name === key);
          const message = normalizeErrorMessage(value);

          if (formField && message) {
            form.setError(formField.name as keyof SectionFormValues, { type: "server", message });
            mappedFieldError = true;
          }
        }

        if (mappedFieldError) {
          setSubmitError("Please fix the highlighted fields and try again.");
          return;
        }
      }

      setSubmitError(generalMessage);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ModalShell open={open} panelClassName="max-w-2xl" titleId="section-resource-dialog-title">
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 id="section-resource-dialog-title" className="text-lg font-semibold text-primary">
              {title}
            </h3>
            <p className="text-sm leading-6 text-secondary">{config.description}</p>
          </div>

          <Button aria-label="Close modal" type="button" size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <form className="space-y-5 px-6 py-5" onSubmit={handleSubmit}>
        {submitError ? (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-6 text-primary">
            {submitError}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          {config.fields.map((field) => (
            <SectionField key={field.name} field={field} form={form} />
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={isSubmitting} type="submit">
            {mode === "edit" ? `Save ${config.singularLabel.toLowerCase()}` : `Add ${config.singularLabel.toLowerCase()}`}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function SectionField({
  field,
  form,
}: {
  field: SectionFieldConfig;
  form: UseFormReturn<SectionFormValues>;
}) {
  const error = form.formState.errors[field.name as keyof SectionFormValues]?.message as string | undefined;
  const registerProps = form.register(field.name as never);

  if (field.kind === "checkbox") {
    return (
      <div className="md:col-span-2">
        <label className="flex items-start gap-3 rounded-xl border border-border px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border text-brand-600 focus:ring-borderFocus"
            {...registerProps}
          />
          <span className="space-y-1">
            <span className="block text-sm font-medium text-primary">{field.label}</span>
            {field.description ? <span className="block text-xs leading-5 text-secondary">{field.description}</span> : null}
          </span>
        </label>
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      </div>
    );
  }

  const inputClassName = field.kind === "textarea" ? "md:col-span-2" : "";
  const input = renderInput(field, registerProps);

  return (
    <FormField
      className={inputClassName}
      htmlFor={field.name}
      label={field.label}
      description={field.description}
      error={error}
      required={field.required}
    >
      {input}
    </FormField>
  );
}

function renderInput(
  field: SectionFieldConfig,
  registerProps: ReturnType<UseFormReturn<SectionFormValues>["register"]>
) {
  if (field.kind === "textarea") {
    return (
      <Textarea
        id={field.name}
        placeholder={field.placeholder}
        rows={field.rows ?? 4}
        {...registerProps}
      />
    );
  }

  const type =
    field.kind === "email" || field.kind === "url" || field.kind === "date" || field.kind === "number"
      ? field.kind
      : field.kind === "checkbox" || field.kind === "combobox"
        ? "text"
        : "text";

  if (field.kind === "combobox" && field.options?.length) {
    const listId = `${field.name}-options`;

    return (
      <>
        <Input id={field.name} list={listId} placeholder={field.placeholder} type={type} {...registerProps} />
        <datalist id={listId}>
          {field.options.map((option: ChoiceOption) => (
            <option key={option.value} value={option.label} />
          ))}
        </datalist>
      </>
    );
  }

  return (
    <Input
      id={field.name}
      inputMode={field.kind === "number" ? "numeric" : undefined}
      min={field.kind === "number" ? 0 : undefined}
      placeholder={field.placeholder}
      step={field.kind === "number" ? 1 : undefined}
      type={type}
      {...registerProps}
    />
  );
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

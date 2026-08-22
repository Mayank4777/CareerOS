import type { ChoiceOption } from "@/features/career-profile/types/section";

export function normalizeChoiceValue(
  value: unknown,
  options?: ChoiceOption[],
  allowCustom = false
) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!options || options.length === 0) {
    return trimmed;
  }

  const match = findChoice(trimmed, options);
  if (match) {
    return match.value;
  }

  return allowCustom ? trimmed : trimmed;
}

export function displayChoiceLabel(value: unknown, options?: ChoiceOption[]) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed || !options || options.length === 0) {
    return trimmed;
  }

  const match = findChoice(trimmed, options);
  return match?.label ?? trimmed;
}

export function isValidChoice(value: unknown, options?: ChoiceOption[]) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (!options || options.length === 0) {
    return true;
  }

  return Boolean(findChoice(trimmed, options));
}

function findChoice(value: string, options: ChoiceOption[]) {
  const normalized = value.toLowerCase();

  return options.find(
    (option) => option.value.toLowerCase() === normalized || option.label.toLowerCase() === normalized
  );
}

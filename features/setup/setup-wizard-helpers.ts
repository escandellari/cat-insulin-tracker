import type { UseFormSetError } from "react-hook-form";
import type { SetupFormInput } from "./schema";

export type SetupWizardDateDefaults =
  | {
      kind: "browser";
    }
  | {
      kind: "fixed";
      timezone: string;
      scheduleStartDate: string;
    };

const STEP_BY_FIELD: Partial<Record<keyof SetupFormInput, number>> = {
  catName: 0,
  injectionTimes: 1,
  defaultDosage: 1,
  defaultNeedlesPerInjection: 1,
  timezone: 2,
  scheduleStartDate: 2,
};

export function getDefaultSetupFormValues(defaultDateValues: SetupWizardDateDefaults): SetupFormInput {
  return {
    catName: "",
    injectionTimes: [""],
    defaultDosage: 0,
    defaultNeedlesPerInjection: 0,
    timezone: defaultDateValues.kind === "fixed" ? defaultDateValues.timezone : "",
    scheduleStartDate: defaultDateValues.kind === "fixed" ? defaultDateValues.scheduleStartDate : "",
  };
}

export function isValidationErrorResponse(body: unknown): body is {
  errors: Partial<Record<keyof SetupFormInput, string[]>>;
} {
  return typeof body === "object" && body !== null && "errors" in body;
}

export function getStepForErrors(errors: Partial<Record<keyof SetupFormInput, unknown>>, fallbackStep: number) {
  return Object.keys(errors).reduce(
    (nextStepIndex, field) => Math.min(nextStepIndex, STEP_BY_FIELD[field as keyof SetupFormInput] ?? fallbackStep),
    fallbackStep,
  );
}

export function applyFieldErrors(
  setError: UseFormSetError<SetupFormInput>,
  fieldErrors: Partial<Record<keyof SetupFormInput, string[] | undefined>>,
) {
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) {
      setError(field as keyof SetupFormInput, { message: messages[0] });
    }
  }
}

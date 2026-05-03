import type { UseFormSetError } from "react-hook-form";
import type { SetupFormInput } from "./schema";

export type SetupWizardDateDefaults =
  | {
      kind: "browser";
    }
  | {
      kind: "fixed";
      treatmentStartDate: string;
    };

const STEP_BY_FIELD: Partial<Record<keyof SetupFormInput, number>> = {
  catName: 0,
  treatmentStartDate: 1,
  morningTime: 2,
  eveningTime: 2,
  defaultDosage: 3,
  dueWindowMinutes: 3,
};

export function getDefaultSetupFormValues(defaultDateValues: SetupWizardDateDefaults): SetupFormInput {
  return {
    catName: "",
    treatmentStartDate: defaultDateValues.kind === "fixed" ? defaultDateValues.treatmentStartDate : "",
    browserTimezone: "UTC",
    morningTime: "08:00",
    eveningTime: "20:00",
    defaultDosage: 0,
    dueWindowMinutes: 0,
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

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getBrowserTimezone, getLocalDateString } from "./local-date";
import {
  applyFieldErrors,
  getDefaultSetupFormValues,
  getStepForErrors,
  isValidationErrorResponse,
  type SetupWizardDateDefaults,
} from "./setup-wizard-helpers";
import {
  MobileShell,
  mobilePrimaryButtonClassName,
  mobileSecondaryButtonClassName,
} from "./mobile-shell";
import {
  CatStep,
  DosageStep,
  InjectionTimesStep,
  ReviewStep,
  StartDateStep,
} from "./setup-wizard-steps";
import {
  setupSchema,
  setupStepSchemas,
  type SetupFormInput,
  type SetupInput,
} from "./schema";
import type { FieldErrors } from "react-hook-form";

export function SetupWizard({
  defaultDateValues,
}: {
  defaultDateValues: SetupWizardDateDefaults;
}) {
  const router = useRouter();
  const didHydrateClientDefaults = useRef(false);
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const lastStep = 4;
  const {
    register,
    watch,
    reset,
    getValues,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormInput, undefined, SetupInput>({
    resolver: zodResolver(setupSchema),
    defaultValues: getDefaultSetupFormValues(defaultDateValues),
  });

  useEffect(() => {
    if (didHydrateClientDefaults.current) {
      return;
    }

    didHydrateClientDefaults.current = true;

    reset(
      {
        ...getValues(),
        browserTimezone: getBrowserTimezone(),
        treatmentStartDate:
          defaultDateValues.kind === "browser" ? getLocalDateString() : getValues("treatmentStartDate"),
      },
      { keepDirtyValues: true },
    );
  }, [defaultDateValues.kind, getValues, reset]);

  async function nextStep() {
    const schema = setupStepSchemas[step];

    if (!schema) {
      setStep((current) => Math.min(current + 1, lastStep));
      return;
    }

    const stepValues = getValues();
    const parsed = schema.safeParse(stepValues);

    if (!parsed.success) {
      applyFieldErrors(setError, parsed.error.flatten().fieldErrors);
      return;
    }

    clearErrors();
    setStep((current) => Math.min(current + 1, lastStep));
  }

  const onSubmit = handleSubmit(
    async (values) => {
      setSubmitError(null);

      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.redirected && new URL(response.url).pathname === "/auth/signin") {
        router.push("/auth/signin");
        return;
      }

      if (response.status === 303 || response.ok) {
        router.push("/dashboard");
        return;
      }

      const body = await response.json().catch(() => null);

      if (response.status === 400 && isValidationErrorResponse(body)) {
        applyFieldErrors(setError, body.errors);
        setStep(getStepForErrors(body.errors, step));
        return;
      }

      setSubmitError(body?.error ?? "Setup failed");
    },
    (submitErrors: FieldErrors<SetupFormInput>) => {
      setStep(getStepForErrors(submitErrors as Partial<Record<keyof SetupFormInput, unknown>>, step));
    },
  );

  const values = watch();

  return (
    <MobileShell>
      <form onSubmit={onSubmit} className="space-y-6">
        <input type="hidden" {...register("browserTimezone")} />
        <div className="space-y-3">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-sage-600">
            Setup
          </p>
          <div className="flex gap-2" aria-label="Progress">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={`h-2 flex-1 rounded-full ${index <= step ? "bg-brand" : "bg-sage-200"}`}
              />
            ))}
          </div>
        </div>

        {step === 0 && <CatStep register={register} error={errors.catName?.message} />}

        {step === 1 && <StartDateStep register={register} errors={errors} />}

        {step === 2 && <InjectionTimesStep register={register} errors={errors} />}

        {step === 3 && <DosageStep register={register} errors={errors} />}

        {step === 4 && <ReviewStep values={values} submitError={submitError} />}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              className={`flex-1 ${mobileSecondaryButtonClassName}`}
              onClick={() => setStep((current) => current - 1)}
            >
              Back
            </button>
          )}

          {step < lastStep ? (
            <button
              type="button"
              className={`flex-1 ${mobilePrimaryButtonClassName}`}
              onClick={nextStep}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ${mobilePrimaryButtonClassName} disabled:opacity-50`}
            >
              Complete setup
            </button>
          )}
        </div>
      </form>
    </MobileShell>
  );
}

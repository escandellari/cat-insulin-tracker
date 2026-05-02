"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getLocalDateString } from "./local-date";
import { CatStep, DateStep, ReviewStep, ScheduleStep } from "./setup-wizard-steps";
import {
  setupSchema,
  setupStepSchemas,
  type SetupFormInput,
  type SetupInput,
} from "./schema";

export function SetupWizard({
  initialTimezone,
  initialScheduleStartDate,
}: {
  initialTimezone: string;
  initialScheduleStartDate: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const shouldUseBrowserDefaults = initialTimezone === "UTC";
  const browserTimezone = shouldUseBrowserDefaults
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || initialTimezone
    : initialTimezone;
  const browserDate = shouldUseBrowserDefaults ? getLocalDateString() : initialScheduleStartDate;
  const {
    register,
    watch,
    setValue,
    getValues,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormInput, undefined, SetupInput>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      catName: "",
      injectionTimes: [""],
      defaultDosage: 0,
      defaultNeedlesPerInjection: 0,
      timezone: browserTimezone,
      scheduleStartDate: browserDate,
    },
  });

  const injectionTimes = watch("injectionTimes");

  async function nextStep() {
    const schema = setupStepSchemas[step];

    if (!schema) {
      setStep((current) => Math.min(current + 1, 3));
      return;
    }

    const stepValues = getValues();
    const parsed = schema.safeParse(stepValues);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages?.[0]) {
          setError(field as keyof SetupFormInput, { message: messages[0] });
        }
      }
      return;
    }

    clearErrors();
    setStep((current) => Math.min(current + 1, 3));
  }

  function updateInjectionTime(index: number, value: string) {
    const nextTimes = [...getValues("injectionTimes")];
    nextTimes[index] = value;
    setValue("injectionTimes", nextTimes, { shouldValidate: true, shouldDirty: true });
  }

  function addInjectionTime() {
    setValue("injectionTimes", [...getValues("injectionTimes"), ""], {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const response = await fetch("/api/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });

    if (response.status === 303 || response.ok) {
      router.push("/dashboard");
      return;
    }

    const body = await response.json().catch(() => null);
    setSubmitError(body?.error ?? "Setup failed");
  });

  const values = watch();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold">Set up your cat&apos;s profile</h1>

      {step === 0 && <CatStep register={register} error={errors.catName?.message} />}

      {step === 1 && (
        <ScheduleStep
          injectionTimes={injectionTimes}
          register={register}
          errors={errors}
          updateInjectionTime={updateInjectionTime}
          addInjectionTime={addInjectionTime}
        />
      )}

      {step === 2 && <DateStep register={register} errors={errors} />}

      {step === 3 && <ReviewStep values={values} submitError={submitError} />}

      <div className="flex gap-2">
        {step > 0 && (
          <button type="button" onClick={() => setStep((current) => current - 1)}>
            Back
          </button>
        )}

        {step < 3 ? (
          <button type="button" onClick={nextStep}>
            Next
          </button>
        ) : (
          <button type="submit" disabled={isSubmitting}>
            Confirm setup
          </button>
        )}
      </div>
    </form>
  );
}

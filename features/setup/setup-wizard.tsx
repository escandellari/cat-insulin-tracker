"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
      timezone: initialTimezone,
      scheduleStartDate: initialScheduleStartDate,
    },
  });

  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimezone && initialTimezone === "UTC") {
      setValue("timezone", browserTimezone, { shouldValidate: true });
    }
  }, [initialTimezone, setValue]);

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

    setSubmitError("Setup failed");
  });

  const values = watch();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold">Set up your cat&apos;s profile</h1>

      {step === 0 && (
        <div className="space-y-2">
          <label className="block space-y-1">
            <span>Cat name</span>
            <input aria-label="Cat name" className="w-full rounded border p-2" {...register("catName")} />
          </label>
          {errors.catName && <p>{errors.catName.message}</p>}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {injectionTimes.map((time, index) => (
            <label key={index} className="block space-y-1">
              <span>{`Injection time ${index + 1}`}</span>
              <input
                aria-label={`Injection time ${index + 1}`}
                type="time"
                className="w-full rounded border p-2"
                value={time}
                onChange={(event) => updateInjectionTime(index, event.target.value)}
              />
            </label>
          ))}
          <button type="button" onClick={addInjectionTime}>
            Add injection time
          </button>
          {errors.injectionTimes && <p>{errors.injectionTimes.message as string}</p>}

          <label className="block space-y-1">
            <span>Default dosage</span>
            <input aria-label="Default dosage" type="number" step="0.1" {...register("defaultDosage")} />
          </label>
          {errors.defaultDosage && <p>{errors.defaultDosage.message}</p>}

          <label className="block space-y-1">
            <span>Default needles per injection</span>
            <input
              aria-label="Default needles per injection"
              type="number"
              step="1"
              {...register("defaultNeedlesPerInjection")}
            />
          </label>
          {errors.defaultNeedlesPerInjection && <p>{errors.defaultNeedlesPerInjection.message}</p>}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="block space-y-1">
            <span>Timezone</span>
            <input aria-label="Timezone" {...register("timezone")} />
          </label>
          {errors.timezone && <p>{errors.timezone.message}</p>}

          <label className="block space-y-1">
            <span>Schedule start date</span>
            <input aria-label="Schedule start date" type="date" {...register("scheduleStartDate")} />
          </label>
          {errors.scheduleStartDate && <p>{errors.scheduleStartDate.message}</p>}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2">
          <p>{values.catName}</p>
          {values.injectionTimes?.map((time) => <p key={time}>{time}</p>)}
          <p>{String(values.defaultDosage ?? "")} units</p>
          <p>{String(values.defaultNeedlesPerInjection ?? "")} needles</p>
          <p>{values.timezone}</p>
          <p>{values.scheduleStartDate}</p>
          {submitError && <p>{submitError}</p>}
        </div>
      )}

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

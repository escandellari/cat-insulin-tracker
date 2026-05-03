import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SetupFormInput } from "./schema";

function StepFrame({
  emoji,
  title,
  description,
  children,
}: {
  emoji: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2 text-center">
        <div className="text-4xl">{emoji}</div>
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-sage-950">{title}</h2>
          {description ? <p className="text-sm text-sage-600">{description}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-sage-950">
      <span>{label}</span>
      {children}
      {hint ? <p className="text-sm font-normal text-sage-600">{hint}</p> : null}
      {error ? <p className="text-sm font-normal text-red-700">{error}</p> : null}
    </label>
  );
}

const inputClassName =
  "w-full rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-base text-sage-950 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export function CatStep({
  register,
  error,
}: {
  register: UseFormRegister<SetupFormInput>;
  error?: string;
}) {
  return (
    <StepFrame emoji="🐱" title="What&apos;s your cat&apos;s name?">
      <Field label="Cat name" error={error}>
        <input
          aria-label="Cat name"
          placeholder="e.g., Whiskers"
          className={inputClassName}
          {...register("catName")}
        />
      </Field>
    </StepFrame>
  );
}

export function StartDateStep({
  register,
  errors,
}: {
  register: UseFormRegister<SetupFormInput>;
  errors: FieldErrors<SetupFormInput>;
}) {
  return (
    <StepFrame emoji="📅" title="When did insulin treatment start?">
      <Field label="Start date" error={errors.treatmentStartDate?.message}>
        <input
          aria-label="Start date"
          type="date"
          className={inputClassName}
          {...register("treatmentStartDate")}
        />
      </Field>
    </StepFrame>
  );
}

export function InjectionTimesStep({
  register,
  errors,
}: {
  register: UseFormRegister<SetupFormInput>;
  errors: FieldErrors<SetupFormInput>;
}) {
  return (
    <StepFrame emoji="⏰" title="Set injection times" description="Most cats receive insulin twice daily">
      <div className="space-y-4">
        <Field label="Morning injection" error={errors.morningTime?.message}>
          <input aria-label="Morning injection" type="time" className={inputClassName} {...register("morningTime")} />
        </Field>
        <Field label="Evening injection" error={errors.eveningTime?.message}>
          <input aria-label="Evening injection" type="time" className={inputClassName} {...register("eveningTime")} />
        </Field>
      </div>
    </StepFrame>
  );
}

export function DosageStep({
  register,
  errors,
}: {
  register: UseFormRegister<SetupFormInput>;
  errors: FieldErrors<SetupFormInput>;
}) {
  return (
    <StepFrame emoji="💉" title="Default dosage settings">
      <div className="space-y-4">
        <Field label="Default dosage" error={errors.defaultDosage?.message}>
          <input
            aria-label="Default dosage"
            type="number"
            step="0.5"
            className={inputClassName}
            {...register("defaultDosage")}
          />
        </Field>
        <Field
          label="Due window"
          error={errors.dueWindowMinutes?.message}
          hint="How many minutes before or after a dose still counts as on time."
        >
          <input
            aria-label="Due window"
            type="number"
            step="5"
            className={inputClassName}
            {...register("dueWindowMinutes")}
          />
        </Field>
      </div>
    </StepFrame>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-sage-50 px-4 py-3 text-sm">
      <span className="text-sage-600">{label}</span>
      <span className="font-medium text-sage-950">{value}</span>
    </div>
  );
}

export function ReviewStep({
  values,
  submitError,
}: {
  values: SetupFormInput;
  submitError: string | null;
}) {
  return (
    <StepFrame emoji="✅" title="Review your settings">
      <div className="space-y-3 rounded-2xl border border-sage-200 bg-sage-50/60 p-4">
        <ReviewRow label="Cat name" value={values.catName} />
        <ReviewRow label="Start date" value={values.treatmentStartDate} />
        <ReviewRow label="Morning" value={values.morningTime} />
        <ReviewRow label="Evening" value={values.eveningTime} />
        <ReviewRow label="Default dosage" value={`${String(values.defaultDosage ?? "")} units`} />
        <ReviewRow label="Due window" value={`${String(values.dueWindowMinutes ?? "")} minutes`} />
      </div>
      {submitError ? <p className="text-sm text-red-700">{submitError}</p> : null}
    </StepFrame>
  );
}

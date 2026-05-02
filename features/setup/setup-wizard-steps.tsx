import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SetupFormInput } from "./schema";

export function CatStep({
  register,
  error,
}: {
  register: UseFormRegister<SetupFormInput>;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block space-y-1">
        <span>Cat name</span>
        <input aria-label="Cat name" className="w-full rounded border p-2" {...register("catName")} />
      </label>
      {error && <p>{error}</p>}
    </div>
  );
}

export function ScheduleStep({
  injectionTimes,
  register,
  errors,
  updateInjectionTime,
  addInjectionTime,
}: {
  injectionTimes: string[];
  register: UseFormRegister<SetupFormInput>;
  errors: FieldErrors<SetupFormInput>;
  updateInjectionTime: (index: number, value: string) => void;
  addInjectionTime: () => void;
}) {
  return (
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
  );
}

export function DateStep({
  register,
  errors,
}: {
  register: UseFormRegister<SetupFormInput>;
  errors: FieldErrors<SetupFormInput>;
}) {
  return (
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
    <div className="space-y-2">
      <p>{values.catName}</p>
      {values.injectionTimes?.map((time) => <p key={time}>{time}</p>)}
      <p>{String(values.defaultDosage ?? "")} units</p>
      <p>{String(values.defaultNeedlesPerInjection ?? "")} needles</p>
      <p>{values.timezone}</p>
      <p>{values.scheduleStartDate}</p>
      {submitError && <p>{submitError}</p>}
    </div>
  );
}

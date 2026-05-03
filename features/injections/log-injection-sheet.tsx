"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { logInjectionSchema, type LogInjectionInput } from "@/features/injections";
import { format } from "date-fns";

type LogInjectionSheetProps = {
  eventId: string;
  scheduledAt: Date;
  defaultDosage: number;
  onClose: () => void;
};

export function LogInjectionSheet({ eventId, scheduledAt, defaultDosage, onClose }: LogInjectionSheetProps) {
  const [open, setOpen] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LogInjectionInput>({
    resolver: zodResolver(logInjectionSchema),
    defaultValues: {
      eventId,
      actualGivenAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      dosageGiven: defaultDosage,
      needlesUsed: 1,
    },
  });

  const onSubmit = async (data: LogInjectionInput) => {
    setSubmitError(null);

    const response = await fetch("/api/injections/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.refresh();
      setOpen(false);
      onClose();
      return;
    }

    const body = await response.json().catch(() => null);
    setSubmitError(body?.error ?? "Could not log injection");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => { setOpen(false); onClose(); }}>
      <div className="w-full max-w-[390px] rounded-t-2xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-medium text-sage-950">Log Injection</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("eventId")} />

          <div>
            <label className="block text-sm font-medium text-sage-700">Time given</label>
            <input
              type="datetime-local"
              {...register("actualGivenAt")}
              className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2"
            />
            {errors.actualGivenAt && <p className="mt-1 text-sm text-red-600">{errors.actualGivenAt.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700">Dosage (units)</label>
            <input
              type="number"
              step="0.1"
              {...register("dosageGiven", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2"
            />
            {errors.dosageGiven && <p className="mt-1 text-sm text-red-600">{errors.dosageGiven.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700">Needles used</label>
            <input
              type="number"
              {...register("needlesUsed", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2"
            />
            {errors.needlesUsed && <p className="mt-1 text-sm text-red-600">{errors.needlesUsed.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700">Notes (optional)</label>
            <textarea
              {...register("notes")}
              className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2"
              rows={3}
            />
          </div>

          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setOpen(false); onClose(); }}
              className="flex-1 rounded-full border border-sage-200 bg-white px-6 py-3.5 font-medium text-sage-950"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-brand px-6 py-3.5 font-medium text-white"
            >
              Log injection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

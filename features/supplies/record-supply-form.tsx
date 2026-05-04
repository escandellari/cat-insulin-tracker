"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { mobilePrimaryButtonClassName, mobileSecondaryButtonClassName } from "@/features/setup";

type RecordSupplyFormProps = {
  catId: string;
  type: "insulin" | "needles";
  buttonLabel: string;
};

export function RecordSupplyForm({ catId, type, buttonLabel }: RecordSupplyFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [startedAt, setStartedAt] = useState("");
  const [startingAmount, setStartingAmount] = useState("");

  const startedAtLabel = type === "insulin" ? "Opened date" : "Last restock";
  const amountLabel = type === "insulin" ? "Initial amount" : "Pack size";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/supplies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        catId,
        type,
        startedAt,
        startingAmount: Number(startingAmount),
      }),
    });

    if (response.ok) {
      router.refresh();
      setOpen(false);
      setStartedAt("");
      setStartingAmount("");
    }
  }

  return open ? (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-sage-700" htmlFor={`${type}-startedAt`}>
          {startedAtLabel}
        </label>
        <input
          id={`${type}-startedAt`}
          type="date"
          value={startedAt}
          onChange={(event) => setStartedAt(event.target.value)}
          className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-sage-700" htmlFor={`${type}-startingAmount`}>
          {amountLabel}
        </label>
        <input
          id={`${type}-startingAmount`}
          type="number"
          value={startingAmount}
          onChange={(event) => setStartingAmount(event.target.value)}
          className="mt-1 block w-full rounded-lg border border-sage-200 px-3 py-2"
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" className={mobilePrimaryButtonClassName}>Save supply</button>
        <button type="button" onClick={() => setOpen(false)} className={mobileSecondaryButtonClassName}>Cancel</button>
      </div>
    </form>
  ) : (
    <button type="button" onClick={() => setOpen(true)} className={mobileSecondaryButtonClassName}>
      {buttonLabel}
    </button>
  );
}

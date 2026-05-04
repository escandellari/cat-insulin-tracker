"use client";

import { useState } from "react";
import { LogInjectionSheet } from "@/features/injections/log-injection-sheet";

type LogInjectionWrapperProps = {
  eventId: string;
  scheduledAt: Date;
  defaultDosage: number;
  timezone: string;
};

export function LogInjectionWrapper({ eventId, scheduledAt, defaultDosage, timezone }: LogInjectionWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-full bg-brand px-6 py-3.5 font-medium text-white"
      >
        Log injection now
      </button>
      {isOpen && (
        <LogInjectionSheet
          eventId={eventId}
          scheduledAt={scheduledAt}
          defaultDosage={defaultDosage}
          timezone={timezone}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

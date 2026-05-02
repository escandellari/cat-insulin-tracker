import { vi } from "vitest";

export function stubLocalDate(isoString: string, localDate: { year: number; month: number; day: number }) {
  const RealDate = Date;

  class FakeDate extends RealDate {
    constructor(value?: string | number | Date) {
      super(value ?? isoString);
    }

    getFullYear() {
      return localDate.year;
    }

    getMonth() {
      return localDate.month;
    }

    getDate() {
      return localDate.day;
    }

    toISOString() {
      return isoString;
    }

    static now() {
      return new RealDate(isoString).valueOf();
    }
  }

  vi.stubGlobal("Date", FakeDate as unknown as DateConstructor);
}

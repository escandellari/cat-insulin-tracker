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

export function stubBrowserDateDefaults() {
  stubLocalDate("2026-01-11T07:30:00.000Z", { year: 2026, month: 0, day: 10 });
  const realDateTimeFormat = Intl.DateTimeFormat;
  vi.spyOn(Intl, "DateTimeFormat").mockImplementation(((locales?: string | string[], options?: Intl.DateTimeFormatOptions) => {
    if (locales === undefined && options === undefined) {
      return realDateTimeFormat(undefined, { timeZone: "America/Los_Angeles" });
    }

    return realDateTimeFormat(locales as any, options);
  }) as typeof Intl.DateTimeFormat);
}

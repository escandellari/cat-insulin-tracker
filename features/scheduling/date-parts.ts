export const SCHEDULE_LOOKAHEAD_DAYS = 90;

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDatePart(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function listScheduleDateParts(startDate: string, daysAhead = SCHEDULE_LOOKAHEAD_DAYS) {
  const firstDay = new Date(`${startDate}T00:00:00.000Z`);

  return Array.from({ length: daysAhead + 1 }, (_, offset) => formatDatePart(addDays(firstDay, offset)));
}

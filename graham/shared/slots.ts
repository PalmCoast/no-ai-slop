export type Slot = { iso: string; label: string };

type Zoned = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
};

function zoned(date: Date, timeZone: string): Zoned {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(pick("year")),
    month: Number(pick("month")),
    day: Number(pick("day")),
    hour: Number(pick("hour")),
    minute: Number(pick("minute")),
    weekday: pick("weekday"),
  };
}

function labelFor(date: Date, timeZone: string): string {
  const when = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${when} ET`;
}

/** Next weekday 3:00 and 4:00 holds on the operator's clock. */
export function nextSlots(now: Date, count = 4, timeZone = "America/New_York"): Slot[] {
  const slots: Slot[] = [];
  const cursor = new Date(now.getTime());
  cursor.setUTCMinutes(0, 0, 0);
  cursor.setUTCHours(cursor.getUTCHours() + 1);
  for (let step = 0; step < 24 * 21 && slots.length < count; step += 1) {
    const parts = zoned(cursor, timeZone);
    const weekday = parts.weekday;
    const open = weekday !== "Sat" && weekday !== "Sun" && (parts.hour === 15 || parts.hour === 16) && parts.minute === 0;
    if (open && cursor.getTime() > now.getTime()) {
      slots.push({ iso: cursor.toISOString(), label: labelFor(cursor, timeZone) });
    }
    cursor.setUTCHours(cursor.getUTCHours() + 1);
  }
  return slots;
}

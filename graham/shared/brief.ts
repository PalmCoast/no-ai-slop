export function briefOf(desk: { notes: unknown[]; alerts: unknown[]; bookings: unknown[] }): {
  alerts: number;
  notes: number;
  holds: number;
  line: string;
} {
  const alerts = desk.alerts.length;
  const notes = desk.notes.length;
  const holds = desk.bookings.length;
  const line =
    alerts > 0 ? `${alerts} urgent` : notes > 0 ? `${notes} on the desk` : holds > 0 ? `${holds} held` : "Line is quiet.";
  return { alerts, notes, holds, line };
}

export function slipId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

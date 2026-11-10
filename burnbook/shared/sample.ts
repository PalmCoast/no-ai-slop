import type { BookInput } from "./book.ts";

/** A filled-in month for a made-up 40-person team. Not a customer. */
export function sampleBook(): BookInput {
  return {
    company: "Northline",
    monthLabel: "October 2026",
    reworkRateUsd: 95,
    vendors: [
      {
        id: "cursor",
        name: "Cursor",
        monthlyUsd: 4800,
        seats: 40,
        activeSeats: 22,
        job: "coding",
        finishedJobs: 60,
        reworkHours: 12,
      },
      {
        id: "copilot",
        name: "Copilot",
        monthlyUsd: 1140,
        seats: 40,
        activeSeats: 6,
        job: "coding",
        finishedJobs: 5,
        reworkHours: 2,
      },
      {
        id: "chatgpt",
        name: "ChatGPT Team",
        monthlyUsd: 1200,
        seats: 40,
        activeSeats: 11,
        job: "research",
        finishedJobs: 8,
        reworkHours: 4,
      },
      {
        id: "line",
        name: "Line",
        monthlyUsd: 6000,
        seats: 0,
        activeSeats: 0,
        job: "support",
        finishedJobs: 400,
        reworkHours: 80,
      },
      {
        id: "clay",
        name: "Clay",
        monthlyUsd: 2400,
        seats: 8,
        activeSeats: 8,
        job: "sales",
        finishedJobs: 15,
        reworkHours: 6,
      },
    ],
  };
}

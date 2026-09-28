export const PRICE_CENTS = 2900;
export const PRICE_LABEL = "$29";
export const PRICE_DETAIL = "$29 once. Card fees, hosting, and a small margin. No subscription.";

export const FREE_LINE = "The timer, the one thing, and the parking list are free. They stay free.";

export const MAKER_NOTE =
  "I used Latch while testing it. It helped me keep time on the task and set the other thought down. That is my experience. It is not a study, and Latch does not treat ADHD.";

export const RECORD_GETS = [
  "A log of time on task: the task, the minutes, and how many thoughts you parked.",
  "A timer length you choose, from 1 to 90 minutes.",
  "A text file of the log, when you want a copy.",
];

export const RECORD_STAYS =
  "The log stays on this browser. The key unlocks the record on another browser. The lines do not move with the key. Nothing you type is sent with the payment.";

export const DEMO_NOTE = "Demo record. No card was charged. A real charge starts when Stripe is set on the site.";

export const SELLER = "Sold by AgentHive Inc, Palm Coast.";
export const SELLER_EMAIL = "daniel@agenthiveinc.com";

export const PUBLIC_COPY = [FREE_LINE, MAKER_NOTE, PRICE_DETAIL, RECORD_STAYS, DEMO_NOTE, ...RECORD_GETS].join(" ");

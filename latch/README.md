# Latch

A next-hour tool for ADHD. One task on the screen, a timer you can see, and a place to park the other thought.

Latch is for the hour when attention slips: trouble starting, time that does not feel real, and a working memory that drops the thing you just remembered. It is a timer and a list. It does not diagnose or treat ADHD.

## What it does

- One thing on screen. If the line is too big (an email, a kitchen, a bill, a chapter), Latch offers a smaller physical move and keeps the original line on Later.
- A timer with a ring. 15 seconds, 2 minutes, 10 minutes, or 25 minutes. The ring shows time passing, and the copy says how long you have already been on it.
- Park a thought without leaving the task. The parked line can become the one thing later.
- I wandered. The screen pauses a running timer and shows the task, the time left, and how many thoughts are parked.
- When the timer rings: 5 more minutes, the next thing on Later, or stop. After three extensions, Latch states the count and how many thoughts are parked.
- Sound is off until you turn it on. The chime is two quiet notes.
- Everything you type stays in `localStorage` on this browser. There is no account and no streak to break.
- The timer, the one thing, and the parking list are free. They stay free.
- The record is $29 once. It keeps a log of time on task, lets you choose a timer from 1 to 90 minutes, and downloads a text file. No subscription. The log stays on this browser. The payment does not include what you typed.

## What it refuses

- Streaks, points, and badges. A missed day is not a score.
- Treatment claims. A note on the page says it helped one person while testing. That is an experience, not a study.
- Medication reminders and clinical advice.
- Uploading the task list. Checkout sends the product name and the price, not the words on the screen.

## Local

```bash
cd latch
npm install
npm test
npm run dev
```

Vite serves the app at [http://127.0.0.1:5183](http://127.0.0.1:5183). `npm run build` writes `dist/`.

## Deploy

This folder is its own Netlify site. In the Netlify UI:

1. Base directory: `latch`
2. Build command: `npm run build`
3. Publish directory: `dist`

Set `STRIPE_SECRET_KEY` to charge the $29 record through Stripe Checkout. Without that key, **Get the record** issues a demo key and charges nothing. Optional `SITE_URL` is the origin used in the success and cancel URLs.

The task list is not an environment variable and it is not sent to Stripe.

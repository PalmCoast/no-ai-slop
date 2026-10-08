# Latch

A next-hour tool for AuDHD, and for a nervous system that startles or shuts down, including CPTSD. AuDHD means autism and ADHD together. One task on the screen, a timer you can see coming, a place to park the other thought, and a stop when it is too much.

Latch is for the hour when starting, switching, or staying with one thing is the hard part. It is a timer and a list. It does not diagnose or treat autism, ADHD, or CPTSD.

## What it does

- One thing on screen. If the line is too big (an email, a kitchen, a bill, a chapter), Latch offers a smaller physical move and keeps the original line on Later.
- A timer with a ring. 15 seconds, 2 minutes, 10 minutes, or 25 minutes. Before it starts, the screen says what the ring will offer: 5 more minutes, the next thing, stop, or too much.
- Park a thought without leaving the task. The parked line can become the one thing later.
- I wandered. The screen pauses a running timer and shows the task, the time left, and how many thoughts are parked.
- Too much. One tap pauses a running timer and stays paused until you press Resume. The choices are physical: feet on the floor, water or leave the room, a smaller move, or a body need (loud, water, bathroom, leave) that becomes the one thing. It does not ask why.
- Switching names both sides first. Leaving the current task for something on Later, or for a parked thought, shows what you are leaving and what is next. Not yet keeps the current task.
- When the timer rings: 5 more minutes, the next thing on Later, stop, or too much. After three extensions, Latch states the count and how many thoughts are parked.
- Sound is off until you turn it on. The chime is two quiet notes.
- Everything you type stays in `localStorage` on this browser. There is no account and no streak to break.
- The timer, the one thing, and the parking list are free. They stay free.
- The record is $29 once. It keeps a log of time on task, lets you choose a timer from 1 to 90 minutes, and downloads a text file. No subscription. The log stays on this browser. The payment does not include what you typed.

## What it refuses

- Streaks, points, and badges. A missed day is not a score.
- Treatment claims. A note on the page says it helped one person keep time on a task while testing. That is an experience, not a study, and it is not a claim about autism, ADHD, or CPTSD.
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

Production host: [latch.agenthiveinc.com](https://latch.agenthiveinc.com). Reed owns that deploy. The ticket is [REED-ASSIGNMENT.md](REED-ASSIGNMENT.md). The steps are [GROK-DEPLOY.md](GROK-DEPLOY.md).

This folder is its own Netlify site. It is not the site that serves agenthiveinc.com. In the Netlify UI:

1. Base directory: `latch`
2. Build command: `npm run build`
3. Publish directory: `dist`

Set `SITE_URL` to `https://latch.agenthiveinc.com`. Set `STRIPE_SECRET_KEY` to charge the $29 record through Stripe Checkout. Without that key, **Get the record** issues a demo key and charges nothing.

The task list is not an environment variable and it is not sent to Stripe.

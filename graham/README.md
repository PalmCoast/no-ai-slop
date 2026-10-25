# Graham

Graham is Daniel Graham's line. The cell forwards unknown callers here. People on the contacts list still ring him. Graham books the meeting, takes the note, alerts him when the work has stopped, and blocks a mill script.

The shape is a [SpaceXAI Team Bot](https://x.ai/news/team-bots) (28 Sep 2026): context, plugins, credentials, and memory. The public template is a recipe. It does not carry contacts, call notes, or keys. Conversations on a stood-up being stay with that operator.

The body double talks in the browser and cuts a vertical caption reel. It says "This is Graham, Daniel's line." The reel is the mark, not a filmed face. A cloned voice stays on the operator's own account.

GuyThread supplies the Monday drop: three things, each with a price and a reason. AskYard, NetYard, Sonaris, Stateside, Latch, Braid, and First Deploy AI are skills of the same being.

## Price

$1,750 setup (50% to start or pay in full), then $250/mo. Same written plan as First Deploy AI. Start with the [free 30](https://calendly.com/coltsinsider/30min).

## Local

```bash
cd graham
npm install
npm test
npm run dev
```

The desk is at `http://127.0.0.1:5192/`.

`npm run build` writes `dist/`. Functions answer `/api/screen`, `/api/chat`, `/api/book`, `/api/desk`, `/api/template`, and `/api/standup`. With no `GRAHAM_DESK_KEY`, the desk is open for a demo. Set that key in production and send it as `x-graham-key`.

Do not set a provider API key in the repo. Voice in the browser needs no key. ElevenLabs, Gmail, Calendar, and the rest are plugins the operator connects on their own account.

## Deploy

Separate Netlify site. Base directory `graham`. Build `npm run build`. Publish `dist`. Node 22. `netlify.toml` already says this.

The catalog lists Graham as lab until a host answers. Do not point another product's site at this folder.

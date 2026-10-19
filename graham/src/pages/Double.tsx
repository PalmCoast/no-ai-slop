import { FormEvent, useEffect, useRef, useState } from "react";
import { answerAs, type Answer } from "../../shared/answer.ts";
import { DISCLOSURE } from "../../shared/public.ts";
import { drawFrame } from "../reel";

const PROMPTS = [
  "What do I wear to an outdoor October wedding?",
  "Anniversary is Saturday. About $100. She loves to cook.",
  "Jacobs or Puka at flex? Half-PPR.",
  "Block the spam mills, and still take a real HVAC quote.",
  "How do I stop missing night calls?",
];

function speak(text: string): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.96;
  window.speechSynthesis.speak(utter);
}

export default function Double() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [question, setQuestion] = useState(PROMPTS[0]);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    document.title = "Double | Graham";
  }, []);

  function ask(next: string) {
    const result = answerAs(next, DISCLOSURE);
    setAnswer(result);
    setNote("Answer is on the card.");
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d");
      if (ctx) drawFrame(ctx, result, 1);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    ask(question);
  }

  async function makeReel() {
    const canvas = canvasRef.current;
    if (!canvas || !answer) return;
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    speak(answer.spoken);
    if (typeof MediaRecorder === "undefined" || !canvas.captureStream) {
      drawFrame(ctx, answer, 1);
      setNote("This browser will speak it. It will not save a video file.");
      return;
    }
    const stream = canvas.captureStream(30);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    const chunks: Blob[] = [];
    const done = new Promise<void>((resolve) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "graham-answer.webm";
        link.click();
        setNote("Reel saved. Graham is on the card. It is not a filmed face.");
        resolve();
      };
    });
    recorder.start();
    const started = performance.now();
    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / 7000);
        drawFrame(ctx, answer, progress);
        if (progress < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    recorder.stop();
    await done;
  }

  return (
    <div className="container split">
      <div>
        <p className="kicker">Body double</p>
        <h1>Talk, then cut the reel.</h1>
        <p className="lede">Graham answers in the shop voice, says the price when there is one, and speaks it. The video is a caption card with the mark.</p>
        <div className="row wrap">
          {PROMPTS.map((prompt) => (
            <button key={prompt} type="button" className="chip" onClick={() => { setQuestion(prompt); ask(prompt); }}>
              {prompt}
            </button>
          ))}
        </div>
        <form className="stack" onSubmit={onSubmit}>
          <label>
            Ask Graham
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} />
          </label>
          <div className="row">
            <button className="button" type="submit">
              Answer
            </button>
            <button
              className="button ghost"
              type="button"
              disabled={!answer}
              onClick={() => answer && speak(answer.spoken)}
            >
              Talk
            </button>
            <button className="button ghost" type="button" disabled={!answer} onClick={() => void makeReel()}>
              Make the reel
            </button>
          </div>
        </form>
        {answer ? (
          <article className="card">
            <p className="kicker">{answer.lane}</p>
            <h2>{answer.headline}</h2>
            <p>{answer.detail}</p>
            {answer.price ? <p className="price">{answer.price}</p> : null}
            <p>{answer.reason}</p>
            {answer.href ? (
              <p>
                <a href={answer.href}>Open the app this came from</a>
              </p>
            ) : null}
          </article>
        ) : null}
        {note ? <p className="muted">{note}</p> : null}
      </div>
      <canvas ref={canvasRef} className="reel" width={720} height={1280} aria-label="Graham answer reel" />
    </div>
  );
}

export const WHO_LINE =
  "AuDHD means autism and ADHD together. Latch is also for a nervous system that startles or shuts down, including CPTSD. It does not treat autism, ADHD, or CPTSD.";

export const RING_LINE =
  "When it rings, the choices are the same every time: 5 more minutes, the next thing, stop, or too much.";

export const TOO_MUCH_LINE = "You can stop. Nothing here asks why.";

export type SteadyStep = { id: string; label: string; detail: string };

export const STEADY_STEPS: SteadyStep[] = [
  { id: "feet", label: "Feet on the floor", detail: "Name one thing you can see." },
  { id: "water", label: "Water, or leave", detail: "Get a drink, or leave the room." },
];

export type BodyNeed = { id: string; label: string; move: string };

export const BODY_NEEDS: BodyNeed[] = [
  { id: "loud", label: "It's loud", move: "Turn one sound down, or step out" },
  { id: "water", label: "Water", move: "Get a drink of water" },
  { id: "bathroom", label: "Bathroom", move: "Go to the bathroom" },
  { id: "leave", label: "Leave", move: "Leave the room" },
];

export type Handoff = {
  from: string | null;
  to: string;
  firstMove: string | null;
};

export function handoffScript(from: string | null, to: string, firstMove: string | null): Handoff {
  return {
    from: from && from.trim() ? from.trim() : null,
    to: to.trim(),
    firstMove: firstMove && firstMove.trim() ? firstMove.trim() : null,
  };
}

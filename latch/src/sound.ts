let audio: AudioContext | null = null;

function context(): AudioContext | null {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audio) audio = new Ctx();
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

export function primeAudio(): void {
  context();
}

export function chime(): void {
  const audio = context();
  if (!audio) return;
  const startAt = audio.currentTime;
  [523.25, 659.25].forEach((freq, index) => {
    const osc = audio!.createOscillator();
    const gain = audio!.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const noteAt = startAt + index * 0.14;
    gain.gain.setValueAtTime(0.0001, noteAt);
    gain.gain.exponentialRampToValueAtTime(0.05, noteAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteAt + 0.32);
    osc.connect(gain);
    gain.connect(audio!.destination);
    osc.start(noteAt);
    osc.stop(noteAt + 0.34);
  });
}

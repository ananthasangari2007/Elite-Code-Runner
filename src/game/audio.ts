// Lightweight WebAudio sound effects — no external assets needed.
let ctx: AudioContext | null = null;
let muted = false;
let musicNodes: {
  osc: OscillatorNode;
  gain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
} | null = null;

function ac(): AudioContext {
  if (!ctx)
    ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
  if (musicNodes) musicNodes.gain.gain.value = muted ? 0 : 0.04;
}
export function isMuted() {
  return muted;
}

function blip(freq: number, dur: number, type: OscillatorType = "square", vol = 0.15) {
  if (muted) return;
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g).connect(a.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.stop(a.currentTime + dur);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  move: () => blip(520, 0.06, "square", 0.08),
  correct: () => {
    blip(660, 0.1, "triangle", 0.18);
    setTimeout(() => blip(990, 0.15, "triangle", 0.18), 90);
  },
  wrong: () => {
    blip(220, 0.18, "sawtooth", 0.18);
    setTimeout(() => blip(140, 0.22, "sawtooth", 0.18), 120);
  },
  collide: () => blip(300, 0.12, "square", 0.18),
  countdown: () => blip(880, 0.1, "sine", 0.2),
  go: () => {
    blip(523, 0.1, "sine", 0.2);
    setTimeout(() => blip(784, 0.2, "sine", 0.2), 120);
  },
};

export function startMusic() {
  if (musicNodes) return;
  try {
    const a = ac();
    const osc = a.createOscillator();
    const gain = a.createGain();
    const lfo = a.createOscillator();
    const lfoGain = a.createGain();
    osc.type = "triangle";
    osc.frequency.value = 110;
    gain.gain.value = muted ? 0 : 0.04;
    lfo.frequency.value = 0.6;
    lfoGain.gain.value = 30;
    lfo.connect(lfoGain).connect(osc.frequency);
    osc.connect(gain).connect(a.destination);
    osc.start();
    lfo.start();
    musicNodes = { osc, gain, lfo, lfoGain };
  } catch {
    /* ignore */
  }
}

export function stopMusic() {
  if (!musicNodes) return;
  try {
    musicNodes.osc.stop();
    musicNodes.lfo.stop();
  } catch {
    /* ignore */
  }
  musicNodes = null;
}

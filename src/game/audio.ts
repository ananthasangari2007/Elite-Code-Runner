// Lightweight WebAudio sound effects with a looping gameplay song.
let ctx: AudioContext | null = null;
let muted = false;
let musicElement: HTMLAudioElement | null = null;

const MUSIC_SRC = "/audio/subway-surfers.mpeg";

function ac(): AudioContext {
  if (!ctx)
    ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();
  return ctx;
}

function getMusicElement() {
  if (!musicElement) {
    musicElement = new Audio(MUSIC_SRC);
    musicElement.loop = true;
    musicElement.preload = "auto";
    musicElement.volume = 0.45;
    musicElement.muted = muted;
  }

  return musicElement;
}

export function setMuted(m: boolean) {
  muted = m;
  if (musicElement) musicElement.muted = muted;
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
  try {
    const el = getMusicElement();
    el.muted = muted;
    void el.play();
  } catch {
    /* ignore */
  }
}

export function stopMusic() {
  if (!musicElement) return;
  try {
    musicElement.pause();
    musicElement.currentTime = 0;
  } catch {
    /* ignore */
  }
}

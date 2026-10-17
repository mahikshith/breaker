// Tiny synthesized sound set. Created on first user gesture (browsers block audio before that).
let ac = null, master = null, muted = false;
export function unlockAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
}
export const setMuted = m => { muted = m; if (master) master.gain.value = m ? 0 : 0.5; };
export const isMuted = () => muted;

function tone(freq, dur, type = 'triangle', vol = 0.2, slide = 0, when = 0) {
  if (!ac || muted) return;
  const t = ac.currentTime + when;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
let noiseBuf = null;
function noise(dur, vol = 0.2, freq = 1800, q = 0.8) {
  if (!ac || muted) return;
  if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur);
}
// pentatonic pitch ladder so long combos sound musical, not shrill
const LADDER = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
export const sfx = {
  hit(combo = 0) { const n = LADDER[Math.min(combo, LADDER.length - 1)]; tone(523 * 2 ** (n / 12), 0.09, 'triangle', 0.12); noise(0.05, 0.08, 3000); },
  tough() { tone(220, 0.08, 'square', 0.05); noise(0.04, 0.1, 1200); },
  paddle() { tone(160, 0.08, 'sine', 0.25, 0.6); },
  wall() { tone(300, 0.03, 'sine', 0.05); },
  power() { [0, 4, 7, 12].forEach((n, i) => tone(660 * 2 ** (n / 12), 0.12, 'triangle', 0.12, 0, i * 0.05)); },
  lose() { tone(330, 0.5, 'sawtooth', 0.08, 0.4); },
  zap() { tone(900, 0.12, 'square', 0.04, 0.3); },
  hurt() { noise(0.25, 0.25, 400, 0.5); tone(120, 0.25, 'sawtooth', 0.1, 0.5); },
  boom() { noise(0.6, 0.4, 250, 0.4); tone(70, 0.6, 'sine', 0.35, 0.4); },
  breach() { tone(196, 0.9, 'sine', 0.3, 0.5); [0, 7, 12, 19].forEach((n, i) => tone(392 * 2 ** (n / 12), 0.5, 'triangle', 0.1, 0, 0.08 + i * 0.07)); },
  beat() { tone(55, 0.18, 'sine', 0.35, 0.7); },
  chew() { noise(0.08, 0.07, 700, 1.5); },
  win() { [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => tone(523 * 2 ** (n / 12), 0.25, 'triangle', 0.12, 0, i * 0.07)); },
};

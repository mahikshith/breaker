import { ART } from './vault-art.js';

const clamp = n => Math.max(0, Math.min(1, n));
const COLOURS = { carrier: 0, circuit: 300, forge: 65, player: 220 };
let textures;
function images() {
  if (!textures && ART.spaceWeapons && typeof Image !== 'undefined') {
    textures = Object.fromEntries(Object.entries(ART.spaceWeapons).map(([id, url]) => { const img = new Image(); img.src = url; return [id, img]; }));
  }
  return textures;
}
const ready = img => img?.complete && img.naturalWidth;

// A locked lane is followed by real recovery; consecutive rests or dual batteries are excluded.
export function nextEnemyVolley(mode = 'medium', previous = null, random = Math.random) {
  const tune = { easy: [440, 1.35, 3.8], medium: [520, 1.2, 3.1], hard: [600, 1.1, 2.5] }[mode] || [520, 1.2, 3.1];
  const roll = () => Math.min(.999999, Math.max(0, Number(random()) || 0));
  const patterns = ['left', 'right', 'both', 'quiet'].filter(p => p !== previous || (p !== 'quiet' && p !== 'both'));
  const pattern = patterns[Math.floor(roll() * patterns.length)], kind = roll() < (mode === 'easy' ? .7 : .5) ? 'heavy' : 'salvo';
  return { pattern, kind, shots: kind === 'heavy' ? [0] : [0, .14, .28], warning: tune[1], cooldown: tune[2], speed: tune[0] + (kind === 'salvo' ? 40 : 0), r: kind === 'heavy' ? 9 : 7.5 };
}

export function enemyEscapeLane(paddle, left, right, targetX, radius, margin = 8) {
  const lo = left + paddle.w / 2, hi = right - paddle.w / 2;
  const candidates = [[lo, Math.min(hi, targetX - paddle.w / 2 - radius)], [Math.max(lo, targetX + paddle.w / 2 + radius), hi]];
  const [min, max] = candidates.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))[0];
  return max - min >= margin ? { min, max } : null;
}

function tint(g, colour) { const hue = COLOURS[colour] ?? 0; if (hue) g.filter = `hue-rotate(${hue}deg)`; }
function flash(g, from, angle, age, colour) {
  const img = images()?.shot;
  if (!ready(img) || !from || age < 0 || age >= .14) return;
  g.save(); tint(g, colour); g.translate(from.x, from.y); g.rotate(angle - Math.PI / 2); g.globalAlpha *= 1 - age / .14;
  const w = 23 + 8 * (1 - age / .14); g.drawImage(img, -w / 2, -7, w, 15); g.restore();
}

export function drawWeaponCharge(g, from, angle, progress, colour = 'carrier') {
  const img = images()?.shot; if (!ready(img) || !from || progress <= 0 || progress >= 1) return;
  const w = 10 + 11 * clamp(progress);
  g.save(); tint(g, colour); g.translate(from.x, from.y); g.rotate(angle - Math.PI / 2); g.globalAlpha *= .25 + .6 * progress;
  g.drawImage(img, -w / 2, -6, w, 12); g.restore();
}

export function drawEnemyBolt(g, bolt, ageSeconds = Infinity) {
  const img = images()?.shot; if (!ready(img)) return;
  const { x, y, vx, vy, r, from } = bolt, angle = Math.atan2(vy, vx), size = bolt.size || r * (65 / 9);
  g.save(); tint(g, bolt.colour);
  if (from) {
    g.translate(from.x, from.y); g.rotate(angle - Math.PI / 2); g.beginPath(); g.rect(-10000, 0, 20000, 20000); g.clip();
    g.rotate(Math.PI / 2 - angle); g.translate(-from.x, -from.y);
  }
  g.translate(x, y); g.rotate(angle - Math.PI / 2); g.drawImage(img, -size / 2, -size * (875 / 1254), size, size); g.restore();
  if (bolt.muzzleFlash !== false) flash(g, from, angle, ageSeconds, bolt.colour);
}

export function drawWeaponMuzzle(g, from, angle, ageSeconds, colour = 'carrier') { flash(g, from, angle, ageSeconds, colour); }
export function drawPlayerMuzzle(g, from, angle, ageSeconds) { flash(g, from, angle, ageSeconds, 'player'); }

export function drawPlayerBolt(g, bolt, ageSeconds = Infinity) {
  drawEnemyBolt(g, { ...bolt, r: bolt.r || 6.8, size: bolt.size || 37, colour: bolt.colour || 'player' }, ageSeconds);
}

export function drawEnemyImpact(g, hit, ageSeconds) {
  const img = images()?.impact; if (!ready(img) || ageSeconds < 0 || ageSeconds >= .32) return;
  const t = ageSeconds / .32, u = clamp(ageSeconds / .09), pop = u * u * (3 - 2 * u), w = (hit.r >= 9 ? 54 : 48) * (.65 + .45 * pop), h = w * img.naturalHeight / img.naturalWidth;
  g.save(); tint(g, hit.colour); g.translate(hit.x, hit.y); g.rotate(Math.atan2(hit.vy, hit.vx) - Math.PI / 2); g.globalAlpha *= 1 - t;
  g.drawImage(img, -w * .51, -h * .89, w, h); g.restore();
}

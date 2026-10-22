import { ART } from './vault-art.js';
import { loadImg, ready, rrect, text, drawBall, NUM } from './gfx.js';

export const SPACE_POWERS = [
  { id: 'laser', label: 'LASER', color: '#f39cba' },
  { id: 'titan', label: 'UNSTOPPABLE', color: '#d3afe9' },
  { id: 'five', label: '5 BALLS', color: '#a5dec4' },
];
export const KIT_POWERS = [
  { id: 'shield', label: 'BRICK WARD', color: '#dba4ba' },
  { id: 'arrows', label: 'ARROWS', color: '#e3c6d1' },
  { id: 'titan', label: 'COSMIC', color: '#d3afe9' },
  { id: 'five', label: 'BALL FAN', color: '#dba4ba' },
];

export function spacePowerLayout(level) {
  const s = level.kitUIScale, kit = level.kitPowers;
  const w = Math.min(level.W - 24 / s, (kit ? 344 : 374) / s), h = (kit ? 122 : 238) / s;
  const x = kit ? 12 / s : (level.W - w) / 2, y = level.kitAnchor().y - level.kitAnchor().r - h - 8 / s;
  const powers = level.powerChoices || (level.kitPowers ? KIT_POWERS : SPACE_POWERS);
  const gap = (kit ? 8 : 10) / s, cw = (w - 24 / s - gap * (powers.length - 1)) / powers.length;
  return { x, y, w, h, close: { x: x + w - 44 / s, y, w: 44 / s, h: 44 / s },
    choices: powers.map((p, i) => ({ ...p, x: x + 12 / s + i * (cw + gap), y: y + (kit ? 44 : 64) / s, w: cw, h: (kit ? 66 : 142) / s })) };
}

export function spacePowerAt(level, x, y) {
  const a = spacePowerLayout(level), inside = r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  return a.choices.find(inside)?.id || 'close';
}

export function drawSpacePowerMenu(g, level) {
  if (!level.kitPowers) { drawSpaceLoadout(g, level); return; }
  const a = spacePowerLayout(level), s = level.kitUIScale;
  const t = Math.min(1, (performance.now() - level.powerMenuAt) / 180), eased = 1 - (1 - t) ** 3;
  g.save(); g.fillStyle = 'rgba(6,8,20,.38)'; g.fillRect(0, 0, level.W, level.H);
  g.translate(0, (1 - eased) * 24 / s); g.globalAlpha *= eased;
  g.fillStyle = level.kitPowers ? '#302333' : '#242036'; rrect(g, a.x, a.y, a.w, a.h, 16 / s); g.fill();
  g.strokeStyle = level.kitPowers ? '#96667c' : '#826480'; g.lineWidth = 1 / s; g.stroke();
  text(g, level.kitPowers ? 'KIT’S ARMOURY' : 'CHOOSE POWER', a.x + 16 / s, a.y + 23 / s, 14 / s, '#f2deec');
  text(g, '×', a.close.x + a.close.w / 2, a.y + 23 / s, 24 / s, '#cfbacf', 'center');
  for (const c of a.choices) {
    const cx = c.x + c.w / 2, cy = c.y + 23 / s;
    g.save(); if (!level.canChoosePower(c.id)) g.globalAlpha *= .4;
    g.fillStyle = level.kitPowers ? '#493447' : '#39304b'; rrect(g, c.x, c.y, c.w, c.h, 10 / s); g.fill();
    g.strokeStyle = c.color; g.fillStyle = c.color; g.lineWidth = 2 / s;
    if (c.id === 'moonbind') {
      g.beginPath(); g.arc(cx, cy, 12 / s, -.8, 4.6); g.stroke();
      g.beginPath(); g.moveTo(cx, cy - 8 / s); g.lineTo(cx, cy); g.lineTo(cx + 6 / s, cy + 3 / s); g.stroke();
    } else if (c.id === 'ricochet') {
      g.beginPath(); g.moveTo(cx - 11 / s, cy + 11 / s); g.lineTo(cx + 11 / s, cy); g.lineTo(cx - 11 / s, cy - 11 / s); g.stroke();
      g.beginPath(); g.arc(cx - 11 / s, cy - 11 / s, 4 / s, 0, 7); g.fill();
    } else if (c.id === 'shield') {
      g.beginPath(); g.moveTo(cx - 10 / s, cy - 12 / s); g.lineTo(cx + 10 / s, cy - 12 / s); g.lineTo(cx + 9 / s, cy + 2 / s);
      g.quadraticCurveTo(cx + 7 / s, cy + 10 / s, cx, cy + 14 / s); g.quadraticCurveTo(cx - 7 / s, cy + 10 / s, cx - 9 / s, cy + 2 / s); g.closePath(); g.fill(); g.stroke();
    } else if (c.id === 'arrows') {
      for (const dx of [-6, 6]) {
        g.beginPath(); g.moveTo(cx + dx / s, cy + 12 / s); g.lineTo(cx + dx / s, cy - 12 / s);
        g.moveTo(cx + (dx - 4) / s, cy - 7 / s); g.lineTo(cx + dx / s, cy - 13 / s); g.lineTo(cx + (dx + 4) / s, cy - 7 / s);
        g.moveTo(cx + (dx - 4) / s, cy + 7 / s); g.lineTo(cx + dx / s, cy + 11 / s); g.lineTo(cx + (dx + 4) / s, cy + 7 / s); g.stroke();
      }
    } else if (c.id === 'laser') {
      for (const dx of [-7, 7]) {
        g.beginPath(); g.moveTo(cx + dx / s, cy + 9 / s); g.lineTo(cx + dx / s, cy - 11 / s); g.stroke();
        rrect(g, cx + (dx - 3) / s, cy + 5 / s, 6 / s, 10 / s, 2 / s); g.fill();
      }
    } else if (c.id === 'titan') {
      g.save(); drawBall(g, { x: cx, y: cy, vx: 0, vy: 0, r: 10 / s, titan: 1 }, g.globalAlpha); g.restore();
    } else for (const [dx, dy] of [[0, -9], [-10, 0], [10, 0], [-6, 11], [6, 11]]) {
      g.beginPath(); g.arc(cx + dx / s, cy + dy / s, 4 / s, 0, Math.PI * 2); g.fill();
    }
    text(g, c.label, cx, c.y + 53 / s, level.kitPowers || c.id === 'titan' ? 10 / s : 12 / s, '#fff1fc', 'center');
    g.restore();
  }
  g.restore();
}

const families = {};
for (const [id, family] of Object.entries(ART.spaceCompanions || {})) families[id] = { ...family, img: loadImg(family.url) };

const uiParts = {};
for (const id of ['capsule_laser', 'ball']) {
  const part = ART.relayCircuit?.parts?.[id] || ART.carrier?.parts?.[id];
  if (part?.url) uiParts[id] = { ...part, img: loadImg(part.url) };
}

export function spaceCompanionId(level) {
  if (['nix', 'vesper', 'forge'].includes(level.companionId)) return level.companionId;
  if (level.name === 'Circuit Breakout') return 'vesper';
  if (level.name === 'Shutter Forge') return 'forge';
  return 'nix';
}

export function spacePowerDetail(level, id) {
  const limits = level.companionLimits?.() || {}, live = (level.balls || []).filter(b => !b.dead).length;
  if (id === 'five') return `+${Math.max(0, Math.min(4, (limits.balls ?? 60) - live))} BALLS · MAX ${limits.balls ?? 60}`;
  if (id === 'titan') return `${limits.duration ?? 10}s · ${limits.cosmic ?? 1} COSMIC MAX`;
  return `${limits.duration ?? 10}s · CAP ${limits.maxTime ?? 10}s`;
}

function label(g, value, x, y, size, color, align = 'left') {
  g.fillStyle = color; g.font = `600 ${size}px ${NUM}`; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(value, x, y);
}

function metalPanel(g, x, y, w, h, radius, tint = '#74647f') {
  const rim = g.createLinearGradient(x, y, x + w * .6, y + h);
  rim.addColorStop(0, '#b4b8cf'); rim.addColorStop(.08, '#545b78'); rim.addColorStop(.48, tint); rim.addColorStop(1, '#252c43');
  g.fillStyle = rim; rrect(g, x, y, w, h, radius); g.fill();
  const face = g.createLinearGradient(x, y, x, y + h);
  face.addColorStop(0, '#30364f'); face.addColorStop(.35, '#1c243d'); face.addColorStop(1, '#14192b');
  g.fillStyle = face; rrect(g, x + 2, y + 2, w - 4, h - 4, Math.max(2, radius - 2)); g.fill();
  g.strokeStyle = 'rgba(224,216,245,.18)'; g.lineWidth = .7; rrect(g, x + 4, y + 4, w - 8, h - 8, Math.max(2, radius - 4)); g.stroke();
}

function iconPart(g, part, x, y, w, h) {
  if (!ready(part)) return false;
  const [bx, by, bw, bh] = part.artBounds || [0, 0, 1, 1], iw = part.img.naturalWidth, ih = part.img.naturalHeight;
  const scale = Math.min(w / (bw * iw), h / (bh * ih));
  g.drawImage(part.img, x - bw * iw * scale / 2 - bx * iw * scale, y - bh * ih * scale / 2 - by * ih * scale, iw * scale, ih * scale);
  return true;
}

function drawSpaceLoadout(g, level) {
  const a = spacePowerLayout(level), s = level.kitUIScale, id = spaceCompanionId(level);
  const t = Math.max(0, Math.min(1, (performance.now() - level.powerMenuAt) / 180)), eased = 1 - (1 - t) ** 3;
  g.save(); g.fillStyle = 'rgba(4,7,17,.56)'; g.fillRect(0, 0, level.W, level.H);
  g.translate(0, (1 - eased) * 18 / s); g.globalAlpha *= eased;
  metalPanel(g, a.x, a.y, a.w, a.h, 18 / s, id === 'vesper' ? '#6c749a' : '#8c6c8f');
  const title = id === 'vesper' ? 'VESPER + LATCH' : id === 'forge' ? 'FORGE ARSENAL' : 'NIX’S LOADOUT';
  if (id === 'forge') drawCoreIcon(g, a.x + 30 / s, a.y + 29 / s, 15 / s);
  else sprite(g, families[id], 'ready', 0, a.x + 30 / s, a.y + 29 / s, 38 / s, 38 / s);
  text(g, title, a.x + 57 / s, a.y + 23 / s, 16 / s, '#f8eaf8');
  label(g, 'ONE CHARGE · CHOOSE YOUR POWER', a.x + 57 / s, a.y + 42 / s, 9 / s, '#adb5d0');
  text(g, '×', a.close.x + a.close.w / 2, a.y + 24 / s, 26 / s, '#d2c8df', 'center');
  for (const c of a.choices) {
    const enabled = level.canChoosePower(c.id), cx = c.x + c.w / 2, cy = c.y + 45 / s;
    g.save(); if (!enabled) g.globalAlpha *= .42;
    metalPanel(g, c.x, c.y, c.w, c.h, 12 / s, c.color);
    const glow = g.createRadialGradient(cx, cy, 0, cx, cy, 36 / s); glow.addColorStop(0, c.color + '45'); glow.addColorStop(1, c.color + '00');
    g.fillStyle = glow; g.fillRect(c.x + 4 / s, c.y + 6 / s, c.w - 8 / s, 76 / s);
    if (c.id === 'laser') {
      if (!iconPart(g, uiParts.capsule_laser, cx, cy, 66 / s, 37 / s)) {
        g.strokeStyle = c.color; g.lineWidth = 5 / s; for (const dx of [-9, 9]) { g.beginPath(); g.moveTo(cx + dx / s, cy + 13 / s); g.lineTo(cx + dx / s, cy - 17 / s); g.stroke(); }
      }
    } else if (c.id === 'titan') {
      g.save(); drawBall(g, { x: cx, y: cy, vx: 0, vy: 0, r: 21 / s, titan: 1 }, g.globalAlpha); g.restore();
    } else for (const [dx, dy] of [[0, -17], [-19, -1], [19, -1], [-11, 20], [11, 20]]) {
      if (!iconPart(g, uiParts.ball, cx + dx / s, cy + dy / s, 15 / s, 15 / s)) {
        g.fillStyle = '#e8efff'; g.beginPath(); g.arc(cx + dx / s, cy + dy / s, 6 / s, 0, Math.PI * 2); g.fill();
      }
    }
    text(g, c.label, cx, c.y + 87 / s, c.id === 'titan' ? 12 / s : 15 / s, '#fff1fc', 'center');
    label(g, spacePowerDetail(level, c.id), cx, c.y + 105 / s, 8.5 / s, '#bcc8df', 'center');
    g.fillStyle = enabled ? c.color + '25' : '#465066'; rrect(g, c.x + 10 / s, c.y + 117 / s, c.w - 20 / s, 17 / s, 5 / s); g.fill();
    label(g, enabled ? 'SELECT' : 'AT LIMIT', cx, c.y + 126 / s, 9 / s, enabled ? '#f1dce9' : '#d0d4df', 'center');
    g.restore();
  }
  if (id === 'vesper') {
    sprite(g, families.latch, 'idle', 0, a.x + 39 / s, a.y + a.h - 11 / s, 34 / s, 34 / s);
    label(g, 'Latch jams one cannon for 6s', a.x + 53 / s, a.y + a.h - 14 / s, 11 / s, '#c2dfeb');
  } else label(g, 'Choose once. Keep the charge if a power is full.', a.x + a.w / 2, a.y + a.h - 14 / s, 10 / s, '#aebbd4', 'center');
  g.restore();
}

export function companionFrame(family, clip, age = 0) {
  const anim = family.clips[clip] || family.clips.idle;
  const i = Math.max(0, Math.floor(age * anim.fps));
  return anim.frames[anim.loop ? i % anim.frames.length : Math.min(i, anim.frames.length - 1)];
}

function sprite(g, family, clip, age, x, y, w, h) {
  if (!ready(family)) return;
  const n = companionFrame(family, clip, age), [cw, ch] = family.cell;
  g.drawImage(family.img, n % family.columns * cw, Math.floor(n / family.columns) * ch, cw, ch,
    x - family.pivot[0] * w, y - family.pivot[1] * h, w, h);
}

function drawCoreIcon(g, x, y, r) {
  const glow = g.createRadialGradient(x - r * .35, y - r * .4, 0, x, y, r);
  glow.addColorStop(0, '#f2e5ff'); glow.addColorStop(.32, '#a68cd0'); glow.addColorStop(.7, '#54466e'); glow.addColorStop(1, '#283147');
  g.fillStyle = glow; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * .82, y); g.lineTo(x, y + r); g.lineTo(x - r * .82, y); g.closePath(); g.fill();
  g.strokeStyle = '#b8bdd0'; g.lineWidth = 1.2; g.stroke();
}

export function nixExpression(level) {
  if (level.state === 'lost') return 'loss';
  if (level.state === 'won' || level.phase === 'escape' || level.phase === 'retreat') return 'win';
  if (level.kitTime - level.coreCastAt < .6) return 'command';
  if (level.raid?.stage === 'extract' || level.attack || level.warning || level.bolts?.length) return 'warning';
  if (level.crew?.some(c => c.securedAt !== null && level.clock - c.securedAt < .8)) return 'secured';
  return level.canUseCorePower() ? 'ready' : 'idle';
}

export function drawNixControl(g, level) {
  const id = spaceCompanionId(level), family = families[id];
  if (id !== 'forge' && !ready(family)) return;
  const orb = level.kitAnchor(), s = level.kitUIScale, clip = nixExpression(level);
  const age = clip === 'command' ? level.kitTime - level.coreCastAt : level.kitTime;
  g.save();
  g.fillStyle = '#30243e'; g.beginPath(); g.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2); g.fill();
  if (id === 'forge') drawCoreIcon(g, orb.x, orb.y, orb.r * .64);
  else sprite(g, family, clip, age, orb.x, orb.y - 2 / s, orb.r * 2, orb.r * 2);
  g.strokeStyle = '#624362'; g.lineWidth = 3 / s;
  g.beginPath(); g.arc(orb.x, orb.y, orb.r - 1.5 / s, 0, Math.PI * 2); g.stroke();
  if (level.paddle.charge > 0) {
    g.strokeStyle = level.canUseCorePower() ? '#efb0da' : '#b77dae';
    g.beginPath(); g.arc(orb.x, orb.y, orb.r - 1.5 / s, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * level.paddle.charge); g.stroke();
  }
  g.restore();
}

export const drawSpaceControl = drawNixControl;

export function drawLatchJam(g, level, gun) {
  const family = families.latch, remaining = (gun.jamUntil || 0) - level.clock;
  if (!ready(family) || remaining <= 0 || gun.hp <= 0) return;
  const age = 6 - remaining, p = level.cannonPose(gun), side = p.x < level.W / 2 ? -1 : 1;
  const port = { x: p.x + side * 14 * Math.cos(p.angle) + 8 * Math.sin(p.angle), y: p.y + side * 14 * Math.sin(p.angle) - 8 * Math.cos(p.angle) };
  const approach = Math.min(1, Math.max(0, age / .45));
  const leave = Math.max(0, Math.min(1, remaining / .4)), alpha = Math.min(1, age / .15, leave);
  const x = port.x + side * (1 - approach) * 22, y = port.y + (1 - approach) * 10;
  const clip = age < .45 ? 'approach' : remaining < .4 ? 'release' : 'clamp';
  g.save(); g.globalAlpha *= alpha; g.translate(x, y);
  if (side > 0) g.scale(-1, 1);
  const habitat = g.createRadialGradient(-15, -3, 2, -15, -3, 25);
  habitat.addColorStop(0, 'rgba(84,193,214,.04)'); habitat.addColorStop(1, 'rgba(118,226,241,.10)');
  g.fillStyle = habitat; g.beginPath(); g.ellipse(-15, -3, 24, 20, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(172,238,246,.35)'; g.lineWidth = .65; g.stroke();
  sprite(g, family, clip, clip === 'release' ? .4 - remaining : age, 0, 0, 44, 44);
  g.restore();
}

export function drawTickSecure(g, level, crew) {
  const family = families.tick;
  if (!ready(family) || crew.releasedAt === null) return;
  const a = crew.art.rect, width = 40, x = a.x + a.w / 2, y = a.y - 2;
  if (crew.secured) {
    g.save(); g.strokeStyle = '#9cd9ae'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x - 1, y + 2); g.lineTo(x + 3, y - 3); g.stroke(); g.restore();
  }
  const age = level.clock - crew.releasedAt;
  if (age < 0 || age > 1.1) return;
  // One mechanic is visible even when a split ball releases several workers together.
  const current = level.crew.find(c => c.releasedAt !== null && level.clock - c.releasedAt >= 0 && level.clock - c.releasedAt <= 1.1);
  if (current !== crew) return;
  g.save(); g.globalAlpha *= Math.min(1, (1.1 - age) / .3);
  sprite(g, family, 'secure', age, x, y, width, width);
  g.restore();
}

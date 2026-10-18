import { Carrier } from '../../src/carrier.js';
import { ART } from '../../src/vault-art.js';
import { artLoaded, loadImg } from '../../src/gfx.js';

const option = new URLSearchParams(location.search).get('option') || 'A';
const data = ART.carrier, scale = 393 / 360, origin = 59 - 34 * scale, TAU = Math.PI * 2;
const parts = Object.fromEntries(Object.entries(data.parts).map(([id, p]) => [id, { ...p, img: loadImg(p.url) }]));
const choices = {
  A: {
    name: 'A · Boosted retreat',
    intro: 'A complete rescue has a visible payoff. The carrier lights its engines, retreats, then returns in a tougher authored sector.',
    scenes: [
      ['01 · Medium boarding attack', 'Face the crew. Hold a real combat pose.', 'Larger armoured raiders turn toward their captive. A full Nix orb is available before the last rescue.'],
      ['02 · Crew safe. Engines ignite.', 'Hover → thrust → climb out of view', 'A surviving carrier retreats as one ship. Destroyed hulls get a crash ending instead; crew stay secured.'],
      ['03 · A harder next sector', 'Fresh layout, stronger adversaries', 'A new authored Carrier layout arrives after results. New ship classes get their own assets and attack tells.']
    ],
    footer: 'Recommended progression: a clear win and visible escape between encounters. Relay Raiders remains a separate authored level.'
  },
  B: {
    name: 'B · Carrier siege',
    intro: 'The carrier stays in the same arena. Each rescued wave forces a staged rebuild and a stronger attack pattern.',
    scenes: [
      ['01 · Medium boarding attack', 'Face the crew. Hold a real combat pose.', 'The same mode tuning: larger armoured raiders, earlier earned Nix, and active warned mothership attacks.'],
      ['02 · The arena rebuilds', 'Threats stop while modules assemble', 'New panels arrive in a short staggered construction. The caught serve resumes after all pieces settle.'],
      ['03 · The carrier retaliates', 'Fresh targets, denser armour, new roles', 'A reinforced wave starts with a new pattern. Checkpoint progress and companion charge stay earned.']
    ],
    footer: 'Continuous waves: no victory after the first rescue. End the encounter after the authored final wave; no endless same-art grind.'
  }
};
const p = choices[option]; if (!p) throw Error('Choose A or B');
document.querySelector('main').innerHTML = `<header><div class="eyebrow">DESIGN STUDY · CURRENT ART · PROPOSED MOTION / TUNING</div><h1>${p.name}</h1><p>${p.intro}</p></header><div class="modes"><span>EASY · current Carrier baseline</span><span class="chosen">MEDIUM · recommended default</span><span>HARD · stronger, shorter-window raids</span></div><section class="states">${p.scenes.map(([title, beat, caption], i) => `<article><h2>${title}</h2><p class="beat">${beat}</p><canvas width="393" height="852" data-scene="${i}"></canvas><p class="caption">${caption}</p></article>`).join('')}</section><section class="notes"><p><strong>Shared mode revision</strong>One selection applies to Carrier and Vault. Easy slows the serpent; Medium and Hard increase pressure through tested authored rules.</p><p><strong>Shared power revision</strong>Useful legal hits charge Nix earlier. Marked Laser / Split / Shield caches remain earned pickups. No extra meter.</p></section><footer>${p.footer}<br>Static proposal, not implemented gameplay. Larger source fighter shown for scale; future distinct ship-class artwork remains unbuilt. All new timing needs phone playtests.</footer>`;

function part(g, id, x, y, w, h, angle = 0, alpha = 1) {
  const p = parts[id]; [w, h] = w === undefined ? p.display : [w, h];
  g.save(); g.translate(x, y); g.rotate(angle); g.globalAlpha *= alpha;
  g.drawImage(p.img, -p.pivot[0] * w, -p.pivot[1] * h, w, h); g.restore();
}
function path(g, points, color, width = 1.4, dash = []) {
  g.save(); g.strokeStyle = color; g.lineWidth = width; g.setLineDash(dash); g.beginPath();
  points.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore();
}
function ring(g, x, y, r, left = 1) {
  g.strokeStyle = '#e9acd0'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * left); g.stroke();
}
function ship(g, l, dy = 0, thrust = 0) {
  const h = l.assembly.hull, bay = l.assembly.hangar;
  g.save(); g.translate(0, dy);
  if (thrust) for (const x of [102, 258]) part(g, 'aThruster', x, h.y + 55, 28 * Math.sqrt(thrust), 90 * thrust, 0);
  part(g, 'aHull', h.x, h.y);
  part(g, 'aDoorLeft', bay.x - bay.w / 4, bay.y);
  part(g, 'aDoorRight', bay.x + bay.w / 4, bay.y);
  for (const c of l.guns) l.drawCannon(g, c);
  g.restore();
}
function fighter(g, x, y, target, hp = 4) {
  const angle = (Math.atan2(target.y - y, target.x - x) - Math.PI / 2 + TAU) % TAU;
  const w = 48, h = 40, c = Math.cos(angle), s = Math.sin(angle);
  for (const [u, v] of parts.aFighter.thrusterPorts) {
    const dx = (u - .5) * w, dy = (v - .5) * h;
    part(g, 'aThruster', x + dx * c - dy * s, y + dx * s + dy * c, 9, 23, angle + Math.PI);
  }
  part(g, 'aFighter', x, y, w, h, angle);
  for (let i = 0; i < hp; i++) { g.fillStyle = '#d9c3e3'; g.fillRect(x - hp * 3 + i * 6, y + 29, 4, 2.2); }
  return angle;
}
function scene(canvas, stage) {
  const g = canvas.getContext('2d'), l = new Carrier(360, 729, scale);
  l.hudY = 34; l.clock = 3; l.kitTime = 3; l.aim = null; l.paddle.charge = 1; l.score = 420 + stage * 260;
  Object.assign(l.balls[0], { caught: false, x: 190, y: l.paddle.y - 76 });
  g.setTransform(scale, 0, 0, scale, 0, 0); l.drawFullBleedBackground(g, origin / scale, 852 / scale);
  g.setTransform(scale, 0, 0, scale, 0, origin);
  const escaping = option === 'A' && stage === 1, rebuilding = option === 'B' && stage === 1;
  if (escaping) { l.state = 'won'; l.paddle.charge = 0; }
  ship(g, l, escaping ? -70 : stage === 0 ? 3 : 0, escaping ? 1 : rebuilding ? .12 : .28);
  if (!escaping) {
    for (const [i, b] of l.bricks.entries()) {
      const a = b.art, k = rebuilding ? .35 + (i % 4) * .16 : 1;
      const lift = rebuilding ? -18 * (1 - k) : 0;
      part(g, b.part, a.x, a.y + lift, a.w * k, a.h * k, 0, rebuilding ? k : 1);
      if (stage === 2 && i % 3 === 0) path(g, [[a.rect.x + 3, a.rect.y + 3], [a.rect.x + a.rect.w - 3, a.rect.y + 3]], '#c6c9d9', 2.4);
      if (b.payload && !rebuilding) part(g, `capsule_${b.payload}`, a.x, a.y, 18, 9);
    }
    for (const c of l.crew) {
      if (rebuilding) { part(g, 'aPod', c.art.x, c.art.y, c.art.w, c.art.h, 0, .7); continue; }
      l.drawCrew(g, c);
    }
    if (stage === 2) {
      const a = l.bricks[0].art;
      for (const [x, y, id] of [[150, 244, 'aBrickCyan'], [210, 244, 'aBrickCyan'], [150, 273, 'aBrickPink'], [210, 273, 'aBrickPink']]) part(g, id, x, y, a.w, a.h);
    }
  } else {
    for (const [i, c] of l.crew.entries()) {
      path(g, [[c.x - 3, c.y], [c.x - 1, c.y + 2], [c.x + 4, c.y - 4]], '#9cd9ae', 2);
      part(g, 'aWorker', 270 + i * 18, 265 - i * 11, 15, 17);
    }
  }
  let facing = null;
  if (stage === 0 || stage === 2) {
    const c = l.crew[stage === 0 ? 0 : 1], y = l.paddle.y - 220, x = stage === 0 ? 155 : 226;
    facing = fighter(g, x, y, c, stage === 0 ? 3 : 4);
    if (stage === 0) {
      path(g, [[x, y - 9], [c.x, c.y]], 'rgba(227,159,204,.55)', 1.3, [3, 5]);
      ring(g, c.x, c.y, 25, .78);
      g.font = '12px "Lilita One"'; g.textAlign = 'left'; g.fillStyle = '#efbfdc'; g.fillText('0:06', c.x + 28, c.y - 10);
    }
    if (stage === 2) {
      path(g, [[l.guns[0].x, l.guns[0].y + 12], [37, 238]], '#e29fba', 1, [3, 5]); ring(g, 37, 238, 12, .6);
      // Cannon turn first, then boarding: the study does not stack lethal extraction and fire.
    }
  }
  if (!escaping) { l.drawPaddle(g); l.drawBalls(g); }
  l.drawDeck(g);
  if (!escaping) {
    l.drawHUDBase(g);
    g.fillStyle = '#a8bfcc'; for (const x of [22, 28]) g.fillRect(x / scale, 34 + 11 / scale, 2.5 / scale, 14 / scale);
  }
  return { facing, escaped: escaping, rebuilding, raidToCrew: stage === 0 || stage === 2 };
}
window.__difficultyBoards = { ready: false };
Promise.all([artLoaded(), document.fonts.load('18px "Lilita One"'), document.fonts.load('16px Rubik')]).then(() => {
  const scenes = [...document.querySelectorAll('canvas')].map((c, i) => scene(c, i));
  window.__difficultyBoards = { ready: true, option, conceptOnly: true, scenes, decoded: Object.values(parts).every(p => p.img.complete && p.img.naturalWidth > 0) };
});

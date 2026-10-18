import { Relay } from '../../src/relay.js';
import { artLoaded, text, rrect } from '../../src/gfx.js';
import { unlockAudio } from '../../src/audio.js';

const q = new URLSearchParams(location.search), cv = document.querySelector('canvas'), g = cv.getContext('2d');
const phone = q.get('device') === 'android' ? [32,24] : [59,34], safe = q.has('safe') ? q.get('safe').split(',').map(Number) : phone;
const width = innerWidth, height = innerHeight, fullH = Math.round(360 * height / width), scale = Math.min(width / 360, height / fullH), dpr = Math.min(devicePixelRatio || 1, 3);
const originY = (height - fullH * scale) / 2 + safe[0] - 34 * scale, H = Math.round(fullH - (safe[0] + safe[1]) / scale) + 34;
cv.width = Math.round(width * dpr); cv.height = Math.round(height * dpr); cv.style.width = width + 'px'; cv.style.height = height + 'px';
let level;
function fresh() { level = new Relay(360, H, scale, RELAY_DATA); level.hudY = 34; level.inB = safe[1] / scale; level.debugGeometry = q.has('debug'); return level; }
fresh();
let paused = q.has('paused'), last = 0, ready = false, gamePointer = null;
function togglePause() { paused = !paused; level.pointerCancel(); level.keys = {}; gamePointer = null; draw(); }
function draw() {
  g.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0); level.drawFullBleedBackground(g, originY / scale, height / scale);
  g.setTransform(scale * dpr, 0, 0, scale * dpr, 0, originY * dpr); level.draw(g);
  g.fillStyle = '#a8bfcc'; for (const x of [22,28]) { rrect(g, x / scale, 34 + 11 / scale, 2.5 / scale, 14 / scale, 1 / scale); g.fill(); }
  if (level.state !== 'play') { g.fillStyle = 'rgba(4,7,18,.94)'; rrect(g, 32, H * .43, 296, 154, 22); g.fill(); text(g, level.state === 'won' ? 'CREW SAFE!' : 'TRY AGAIN', 180, H * .43 + 38, 28, '#d3c1ff', 'center'); text(g, `${level.crew.filter(c=>!c.hp).length} / 4 workers`, 180, H * .43 + 76, 17, '#b9d6e8', 'center'); text(g, 'Tap to retry', 180, H * .43 + 120, 16, '#bfa4ee', 'center'); }
  else if (paused) text(g, 'PAUSED', 180, H * .62, 24, '#d6ccf4', 'center');
}
function advance(seconds) { for (let left = seconds; left > 0;) { const dt = Math.min(left, 1 / 120); level.update(dt); left -= dt; } draw(); }
window.__relay = { ready: false, get level() { return level; }, fresh, geometry: { width, height, H, scale, originY, safe }, advance, render: draw, setPaused(value) { paused = !!value; }, inspect: () => level.inspect() };
cv.addEventListener('pointerdown', event => { unlockAudio(); if (level.state !== 'play') { location.reload(); return; } const x = event.clientX / scale, y = (event.clientY - originY) / scale; if (event.clientX < 48 && y < 34 + 44 / scale) { togglePause(); return; } if (paused || gamePointer !== null) return; gamePointer = event.pointerId; cv.setPointerCapture(event.pointerId); level.pointerDown(x,y); });
cv.addEventListener('pointermove', event => { if (gamePointer === event.pointerId) level.pointerMove(event.clientX / scale, (event.clientY - originY) / scale); });
cv.addEventListener('pointerup', event => { if (gamePointer !== event.pointerId) return; gamePointer = null; level.pointerUp(); });
cv.addEventListener('pointercancel', event => { if (gamePointer !== event.pointerId) return; gamePointer = null; level.pointerCancel(); });
addEventListener('keydown', event => { if (event.key.toLowerCase() === 'p') togglePause(); else if (event.key.toLowerCase() === 'd') level.debugGeometry = !level.debugGeometry; else if (!paused) level.key(event.key,true); draw(); });
addEventListener('keyup', event => { if (!paused) level.key(event.key,false); });
artLoaded().then(async () => { await document.fonts.load('18px "Lilita One"'); ready = true; window.__relay.ready = true; draw(); });
requestAnimationFrame(function frame(now) { if (ready && last && !paused) advance(Math.min(.05, (now-last)/1000)); last = now; requestAnimationFrame(frame); });

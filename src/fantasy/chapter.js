// Bellforge Run and Tidewheel Citadel as main-game chapters: the standalone encounter models behind the shared Arena-style
// contract (relative thumb drag, Kit orb, power menu, HUD, continue/results) that main.js drives.
import { Arena } from '../arena.js';
import { Bellforge } from './bellforge.js';
import { TidewheelSiege } from './tidewheel-siege.js';
import { Gatehouse, GATEHOUSE_FLOORS } from './gatehouse.js';
import { LumiTower } from './lumitower.js';
import { SerpentRivals, RIVALS_KINDS } from './rivals.js';
import { DragonsHoard, HOARD_KINDS } from './hoard.js';
import { hoardButtons, cave, caveReady } from './hoard-render.js';
import { makeArt, drawEncounter, gWard } from './render.js';
import { cached, drawBall, text, ramTeach } from '../gfx.js';
import { Coach } from '../coach.js';
import { sfx } from '../audio.js';
import { kitExpression, updateKitPresence } from '../kit.js';
import { drawCastleFx } from '../castle-art.js';
import { PACE } from './purpose.js';
import { drawPurpose, drawPurposeVignette } from './purpose-render.js';

const MIN_H = 700;   // the models need their full portrait world; shorter screens draw it scaled down
const KINDS = { shield: 'echo', anchor: 'anchor', arrows: 'volley', titan: 'cosmic' };   // menu id -> model power
const CHAPTERS = {
  bellforge: { Model: Bellforge, powers: [{ id: 'shield', label: 'ECHO GUARD', color: '#dba4ba' }],
    preview: { x: 6, y: 68, w: 348, h: 74 }, stars: a => 1 + (a.lives >= 2) + (a.m.lumi.steps <= 2) },
  // Tidewheel Siege: four stages building to Nerra (tidewheel-siege.js). Stars: free Lumi, keep half the flood margin in
  // the showdown, and knock Nerra down early (before the showdown).
  tidewheel: { Model: TidewheelSiege, stages: 4, powers: [{ id: 'anchor', label: 'ANCHOR', color: '#a9e7dd' }, { id: 'arrows', label: 'ARROWS', color: '#e3c6d1' }, { id: 'titan', label: 'STARFIRE', color: '#d3afe9' }],
    preview: { x: 20, y: 128, w: 320, h: 68 }, stars: a => { const f = a.m.starFlags(); return 1 + f.flood + f.knockdown; } },
  // Stars: clear it, finish with 2+ balls, and take at most one paddle stun (a bell that lands on the paddle).
  gatehouse: { Model: Gatehouse, name: 'Gatehouse Siege', kinds: { shield: 'ward' }, powers: [{ id: 'shield', label: 'WARD', color: '#a9cbf0' }],
    preview: { x: 14, y: 88, w: 332, h: 68 }, stars: a => 1 + (a.lives >= 2) + (a.stuns <= 1) },
  // Lumi holds the paddle: her face fills Kit's orb and her songs map 1:1 to the model. Stars: clear it, keep 2+ balls, never get bitten.
  lumitower: { Model: LumiTower, name: 'Lumi Breaks Out', hero: 'Lumi', face: 'lumi', menuTitle: 'LUMI’S SONGS', kinds: { lullaby: 'lullaby', starlight: 'starlight', songshield: 'songshield' },
    powers: [{ id: 'lullaby', label: 'LULLABY', color: '#b9a8ef' }, { id: 'starlight', label: 'STARLIGHT', color: '#f4d98c' }, { id: 'songshield', label: 'SONG SHIELD', color: '#f0a7c4' }],
    preview: { x: -15, y: 98, w: 260, h: 46 }, stars: a => 1 + (a.lives >= 2) + (a.m.bites === 0) },
  // Kit baits the twin serpents into the Clash Chamber. Stars: clear it, keep 2+ balls, and land at least one clash.
  rivals: { Model: SerpentRivals, name: 'Serpent Rivals', kinds: RIVALS_KINDS, powers: [{ id: 'shield', label: 'WARD', color: '#a9cbf0' }, { id: 'arrows', label: 'ARROWS', color: '#e3c6d1' }],
    preview: m => ({ x: -40, y: m.paddle.y - 512, w: 340, h: 44 }), stars: a => 1 + (a.lives >= 2) + (a.m.clashes >= 1) },
  // Kit robs Ember's hoard. Stars: escape, keep 2+ balls, and never wake him (no wake roar, never caught while greedy).
  hoard: { Model: DragonsHoard, name: 'Dragon’s Hoard', kinds: HOARD_KINDS, powers: [{ id: 'shield', label: 'WARD', color: '#a9cbf0' }, { id: 'arrows', label: 'ARROWS', color: '#e3c6d1' }],
    preview: { x: 0, y: 30, w: 360, h: 70 }, stars: a => 1 + (a.lives >= 2) + (a.m.wakes === 0) },
};
// Purpose plates (src/fantasy/purpose.js): where each chapter shows its villain's goal, in model space, clear of the HUD row
// (pause, balls and score sit over model y 6..24 at the sides) and of each floor's chips. Bellforge's lift drop reuses the plate.
const PURPOSE = {
  bellforge: m => ({ x: 296, y: 30, w: 118, label: 'KORR LOWERS LUMI' }),
  // Floor 1 sits under the par chip, floor 2 under the rack chip when it shows, floor 3 left of Korr's HP bar.
  gatehouse: m => m.floor === 2 ? { x: 76, y: 30, w: 138, label: 'KORR HAULS LUMI AWAY' } : { x: 180, y: m.floor === 0 || m.rackSmashed ? 43 : 27, w: 158, label: 'KORR HAULS LUMI AWAY' },
  // Gnash's windows hug the side walls, so the plate keeps to the middle of the top band, under the floor chip.
  lumitower: m => ({ x: 180, y: 27, w: 160, label: 'GNASH COILS UP TO LUMI' }),
  rivals: m => ({ x: 180, y: 27, w: 160, label: 'THE SEAL CLOSES ON LUMI' }),
  // Ember's eye and the loot pill hold the top right; the plate hangs under the loot pill, over the cave wall behind him.
  hoard: m => ({ x: 214, y: 46, w: 140, label: 'EMBER SWALLOWS LUMI' }),
};
const purposeClock = (key, m) => key === 'bellforge' ? { p: m.lumi.steps / m.rules.mistakes, pushAt: -Infinity, surgeAt: m.liftAt ?? -Infinity } : m.purpose;
// Castle capsule and orb kinds -> the shared power sounds.
const PICK = { multi: 'split', ram: 'power', chest: 'power', echo: 'shield', ward: 'shield', songshield: 'shield', volley: 'arrows', cosmic: 'titan', lullaby: 'slow', starlight: 'focus' };
const SNAKES = new Set(['lumitower', 'rivals']), OWN_REASON = new Set(['bellforge', 'gatehouse', 'lumitower', 'rivals', 'hoard']);
const HOARD_LOUD = new Set(['roar-warning', 'breath-warning', 'exit-open', 'slide', 'gate-break', 'crown-break', 'weight-break', 'escape', 'ram-launch', 'run', 'stay', 'crown-grab']);
const HOARD_QUIET = new Set(['loot', 'spill', 'melt', 'harden', 'chime-ready', 'yawn', 'volley', 'arrow-hit', 'ward-deploy', 'row-clear', 'brick-break', 'paddle']);
let art;

export class FantasyChapter {
  constructor(key, W, H, uiScale = 1, difficulty = 'easy', hudTop = 34) {
    const c = CHAPTERS[key]; this.key = key; this.c = c; this.hudTop = hudTop;
    this.W = W; this.H = H; this.kitUIScale = uiScale; this.hudY = 0; this.inB = 0;
    const height = Math.max(MIN_H, H - hudTop);
    this.k = Math.min(1, (H - hudTop) / MIN_H); this.ox = (W - 360 * this.k) / 2;
    this.m = new c.Model({ width: 360, height, difficulty, paddleY: height - Math.min(120, Math.max(90, 126 / uiScale)) });
    art ||= makeArt();
    this.name = c.name || (key === 'bellforge' ? 'Bellforge Run' : 'Tidewheel Citadel'); this.stuns = 0; this.kitFace = c.face; this.menuTitle = c.menuTitle; this.hurtUntil = 0; this.lives0 = this.m.lives;
    this.paddle = { charge: 0, stun: 0 }; this.balls = this.m.balls;
    this.coreMode = 'ward'; this.kitPowers = true; this.powerChoices = c.powers; this.powerMenuOpen = false; this.powerMenuAt = 0;
    this.t = 0; this.kitTime = 0; this.kitMood = 'Idle'; this.kitAt = 0; this.kitShockUntil = 0; this.kitCastAt = -Infinity; this.kitReactionAt = -Infinity;
    this.kitBodyAt = 0; this.kitBodyUntil = 0; this.kitWasFull = false; this.kitSeenCastAt = -Infinity; this.combo = 0; this.aim = null;
    this.ptr = { down: false, x: 0, y: 0 }; this.keys = {}; this.inputEpoch = 0; this.floodMin = Infinity;
    this.heard = new WeakSet(); this.hitSoundAt = -Infinity; this.hint = null;
    this.coach = new Coach(); // first-time serve and ram coaching (src/coach.js); castle chapters have no Focus aim
  }
  get state() { return this.m.state; }
  get phase() { return this.m.phase; }
  get lives() { return this.m.lives; }
  get score() { return this.m.score; }
  get danger() { const p = this.m.purpose?.p || 0; return Math.max(p >= PACE.mid ? p : 0, this.baseDanger); }
  get baseDanger() { const m = this.m; if (this.key === 'hoard') return m.ember.stage === 'windup' ? .8 : m.floor === 2 ? Math.max(0, Math.min(.9, 1 - (m.dangerY - m.fieldBottom()) / 140)) : m.wake / 100 * .7; if (this.key === 'lumitower' || this.key === 'rivals') return m.lunges.some(l => l.stage !== 'peek' && l.stage !== 'retreat') ? .8 : 0; if (this.key === 'gatehouse') return m.bells.length || m.villain.stage === 'windup' || m.winch?.stage === 'crank' ? .75 : m.floor / 3 * .6; return this.key === 'bellforge' ? m.lumi.steps / m.rules.mistakes : 1 - (m.water.y - m.water.limit) / (m.water.initial - m.water.limit); }
  get reason() { const m = this.m; return OWN_REASON.has(this.key) ? m.reason : m.loss === 'flood' ? 'The basin reached the refuge.' : 'The last ball slipped away.'; }
  // The menu card shows the Twin Seal with three ward plates and its first cracks.
  skipIntro() { if (this.key === 'tidewheel') this.m.preview(); if (this.key === 'hoard') this.m.wake = 64; if (this.key === 'rivals') { this.m.buildFloor(2); this.m.floorTime = 5; this.m.seal.ward = 3; this.m.seal.hp = Math.round(this.m.seal.maxHP * .7); } }
  previewRect() { const r = typeof this.c.preview === 'function' ? this.c.preview(this.m) : this.c.preview; return { ...r, y: r.y + this.hudTop }; }
  // ---------- input (level coordinates; the model sits hudTop below the level's top, scaled by k on short screens) ----------
  toModel(x) { return (x - this.ox) / this.k; }
  // The Hoard's greed card and RUN pill are model-space buttons drawn by hoard-render.js; a tap on one never starts a drag.
  hoardTap(x, y) {
    if (this.key !== 'hoard' || !Number.isFinite(y)) return false;
    const mx = this.toModel(x), my = (y - this.hudTop) / this.k, B = hoardButtons(this.m), on = r => r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
    if (on(B.run)) return this.m.choose('run'), true;
    if (on(B.stay)) return this.m.choose('stay'), true;
    if (on(B.flee)) return this.m.run(), true;
    return this.m.phase === 'greed';   // the card is modal: other taps do nothing
  }
  // A tap on the Tidewheel stage card skips it; its release serves as usual.
  pointerDown(x, y) { const m = this.m; if (this.hoardTap(x, y)) return; m.skipCard?.(); Object.assign(this.ptr, { down: true, x }); this.anchor = this.toModel(x); this.padAnchor = m.paddle.targetX; }
  pointerMove(x) {
    if (!this.ptr.down) return;
    const m = this.m, lo = m.paddle.w / 2 + 12, hi = m.width - lo;
    let tx = this.padAnchor + (this.toModel(x) - this.anchor) * 1.15;
    // pinned against a wall: re-anchor so the paddle comes straight back when the thumb reverses
    if (tx < lo || tx > hi) { tx = Math.max(lo, Math.min(hi, tx)); this.padAnchor = tx; this.anchor = this.toModel(x); }
    m.setTarget(tx);
  }
  pointerUp() { this.ptr.down = false; this.serve(); }
  serve() { const hold = this.m.phase === 'serve'; if (this.m.launch() && hold) this.coach.served(); }
  pointerCancel() { this.ptr.down = false; }
  key(k, down) {
    if (this.powerMenuOpen) {
      if (down && this.powerChoices[+k - 1]) this.chooseSpacePower(this.powerChoices[+k - 1].id);
      else if (down && k.toLowerCase() === 'k') this.closePowerMenu();
      return;
    }
    this.keys[k] = down;
    if (this.key === 'hoard' && down) { const c = k.toLowerCase(); if (this.m.phase === 'greed') { if (c === '1' || c === 'r') this.m.choose('run'); if (c === '2' || c === 's') this.m.choose('stay'); return; } if (c === 'r') this.m.run(); }
    if (k === ' ' && !down) this.serve();
    if (k.toLowerCase() === 'k' && down) this.activateKitPower();
  }
  kitAnchor() { return { x: 38 / this.kitUIScale, y: this.H - 30 / this.kitUIScale, r: 26 / this.kitUIScale }; }
  activateKitPower() {
    if (this.state !== 'play' || this.powerMenuOpen) return false;
    this.m.skipCard?.();   // tapping the orb also dismisses a stage card
    if (this.m.charge < 100) {
      this.hint = { text: `Break bricks to charge ${this.c.hero || 'Kit'}`, until: this.t + 2.2 };
      return false;
    }
    this.powerMenuOpen = true; this.powerMenuAt = performance.now();
    this.inputEpoch++; this.pointerCancel(); this.keys = {}; return true;
  }
  closePowerMenu() {
    if (!this.powerMenuOpen) return;
    this.powerMenuOpen = false; this.inputEpoch++; this.pointerCancel(); this.keys = {};
  }
  kind(id) { return (this.c.kinds || KINDS)[id]; }
  canChoosePower(id) { return !!this.kind(id) && this.m.canActivate(this.kind(id), { ignorePause: true }); }
  chooseSpacePower(id) {
    if (!this.powerMenuOpen || !this.canChoosePower(id)) return false;
    this.closePowerMenu();
    if (!this.m.activate(this.kind(id))) return false;
    this.kitCastAt = this.t; sfx.pick(PICK[this.kind(id)] || this.kind(id)); return true;
  }
  continueRun() {
    this.resultSaved = false; this.m.continued = false;   // how many continues are offered is the shared monetization policy's call
    if (this.m.continue()) { this.kitShockUntil = 0; this.hint = null; this.pointerCancel(); sfx.power(); }
  }
  // Back in action (main.js draws the banner): the ball waits on the paddle and the model's clocks hold until the serve.
  get backHold() { return !!this.m.backHold; }
  nearMiss() { return this.m.nearMiss(); }
  // ---------- simulation ----------
  update(dt) {
    if (this.powerMenuOpen) return;
    const m = this.m, was = m.state;
    this.t += dt; this.kitTime += dt;
    const nudge = (this.keys.ArrowRight ? 1 : 0) - (this.keys.ArrowLeft ? 1 : 0);
    if (nudge) m.setTarget(m.paddle.targetX + nudge * 460 * dt);
    m.update(dt); this.balls = m.balls; this.paddle.charge = m.charge / 100; this.paddle.stun = m.paddle.stun || (this.t < this.hurtUntil ? 1 : 0);
    if ((SNAKES.has(this.key) || this.key === 'hoard') && m.lives < this.lives0) this.hurtUntil = this.t + .9; this.lives0 = m.lives;
    if (this.key === 'tidewheel') this.floodMin = Math.min(this.floodMin, m.water.y);
    for (const e of m.effects) if (!this.heard.has(e)) {
      this.heard.add(e); if (e.kind === 'paddle-stun') this.stuns++; if (e.kind === 'ram-launch') this.coach.ramLaunched();
      if (e.kind === 'mine-blast') { sfx.boom(); continue; } if (e.kind === 'coin-pop') { sfx.hit(6); continue; }
      // The chapter's right power on its villain (ram.js powerTitle): a short title over the field and a boom.
      if (e.kind === 'power-title') { this.title = { text: e.text, at: this.t }; sfx.boom(); continue; }
      // A caught capsule plays its power's own short signature (audio.js sfx.pick).
      const cap = e.kind === 'capsule' ? e.power : e.kind.startsWith('capsule-') ? e.kind.slice(8) : e.kind.startsWith('note-') ? e.kind.slice(5) : null;
      if (cap) { sfx.pick(PICK[cap] || cap); continue; }
      if (this.key === 'hoard') {
        if (e.kind === 'scorch' || e.kind === 'avalanche' || e.kind === 'caught') { this.kitShockUntil = this.t + .9; sfx.hurt(); }
        else if (e.kind === 'chime' || e.kind === 'ward-bounce') { this.kitReactionAt = this.t; this.kitWardResult = 'held'; sfx.hit(6); }
        else if (HOARD_LOUD.has(e.kind)) sfx.beat();
        else if (!HOARD_QUIET.has(e.kind) && m.time - this.hitSoundAt > .06) { sfx.hit(); this.hitSoundAt = m.time; }
        else if (e.kind === 'brick-break' && m.time - this.hitSoundAt > .06) { sfx.hit(e.type === 'coin' || e.type === 'chest' ? 6 : 0); this.hitSoundAt = m.time; }
        continue;
      }
      if (SNAKES.has(this.key)) {
        if (e.kind === 'swallow') { this.kitShockUntil = this.t + .9; sfx.hurt(); }
        else if (e.kind === 'snake-hurt' || e.kind === 'shield-block' || e.kind === 'dizzy-hit' || e.kind === 'ward-bounce') { this.kitReactionAt = this.t; this.kitWardResult = 'held'; sfx.hit(); }
        else if (e.kind === 'chomp') sfx.chew();
        else if (['bite-warning', 'hatch-open', 'rope-escape', 'ram-launch', 'clash', 'seal-open', 'seal-shatter', 'lure-call'].includes(e.kind)) sfx.beat();
        else if (e.kind === 'bell-ring') sfx.hit(Math.min(8, e.rings * 2));
        else if (!['window-peek', 'lullaby', 'starlight', 'songshield', 'seal-feed', 'lure-dim', 'volley', 'arrow-hit', 'ward-deploy'].includes(e.kind) && m.time - this.hitSoundAt > .06) { sfx.hit(); this.hitSoundAt = m.time; }
        continue;
      }
      if (['bell-release', 'ratchet', 'surge', 'chain-snap', 'knockdown', 'valve-shut', 'bar-break', 'nerra-slam', 'tide-surge', 'bell-warning', 'housing-break', 'drawbridge-crash', 'gate-open', 'ram-launch', 'winch-tell', 'crank-jam', 'rack-smash', 'loot-shower'].includes(e.kind)) sfx.beat();
      else if (m.time - this.hitSoundAt > .06) { sfx.hit(); this.hitSoundAt = m.time; }
    }
    if (was === 'play' && m.state !== 'play') { m.state === 'won' ? sfx.win() : sfx.lose(); this.kitShockUntil = this.t + 1.1; }
    // The villain is nearly there: a heartbeat that quickens as the clock runs out.
    const pc = PURPOSE[this.key] && purposeClock(this.key, m);
    if (pc && pc.p >= PACE.high && m.state === 'play' && (this.beatT = (this.beatT || 0) - dt) <= 0) { sfx.beat(); this.beatT = 1.05 - .45 * (pc.p - PACE.high) / (1 - PACE.high); }
    updateKitPresence(this);
    const mood = kitExpression(this);
    if (mood !== this.kitMood) { this.kitMood = mood; this.kitAt = this.kitTime; }
    const p = m.paddle;
    this.coach.update(dt, { blocked: m.state !== 'play' || !!m.backHold || m.phase === 'intro' || m.phase === 'card' || m.phase === 'hook' || m.phase === 'clear' || m.phase === 'greed' || m.phase === 'escape' || this.powerMenuOpen,   // the Hoard's greed card is modal
      serveWaiting: m.phase === 'serve' && m.balls.some(b => b.caught && !b.dead), streak: p.streak || 0, armed: !!p.armed });
    ramTeach(p, this.coach.ramPulse);
  }
  // main.js draws this over the level, in level space, only while play runs (never under the continue panel).
  drawCoach(g) {
    const p = this.m.paddle;
    this.coach.draw(g, this.ox + p.x * this.k, this.hudTop + (p.y + 31) * this.k, this.kitUIScale,
      { width: this.W, lit: p.armed ? 3 : Math.min(3, p.streak || 0), gem: this.key === 'lumitower' ? 'pip_rose' : 'pip_gold' });
  }
  result() {
    const m = this.m, won = m.state === 'won';
    return { stars: won ? this.c.stars(this) : 0,
      lines: this.key === 'hoard' ? [['Score', Math.round(m.score).toLocaleString()], ['Loot banked', won ? `${m.banked}${m.mult > 1 ? ` (×${m.mult})` : ''}` : `${m.loot}`], ['Ember woke', m.wakes]] : this.key === 'rivals' ? [['Score', Math.round(m.score).toLocaleString()], ['Floors', `${won ? 3 : m.floor} / 3`], ['Clashes', m.clashes]] : this.key === 'lumitower' ? [['Score', Math.round(m.score).toLocaleString()], ['Floors', `${won ? 3 : m.floor} / 3`], ['Bites', m.bites]] : this.key === 'gatehouse' ? [['Score', Math.round(m.score).toLocaleString()], ['Floors', `${won ? 3 : m.floor} / 3`], ['Balls left', m.lives]] : this.key === 'tidewheel' ? [['Score', Math.round(m.score).toLocaleString()], ['Stages', `${won ? m.stageCount : m.stagesCleared} / ${m.stageCount}`], ['Knock-downs', m.knockdowns], ['Flood margin', `${Math.max(0, Math.round(((Number.isFinite(m.floodMinS4) ? m.floodMinS4 : this.floodMin) - m.water.limit) / (m.water.initial - m.water.limit) * 100))}%`]] : [['Score', Math.round(m.score).toLocaleString()], this.key === 'bellforge' ? ['Lift drops', `${m.lumi.steps} / ${m.rules.mistakes}`] : ['Flood margin', `${Math.max(0, Math.round((this.floodMin - m.water.limit) / (m.water.initial - m.water.limit) * 100))}%`], ['Balls left', m.lives]] };
  }
  // ---------- drawing ----------
  // The purpose plate shows while a floor is in play (not over climbs, crashes, the greed card or the ending).
  showPurpose() { const m = this.m; return !!PURPOSE[this.key] && (m.phase === 'play' || m.phase === 'serve' || m.phase === 'breach') && (m.state === 'play' || m.state === 'lost'); }
  background() {
    return cached(`fantasy-bg-${this.key}-${this.W}-${this.H}-${this.key === 'hoard' && caveReady() ? 1 : 0}`, this.W, this.H, g => {
      if (this.key === 'hoard') {   // the cave plate itself, edge rows stretched under the notch and home bar
        const c = cave(360, this.m.height), s = this.k, w = 360 * s, h = this.m.height * s, y = this.hudTop, pw = c.width, ph = c.height;
        g.drawImage(c, 0, 0, pw, 1, 0, 0, this.W, y + 1); g.drawImage(c, 0, ph - 1, pw, 1, 0, y + h - 1, this.W, this.H - y - h + 1);
        if (this.ox > 0) { g.drawImage(c, 0, 0, 1, ph, 0, y, this.ox + 1, h); g.drawImage(c, pw - 1, 0, 1, ph, this.ox + w - 1, y, this.ox + 1, h); }
        g.drawImage(c, this.ox, y, w, h); return;
      }
      if (SNAKES.has(this.key)) { const top = { rivals: '#12162a', lumitower: '#171226' }, bottom = { rivals: '#090b16', lumitower: '#0c0a16' }; const gr = g.createLinearGradient(0, 0, 0, this.H); gr.addColorStop(0, top[this.key]); gr.addColorStop(1, bottom[this.key]); g.fillStyle = gr; g.fillRect(0, 0, this.W, this.H); return; }
      const img = art.images[this.key + '/background'];
      g.fillStyle = '#101622'; g.fillRect(0, 0, this.W, this.H);
      if (!img.naturalWidth) return;
      g.drawImage(img, 0, 0, img.naturalWidth, 2, 0, 0, this.W, this.hudTop + 1);
      g.drawImage(img, 0, this.hudTop, this.W, this.H - this.hudTop);
      if (this.key === 'gatehouse') {   // same shade and vignette the encounter paints, so the margin under the home bar continues it
        g.globalAlpha = .42; g.fillStyle = '#050912'; g.fillRect(0, 0, this.W, this.H); g.globalAlpha = 1;
        const mh = this.m.height * this.k, cy = this.hudTop + mh * .45, vg = g.createRadialGradient(this.W / 2, cy, mh * .3, this.W / 2, cy, mh * .8);
        vg.addColorStop(0, '#0000'); vg.addColorStop(1, '#02040a99'); g.fillStyle = vg; g.fillRect(0, 0, this.W, this.H);
      }
    });
  }
  draw(g) {
    g.drawImage(this.background(), 0, 0, this.W, this.H);
    g.save(); g.translate(this.ox, this.hudTop); g.scale(this.k, this.k);
    drawEncounter(g, this.m, art, this.key);
    drawCastleFx(g, this.m.effects);
    if (this.key === 'bellforge' || this.key === 'tidewheel' || this.key === 'lumitower') gWard(g, this.m, art); // their renderers have no Ward of their own
    const pc = this.showPurpose() && purposeClock(this.key, this.m);
    if (pc) drawPurpose(g, pc, PURPOSE[this.key](this.m), this.m.time);
    g.restore();
    if (pc && this.m.state === 'play') drawPurposeVignette(g, this.W, this.H, pc.p, this.t);
    const s = this.kitUIScale, y = this.hudY + 18 / s;
    Arena.prototype.drawDeck.call(this, g);
    for (let i = 0; i < Math.max(3, Math.min(5, this.lives)); i++) drawBall(g, { x: (66 + i * 14) / s, y, r: 4.5 / s, vx: 0, vy: 0 }, i < this.lives ? 1 : 0.18);
    text(g, Math.round(this.score).toLocaleString('en-US'), this.W - 12 / s, y, 18 / s, '#fff', 'right');
    if (this.hint && this.t < this.hint.until) text(g, this.hint.text, this.W / 2, this.hudTop + (this.m.paddle.y - 40) * this.k, 14 / s, '#edb0c8', 'center');
    const ta = this.title ? this.t - this.title.at : Infinity;
    if (ta < 1.6) { // pops in, holds, fades
      g.save(); g.globalAlpha = Math.min(1, ta / .12, (1.6 - ta) / .4);
      text(g, this.title.text, this.W / 2, this.hudTop + 150 * this.k, (20 + 6 * Math.max(0, 1 - ta / .18)) / s, '#ffe2a8', 'center'); g.restore();
    }
  }
}

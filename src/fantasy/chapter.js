// Bellforge Run and Tidewheel Citadel as main-game chapters: the standalone encounter models behind the shared Arena-style
// contract (relative thumb drag, Kit orb, power menu, HUD, continue/results) that main.js drives.
import { Arena } from '../arena.js';
import { Bellforge } from './bellforge.js';
import { Tidewheel } from './tidewheel.js';
import { Gatehouse, GATEHOUSE_FLOORS } from './gatehouse.js';
import { LumiTower } from './lumitower.js';
import { makeArt, drawEncounter } from './render.js';
import { cached, drawBall, text } from '../gfx.js';
import { sfx } from '../audio.js';
import { kitExpression, updateKitPresence } from '../kit.js';

const MIN_H = 700;   // the models need their full portrait world; shorter screens draw it scaled down
const KINDS = { shield: 'echo', anchor: 'anchor', arrows: 'volley', titan: 'cosmic' };   // menu id -> model power
const CHAPTERS = {
  bellforge: { Model: Bellforge, powers: [{ id: 'shield', label: 'ECHO GUARD', color: '#dba4ba' }],
    preview: { x: 6, y: 68, w: 348, h: 74 }, stars: a => 1 + (a.lives >= 2) + (a.m.lumi.steps <= 2) },
  tidewheel: { Model: Tidewheel, powers: [{ id: 'anchor', label: 'ANCHOR', color: '#a9e7dd' }, { id: 'arrows', label: 'ARROWS', color: '#e3c6d1' }, { id: 'titan', label: 'STARFIRE', color: '#d3afe9' }],
    preview: { x: 20, y: 128, w: 320, h: 68 }, stars: a => 1 + (a.lives >= 2) + (a.floodMin >= a.m.water.limit + (a.m.water.initial - a.m.water.limit) / 2) },
  // Stars: clear it, finish with 2+ balls, and take at most one paddle stun (a bell that lands on the paddle).
  gatehouse: { Model: Gatehouse, name: 'Gatehouse Siege', kinds: { shield: 'ward' }, powers: [{ id: 'shield', label: 'WARD', color: '#a9cbf0' }],
    preview: { x: 14, y: 88, w: 332, h: 68 }, stars: a => 1 + (a.lives >= 2) + (a.stuns <= 1) },
  // Lumi holds the paddle: her face fills Kit's orb and her songs map 1:1 to the model. Stars: clear it, keep 2+ balls, never get bitten.
  lumitower: { Model: LumiTower, name: 'Lumi Breaks Out', hero: 'Lumi', face: 'lumi', menuTitle: 'LUMI’S SONGS', kinds: { lullaby: 'lullaby', starlight: 'starlight', songshield: 'songshield' },
    powers: [{ id: 'lullaby', label: 'LULLABY', color: '#b9a8ef' }, { id: 'starlight', label: 'STARLIGHT', color: '#f4d98c' }, { id: 'songshield', label: 'SONG SHIELD', color: '#f0a7c4' }],
    preview: { x: -15, y: 98, w: 260, h: 46 }, stars: a => 1 + (a.lives >= 2) + (a.m.bites === 0) },
};
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
  }
  get state() { return this.m.state; }
  get phase() { return this.m.phase; }
  get lives() { return this.m.lives; }
  get score() { return this.m.score; }
  get danger() { const m = this.m; if (this.key === 'lumitower') return m.lunges.some(l => l.stage !== 'peek' && l.stage !== 'retreat') ? .8 : 0; if (this.key === 'gatehouse') return m.bells.length || m.villain.stage === 'windup' ? .75 : m.floor / 3 * .6; return this.key === 'bellforge' ? m.lumi.steps / m.rules.mistakes : 1 - (m.water.y - m.water.limit) / (m.water.initial - m.water.limit); }
  get reason() { const m = this.m; return this.key === 'bellforge' || this.key === 'gatehouse' || this.key === 'lumitower' ? m.reason : m.loss === 'flood' ? 'The basin reached the refuge.' : 'The last ball slipped away.'; }
  previewRect() { const r = this.c.preview; return { ...r, y: r.y + this.hudTop }; }
  // ---------- input (level coordinates; the model sits hudTop below the level's top, scaled by k on short screens) ----------
  toModel(x) { return (x - this.ox) / this.k; }
  pointerDown(x) { const m = this.m; Object.assign(this.ptr, { down: true, x }); this.anchor = this.toModel(x); this.padAnchor = m.paddle.targetX; }
  pointerMove(x) {
    if (!this.ptr.down) return;
    const m = this.m, lo = m.paddle.w / 2 + 12, hi = m.width - lo;
    let tx = this.padAnchor + (this.toModel(x) - this.anchor) * 1.15;
    // pinned against a wall: re-anchor so the paddle comes straight back when the thumb reverses
    if (tx < lo || tx > hi) { tx = Math.max(lo, Math.min(hi, tx)); this.padAnchor = tx; this.anchor = this.toModel(x); }
    m.setTarget(tx);
  }
  pointerUp() { this.ptr.down = false; this.m.launch(); }
  pointerCancel() { this.ptr.down = false; }
  key(k, down) {
    if (this.powerMenuOpen) {
      if (down && this.powerChoices[+k - 1]) this.chooseSpacePower(this.powerChoices[+k - 1].id);
      else if (down && k.toLowerCase() === 'k') this.closePowerMenu();
      return;
    }
    this.keys[k] = down;
    if (k === ' ' && !down) this.m.launch();
    if (k.toLowerCase() === 'k' && down) this.activateKitPower();
  }
  kitAnchor() { return { x: 38 / this.kitUIScale, y: this.H - 30 / this.kitUIScale, r: 26 / this.kitUIScale }; }
  activateKitPower() {
    if (this.state !== 'play' || this.powerMenuOpen) return false;
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
    this.kitCastAt = this.t; sfx.power(); return true;
  }
  continueRun() {
    this.resultSaved = false; this.m.continued = false;   // how many continues are offered is the shared monetization policy's call
    if (this.m.continue()) { this.kitShockUntil = 0; this.hint = { text: 'BACK IN!', until: this.t + 1.5 }; sfx.power(); }
  }
  // ---------- simulation ----------
  update(dt) {
    if (this.powerMenuOpen) return;
    const m = this.m, was = m.state;
    this.t += dt; this.kitTime += dt;
    const nudge = (this.keys.ArrowRight ? 1 : 0) - (this.keys.ArrowLeft ? 1 : 0);
    if (nudge) m.setTarget(m.paddle.targetX + nudge * 460 * dt);
    m.update(dt); this.balls = m.balls; this.paddle.charge = m.charge / 100; this.paddle.stun = m.paddle.stun || (this.t < this.hurtUntil ? 1 : 0);
    if (this.key === 'lumitower' && m.lives < this.lives0) this.hurtUntil = this.t + .9; this.lives0 = m.lives;
    if (this.key === 'tidewheel') this.floodMin = Math.min(this.floodMin, m.water.y);
    for (const e of m.effects) if (!this.heard.has(e)) {
      this.heard.add(e); if (e.kind === 'paddle-stun') this.stuns++;
      if (this.key === 'lumitower') {
        if (e.kind === 'swallow') { this.kitShockUntil = this.t + .9; sfx.hurt(); }
        else if (e.kind === 'snake-hurt' || e.kind === 'shield-block') { this.kitReactionAt = this.t; this.kitWardResult = 'held'; sfx.hit(); }
        else if (e.kind === 'chomp') sfx.chew();
        else if (['bite-warning', 'hatch-open', 'rope-escape', 'ram-launch'].includes(e.kind)) sfx.beat();
        else if (e.kind === 'bell-ring') sfx.hit(Math.min(8, e.rings * 2));
        else if (!['window-peek', 'lullaby', 'starlight', 'songshield'].includes(e.kind) && m.time - this.hitSoundAt > .06) { sfx.hit(); this.hitSoundAt = m.time; }
        continue;
      }
      if (['bell-release', 'ratchet', 'surge', 'bell-warning', 'housing-break', 'drawbridge-crash', 'gate-open', 'ram-launch'].includes(e.kind)) sfx.beat();
      else if (m.time - this.hitSoundAt > .06) { sfx.hit(); this.hitSoundAt = m.time; }
    }
    if (was === 'play' && m.state !== 'play') { m.state === 'won' ? sfx.win() : sfx.lose(); this.kitShockUntil = this.t + 1.1; }
    updateKitPresence(this);
    const mood = kitExpression(this);
    if (mood !== this.kitMood) { this.kitMood = mood; this.kitAt = this.kitTime; }
  }
  result() {
    const m = this.m, won = m.state === 'won';
    return { stars: won ? this.c.stars(this) : 0,
      lines: this.key === 'lumitower' ? [['Score', Math.round(m.score).toLocaleString()], ['Floors', `${won ? 3 : m.floor} / 3`], ['Bites', m.bites]] : this.key === 'gatehouse' ? [['Score', Math.round(m.score).toLocaleString()], ['Floors', `${won ? 3 : m.floor} / 3`], ['Balls left', m.lives]] : [['Score', Math.round(m.score).toLocaleString()], this.key === 'bellforge' ? ['Lift drops', `${m.lumi.steps} / ${m.rules.mistakes}`] : ['Flood margin', `${Math.max(0, Math.round((this.floodMin - m.water.limit) / (m.water.initial - m.water.limit) * 100))}%`], ['Balls left', m.lives]] };
  }
  // ---------- drawing ----------
  background() {
    return cached(`fantasy-bg-${this.key}-${this.W}-${this.H}`, this.W, this.H, g => {
      if (this.key === 'lumitower') { const gr = g.createLinearGradient(0, 0, 0, this.H); gr.addColorStop(0, '#171226'); gr.addColorStop(1, '#0c0a16'); g.fillStyle = gr; g.fillRect(0, 0, this.W, this.H); return; }
      const img = art.images[this.key + '/background'];
      g.fillStyle = '#101622'; g.fillRect(0, 0, this.W, this.H);
      if (!img.naturalWidth) return;
      g.drawImage(img, 0, 0, img.naturalWidth, 2, 0, 0, this.W, this.hudTop + 1);
      g.drawImage(img, 0, this.hudTop, this.W, this.H - this.hudTop);
      if (this.key === 'gatehouse') { g.globalAlpha = .42; g.fillStyle = '#050912'; g.fillRect(0, 0, this.W, this.H); g.globalAlpha = 1; }   // same shade the encounter paints
    });
  }
  draw(g) {
    g.drawImage(this.background(), 0, 0, this.W, this.H);
    g.save(); g.translate(this.ox, this.hudTop); g.scale(this.k, this.k);
    drawEncounter(g, this.m, art, this.key);
    g.restore();
    const s = this.kitUIScale, y = this.hudY + 18 / s;
    Arena.prototype.drawDeck.call(this, g);
    for (let i = 0; i < Math.max(3, Math.min(5, this.lives)); i++) drawBall(g, { x: (66 + i * 14) / s, y, r: 4.5 / s, vx: 0, vy: 0 }, i < this.lives ? 1 : 0.18);
    text(g, Math.round(this.score).toLocaleString('en-US'), this.W - 12 / s, y, 18 / s, '#fff', 'right');
    if (this.hint && this.t < this.hint.until) text(g, this.hint.text, this.W / 2, this.hudTop + (this.m.paddle.y - 40) * this.k, 14 / s, '#edb0c8', 'center');
  }
}

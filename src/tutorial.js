// "How to play": the ball-control tutorial, taught by playing. Pure step rules (no drawing) so they can be tested;
// src/coach.js shows the chip for the current step and src/tutorial-draw.js draws the hand/arrow gesture.
//
// One short chip per step; a step ends when the player does the thing. The Vault runs it on a first play (and from the
// menu's "How to play"), with the serpent held and a lost ball free, so nothing can go wrong while learning.
//   aim     hold the finger down on the waiting ball: the aim line shows
//   serve   lift the finger: the ball launches along the aim line
//   move    drag anywhere to slide the paddle under the ball
//   edge    where the ball meets the paddle sets its angle: the edge sends it sharp
//   centre  the middle sends it straight up
//   ram     three middle hits in a row arm the Ram ball (src/fantasy/ram.js); the next middle hit launches it
//   capsule a power-up capsule falls and has to be caught
//   done    a short "you're ready" beat, then the tutorial is over for good
import { store } from './prefs.js';

export const TUT = {
  hold: .35,        // seconds of holding on the waiting ball that count as "aiming"
  move: 60,         // world units of paddle travel that count as "dragging"
  edge: .5,         // |offset| (0 = centre, 1 = tip) at or past which a return is an edge hit
  centre: 1 / 3,    // the ram's centre third (src/fantasy/ram.js)
  doneFor: 2,       // seconds the "ready" chip stays
  dropGap: 1.1,     // seconds between a missed capsule and the next one
};

// Copy: *word* is a highlighted keyword; '>' draws a small arrow. Keep each under ~34 characters.
export const STEPS = [
  { id: 'aim', copy: '*HOLD* on the ball to *aim*', icon: 'hold' },
  { id: 'serve', copy: '*LIFT* your finger to *serve*', icon: 'lift' },
  { id: 'move', copy: '*DRAG* to slide the paddle', icon: 'slide' },
  { id: 'edge', copy: 'Hit with the *EDGE* > *SHARP* angle', icon: 'edges' },
  { id: 'centre', copy: 'Hit the *MIDDLE* > *STRAIGHT* up', icon: 'centre' },
  { id: 'ram', copy: '*MIDDLE* ×3 > *RAM BALL*', icon: 'pips' },
  { id: 'capsule', copy: '*CATCH* the falling power-up', icon: 'capsule' },
  { id: 'done', copy: 'Nice! You *control* the ball', icon: 'pips' },
];
export const COUNT = STEPS.length - 1;   // the steps with a progress dot (everything but the closing chip)

export const tutorialDone = () => !!store.get('tutDone');
const finish = () => store.set('tutDone', true);

export class Tutorial {
  constructor() { this.i = 0; this.active = true; this.held = 0; this.moved = 0; this.lastX = null; this.doneT = 0; this.dropT = 0; this.wantDrop = false; this.stepT = 0; }
  get step() { return this.active ? STEPS[this.i] : null; }
  get id() { return this.step?.id ?? null; }
  advance() {
    if (!this.active) return;
    this.i++; this.stepT = 0; this.held = 0; this.moved = 0; this.wantDrop = false;
    if (this.i >= STEPS.length) this.end();
  }
  end() { this.active = false; this.wantDrop = false; finish(); }
  skip() { if (this.active) this.end(); }
  // What the chip should say right now: after the serve step a ball waiting on the paddle asks for its aim again.
  shown(s = {}) {
    if (!this.active) return null;
    if (s.serveWaiting && this.i >= 2 && this.id !== 'done') return STEPS[0].id;
    return this.id;
  }
  // Called every frame with the coach's moment: { serveWaiting, holding, paddleX, drops, blocked } and real seconds.
  feed(dt, s) {
    if (!this.active || s.blocked) return;
    this.stepT += dt;
    if (this.id === 'aim') { this.held = s.serveWaiting && s.holding ? this.held + dt : 0; if (this.held >= TUT.hold) this.advance(); }
    else if (this.id === 'move') {
      if (this.lastX !== null && !s.serveWaiting) this.moved += Math.abs(s.paddleX - this.lastX);
      if (this.moved >= TUT.move) this.advance();
    } else if (this.id === 'capsule') {
      this.dropT -= dt;
      this.wantDrop = !s.drops && this.dropT <= 0 && !s.serveWaiting;
    } else if (this.id === 'done') { this.doneT += dt; if (this.doneT >= TUT.doneFor) this.advance(); }
    this.lastX = s.paddleX ?? this.lastX;
  }
  takeDrop() { if (!this.wantDrop) return false; this.wantDrop = false; this.dropT = TUT.dropGap; return true; }
  // Player events from the level.
  served() { if (this.id === 'aim' || this.id === 'serve') { while (this.active && (this.id === 'aim' || this.id === 'serve')) this.advance(); } }
  hit(offset) {   // offset: -1..1 across the paddle where the ball met it
    const o = Math.abs(offset);
    if (this.id === 'edge' && o >= TUT.edge) this.advance();
    else if (this.id === 'centre' && o < TUT.centre) this.advance();
  }
  ramLaunched() { if (this.id === 'ram') this.advance(); }
  caught() { if (this.id === 'capsule') this.advance(); }
}

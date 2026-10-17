// Breakable physics: broken bricks split into convex fragments and unsupported bricks fall as rigid bodies.
// Uses planck (Box2D). Game units are y-down; 16 units = 1 metre.
import { World, Vec2, Box, Polygon, Edge } from 'planck';

const S = 16;
const v = (x, y) => Vec2(x / S, y / S);
const MAX_PIECES = 140;

// Clip a convex polygon [[x,y]...] to the half-plane closer to point a than to point b (a Voronoi cell edge).
function clipToward(poly, a, b) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, nx = b[0] - a[0], ny = b[1] - a[1];
  const side = p => (p[0] - mx) * nx + (p[1] - my) * ny; // <= 0 keeps the point
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], sp = side(p), sq = side(q);
    if (sp <= 0) out.push(p);
    if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  }
  return out;
}
function area(poly) { let s = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; s += p[0] * q[1] - q[0] * p[1]; } return Math.abs(s) / 2; }

export class Debris {
  constructor({ left, right, floor, onPaddleHit }) {
    this.world = new World({ gravity: Vec2(0, 34) });
    const ground = this.world.createBody();
    ground.createFixture(Edge(v(left, -400), v(left, floor)), { friction: 0.4 });
    ground.createFixture(Edge(v(right, -400), v(right, floor)), { friction: 0.4 });
    ground.createFixture(Edge(v(left - 50, floor), v(right + 50, floor)), { friction: 0.8, restitution: 0.15 });
    this.pieces = []; this.statics = new Map(); this.queue = [];
    this.paddle = this.world.createBody({ type: 'kinematic' });
    this.paddleFix = null; this.paddleW = 0;
    this.onPaddleHit = onPaddleHit;
    this.world.on('begin-contact', c => {
      const a = c.getFixtureA().getBody(), b = c.getFixtureB().getBody();
      for (const [x, y] of [[a, b], [b, a]]) {
        const p = x.getUserData();
        if (!p || p.kind !== 'brick' || p.broken) continue;
        const rv = x.getLinearVelocity().clone().sub(y.getLinearVelocity()).length() * S;
        if (y === this.paddle) { p.broken = true; this.queue.push(p); this.onPaddleHit?.(p); }
        else if (rv > 140) { p.broken = true; this.queue.push(p); }
      }
    });
  }

  // remaining bricks in the wall are static obstacles for falling debris
  addStatic(id, x, y, w, h) {
    const b = this.world.createBody({ position: v(x + w / 2, y + h / 2) });
    b.createFixture(Box(w / 2 / S, h / 2 / S), { friction: 0.6 });
    this.statics.set(id, b);
  }
  removeStatic(id) { const b = this.statics.get(id); if (b) { this.world.destroyBody(b); this.statics.delete(id); } }

  setPaddle(x, y, w, h, vx) {
    if (w !== this.paddleW) {
      if (this.paddleFix) this.paddle.destroyFixture(this.paddleFix);
      this.paddleFix = this.paddle.createFixture(Box(w / 2 / S, h / 2 / S), { friction: 0.5 }); this.paddleW = w;
    }
    this.paddle.setPosition(v(x, y + h / 2)); this.paddle.setLinearVelocity(v(vx, 0));
  }

  // art: { img, ox, oy, w, h } image placed so its (ox, oy) offset maps to the brick's top-left
  shatter(art, x, y, w, h, vx = 0, vy = -60, n = 4) {
    const seeds = [];
    for (let i = 0; i < n; i++) seeds.push([x + w * (0.15 + 0.7 * Math.random()), y + h * (0.2 + 0.6 * Math.random())]);
    for (const s of seeds) {
      let poly = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      for (const o of seeds) if (o !== s) poly = clipToward(poly, s, o);
      if (poly.length < 3 || poly.length > 8 || area(poly) < 6) continue;
      const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
      const local = poly.map(p => [p[0] - cx, p[1] - cy]);
      const body = this.world.createBody({ type: 'dynamic', position: v(cx, cy), angularDamping: 0.3, linearDamping: 0.05 });
      body.createFixture(Polygon(local.map(p => v(p[0], p[1]))), { density: 1, friction: 0.5, restitution: 0.25 });
      const out = (cx - (x + w / 2)) / w * 2;
      body.setLinearVelocity(v(vx * 0.35 + out * 70 + (Math.random() - 0.5) * 40, vy * 0.35 - 40 - Math.random() * 60));
      body.setAngularVelocity((Math.random() - 0.5) * 14);
      this.add({ kind: 'frag', body, local, art, bx: x - cx, by: y - cy, life: 2.2 + Math.random() * 0.8 });
    }
  }
  // an unsupported brick tumbles out of the wall as one piece and shatters on impact
  drop(art, x, y, w, h, meta) {
    const body = this.world.createBody({ type: 'dynamic', position: v(x + w / 2, y + h / 2), angularDamping: 0.1 });
    body.createFixture(Box(w / 2 / S * 0.96, h / 2 / S * 0.96), { density: 1.4, friction: 0.5, restitution: 0.1 });
    body.setAngularVelocity((Math.random() - 0.5) * 1.5);
    const local = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
    this.add({ kind: 'brick', body, local, art, bx: -w / 2, by: -h / 2, w, h, life: 6, meta });
  }
  add(p) {
    p.t = 0; p.body.setUserData(p); this.pieces.push(p);
    if (this.pieces.length > MAX_PIECES) {
      this.pieces = this.pieces.filter(q => !q.dead);
      if (this.pieces.length > MAX_PIECES) this.kill(this.pieces.find(q => q.kind === 'frag') || this.pieces[0]);
    }
  }
  kill(p) { if (p.dead) return; p.dead = true; this.world.destroyBody(p.body); }

  // balls knock debris around; the ball itself keeps its own deterministic path
  poke(ball) {
    for (const p of this.pieces) {
      if (p.dead) continue;
      const pos = p.body.getPosition(), dx = pos.x * S - ball.x, dy = pos.y * S - ball.y, d = Math.hypot(dx, dy);
      const reach = ball.r + (p.kind === 'brick' ? 14 : 6);
      if (d < reach && d > 0) p.body.applyLinearImpulse(v(ball.vx * 0.004 + dx / d * 2, ball.vy * 0.004 + dy / d * 2).mul(p.body.getMass()), p.body.getWorldCenter(), true);
    }
  }

  step(dt, shatterBrick) {
    this.world.step(Math.min(dt, 1 / 30), 6, 2);
    for (const p of this.queue.splice(0)) {
      if (p.dead) continue;
      const pos = p.body.getPosition(), vel = p.body.getLinearVelocity();
      this.kill(p);
      shatterBrick?.(p, pos.x * S, pos.y * S, vel.x * S, vel.y * S);
    }
    for (const p of this.pieces) { p.t += dt; if (p.t > p.life) this.kill(p); }
    this.pieces = this.pieces.filter(p => !p.dead);
  }

  draw(g) {
    for (const p of this.pieces) {
      const pos = p.body.getPosition(), a = p.body.getAngle(), x = pos.x * S, y = pos.y * S;
      const fade = Math.min(1, (p.life - p.t) * 2), path = () => { g.beginPath(); p.local.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); };
      g.save(); g.globalAlpha = fade * 0.35; g.fillStyle = '#000'; g.translate(x + 2.5, y + 4); g.rotate(a); path(); g.fill(); g.restore();
      // the piece shows exactly the part of the brick image it was cut from
      g.save(); g.globalAlpha = fade; g.translate(x, y); g.rotate(a); path(); g.clip();
      const A = p.art; g.drawImage(A.img, p.bx - A.ox, p.by - A.oy, A.iw, A.ih);
      g.restore();
    }
  }
}

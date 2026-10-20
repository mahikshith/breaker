import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const out = resolve(process.argv[2] || 'out/starflight-mission-review');
const base = process.argv[3] || 'http://127.0.0.1:4194/prototypes/starflight/';
const probe = process.argv.includes('--probe'), routes = process.argv.includes('--earned');
const ROUTE_SECONDS = 240;
const POWER_IDS = ['laser', 'seeker', 'spiral', 'drones', 'nova', 'hyper', 'stasis', 'storm', 'ricochet'];
const DEVICES = { ios: { width: 393, height: 852, top: 59, bottom: 34 }, android: { width: 412, height: 915, top: 32, bottom: 24 } };
const STORM_META = JSON.parse(readFileSync('assets/starflight-storm/manifest.json', 'utf8'));
const EQUIPMENT_META = JSON.parse(readFileSync('assets/starflight-equipment/manifest.json', 'utf8'));
mkdirSync(out, { recursive: true });
const sha = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const files = dir => existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(dir + '/' + e.name) : [dir + '/' + e.name]) : [];
const seal = () => Object.fromEntries([
  ...files('prototypes/starflight').filter(p => /\.(js|html|css)$/.test(p)),
  ...files('src/starflight').filter(p => p.endsWith('.js')),
  ...['assets/starflight', 'assets/starflight-v2', 'assets/starflight-arsenal', 'assets/starflight-storm', 'assets/starflight-equipment'].flatMap(files),
].sort().map(p => [p, sha(p)]));
const report = {
  scope: 'Actual mission UI and CDP touch at phone viewports, not physical devices. Resource/late-state fixtures are labelled staged. Earned policies use only input and normal model updates; no HP, resource, actor or progression writes.',
  sourceBefore: seal(), cases: [], earned: [], complete: false,
};
for(const [id,part] of Object.entries(EQUIPMENT_META.parts))assert.equal(sha(part.path),part.sha256,id+' canonical equipment hash');
report.equipment = Object.fromEntries(Object.entries(EQUIPMENT_META.parts).map(([id,p])=>[id,{path:p.path,sha256:p.sha256,pivot:p.pivot,size:p.size}]));
const save = () => writeFileSync(out + '/report.json', JSON.stringify(report, null, 2));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM, args: ['--mute-audio'] });
let active;

async function open(device, difficulty) {
  const D = DEVICES[device], page = await browser.newPage({ viewport: { width: D.width, height: D.height }, deviceScaleFactor: 2, hasTouch: true });
  const errors = [], failed = [], http = [];
  page.on('pageerror', e => errors.push(e.stack || e.message));
  page.on('requestfailed', r => failed.push({ url: r.url(), error: r.failure()?.errorText }));
  page.on('response', r => { if (r.status() >= 400 && !r.url().includes('favicon')) http.push({ url: r.url(), status: r.status() }); });
  await page.addInitScript(() => {
    requestAnimationFrame = fn => { window.__missionFrame = fn; return 1; };
    const Original = Image; window.__missionImages = [];
    window.Image = class extends Original { constructor() { super(); __missionImages.push(this); } };
    window.__missionDraws = {};
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function(image, ...args) {
      if (this.canvas.id === 'game' && image?.src?.includes('/starflight-storm/')) {
        const key = new URL(image.src).pathname.split('/').at(-1);
        __missionDraws[key] = (__missionDraws[key] || 0) + 1;
      }
      return draw.call(this, image, ...args);
    };
  });
  await page.goto(base + (base.includes('?') ? '&' : '?') + 'safe=' + D.top + ',' + D.bottom);
  await page.waitForFunction(() => window.__starflight?.ready && window.__missionFrame, null, { timeout: 45000, polling: 50 });
  await page.evaluate(() => {
    let now = performance.now();
    window.MQ = {
      frame(n = 1) { now = Math.max(now, performance.now()); for (let i = 0; i < n; i++) __missionFrame(now += 1000 / 60); },
      snapshot() { return JSON.stringify(__starflight.game, (_, v) => v instanceof Set ? [...v] : v); },
    };
    MQ.frame(2);
  });
  const cdp = await page.context().newCDPSession(page), fingers = new Map();
  const dispatch = type => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers].map(([id, p]) => ({ id, ...p, radiusX: 3, radiusY: 3, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, { x, y }); await dispatch('touchStart'); };
  const move = async (id, x, y) => { assert(fingers.has(id)); fingers.set(id, { x, y }); await dispatch('touchMove'); };
  const up = async id => {
    const point = fingers.get(id); assert(point, 'ending active touch');
    fingers.delete(id);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ id, ...point, radiusX: 3, radiusY: 3, force: 1 }] });
  };
  const cancel = async () => { if (!fingers.size) return; fingers.clear(); await dispatch('touchCancel'); };
  const tap = async selector => {
    const r = await page.locator(selector).boundingBox(); assert(r, 'visible ' + selector);
    await down(99, r.x + r.width / 2, r.y + r.height / 2); await up(99);
  };
  const frame = n => page.evaluate(n => MQ.frame(n), n);
  const snap = () => page.evaluate(() => MQ.snapshot());
  const fresh = async () => {
    await cancel();
    const mode = await page.evaluate(() => __starflight.mode);
    if (mode === 'play' || mode === 'arsenal') { if (mode === 'arsenal') await tap('#close-powers'); await tap('#pause'); }
    if (await page.locator('#retry').isVisible()) await tap('#retry');
    else if (await page.locator('#again').isVisible()) await tap('#again');
    else await tap('#launch');
    await frame(1);
  };
  const ui = { page, device, difficulty, D, errors, failed, http, cdp, down, move, up, cancel, tap, frame, snap, fresh };
  active = ui;
  await tap('[data-mode="' + difficulty + '"]'); await tap('#launch'); await frame(1);
  assert.equal(await page.evaluate(() => __starflight.mode), 'play');
  assert.equal(await page.evaluate(() => typeof __starflight.game.canActivate), 'function', 'new mission model loaded');
  return ui;
}

async function checkUI(ui) {
  const { page, device, difficulty, D, tap, down, move, up, cancel, frame, snap, fresh } = ui;
  const prefix = out + '/' + device + '-' + difficulty;
  const initial = await page.evaluate(() => {
    const g = __starflight.game;
    const rect = e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
    return {
      player: { ...g.player }, time: g.time, state: g.state, phase: g.phase, difficulty: g.difficulty,
      charge: g.charge, stocks: { ...g.stocks }, field: rect(document.getElementById('flight')),
      images: __missionImages.map(i => ({ src: i.src, width: i.naturalWidth, complete: i.complete })),
      text: document.querySelector('.mission')?.textContent || '',
    };
  });
  assert.equal(initial.difficulty, difficulty); assert.equal(initial.field.w, D.width); assert.equal(initial.field.h, D.height);
  assert(initial.images.length > 20 && initial.images.every(i => i.width > 0 && i.complete), 'all actual raster families decode');
  for(const p of Object.values(EQUIPMENT_META.parts))assert(initial.images.some(i=>i.src.endsWith(p.path.replace('assets/',''))&&i.width===p.size[0]),'new equipment decoded '+p.path);
  assert.deepEqual(Object.keys(initial.stocks).sort(), [...POWER_IDS].sort(), 'nine bounded stock kinds');
  assert(initial.text.trim().length > 15, 'actual mission briefing present');
  if (difficulty === 'easy') await page.screenshot({ path: prefix + '-00-opening.png' });
  const start = initial.player, tx = D.width / 2, ty = D.height * .67;
  await down(81, tx, ty); await move(81, tx + 50, ty - 38); await frame(28); await up(81);
  const drag = await page.evaluate(() => ({ ...__starflight.game.player }));
  assert(drag.x > start.x + 20 && drag.y < start.y - 12 && !drag.moving, 'relative genuine touch drag');
  await down(81, tx, ty); await move(81, tx - 20, ty); await frame(2);
  await tap('#pause'); await frame(1);
  assert.equal(await page.evaluate(() => __starflight.mode), 'pause', 'second touch can pause held drag');
  const paused = await snap(); await frame(120); assert.equal(await snap(), paused, 'pause freezes complete model');
  await up(81); await tap('#resume'); await frame(2);
  assert.equal(await page.evaluate(() => __starflight.game.player.moving), false, 'paused touch cannot restart movement');
  await page.evaluate(() => dispatchEvent(new Event('blur')));
  const background = await snap(); await frame(90); assert.equal(await snap(), background, 'blur freeze');
  await tap('#resume'); await tap('#reactor'); await frame(1);
  assert.equal(await page.evaluate(() => __starflight.mode), 'arsenal');
  const panel = await page.evaluate(() => {
    const rect = e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
    return { ...rect(document.getElementById('power-panel')), cards: [...document.querySelectorAll('[data-power]')].map(e => ({
      id: e.dataset.power, disabled: e.disabled, stock: e.querySelector('.stock-state')?.textContent, ...rect(e),
    })) };
  });
  assert.deepEqual(panel.cards.map(c => c.id).sort(), [...POWER_IDS].sort());
  assert(panel.x >= 0 && panel.y >= D.top && panel.x + panel.w <= D.width && panel.y + panel.h <= D.height - D.bottom, 'nine-choice safe-area fit');
  for (const c of panel.cards) assert(c.w >= 44 && c.h >= 44 && c.stock, c.id + ' actual touch/card status');
  const modal = await snap(); await frame(120); assert.equal(await snap(), modal, 'arsenal freezes all clocks/stocks');
  await page.keyboard.press('ArrowLeft'); await frame(3); assert.equal(await snap(), modal, 'modal blocks movement');
  await tap('#close-powers');
  await down(81, tx, ty); await tap('#reactor');
  assert.equal(await page.evaluate(() => __starflight.mode), 'arsenal', 'secondary thumb opens weapon bay while steering');
  await up(81); await tap('#reactor');
  assert.equal(await page.evaluate(() => __starflight.mode), 'play', 'fresh primary tap is not swallowed by duplicate-click suppression');
  await fresh();
  const powers = [];
  if (!probe) for (const id of POWER_IDS) {
    await fresh();
    await frame(180); // Natural entry first: the staged power is demonstrated over occupied combat.
    await page.evaluate(async () => {
      const geometry = await import('../../src/starflight/geometry.js');
      const mission = await import('../../src/starflight/mission.js');
      window.__missionLaunches = [];
      const g = __starflight.game, add = g.addShot;
      g.addShot = function(...args) {
        const shot = add.apply(this, args), p = { ...this.player };
        const ownerPoses = this.enemies.map(e => ({ id: e.id, ship: e.ship, x: e.x, y: e.y, angle: e.angle }));
        const drones = this.drones.map(d => ({ id: d.id, x: d.x, y: d.y, angle: d.angle, muzzle: d.muzzle && { ...d.muzzle } }));
        __missionLaunches.push({ shot, at: this.time, birth: { x: args[0], y: args[1] }, p, ownerPoses, drones });
        return shot;
      };
      window.__missionLaunchAudit = () => __missionLaunches.map(entry => {
        const { shot:s, birth, p, ownerPoses, drones } = entry;
        let expected, source;
        if (s.side === 'enemy') {
          const owner = ownerPoses.find(e => e.id === s.owner);
          if (owner && Number.isInteger(s.port)) { expected = geometry.shipPoint(owner.ship, owner.x, owner.y, owner.angle, geometry.SHIPS[owner.ship].muzzles[s.port]); source = 'enemy hardpoint'; }
        } else if (s.kind === 'drone') {
          const d = drones.find(d => d.id === s.owner);
          if (d?.muzzle) { expected = d.muzzle; source = 'physical drone aperture'; }
        } else if (s.kind === 'nova') { expected = p; source = 'radial hull emitter'; }
        else if (s.kind === 'ricochet') { expected = geometry.shipPoint('player', p.x, p.y, p.angle, mission.MISSION_PLAYER_NOSE); source = 'nose emitter'; }
        else if (Number.isInteger(s.port)) { expected = geometry.shipPoint('player', p.x, p.y, p.angle, geometry.SHIPS.player.muzzles[s.port]); source = 'player hardpoint'; }
        return { kind:s.kind, side:s.side, age:s.age, bornAt:entry.at, birth, from:s.from, source, expected,
          originError:expected ? Math.hypot(birth.x-expected.x,birth.y-expected.y) : null,
          fromError:s.from ? Math.hypot(birth.x-s.from.x,birth.y-s.from.y) : null,
          heading:Math.atan2(s.vy,s.vx), radius:s.r, life:s.life, bounces:s.bounces };
      });
    }); // Observe original emissions; no damage, actor, resource or progression override.
    await page.evaluate(() => { __starflight.game.charge = 100; MQ.frame(1); }); // Staged charge only.
    await tap('#reactor'); await frame(1);
    if (id === 'storm' && difficulty === 'easy') await page.screenshot({ path: prefix + '-01-nine-powers-staged.png' });
    await tap('[data-power="' + id + '"]'); await frame(1);
    const cast = await page.evaluate(id => ({ charge: __starflight.game.charge, timer: __starflight.game.timers[id], canRepeat: __starflight.game.canActivate(id) }), id);
    assert.equal(cast.charge, 0); assert(cast.timer > 0 && !cast.canRepeat, id + ' spends once and cannot immediate recast');
    powers.push({ id, ...cast });
    if (id === 'storm') {
      await page.evaluate(() => { __starflight.game.stocks.nova = 1; }); // Staged incompatible stock, not an earned capsule.
      await tap('#reactor'); await frame(1);
      assert(await page.locator('[data-power="nova"]').isDisabled(), 'Storm locks incompatible manual powers');
      const exclusive = await snap(); await page.keyboard.press('5'); await frame(1);
      assert.equal(await snap(), exclusive, 'rejected Nova preserves all resources and paused Storm state');
      await tap('#close-powers');
      await page.evaluate(() => {
        const g = __starflight.game, update = g.updateStorm;
        window.__missionReturned = null;
        g.updateStorm = function(...args) {
          const previous = this.storm, result = update.apply(this, args);
          if (previous && !this.storm) __missionReturned = { wings: JSON.parse(JSON.stringify(previous.wings)), player: { ...this.player } };
          return result;
        };
      }); // Read-only observation of the original final-return step.
      const phases = new Set(), samples = []; let finalReturn;
      let occupiedSweep = false;
      for (let i = 0; i < 100; i++) {
        await frame(6);
        const s = await page.evaluate(() => {
          const g = __starflight.game; return { time: g.time, storm: g.storm ? JSON.parse(JSON.stringify(g.storm)) : null, player: { ...g.player }, friendlyShots: g.shots.filter(s => s.side === 'player').length };
        });
        if (!s.storm) break;
        assert.equal(s.friendlyShots, 0, 'Storm is thunder only through split, sweep and return');
        if (s.storm.stage === 'return') finalReturn = s;
        if (!occupiedSweep && s.storm.stage === 'sweep' && s.storm.age >= 1.5) {
          const field = await page.evaluate(() => ({ live:__starflight.game.enemies.filter(e=>e.hp>0&&e.y>0).length, time:__starflight.game.time, band:__starflight.game.storm?.band }));
          if (field.live) {
            occupiedSweep = true; powers.at(-1).occupiedSweep = field;
            if (difficulty === 'easy') await page.screenshot({path:prefix+'-storm-occupied-sweep-staged.png'});
          }
        }
        if (!phases.has(s.storm.stage)) {
          phases.add(s.storm.stage); samples.push(s);
          if (difficulty === 'easy') await page.screenshot({ path: prefix + '-storm-' + s.storm.stage + '-staged.png' });
        }
        if (i === 3) { await tap('#pause'); const frozen = await snap(); await frame(120); assert.equal(await snap(), frozen, 'detached wings pause exactly'); await tap('#resume'); }
        if (i === 12) { await down(81, tx, ty); await move(81, tx + 26, ty - 12); }
        if (i === 22) await up(81);
      }
      assert.deepEqual([...phases], ['split', 'sweep', 'return'], 'actual full physical wing cycle');
      powers.at(-1).wingSamples = samples;
      powers.at(-1).finalReturn = finalReturn;
      const returned = await page.evaluate(() => __missionReturned); assert(returned, 'actual completed return observed');
      const c = Math.cos(returned.player.angle), sn = Math.sin(returned.player.angle);
      for (const wing of returned.wings) {
        const [x, y] = STORM_META.parts[wing.side < 0 ? 'wing-left' : 'wing-right'].neutralOffset;
        assert(Math.hypot(wing.x - (returned.player.x + x * c - y * sn), wing.y - (returned.player.y + x * sn + y * c)) < .02, 'wing reattaches at actual rotated source socket');
      }
      powers.at(-1).returned = returned;
      assert(occupiedSweep, 'Storm sweep demonstrated over naturally occupied field');
      const draws = await page.evaluate(() => ({ ...__missionDraws }));
      assert(draws['body.png'] > 0 && draws['wing-left.png'] > 0 && draws['wing-right.png'] > 0, 'actual cut body and both source wings rendered');
      powers.at(-1).sourceDraws = draws;
      assert.equal(await page.evaluate(() => __starflight.game.storm), null, 'wings finish return without duplicate actors');
    } else if (id === 'ricochet') {
      let maxBounces = 0, segments = 0;
      for (let i = 0; i < 35; i++) {
        await frame(6);
        const s = await page.evaluate(() => __starflight.game.shots.filter(s => s.kind === 'ricochet').map(s => ({ bounces: s.bounces, segments: s.segments?.length || 0 })));
        for (const b of s) { maxBounces = Math.max(maxBounces, b.bounces); segments = Math.max(segments, b.segments); }
        if (i === 10 && difficulty === 'easy') await page.screenshot({ path: prefix + '-ricochet-staged.png' });
      }
      assert(maxBounces > 0 && segments > 0, 'physical missile wall bounces and piecewise segments observed');
      powers.at(-1).maxBounces = maxBounces;
    } else {
      await frame(id === 'drones' ? 65 : 20);
      if (id === 'nova' && difficulty === 'easy') await page.screenshot({ path: prefix + '-nova-staged.png' });
    }
    const launches = await page.evaluate(() => __missionLaunchAudit());
    for (const s of launches) {
      if (s.expected) assert(s.originError < .02, id+' / '+s.kind+' actual launch origin');
      if (s.from) assert(s.fromError < .02, id+' / '+s.kind+' saved source equals actual launch');
    }
    const expected = {laser:'laser',seeker:'seeker',spiral:'salvo',drones:'drone',nova:'nova',hyper:'hyper',ricochet:'ricochet'}[id];
    if (expected) assert(launches.some(s=>s.kind===expected&&s.side==='player'), id+' actual special emission observed');
    powers.at(-1).launches = launches;
    if(difficulty==='easy'&&!['storm','ricochet'].includes(id))await page.screenshot({path:prefix+'-power-'+id+'-staged.png'});
    await frame(720); // At most one short earned relief can delay these initial finite powers.
    const expired = await page.evaluate(id => { const g=__starflight.game; return {timer:g.timers[id],state:g.state,time:g.time,
      stock:g.stocks[id],charge:g.charge,bank:g.chargeBank,storm:!!g.storm,live:g.shots.filter(s=>s.kind===id||id==='spiral'&&s.kind==='salvo').length}; },id);
    assert.equal(expired.timer,0,id+' finite duration expires during actual updates');
    if(id==='storm')assert.equal(expired.storm,false,'no detached wing remains after expiry');
    powers.at(-1).expiry=expired;
    report.inProgress={device,difficulty,powers};save();
  }
  await fresh();
  await page.evaluate(() => { const g = __starflight.game; g.stocks.storm = 1; g.charge = 100; g.chargeBank = 0; MQ.frame(1); }); // Staged resource ownership fixture.
  await tap('#reactor'); await frame(1); await tap('[data-power="storm"]'); await frame(1);
  const stored = await page.evaluate(() => ({ stock: __starflight.game.stocks.storm, charge: __starflight.game.charge }));
  assert.equal(stored.stock, 0); assert.equal(stored.charge, 100, 'stored choice spends stock before reactor');
  let collection, shield,resize;
  if(difficulty==='easy'){
    await fresh();await page.evaluate(()=>{__starflight.game.charge=100;MQ.frame(1);});
    await tap('#reactor');await tap('[data-power="storm"]');await frame(50);
    const beforeResize=await page.evaluate(()=>{const g=__starflight.game;window.__resizeWitness=g;return{time:g.time,w:g.width,h:g.height,stormAge:g.storm?.age};});
    await down(81,tx,ty);
    await page.setViewportSize({width:D.width,height:D.height-52});
    await page.waitForFunction(()=>__starflight.mode==='pause',null,{polling:50});await frame(2);
    const afterResize=await page.evaluate(()=>{const g=__starflight.game;return{same:g===__resizeWitness,time:g.time,w:g.width,h:g.height,stormAge:g.storm?.age,
      points:[g.player,...(g.storm?.wings||[]),...g.shots,...g.enemies].map(p=>({x:p.x,y:p.y}))};});
    assert(afterResize.same&&afterResize.h<beforeResize.h,'resize retains/rebases the actual mission');
    assert.equal(afterResize.time,beforeResize.time);assert.equal(afterResize.stormAge,beforeResize.stormAge);
    assert(afterResize.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)),'resized physical poses stay finite');
    await up(81);await page.setViewportSize({width:D.width,height:D.height});await frame(2);
    await page.waitForFunction(h=>Math.abs(__starflight.game.height-h)<.1,beforeResize.h,{polling:50});
    await tap('#resume');await frame(2);
    assert.equal(await page.evaluate(()=>__starflight.game.player.moving),false,'resize consumes held touch');
    resize={before:beforeResize,after:afterResize};
    await fresh();
    const dropped=await page.evaluate(()=>{const g=__starflight.game,p=g.player;
      const item={id:++g.serial,x:p.x+70,y:p.y-30,vx:0,vy:50,r:12,kind:'power',power:'laser',age:0};
      g.pickups.push(item);return{item:{...item},player:{...p}};
    }); // Staged falling capsule; only real touch/collision may collect it.
    await frame(24);
    const bypass=await page.evaluate(()=>{const g=__starflight.game;return{item:{...g.pickups[0]},stock:g.stocks.laser,player:{...g.player}};});
    assert.equal(bypass.stock,0,'nearby capsule is not automatically stored');
    assert(Math.abs(bypass.item.x-dropped.item.x)<.01&&bypass.item.y>dropped.item.y,'capsule falls without magnetic lateral pull');
    const s=D.width/360;
    await down(81,tx,ty);await move(81,tx+70*s,ty+5*s);await frame(24);await up(81);
    collection=await page.evaluate(()=>{const g=__starflight.game;return{stock:g.stocks.laser,pickups:g.pickups.length,player:{...g.player},score:g.score};});
    assert.equal(collection.stock,1,'actual swept ship contact stores the falling capsule once');
    assert.equal(collection.pickups,0);assert.equal(collection.score,50);
    await page.screenshot({path:prefix+'-capsule-contact-staged.png'});
    await fresh();await frame(100); // Let the genuine initial1.5s spawn grace expire.
    const startShield=await page.evaluate(()=>{const g=__starflight.game,p=g.player;g.shieldCharges=1;g.timers.shield=12;
      g.addShot(p.x,p.y-80,Math.PI/2,180,4,'enemy','pulse',1);return{hp:p.hp,y:p.y,time:g.time};
    }); // Staged one-charge shield and incoming projectile; actual motion resolves contact.
    await frame(10);await page.screenshot({path:prefix+'-shield-incoming-staged.png'});await frame(10);
    const blocked=await page.evaluate(()=>{const g=__starflight.game;return{hp:g.player.hp,charges:g.shieldCharges,shots:g.shots.filter(s=>s.side==='enemy').length,invuln:g.player.invuln,time:g.time};});
    assert.equal(blocked.hp,startShield.hp);assert.equal(blocked.charges,0,'shield intercepts at visible31u envelope before hurt core');
    assert.equal(blocked.shots,0);
    await frame(40);
    await page.evaluate(()=>{const g=__starflight.game,p=g.player;g.addShot(p.x,p.y-80,Math.PI/2,180,4,'enemy','pulse',1);});
    await frame(28);
    const unguarded=await page.evaluate(()=>({hp:__starflight.game.player.hp,charges:__starflight.game.shieldCharges}));
    assert.equal(unguarded.hp,startShield.hp-1,'spent shield cannot grant another protection');
    shield={start:startShield,blocked,unguarded};
  }
  await fresh();
  const retry = await page.evaluate(() => { const g = __starflight.game; return { time: g.time, hp: g.player.hp, maxHP: g.player.maxHP, charge: g.charge, score: g.score, stocks: g.stocks, timers: g.timers, storm: g.storm }; });
  assert(retry.time < .1 && retry.hp === retry.maxHP && retry.charge === 0 && retry.score === 0 && !retry.storm);
  assert(Object.values(retry.stocks).every(n => n === 0) && Object.values(retry.timers).every(n => n === 0), 'Retry clears every new resource');
  assert.deepEqual(ui.errors, []); assert.deepEqual(ui.failed, []); assert.deepEqual(ui.http, []);
  report.cases.push({ device, difficulty, initial, drag, panel, powers, stored, collection,shield,resize,retry, pauseFreeze: true, backgroundHandlerFixture: true, errors: ui.errors, failed: ui.failed, http: ui.http });
  delete report.inProgress;
  save(); console.log(device, difficulty, 'mission UI passed');
}

async function runRoute(ui, policy) {
  const { page, device, D, down, move, up, fresh, frame, tap } = ui;
  await fresh();
  const start = await page.evaluate(() => { const g = __starflight.game; return { x: g.player.x, y: g.player.y, w: g.width, h: g.height, charge: g.charge, score: g.score, hp: g.player.hp, seed: g.seed }; });
  assert.equal(start.charge, 0); assert.equal(start.score, 0);
  const scale = D.width / start.w, finger = { x: D.width / 2, y: D.height * .68 };
  let anchor = { x: start.x, y: start.y };
  if (policy !== 'idle') await down(81, finger.x, finger.y);
  const history = [], casts = [], collected = new Map(), stormCaptures = new Set(); let stop = ROUTE_SECONDS + 's bound', combat = false, boss = false, bounceCaptured = false;
  for (let i = 0; i < ROUTE_SECONDS * 4; i++) {
    const step = await page.evaluate(policy => {
      const g = __starflight.game, p = g.player; let y = g.height * .78;
      const enemies = g.enemies.filter(e => e.hp > 0 && e.y > 0);
      const target = enemies.sort((a, b) => (a.kind === 'boss' ? -1 : 0) - (b.kind === 'boss' ? -1 : 0) || Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
      const desiredDrop = policy === 'supplies' && g.pickups.filter(d => d.y > g.height * .45 && d.y < g.height - 30
        && (d.kind !== 'power' || !g.stocks[d.power] && Object.values(g.stocks).reduce((a,b)=>a+b,0)<3))
        .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
      if(desiredDrop)y=Math.max(g.height*.55,Math.min(g.height-45,desiredDrop.y+18));
      const candidates = [36, 68, 100, 132, 164, 196, 228, 260, 292, 324];
      const cost = x => {
        let n = Math.abs(x - p.x) * .001;
        if (policy === 'ordinary' || policy === 'supplies') n += Math.abs(x - (desiredDrop?.x ?? target?.x ?? 180)) * (desiredDrop ? .035 : .014);
        else n += Math.abs(x - 320) * .001;
        for (const s of g.shots) if (s.side === 'enemy') {
          const t = Math.max(0, Math.min(.65, (y - s.y) / (s.vy || 1)));
          const d = Math.hypot(s.x + s.vx * t - x, s.y + s.vy * t - y);
          if (d < 65) n += 130 / (d + 7);
        }
        for (const e of enemies) if (e.y > y - 100) n += 100 / (Math.hypot(e.x - x, e.y - y) + 8);
        for (const h of g.hazards) n += 80 / (Math.hypot(h.x - x, h.y - y) + 8);
        return n;
      };
      const x = candidates.reduce((a, b) => cost(a) < cost(b) ? a : b);
      const order = ['storm', 'ricochet', 'laser', 'drones', 'seeker', 'nova', 'hyper', 'spiral', 'stasis'];
      const ready = order.find(id => g.stocks[id] && g.canActivate(id)) || order.find(id => g.canActivate(id));
      return { x, y, time: g.time, state: g.state, phase: g.phase, hp: p.hp, kills: g.kills, score: g.score, charge: g.charge, stocks: { ...g.stocks }, ready, stormStage: g.storm?.stage, ricochetBounces: Math.max(0, ...g.shots.filter(s => s.kind === 'ricochet').map(s => s.bounces)), enemies: enemies.length, enemyShots: g.shots.filter(s => s.side === 'enemy').length, bossHP: enemies.find(e => e.kind === 'boss')?.hp, mission: g.mission || null,
        pursuedDrop:desiredDrop&&{id:desiredDrop.id,kind:desiredDrop.kind,power:desiredDrop.power},
        pickups:g.effects.filter(f=>f.kind==='pickup').map(f=>({id:[f.seed,f.x,f.y,f.pickupKind,f.power].join(':'),kind:f.pickupKind,power:f.power,x:f.x,y:f.y})) };
    }, policy);
    assert(Object.values(step.stocks).every(n => Number.isInteger(n) && n >= 0 && n <= 1), 'per-kind stored capsule cap');
    assert(Object.values(step.stocks).reduce((a, b) => a + b, 0) <= 3, 'total stored capsule cap');
    for(const p of step.pickups)if(!collected.has(p.id))collected.set(p.id,{...p,at:step.time});
    if (step.state !== 'play') { stop = step.state; history.push(step); break; }
    if (!combat && step.time > 45 && step.mission?.group >= 2 && step.enemies >= 2 && step.enemyShots) { await page.screenshot({ path: out + '/' + device + '-' + policy + '-earned-combat.png' }); combat = true; }
    if (!boss && step.bossHP) { await page.screenshot({ path: out + '/' + device + '-' + policy + '-earned-boss.png' }); boss = true; }
    if (policy === 'supplies' && step.stormStage && !stormCaptures.has(step.stormStage)) {
      stormCaptures.add(step.stormStage); await page.screenshot({ path: out + '/' + device + '-supplies-earned-storm-' + step.stormStage + '.png' });
    }
    if (policy === 'supplies' && step.ricochetBounces > 0 && !bounceCaptured) {
      bounceCaptured = true; await page.screenshot({ path: out + '/' + device + '-supplies-earned-ricochet-bounce.png' });
    }
    if (policy === 'supplies' && step.ready) {
      await up(81); await tap('#reactor'); await frame(1); await tap('[data-power="' + step.ready + '"]');
      const after = await page.evaluate(() => { const g = __starflight.game; return { stocks: { ...g.stocks }, charge: g.charge, player: { ...g.player } }; });
      casts.push({ time: step.time, id: step.ready, before: { stocks: step.stocks, charge: step.charge }, after });
      if (['storm', 'ricochet'].includes(step.ready)) { await frame(16); await page.screenshot({ path: out + '/' + device + '-supplies-earned-' + step.ready + '.png' }); }
      anchor = { x: after.player.x, y: after.player.y }; await down(81, finger.x, finger.y);
    }
    if (policy !== 'idle') await move(81, finger.x + (step.x - anchor.x) * scale, finger.y + (step.y - anchor.y) * scale);
    await frame(15);
    if (i % 20 === 0) history.push(step);
  }
  if (policy !== 'idle') await up(81);
  const final = await page.evaluate(() => { const g = __starflight.game; return { time: g.time, state: g.state, phase: g.phase, hp: g.player.hp, kills: g.kills, score: g.score, charge: g.charge, stocks: { ...g.stocks }, mission: g.mission || null, world: g.world, completedEnemyIDs: [...g.completedEnemies], requiredEnemyIDs: [...g.requiredEnemies] }; });
  await page.screenshot({ path: out + '/' + device + '-' + policy + '-earned-outcome.png' });
  const scope = policy === 'ordinary' ? 'One bounded240s real touch route, target tracking and hazard projection, ordinary autofire only. No state/resource writes; no casts.'
    : policy === 'supplies' ? 'One bounded240s real touch route. Naturally collected stocks and genuinely earned reactor are selected through the actual nine-choice UI. No state/resource writes.'
    : policy === 'idle' ? 'One bounded240s stationary no-input attempt. Automatic primary remains active; no state/resource writes or casts.'
      : 'One bounded240s dodge-only target policy, automatic primary still active. No player damage targeting or casts. A non-win alone does not prove no-fire cannot win.';
  if (final.state === 'won') {
    assert.equal(await page.evaluate(() => __starflight.mode), 'won');
    assert(await page.locator('#result').isVisible(), 'actual mission success UI');
    assert.equal(final.mission?.beat, 'complete');
    assert.equal(final.world.gate.open, 1); assert.equal(final.world.blockade.remaining, 0);
    assert.equal(final.requiredEnemyIDs.length, 0);
  }
  report.earned.push({ device, policy, scope, start, stop, history, casts, collected:[...collected.values()], stormCaptures: [...stormCaptures], bounceCaptured, final, combat, boss, errors: ui.errors });
  save(); console.log(device, policy, final.state, final.time.toFixed(2), final.hp);
}

try {
  for (const device of Object.keys(DEVICES)) {
    for (const difficulty of probe ? ['easy'] : ['easy', 'medium', 'hard']) {
      const ui = await open(device, difficulty);
      await checkUI(ui);
      if (routes && difficulty === 'easy') { await runRoute(ui, 'ordinary'); await runRoute(ui, 'supplies'); await runRoute(ui, 'passive'); await runRoute(ui, 'idle'); }
      await ui.page.close(); active = null;
    }
  }
  report.sourceAfter = seal(); report.sourceStable = JSON.stringify(report.sourceBefore) === JSON.stringify(report.sourceAfter);
  report.complete = true; save(); assert(report.sourceStable, 'mission source/art unchanged through final run');
} catch (error) {
  report.failure = { message: error.stack || String(error), device: active?.device, difficulty: active?.difficulty, errors: active?.errors, failed: active?.failed, http: active?.http };
  if (active) await active.page.screenshot({ path: out + '/failure.png' }).catch(() => {});
  save(); throw error;
} finally { await browser.close(); }

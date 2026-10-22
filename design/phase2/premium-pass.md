# Premium pass: chapters 1-8 up to the Gatehouse finish

Reference: `design/phase2/img/kit-gatehouse-siege-v1.png`, review capture `gatehouse-first-pass.png`.
Gatehouse sets the bar: glazed ceramic bricks with a dark lower lip, enamelled-steel armour plates, a lit 3D villain,
a deep architectural backdrop with warm accents, rendered chips and sparks for crashes, rendered pips in the HUD.

Before captures (393x852, iOS safe area, seeded autoplay; serve, mid-play at 9 s, and the frame with the most on-screen
breakage in 150 s): `/mnt/project-files/breaker/review-2026-10-22/premium-audit/before/L<n>-<level>-{1-serve,2-midplay,3-bigmoment}.png`
(L9 Gatehouse is included as the reference).

Tags: **art** = needs rendered art (Phase B covers the ones marked "done"), **code** = existing art or a draw-call swap is enough.
Levels are ranked by how early players meet them (Carrier, Vault, Frost first), then by the size of the gap.

## Shared gaps (all Arena chapters: Carrier, Vault, Circuit, Forge, Frost, Mooncoil)

| Gap | Where | Tag |
|---|---|---|
| Every hit spawns a plain stroked ring (`FX.ring`). The owner rejected rings as FX. | `src/gfx.js` FX.ring/draw, called from carrier/relay/orbital/frost/arena | art done: `glints/glint_{warm,cool,rose}` |
| Brick breaks throw flat code polygons (`FX.shatter`, `poly()`) instead of glazed chips. | `src/gfx.js` FX.shatter/draw | art done: `shards/<palette>_{a,b,c}` |
| Bottom safe-area margin repeats the plate's edge rows, so the plate looks smeared under the paddle. Vault, Mooncoil, Bellforge, Tidewheel and Gatehouse all show it. | full-bleed background fill in `main.js` and `FantasyChapter.background()` | code: fade to the plate's floor colour or mirror a 40-unit band |
| HUD "AIM" counter is three code dots; the progress bar is a flat line (yellow on the Vault, which breaks the minimal-yellow rule). | `Arena.drawHUDBase` | code: use `assets/fx-kit/pip_*` (already rendered) and a glazed bar |

## 1. Carrier Breakout (first impression: highest impact)

| Area | Gap | Tag |
|---|---|---|
| Bricks | Matte printed panels (`aBrickCyan`/`aBrickPink`): no glaze, no lip, they read as flat stickers next to the rendered hull. | art done: `carrier/enamel_{cyan,pink}` |
| Villain | The carrier hull is rendered and reads well, but there is no face. The antagonist never reacts. | art later: a pilot bust in the bridge window with 3 expressions |
| Backdrop | Space plate with planet and asteroids is calm and fine. | none |
| Props | Crew pods are rendered and fine. | none |
| FX | A cyan ring on every brick hit (`carrier.js:251`). Fighters shatter into code polygons. | art done: glints and hull shards |
| HUD | AIM dots and the jump timer are plain text and dots. | code: fx-kit pips |

## 2. The Vault

| Area | Gap | Tag |
|---|---|---|
| Bricks | Already glazed, with 3 damage states. Ruby gem blocks and granite are fine. | none |
| Villain | The serpent is a smooth tube with a rendered head. It reads well. | none |
| Backdrop | Castle hall plate, good. The bottom margin is smeared. | code |
| FX | 1-hit chips (`vault.js:184,370`) are code polygons. Big crashes already use rendered debris. | art done: shards (teal/violet/coral/gold/blue) |
| HUD | The yellow progress bar and the small "FURY QUEUED" text are weaker than the Gatehouse floor pill. | code |

## 3. Frost Warden (largest gap of the early chapters)

| Area | Gap | Tag |
|---|---|---|
| Backdrop | Code-drawn: a slice of the Vault plate at 28 % alpha, a flat navy wall and a gradient. It reads as an empty dark screen. | art done: `frost/backdrop` (sky, peaks, crenellated rampart walk, Lumi's bartizan, courtyard arcade, frozen floor) |
| Props | The rampart walk is a code trapezoid and Lumi's ledge is a code `brick()` slab. | art done: both baked into the backdrop, registered to the same coordinates |
| Ward posts | Stacked granite tiles. Damage shows as stroked crack lines and flat rectangle pips. | art done: `frost/post_{0,1,2}`; pips: code, use fx-kit |
| Villain | The Warden render is grey and low contrast, and small against the sky. It has no rim light and little face read. | art later: re-light the Warden sheet (cool rim, warm key, AO) |
| Bricks | Uses the Vault glaze sprites, which is good. The payload diamond is a code glyph. | code: use the cap icons or a gem sprite |
| FX | Brick fragments are code `brick()` squares. Rings on post hits and punches. | art done: shards (blue/violet/teal/coral), ice shards, glints |

## 4. Circuit Breakout

| Area | Gap | Tag |
|---|---|---|
| Bricks | Neon gem bricks are glossy and on theme. The grey "X" armour crates are flat icons. | art later: enamel armour crate (reuse the `enamel()` builder with gunmetal) |
| Villain | The relay ship render is good. | none |
| Backdrop | Starfield with a planet, fine. | none |
| FX | Stroked rings around every hit and target (visible in the big-moment capture). | art done: glints, hull shards |

## 5. Shutter Forge

| Area | Gap | Tag |
|---|---|---|
| Bricks | Neon gem bricks, fine. The armour plates (`brick_armour`) read flat. | art later |
| HUD | The Kit orb shows a placeholder diamond, not a face. | code/art: wire the companion face |
| FX | Rings. Station hits use code. | art done: glints, hull shards |

## 6. Mooncoil Reliquary

| Area | Gap | Tag |
|---|---|---|
| Bricks | Rendered but matte and darker than the Vault glaze. The iron cage studs are dark. | art later: re-render with the premium `studio()` fill (`art/premium/premium.py`) |
| Backdrop | Moon hall plate is good. The bottom margin is smeared. | code |
| FX | Shatter polygons. | art done: shards (violet/blue/coral/teal) |

## 7. Bellforge Run

| Area | Gap | Tag |
|---|---|---|
| Bricks | Three mismatched families in one wall: rose uses the Tidewheel ceramic tile, cyan and plum use Vault glaze sprites at another scale. | art done: `bellforge/ceramic_{teal,coral,plum}` |
| Pin bricks | Code gradient rectangle with a stroked line at 1 hp. | art done: `bellforge/pin_{2hp,1hp}` |
| Villain / backdrop | Korr and the forge hall are at reference quality. | none |
| FX | Code sparks and rings on bell hits. | art done: glints |

## 8. Tidewheel Citadel

| Area | Gap | Tag |
|---|---|---|
| Bricks, villain, backdrop | At reference quality (Nerra, ceramic tiles, harbour plate). | none |
| FX | Water muzzle and hit puffs are code ellipses and 2-px squares. | art later: a water-splash sprite strip |
| Backdrop | The bottom margin is smeared. | code |

## Phase B asset list (rendered)

Script: `art/premium/premium.py` (uses the Vault rig: glaze, gloss card, key/fill/bounce, AgX). Outputs are in `assets/premium/`
and `assets/premium/manifest.json`, which records px, ppu, drawSize, pivot/anchor, contact anchors, alphaBounds and sha256 for each part.

| Asset | px | Draw | Replaces |
|---|---|---|---|
| `bellforge/ceramic_{teal,coral,plum}` | 304x176 | 38x22 u, contact 34x18 | Bellforge `cyan`/`rose`/`plum` bricks |
| `bellforge/pin_2hp`, `pin_1hp` | 272x176 | 34x22 u, contact 30x18 | code pin gradient |
| `carrier/enamel_{cyan,pink}` | 264x168 | 44x28 u, same normalized frame as `space-a/brick_*` | `aBrickCyan`/`aBrickPink` |
| `frost/post_{0,1,2}` | 104x320 | 26x80 u, contact 18x68 | granite-tile ward posts |
| `frost/backdrop` (.png and .jpg) | 720x1600 | screen 0,0 to 360x800 u | `Frost.background()`, `drawWalkway()`, ledge `brick()` |
| `shards/<palette>_{a,b,c}`: teal, violet, coral, gold, blue, cyan, pink, sage, ivory, ceramic, plum, ice, hull | 48x48 | 8x8 u | `FX.shatter` polygons, Frost fragments |
| `glints/glint_{warm,cool,rose}` | 96x96 | 16x16 u | `FX.ring` |

## Wiring notes (for the code pass; nothing in src/ was changed)

- **Shards** (`src/gfx.js`, `FX.draw` / `poly()`): draw `shards/<palette>_<a|b|c>` centred on the shard and rotated by `s.rot`,
  at a size of about 2.6x the polygon radius. Choose the palette from `s.color`: Vault `COLORS` t/v/c/y/b map to teal/violet/coral/gold/blue;
  Carrier cyan/pink map to cyan/pink; fighter or hull colours map to hull; Frost uses ice for punches and post breaks. Keep the drop shadow
  as one `drawImage` at 30 % black offset (2,3), or drop it. Frost `fragments` (`frost.js:332`) use the same sprites in place of `brick(f.color)`.
- **Glints** (`FX.ring` draw): replace the stroked arc with `glints/glint_<warm|cool|rose>`, additive (`lighter`). Scale 0.7 to 1.3 of
  `r.r * 2` over the existing 0.35 s life, alpha 1 to 0. Pick cool for cyan or white rings, rose for pink or magenta, warm for gold.
  The `onLost` red ring (`arena.js:303`) can stay a ring if it needs to read as a warning.
- **Carrier panels**: point `design/phase1/space-assets-ab.json` parts `aBrickCyan`/`aBrickPink` at `assets/premium/carrier/enamel_*.png`
  and set `size` to [264,168], because `tools/pack_art.py` asserts it. The normalized alpha bounds match the old panels (0.09..0.91 x, 0.19..0.81 y),
  so `fit()` places them identically. The payload capsule still draws on top.
- **Bellforge bricks** (`src/fantasy/render.js` `brick()`): for colour `cyan|rose|plum` draw `ceramic_{teal|coral|plum}` through `tbrick`'s contact
  anchors. They are identical to the Tidewheel tile anchors (0.0526, 0.0909). Pack them like `F.tidewheel.bricks`. Also switch the `brick-break` effect's
  image (`render.js:551`) to the ceramic tile so the falling thirds match.
- **Bellforge pins** (`brick()` `type==='pin'` branch): replace the gradient roundRect and the 1-hp stroke with `pin_{b.hp}hp` drawn at the contact
  anchors over the 30x18 pin rect. Keep the ratchet badge draw on top.
- **Frost backdrop**: in `Frost.background()`, draw `frost/backdrop` (or the .jpg) at screen (0,0) size 360x800, cropped to H. Turn `drawWalkway()`
  into the Warden's shadow ellipse only, and delete the ledge `brick('#42536e')` call (`frost.js:313`). The walk (x 6..264, rear 214, front 238),
  the ledge (266,202 64x14) and the alcove are baked in at the coordinates the code already uses. `drawFullBleedBackground` should fill with `#0b111b`.
- **Frost posts** (`frost.js` defences loop): replace the four granite tiles and the stroked crack with one `post_{k}` drawn at
  (d.x+d.w/2-13, d.y+d.h/2-40, 26, 80), where k = hp/maxHP > .67 ? 0 : > .34 ? 1 : 2. Replace the flat-rectangle hp pips with `fx-kit/pip_blue`/`pip_empty`.

Review mock: `/mnt/project-files/breaker/review-2026-10-22/premium-audit/art/compare-*.png` shows before next to after. The after side was built by swapping
these assets in at runtime with a `drawImage` hook, so it previews the wiring above. It is not the shipped code, and its big-moment frame can
differ from the before frame.

Art for later passes: the Carrier pilot bust, the Warden re-light, the Circuit and Forge armour crates, a Mooncoil brick
re-render and a Tidewheel splash strip.

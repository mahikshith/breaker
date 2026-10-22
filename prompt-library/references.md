# References: images to attach as style references

All paths are relative to the repo root (the `breaker-castle-art` worktree). Every path below was checked and exists. Attach **1 to 3** per prompt (more than that muddies the result in most image tools). The "Attach for" column tells you which to pick.

Two cautions before you start:

- **Some references show things we have since removed.** The Lumi board has small wall lanterns, and `assets/fantasy-machinery/bellforge-background.png` has candles. The owner removed torches, lanterns and lights from backgrounds. Use those images for material and depth only, and keep the "no lanterns, torches or candles" line in the prompt.
- **Boards contain baked-in text.** That is fine for concept boards, never for assets or backgrounds. Say "no text" in the prompt and attach a board only when you want its layout or mood.

## A. The target look (attach these most often)

| # | Path | What it shows | Attach for |
|---|---|---|---|
| 1 | `design/phase2/img/kit-gatehouse-siege-v1.png` (1536x1024) | The owner's favourite concept board. Phone playfield on the left (HUD, bricks, ramps, bell, Kit paddle, face orb), hero panel on the right (winch wheel, portcullis gate, Kit with heater shield, armoured boar Korr), three floor panels, a power strip. Premium render, metal-banded wood and stone machinery. | Concept boards, castle machinery, "premium" finish, villain render quality |
| 2 | `design/phase2/img/lumi-breaks-out-v1.png` (1536x1024) | Sister board: tower shaft with arched windows, Gnash the emerald serpent emerging, Lumi face portrait, rose-gold paddle, song power icons. | Lumi levels, window and serpent staging. Ignore the small wall lamps |
| 3 | `docs/reference/vault-top-down.png` (540x1050) | The "shiny" target: glazed bricks with real reflections and dark separators. | Brick glaze, highlight band, level plate darkness |
| 4 | `docs/screens/07-vault-focus-aim.png` (393x852) | A real in-game screen: dark calm plate, glazed bricks, serpent meter HUD, aim dots, chrome paddle, lives and AIM pips. | Anything that must sit inside the real game: scale, HUD clearance, "background never outshines" |

## B. Characters

| # | Path | What it shows | Attach for |
|---|---|---|---|
| 5 | `assets/kit/expressions.png` (1200x744) | Prince Kit's eight expressions (Determined, Focused, Grin, Shock, Worried, Cheer, Hurt, Laugh) as real Blender renders. Eyes, lids, brows and mouth change together. | Expression sheets for any character |
| 6 | `assets/kit/turnaround.png` (1440x480) | Kit front, three-quarter, side and back, same lighting. Open-face silver helmet, cobalt cape, heater shield. | Turnaround layout and proportion |
| 7 | `assets/princess/Idle_00.png`, `Scared_00.png`, `Panic_00.png` (168x168 each) | Lumi at the real sprite size: honey-blonde hair, rose dress, tiara. Shows how much emotion survives at about 42 units tall. | Lumi identity, native-size readability |
| 8 | `assets/fantasy-machinery/korr.png` (2048x448, four poses) | Korr the armoured boar: ruby-plum glossy plates with gold trim, ivory tusks, amber eyes, four stout hoofed legs, no human arms. | Animals, armour-on-animal, villain pose set |
| 9 | `assets/fantasy-machinery/nerra-v2-idle.png` (640x576) | Nerra the castle-shell crab: oxblood and coral shell with a mini fortress, big expressive eyes on short stalks, mismatched claws, six walking legs. | Creature with a built structure on its back, asymmetry |
| 10 | `art/snake-emerald/proof/contact.png` (1280x960) | Gnash the emerald serpent head in 10 of its 13 expressions (idle, blink, taste, hunt, chew0, chew1, hiss, ouch, dizzy, grin), each also at phone size. Angular head, coral-pink brows, lime eyes, cream jaw. Never round. | Serpent heads, expression sets, phone-size check |
| 11 | `assets/frost-warden/idle_00.png` (256x228) | The hostile frost-blue Yeti guardian. | Yeti and large-ape-like creatures (a different species from friendly Brum, who is a separate character) |

## C. Bricks, machinery and props

| # | Path | What it shows | Attach for |
|---|---|---|---|
| 12 | `art/mooncoil/proof/family.png` (760x610) | A complete brick family: blue, red, green, purple, dark slate and a cache brick, each 1x1 (16x16 cells) and 2x1 (32x16) and each intact and cracked. | Brick families, damage states, cell sizes |
| 13 | `art/fantasy-machinery/proof/parts-contact.png` (1536x1790) | Contact sheet of the machinery kit: bell, ramp, lift, ratchet, plinth, hopper, lever, claws, banded wheel, raft, gate, counterweight, sluice wall, balcony, gate frame. Brass, iron, stone, banded wood. | Machinery props, "one rig, many skins" thinking |
| 14 | `art/castle/proof/window.png` (988x560) | The window kit as layers (back, front, front cracked), with the serpent between them, plus the native 60x72 unit size. | Layered props, openings, "actors pass between two layers" |
| 15 | `art/paddle_skins/proof/skins.png` (560x200) | Kit and Lumi paddle skins sliced into left, middle, right parts. | Paddles, sliced-part assets |

## D. UI, icons and effects

| # | Path | What it shows | Attach for |
|---|---|---|---|
| 16 | `art/power_icons/proof/icons.png` (750x340) | Nine power emblems: Brick Ward, Arrows, Cosmic, Ball Fan (Kit), Lullaby, Starlight Notes, Song Shield (Lumi), Ram Ball in steel and song skins. One family, one lighting, one finish. | Power icons and emblems |
| 17 | `art/power_icons/proof/menu-frost.png` (786x584) | The icons in context: the round face orb at lower left and the "Kit's Armoury" card (Lilita One text drawn by code). | Face-orb and card layout, text-free icon art |
| 18 | `art/fx_kit/proof/fx.png` (880x150) | Counter gems (empty, gold, blue, rose) and crash pieces (three stone chips, one spark) at native and tiny size. | Counters, pips, debris chips |

## E. Backgrounds

| # | Path | What it shows | Attach for |
|---|---|---|---|
| 19 | `assets/mooncoil/background.png` (941x1672, 2.3 MB) | The best production background: quiet near-black upper half, thin silver pillars at the extreme edges, dark slate floor, a few crystals only at the edges. Its exact prompt is in `art/mooncoil/BACKGROUND.md`. | Any level background |

## F. Starflight (attach these only to starfighter prompts)

| # | Path | What it shows | Attach for |
|---|---|---|---|
| 20 | `art/starflight/native-extraction-proof.png` (720x1000) | Player interceptor (points up, white and cyan), scout, heavy gunship and dreadnought boss (point down, graphite with coral and magenta emission) on the real dark nebula, with labels. | Ships, scale between ship classes |
| 21 | `art/starflight/weapons-source.png` (1536x1024) | Six weapon effects on transparency: cyan plasma, coral enemy round, violet hyper, muzzle starburst, explosion, stasis burst. | Projectiles and effects |
| 22 | `assets/starflight/background.png` (768x1536) | Scrolling starfield: calm dark centre, faint nebula only at the edges. | Space backgrounds |

## Quick picks

| If you are making... | Attach |
|---|---|
| A concept board | 1, 2 (optional), and the character or machinery images that appear on it |
| A character or animal | 5 or 6, 8 or 9 or 10 (nearest species), 7 |
| A brick set | 12, 3 |
| Machinery | 13, 1, 14 |
| A background | 19, 4 |
| Icons or UI | 16, 17, 18 |
| Effects | 18, 21 (Starflight), 3 |
| A starfighter, enemy or weapon | 20, 21, 22 |

## Image-use notes

- Large files: `assets/mooncoil/background.png` and the boards are 1.5 to 2.5 MB. If Copilot refuses an upload, downscale to 1024 px on the long side first. Do not edit the original files in the repo.
- References beat words. If a prompt and a reference disagree, tell the tool in the prompt which one wins ("match the reference's materials; use the prompt's pose").
- Never attach a rejected image (anything under `out/rejected-*` or the withdrawn cast boards in `design/phase1/02-menagerie-cast.md`). Ember, Mortar and Polaris are withdrawn and not production characters.

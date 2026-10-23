# Round 3 Art Jobs: Copilot Responses

Every response from this chat, in order. Save images to `art/round3/` using the file names given in each section.

---

## Response 1: A1, Nerra (first take)

I made A1 (Nerra) as one image with three panels stacked top to bottom: movement, face and attention, then attacks and damage. Some rows don't match the brief, and I couldn't attach your GitHub reference images. Check her design against `nerra-calm.jpg` before cutting the frames.

**Where it differs from the brief:**
- **Walk rows:** 9 frames each instead of 8. Frame 9 is probably a repeat of frame 1, so you can drop it to keep the 8-frame loop.
- **Jump row:** 5 frames instead of 4. Frames 4 and 5 are both landing poses.
- **Attacks row:** 6 frames, because the chain yank came out as two frames.
- **Size and spacing:** frames aren't all the same size. The walk rows are tightly packed, so automatic cutting may need some padding there.

The panels split at roughly y≈425 and y≈750 on the 1536×1024 image. You can crop them into `A1-nerra-1.png`, `-2.png` and `-3.png`.

**A1-nerra-list.txt**
```
IMAGE 1 – Movement (top panel)
R1 C1-C9  walk right, frames 1-9 (C9 likely duplicate of C1)
R2 C1-C9  walk left, frames 1-9 (C9 likely duplicate of C1)
R3 C1     turn right->viewer, 1
R3 C2     turn right->viewer, 2
R3 C3     facing viewer (end of turn 1 / start of turn 2)
R3 C4     turn viewer->left, 1
R3 C5     turn viewer->left, 2
R3 C6     turn viewer->left, 3
R4 C1     jump crouch
R4 C2     jump take-off
R4 C3     airborne stretched
R4 C4     landing slam, legs splayed
R4 C5     landing settle

IMAGE 2 – Face & attention (middle panel)
R1 C1  look up-left
R1 C2  look up
R1 C3  look up-right
R1 C4  look left
R1 C5  look at viewer
R1 C6  look right
R1 C7  look down-left
R1 C8  look down
R1 C9  look down-right
R2 C1  smug
R2 C2  furious (brows down, teeth, claws raised)
R2 C3  roaring
R2 C4  hurt
R2 C5  dizzy (spiral eyes)
R3 C1-C4  idle breathing loop, frames 1-4

IMAGE 3 – Attacks & damage (bottom panel)
R1 C1  crusher claw windup (left)
R1 C2  crusher claw strike
R1 C3  gate claw windup with chain (right)
R1 C4  gate claw strike
R1 C5  chain yank, start
R1 C6  chain yank, full pull
R2 C1  hit flinch
R2 C2  staggered and dazed (stars)
R2 C3  knocked over
R2 C4  defeated
```

---

## Response 2: A1, Nerra (second take)

I tried to make the next job, A2 (Frost Warden), but the image tool made **another Nerra sheet** instead. In this chat it kept going back to the A1 prompt.

The new sheet is still useful as a second take, **A1-nerra-2.png**. It's closer to your brief than the first one:
- **Walk rows:** 8 frames each, as asked (the first take had 9).
- **Turn row:** 7 frames, not 6. C4 is the front-facing middle pose.
- **Jump row:** 5 frames again. C4 is the landing slam with a dust puff, and C5 is the settle.
- **Faces and attacks:** these panels have the same layout as the pose list in Response 1, so that list works for both files.

---

## Response 3: A2, Frost Warden and A3, Korr

I got 4 of the 6 sheets. A2's Image 3 and A3's Image 3 are still missing because I hit the image limit. All four sheets came back in one picture split into quarters, with a title written at the top of each quarter. That breaks the "no text" rule, so crop the titles off.

**Cropping the picture (1536×1024):** the quarters split at about x≈768 and y≈575. Cut off the title strip at the top of each quarter, about 35px.

| Quarter | Save as |
|---|---|
| Top-left | A2-frostwarden-1.png |
| Bottom-left | A2-frostwarden-2.png |
| Top-right | A3-korr-1.png |
| Bottom-right | A3-korr-2.png |

**Where it differs from the brief:**
- **A2 Image 2:** the dash rows have 6 frames instead of 5.
- **A2 Image 2, row 3:** the wall smash shows both directions, but they don't look like true mirror images of each other.
- **A3 Image 1, row 4:** the turn is in the right order (side, three-quarter, front).
- **A3 Image 2, row 3:** the bell throw has only 2 frames before the stomp, instead of windup, throw and follow-through.

**A2-frostwarden-list.txt**
```
IMAGE 1 – Base and attacks
R1 C1-C4  idle breathing loop, frames 1-4
R2 C1     ground-pound windup (fists raised)
R2 C2     ground-pound strike
R2 C3     strike impact settle
R2 C4     recover
R3 C1     hit flinch
R3 C2     staggered and dazed
R3 C3     recover (stars)
R3 C4     defeated, slumped

IMAGE 2 – Dash attack
R1 C1     dash right: crouch, frost gathering
R1 C2-C6  dash right: charging run, frames 1-5
R2 C1     dash left: crouch
R2 C2-C6  dash left: charging run, frames 1-5
R3 C1     wall smash, facing left
R3 C2     dazed after impact, facing left
R3 C3     wall smash, facing right
R3 C4     dazed after impact, facing right

IMAGE 3 – Faces: NOT YET GENERATED
```

**A3-korr-list.txt**
```
IMAGE 1 – Movement
R1 C1-C6  walk right, frames 1-6
R2 C1-C6  walk left, frames 1-6
R3 C1-C4  running away from behind, frames 1-4
R4 C1     turn: facing right
R4 C2     turn: three-quarter
R4 C3     turn: facing viewer

IMAGE 2 – Actions
R1 C1-C4  chain haul hand over hand, frames 1-4
R2 C1-C4  winch crank, frames 1-4
R3 C1     bell throw windup
R3 C2     bell throw / follow-through
R3 C3     hoof stomp windup
R3 C4     hoof stomp impact

IMAGE 3 – Faces and damage: NOT YET GENERATED
```

---

## Response 4: B1 to B4, stage environments

All four environment jobs came back as **one combined image** of 1024×1536 pixels, stacked top to bottom. The scene-piece sheets are usable after cropping. **The backdrops are not.** Each one is only about 250×360 pixels, at a shorter, wider ratio than the 1080×2340 portrait spec.

| Band (y px) | Content | Save as |
|---|---|---|
| 0–360 | B1: 4 backdrops (split x≈245 / 510 / 775) | B1-tidewheel-1…4.png (thumbnails only) |
| 362–640 | B2: moving parts | B2-tidewheel-parts-1.png |
| 643–952 | B3: 4 backdrops (split x≈255 / 510 / 772) | B3-frost-1…4.png (thumbnails only) |
| 955–1148 | B3: moving parts | B3-frost-parts-1.png |
| 1150–1536, x 0–385 | B4: Gatehouse backdrop | B4-gatehouse-1.png (thumbnail only) |
| 1150–1536, x 388–1024 | B4: moving parts | B4-gatehouse-parts-1.png |

**Where it differs from the brief:**
- **All backdrops:** too small and the wrong shape. Some also have bright waterfalls or torches in the middle half, where the rules ask for a dark, calm area.
- **B2:** the chain is about 4 links instead of 8. The flag has 4 frames instead of 6, and the sluice pour has 5 instead of 6. The sluice grates have green at their bottom edges.
- **B3 parts:** the snow drift is one strip, not 4 frames. The crumbling-wall frames pick up some green.
- **B4 parts:** the winch has 3 frames instead of 4. The torch has 5 frames and the banner has 4, instead of 6 each.

**B2-tidewheel-parts-list.txt**
```
R1 (top)    water wheel (left, large) | torch flicker x6 + glow sprite | chain | flag waving x4
R2 (middle) water-surface ripple strip x4 (right of wheel)
R3 (bottom) sluice pour x5 | water drips + spray burst (4-5 stages, right)
```

**B3-frost-parts-list.txt**
```
R1  torch x6 | snow particles | snow drift strip (1, not 4) | frozen banner x4
R2  ice crack spreading x4 | wall crumbling x4
```

**B4-gatehouse-parts-list.txt**
```
R1  winch drum x3 | hanging cage swinging x4
R2  torch x5 | banner waving x4
R3  moat ripple x4
```

To get full-size backdrops, ask for one stage per message, for example "B1 Stage 1 only, full portrait 1080×2340, one image."

---

## Response 5: C1, special bricks and D1, effects

C1 and D1 came back as **one 1536×1024 image**. The bricks are on green in the top part and the effects are on black below. Crop at y≈445:

| Band (y px) | Save as |
|---|---|
| 0–445 | C1-bricks-1.png |
| 448–1024 | D1-effects-1.png |

**Where it differs from the brief:**
- **C1 shape:** the bricks are closer to 1.6:1 than 2:1, so stretch or re-run them if the ratio has to be exact.
- **C1 style:** they look more like painted metal and stone than glossy glazed ceramic, and they're missing the star glint at the top-left. Check them against `bricks-glaze-sheet.jpg`.
- **C1 green spill:** a few brick edges sit close to the green, so check the keying around the frost row.
- **D1:** all 5 rows have the frame counts asked for (8, 6, 6, 6, 6). The black background is clean.

**C1-bricks-list.txt**
```
R1 sea:    C1 chest | C2 chest cracked | C3 pearl coin | C4 sea mine (red core) | C5 key | C6 barnacle armour | C7 barnacle armour cracked | C8 brass-banded steel bar
R2 frost:  C1 chest | C2 chest cracked | C3 coin | C4 frost mine (blue core) | C5 key | C6 armoured | C7 armoured cracked | C8 frost-iron steel bar
R3 castle: C1 chest | C2 chest cracked | C3 gold coin | C4 powder-keg bomb | C5 key | C6 gilt armour plate | C7 gilt armour plate cracked | C8 riveted portcullis-iron bar
```

**D1-effects-list.txt**
```
R1  water splash, 8 frames
R2  ice shatter, 6 frames
R3  stone/mortar debris burst, 6 frames
R4  gold coin burst with sparkles, 6 frames
R5  dust cloud puff, 6 frames
```

---

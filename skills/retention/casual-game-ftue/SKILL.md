---
name: casual-game-ftue
description: >-
  Use when designing the first-time user experience / tutorial / onboarding for a
  casual or logic puzzle game, or deciding how a game teaches its rules over the
  first several levels. Trigger it when the user says "build the tutorial", "how
  should players learn this", "onboard a complex mechanic", "the rules are
  confusing", "teach the game without walls of text", or is designing the FTUE for
  a puzzle with more than one rule (e.g. a two-symbol grid with adjacency +
  balance + relation constraints). This skill gets the player to a guaranteed
  first win by playing (not reading), then teaches remaining rules contextually
  as they come up. Includes a battle-tested 8-step structure and exact timings.
  Pairs with logic-puzzle-level-design.
---

# First-Time User Experience for a Puzzle Game

The FTUE decides whether a new player ever becomes a player. For a logic puzzle
with more than one rule, the instinct to *explain the rules first* is exactly
wrong — nobody reads a rulebook on a phone. This skill teaches by *doing*, lands
a guaranteed first win, and then teaches the remaining rules *in context* as the
player meets them. The numbers and structure below are from a shipped, tuned
puzzle game; use them as proven defaults.

## The goal, stated precisely
By the end of the FTUE the player has, **through their own taps**, made the core
interaction happen and won a puzzle — and understands *one* rule. Not all the
rules. One. Everything else is taught later, in-context. Two things earn the
second session: **understanding the core loop**, and **feeling capable** (a real
win they caused). Optimize for both.

## Build it as a pure, view-agnostic state machine
Model the tutorial as a data-driven state machine in the logic core (see
`puzzle-game-architecture`), driven by an injected clock/scheduler and an
`onEvent` callback — **not** as hardcoded UI. Why this pays off:
- **Copy is decoupled from mechanics.** Each step carries only geometry and
  behavior (which cells are targets, what action, which flags); the caption text
  lives in a separate localized table and is merged in at read time. Switching
  language re-localizes a *running* tutorial.
- **It's testable headlessly.** Every step's advance condition and every "wrong
  cell does nothing" guarantee can be unit-tested with a fake clock — no browser.

## The board: guarantee the first win by construction
- Use a **single small fixed demo board (e.g. 4×4), never randomized.** Small and
  fixed means it always reads clearly and you can script exact targets.
- **Each step ships its own preset board that is rebuilt from scratch when the
  step begins.** The player never has to reconstruct prior state, and a fumble on
  step 3 can't corrupt step 4. Every step starts from a known-good position.
- On guided steps, **only the designated target cells respond at all** — every
  other cell is inert. The tutorial therefore *cannot be failed*.

## The proven 8-step sequence
This exact shape has shipped and tunes well. It teaches: place → the core "one
per group" rule → rule-out reasoning → deduce → a second rule → deduce again →
solo practice → celebrate. Adapt the specific rules to your puzzle; keep the
arc.

| # | Action | Backdrop | Teaches / does | Advances when |
|---|--------|----------|----------------|---------------|
| 0 | place (double-tap the one lit cell) | dim | how to place a token | target placed |
| 1 | button ("Got it") | light | states the rule just demonstrated; passive | button press |
| 2 | mark (tap each of several lit cells) | dim | rule-out / elimination reasoning | **all** targets marked |
| 3 | place | dim | deduce: only one option left → place | target placed |
| 4 | swipe (drag across a run of cells) | dim | a second rule, via a gesture | **all** targets marked |
| 5 | place | dim | deduce again | target placed |
| 6 | solo: real input, no highlight, hint available | light | player reasons unaided; introduces the hint UI | correct cell placed |
| 7 | button ("Start game") + finale | light | confetti + congratulations | button press |

Keep it to ~5–8 gated beats. Long tutorials leak players.

### Step-flag vocabulary (reusable design primitives)
- **dim backdrop** — darken every non-target cell behind a coaching scrim so the
  target is unmistakable.
- **all-targets gate** — a multi-cell step advances only after *every* target is
  actioned (not the first), so the whole lesson happens.
- **no-highlight** — suppress the coaching hand/ring so the player reasons on
  their own (use it on the solo step).
- **allow-wrong** — on the solo step only, let wrong actions produce visible
  error feedback instead of being silently inert (safe practice for real play).
- **hint** — expose the opt-in hint affordance; if the player uses it, bring the
  coaching hand *back*.
- **finale** — confetti + a terminal CTA button.

## Principles behind the structure

**1. Learn by doing, never by reading.** No opening rules modal. Put the finger
on the board immediately. Text, when it appears, is a single short line — a
caption, not a lecture. Author copy as an **array of short lines** with manual
breaks, shown in **speech bubbles** positioned around the board
(portrait: stacked above/below; landscape: left/right columns). Only the passive
"got it" and the finale use a CTA button; every other step advances by *doing the
gesture*.

**2. Gate every step.** The tutorial advances only when the player performs the
intended action, so the lesson actually happened and later steps can rely on it.

**3. Point at the exact target.** Show a bobbing coaching hand + a pulsing ring
on the *first remaining* target, and dim the rest. For a gesture step (swipe/drag),
use a **sweeping animated hand that traces the run**, so the motion itself is
demonstrated, not just the endpoints.

**4. Immediate, positive feedback.** The instant the player does the right thing,
pop the piece, sparkle, let the mascot react (see `character-emotes-in-game`),
then wait a short beat (~420ms) *before advancing* so the juice is seen.

**5. Soft, inert mistakes.** During guided steps, a wrong tap does **nothing** —
no penalty, no state change, no scolding. On the solo step, a wrong move flashes
the cell red and shakes the grid briefly (~420ms) with a soft error sound, but
**costs no lives and needs no undo** — because the board state was never mutated,
the player just tries again.

**6. Guarantee the first win.** The FTUE puzzle is tiny and scripted to a win.
A first-session loss, before any investment, is the deadliest churn there is.

**7. Right verb for the device.** Detect pointer type once at boot
(`matchMedia('(pointer: fine)')` → mouse, else touch) and overlay a small set of
verb overrides onto the copy table: "Double-tap"→"Double-click",
"Swipe across"→"Drag across", etc. Only the differing strings are overridden;
everything else stays. A mismatched verb on the very first instruction makes the
game feel foreign.

### Concrete tutorial timings (proven defaults)
- Double-tap detection window: **~420ms** in the tutorial (more forgiving than the
  ~260ms used in real play — new players are slower).
- Advance "juice" delay after a correct action: **~420ms** (so the pop is seen).
- Single-vs-double disambiguation flush: **~240–260ms**.
- Splash/loading → first screen: a short (~350ms) settle, then branch on the
  saved "tutorial done" flag: done → home, else → tutorial.
- Finale confetti: ~70 pieces (a notch below the ~80 used for real level wins, so
  the real win still feels bigger — see `game-juice`).

## First run vs. replay
Persist a boolean "tutorial done" flag. Gate the first-run branch on it. On the
**first-ever** completion, grant a one-time reward and drop the player *straight
into level 1* (momentum). A tutorial **replay** (launched from settings) grants
nothing, hides the reward line, and returns to the menu.

## Teaching the rest: contextual, not front-loaded
This is the crux for puzzles with several rules. Cramming every rule into the
FTUE guarantees confusion. Two complementary techniques — a shipped game uses
*both* rather than per-level tooltips:

**A. Persistent rule chips + reactive rule-flash (recommended).** Keep a compact
always-visible row of rule chips on the play screen (one short phrase per rule).
When the player *breaks* a rule, flash exactly the chip(s) for the rule they
broke (~850ms), flash the offending cell red, and shake the grid. The player
learns each rule at the precise moment it bites — *contextual teaching that needs
no tutorial text.* This scales to any number of rules without ever front-loading
them.

**B. A soft-scaffolding ramp in early levels (concept isolation's cousin).** For
roughly the **first ~20 levels**, pre-reveal one locked "given" token, placed on
the **most-constrained (smallest) group** so the player always has a strong
anchor to reason outward from. From ~level 21 the scaffold is removed and every
level is solvable by pure deduction from empty. (The `logic-puzzle-level-design`
skill owns how the given is chosen and verified.) Optionally also ramp board
*size* upward so complexity grows gently.

If your mechanic is unusually layered, you can *additionally* isolate one new
technique per early level (concept isolation) — see the shared
progressive-disclosure schedule in `logic-puzzle-level-design`. But note the
shipped default leans on contextual rule-flash + the given-scaffold rather than a
prompt on every level, because persistent chips teach continuously and never
nag.

## A hint system extends onboarding forever
Onboarding shouldn't end at level 5. Drive hints from the puzzle's *deduction
engine* (see `logic-puzzle-level-design`, solver B), so a hint points at a **real
next forced move and explains the reasoning in plain language — never jargon**
("only one spot left in this group", not "naked single"). Make it a **preview +
Apply/Cancel** interaction: show what the hint would do behind a dimming scrim,
and only spend the hint charge on *Apply* (cancel is free). Introduce this exact
hint UI during the FTUE's solo step so it's familiar later. Every future stuck
moment becomes a micro-lesson, which is one of the strongest churn reducers you
have.

## One-time contextual spotlights
Beyond the tutorial, teach rare mechanics the first time they occur, once. E.g.
the first time the player drops to their **last life**, spotlight the life
indicator (after a ~650ms beat) and persist a "seen" flag so it never repeats.
Afterward the resource drains silently. One-time, in-context, never nagging.

## Layout & moment
- **Portrait-first** for mobile; the coaching hand, caption bubble, and target
  must all read on a phone in one glance. Make bubble placement orientation-aware.
- A short brand/splash moment sets tone, but don't let it delay the first tap —
  get finger-on-board fast.

## Anti-patterns
- A wall-of-text rules modal before play. Players skip it; you taught nothing.
- Teaching every rule inside the tutorial. Spread it out; teach contextually.
- Ungated tutorials the player can tap through without doing the action.
- A tutorial the player can *lose*. First win must be guaranteed.
- Punishing mistakes during the tutorial. Guided wrong taps should be inert.
- Highlighting nothing / everything — the target must be unmistakable.
- A rule prompt that repeats on every appearance — teach it once (or let the
  persistent chip + rule-flash carry it), then trust the player.

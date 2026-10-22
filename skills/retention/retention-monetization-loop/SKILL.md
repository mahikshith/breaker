---
name: retention-monetization-loop
description: >-
  Use when designing the parts of a casual game that keep players coming back and
  make money without wrecking the experience — the lose→second-chance→revive
  loop, lives/hearts/currency economy, rewarded vs interstitial ad placement and
  throttling, celebration/"happy moment" signals, and streak/daily-return hooks.
  Trigger it when the user says "add a revive / continue", "when should I show
  ads", "lives system", "hearts/currency", "the lose screen", "rewarded ad for a
  hint/refill", "retention", or "streaks". This skill places monetization at the
  natural seams of the game loop, always protecting the active puzzle, with proven
  economy numbers. Pairs with puzzle-game-architecture (ads/storage via ports).
---

# Retention & Monetization Loop

Money in a casual game comes from *protecting* the core loop and monetizing its
*seams* — the moments between puzzles and the moments a player is emotionally
motivated to keep going. Done well, monetization feels like a favor (a second
chance, a helpful assist); done badly, a toll booth. The mechanics and numbers
below are from a shipped web puzzle game.

Everything here runs through the **Ads** and **Storage** ports from
`puzzle-game-architecture`, so it degrades cleanly when no platform SDK is present
and never hard-depends on an ad network.

## The prime directive: never interrupt an active puzzle
No ad, no popup, no interruption while the player is solving. All monetization
happens at **seams**: after a win, after a loss, at level transitions, on the
results screen — never mid-solve. Break this and you break trust and flow at once.

## The second-chance (revive) loop — your best moment
When a player loses, don't cut straight to a fail screen.

- **The mechanic that shipped:** each level gives a small fixed number of lives
  (**3**), drained by *mistakes only* (assists and marks are free). Emit
  `outOfLives` only on the *transition* to zero, never on repeats. Present the
  loss as an **in-place overlay** (not a new screen) after a short ~900ms beat
  where the board reacts sadly; **lock the board** while lives are 0 so a fast
  correct tap can't sneak a win onto the lose screen.
- **The offer:** "Keep going?" with a clear value exchange — *watch a rewarded ad*
  or *spend currency* — to **revive with lives restored to full on the SAME board,
  progress preserved** (a restart, by contrast, resets the board). This is the
  single highest-value ad moment in the game: the player is maximally motivated
  right when they're about to lose progress they care about, so a rewarded ad here
  is a trade they *want*, not an interruption.
- **First-loss teach:** the first time the player ever drops to their **last
  life**, spotlight the life indicator once (after ~650ms), then persist a "seen"
  flag so it never repeats.
- **Keep it non-punishing.** The mascot sympathizes (see
  `character-emotes-in-game`), framing is "let's keep going," declining is
  frictionless, and the tokens **pop back staggered** on revive so it feels
  generous. Cap free-with-ads revives so a run can't be revived infinitely.
- **Handle empty fill gracefully.** If a rewarded ad has no fill, keep the button
  visible and float a quiet "No ads to show" — never a dead end; restart is always
  offered.

## Ad types: match the ad to the moment

**Rewarded (player-initiated, value exchange)** — your primary, player-friendly
revenue. The player *chooses* to watch for something they want:
- revive / continue after a loss (the big one),
- refill an assist charge when it hits 0,
- (optionally) top up currency.
Always deliver the reward reliably through the core economy, and **mute + pause
the game while the ad plays** (the Ads port exposes the hook).

**Interstitial (passive, full-screen)** — no direct reward, so place and throttle
it carefully:
- **Only at natural breaks** — level transitions and results screens, never
  mid-puzzle. A proven placement: award the interstitial as part of "continue from
  results," awaited *before* advancing to the next level.
- **Self-throttle.** Track the timestamp of the last interstitial and **skip the
  request entirely if less than ~3 minutes have passed** (many portals also reject
  midgame ads inside a ~3-minute window — mirror it client-side rather than
  collecting cooldown errors).
- **Never before the player's first win**, and never stacked back-to-back with
  another ad. Early or dense interstitials are a top churn driver.

**Ad lifecycle contract (both types):** on ad-start → pause (`gameplayStop`) and
mute; on ad-finish/error → unmute and resume/resolve. The game must stay fully
playable on **every** failure (unfilled, adblocked, disabled, cooldown): rewarded
resolves `false` (no reward, restart still offered); interstitial resolves and
play continues. If a platform disables ads during a limited launch, latch a
runtime "rewarded disabled" flag that hides all rewarded UI for the session and
leaves currency as the only refill path.

## The resource economy (proven numbers)
Model the whole economy in the pure core (not the UI) so it's tested and saves
correctly. A shipped, balanced starting point:

| Parameter | Value | Meaning |
|-----------|-------|---------|
| Lives per level | **3** | drained by mistakes only, reset each level |
| Starting soft currency | **50** | "one assist in the pocket" for new players |
| Currency per level complete | **10** | granted **once per level/day**, not per replay |
| Assist (hint/reveal) price | **50** | ≈ one assist per five completed levels |
| Assist starting charges | **5** each | persisted |
| Assist refill amount | **+1** | per refill (currency or rewarded ad) |

- **Earn once per unique completion.** Pay the +10 only the first time a given
  level/day is cleared — persist a set of already-rewarded run IDs (`level:<n>`,
  `day:<d>`) so re-opening the results screen never double-pays.
- **Refill priority when an assist hits 0:** (1) **currency first** — if the
  player can afford it, debit synchronously (check-then-debit so a double-tap
  can't overdraw) and grant +1; (2) else a rewarded ad → +1 on grant; (3) else
  shake + "Not enough" and charge nothing. Give assists a way back from empty so a
  stuck player always has an out that isn't "quit."
- **Assists never punish.** Using a hint/reveal scores base points only and
  **does not reset the combo or count as a mistake** — it's a comfort/monetization
  feature, never a penalty. Clamp balances ≥ 0; no upper cap needed.

## Celebration / "happy moment" signals
Fire the platform's celebration/"happytime" signal at genuine high points — a
level solved is the canonical one; streak records/milestones are candidates.
Route it through the lifecycle port (no-op off-platform). Also fire
`gameplayStart` when a puzzle begins (level start, restart, next, revive-resume,
returning to the tab, tutorial) and `gameplayStop` on every break (menu, settings,
results/streak screens, lose overlay, tab hidden). Only fire "happy" on real highs
— spamming it is noise and hurts featuring.

## Retention hooks
- **Streaks (daily).** Track `{ current, best, lastDay, weekProgress }` keyed on a
  whole-day number in local time. Same day again → no change; consecutive day →
  `current + 1` (cap week progress at 7); any gap → reset to 1. Show a flame
  celebration screen **only on the first completion of a day** (so it actually
  advances the streak), never after every level. **A lapsed streak reads 0 to the
  player** even though you keep the history. Recognize streaks; **never punish
  breaking one** — a lost streak is a quiet reset, not a guilt trip. Punitive
  streak mechanics drive the churn they're meant to prevent.
- **Come-back-to-progress.** Because progress is saved (Storage port), a returning
  player resumes exactly where they left off — one of the strongest, cheapest
  retention wins.
- **Social-proof copy is static, not a live stat.** A line like "most players
  revive here" can be tuned copy; don't wire third-party analytics a portal may
  forbid just to make it real.

## Wiring it all through ports (so it degrades)
- `Ads.showRewarded()` → resolves "granted" instantly off-platform, so the
  revive/refill flow is fully testable with no SDK.
- `Ads.showInterstitial()` → no-op off-platform; throttle state still tracked.
- Pause + mute on ad start/stop via the Ads/audio hook.
- **Mute = several independent OR-ed sources** (platform toggle, ad-playing,
  tab-hidden); any one silences audio.
- `Storage` → cloud/progress adapter on-platform, local fallback off it.
This keeps the game playable and testable everywhere; swapping ad networks or
platforms touches one adapter, not the loop.

## Anti-patterns
- An interstitial mid-puzzle or before the first win — trust and flow, gone.
- A hard fail screen with no second chance — you skipped your best ad moment *and*
  your best retention moment at once.
- Unthrottled interstitials stacked at every transition — fast churn.
- A rewarded ad that doesn't reliably deliver its reward — breaks the value
  exchange; players stop opting in.
- Assists that penalize score/combo, or count as mistakes — kills the incentive to
  buy them.
- Punitive streaks / "you lost your streak!" guilt — drives the churn it's meant
  to prevent.
- Resource economy in the view layer — desyncs, can't be tested, can't be trusted.

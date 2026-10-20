# Head-first serpent retreat — 2026-10-20

Final tested HTML: `CDFF74B582002029D5E4B2BF3B98099B69F3583AC6BA39EFEB994774436A85F7`.
Vault source: `3101F125EDDC26F009D9F7163880AFFC0554EE62D0423FFAE498EC6445609EE2`.
Retreat helper: `D013E2ED6EBE681A46CA9B31CF66A8E67E43DDBA4A3584C9FE102590D3338594`.

`report.json` records six passing browser fixtures: 393×852 and 412×915, each with an early rescue, a naturally advanced halfway approach, and a late saved-head rescue. All use the actual `checkBreach`, simulation and Main drawing. Sources/build stayed frozen and there were no page errors.

These are staged presentation tests, not earned wins. The runner clears a breadth-first rescue corridor through ordinary bricks while excluding granite and the actual snake body. The late natural approach blocks Lumi's exit with its body; that fixture first calls the real pre-second-strike `cancelAttack`, `knockBack(3)`, then three additional one-cell recoils before a legal corridor becomes available. That sequence is recorded explicitly in `fixture.savedHead`. It does not claim that one earned hit opens that route.

All six runs preserve 45 granite cells. The head does not jump at handover; maximum head/tail step is 0.593 units per actual 120 Hz update, and whole-ribbon length error is below 3.5×10⁻¹³ units. Both the weighted two-row render and dominant-row heading stay within 0.018 radians of actual travel. Exposed segments remain at full opacity. The final tail is wholly inside the tunnel before disappearance or victory; maximum final centreline Y is 40, above its mouth at Y=88.

Selected PNGs were viewed at both phone sizes. The single head faces into the tunnel, the body remains connected along its original route, and the belly does not flip when the head changes facing. All remaining native frames are in `out/snake-retreat-final-r4/`. Earlier candidate/failing fixture receipts remain in their separate `out/snake-retreat-*` folders; they are not final visual admission.

`snake-head-first-retreat-ios.webm` is actual Main animation at wall time after the staged halfway rescue. This fixture holds its initial ball, retaining the existing rescue slow motion, so its recorded retreat takes 11.853 seconds. It is not a physical-device performance recording or an earned route.

Reproduce from the repository root after packing/building the current atlas. Set `PW_MODULE` to the installed Playwright import URL; optionally set `BROWSER_EXECUTABLE` or `PW_CHROMIUM` to an existing browser:

```powershell
node tools/playtest/snake-retreat.mjs out/snake-retreat dist/breach.html --video
```

The helper writes only its output folder. No production source, saved score, paid resource, game balance or Android artifact is changed by the review.

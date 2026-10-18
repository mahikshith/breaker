# Paddle-targeting cannon study

Unapproved replacement for the rejected brick-destruction studies. See [combat scope and source audit](../weapon-vfx-v3-review.md).

- `plasma-shot-source.png`: preserved original compact downward cannon blast; the original Carrier board is its material/colour reference.
- `plasma-shot.png`: lossless metadata-free working copy,1254×1254RGBA.
- `plasma-shot-runtime.png`:256×256RGBA downsample of the complete original canvas,38,329bytes encoded /262,144bytes decoded. Transparent padding and the original pivot mapping remain intact. The bright body is substantially narrower than the canvas; display by visible body size, not canvas width.
- `asset-report.json`: dimensions, alpha ranges, byte counts and hashes. The original's maximum alpha is254, which is valid translucent VFX, not a failed opaque surface.
- `plasma-shot-prompt.json`: exact art constraints and original reference path.
- `plasma-impact-source.png` and `plasma-impact-runtime.png`: a separate connected plasma splash for real paddle contact, replacing the rejected uniform spokes and cut texture strips. The runtime copy is384×174RGBA; `impact-report.json` and `plasma-impact-prompt.json` record its size, alpha, hash and constraints.
- `cast-roles.png`: unchanged character crops from the original A/B/C boards with selected/proposed status and distinct signature-role suggestions. These are references, not finished new companion atlases.

The shot and impact are actual single raster sprites animated by the preview, not multi-frame rendered animation atlases. Their rendered sizes do not establish gameplay hitboxes. Hostile fire must cross the intact brick field without touching brick HP, rewards or companion charge. Native phone-scale motion and player impact are the review targets. Working review images are in `review/`; the earlier smaller friendly-shot study is preserved in `review/history/`.

Permanent copies are catalogued in [the artwork library](../../../artwork-library/README.md). Preserve rejected versions. Approval of a visual study is separate from actual gameplay balance, collision and handset performance checks.

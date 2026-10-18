# Jade Vault serpent

Derived from the existing project serpent mesh, expression rig and shared Blender lighting. No new third-party input is used. Rendered on 2026-10-18 with `art/snake.py --palette jade --dirs r,l --samples 64 --px 4 --threads 2`.

The family contains 26 transparent RGBA images: 13 expressions × two facings, 176 × 176 pixels, 44 world-unit cells. `meta.json` preserves the existing expression/facing sheet contract and records the material palette. The default `original` palette and `assets/snake/` remain available.

- Body: `#168f83`; crown: `#0b5d59`; lids: `#11726c`.
- Belly: `#c9e8d2`; outline: `#052d31`; diamond marks: `#83e4c2`.
- Brows: `#ff8a9b`; brow emission: `#e95f86`.

PNG text metadata is stripped. Frame size, alpha range, metadata, full family coverage and native gameplay appearance were checked. Runtime uses the separately packed `ART.snakeJade` sheet and a matching continuous Canvas ribbon; no image colour filter is applied.

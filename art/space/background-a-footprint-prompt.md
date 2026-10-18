# Carrier A background planet footprint correction

Use case: precise-object-edit.
Input1 is the current production far background,1024×1536. Preserve the full-bleed dark starfield and existing distant edge asteroids. Change only the violet planet and its immediate background where its old footprint is removed.

The planet currently occupies too much phone play space after a right-anchored uniform portrait crop. Shrink it and move it farther to the right and slightly lower, with MOST of the sphere outside the right boundary. Its only visible round curved slice in the1024×1536 output should lie roughly inside x938..1024 and y922..1183. That corresponds to a narrow about48CSS-pixel edge planet in a393×852phone, around x88..100percent and y60..77percent. Do not draw a rectangular crop boundary; retain a natural sphere silhouette. A useful geometric target is a sphere centered just outside the right edge around(1070,1052), radius132pixels. Reconstruct matching natural starfield wherever the former larger planet is removed. Do not leave a dark patch, ghost arc or second planet.

Dim the violet planet's rim/surface by about35percent, keeping it a distant low-contrast atmospheric object. Preserve its violet identity and spherical curve; no rings and no egg stretch. Keep the center and lower paddle lane dark, clear and continuous with stars. No other design changes, no new rocks in the center, no ships, hulls, cannons, portal, bricks, ball, paddle, workers, characters, companions, UI, labels, panels, rails, deck or text. Return the same1024×1536opaque full-bleed portrait plate.

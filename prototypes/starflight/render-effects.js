const clamp = value => Math.max(0, Math.min(1, value));
const ready = image => image && image.complete !== false && (image.naturalWidth || image.width) > 0;

function stamp(ctx, image, x, y, w, h = w, angle = 0, alpha = 1, pivot = [.5, .5]) {
  if (!ready(image) || alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha *= alpha;
  ctx.drawImage(image, -w * pivot[0], -h * pivot[1], w, h); ctx.restore();
}

function bloom(ctx, x, y, radius, colour, alpha = 1) {
  if (radius <= 0 || alpha <= 0) return;
  const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, colour); light.addColorStop(.28, colour); light.addColorStop(1, 'transparent');
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = light;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2); ctx.restore();
}

// Charge stays on the real bore; it never paints an aimed path across the field.
export function drawWarning(ctx, warning, time = 0) {
  const progress = clamp(warning.age / Math.max(.01, warning.life));
  const hot = warning.kind === 'missile' ? '#ffbe85' : '#ff8eaa';
  for (const source of warning.sources || [warning]) {
    const from = source.from || warning.from || warning;
    if (!Number.isFinite(from.x) || !Number.isFinite(from.y)) continue;
    const angle = source.angle ?? source.angles?.[0] ?? Math.PI / 2;
    const pulse = .9 + .1 * Math.sin(time * 11 + (source.port || 0) * 2);
    const radius = (3 + progress * 9) * pulse;
    ctx.save(); ctx.translate(from.x, from.y); ctx.rotate(angle - Math.PI / 2);
    ctx.globalCompositeOperation = 'screen';
    bloom(ctx, 0, 0, radius * 1.45, hot, .12 + progress * .38);
    ctx.save(); ctx.scale(1, .48);
    bloom(ctx, 0, 0, radius * .9, '#ffe4d7', .15 + progress * .6); ctx.restore();
    // Two rim glints leave the aperture dark enough to retain its metal depth.
    ctx.strokeStyle = hot; ctx.lineWidth = .7 + progress;
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(side * radius * .48, -.9, radius * .17, radius * .38,
        side * .38, -.9, 1.45); ctx.stroke();
    }
    if (progress > .75) bloom(ctx, 0, 1, 2.5 + progress, '#fff8ec', (progress - .75) * 2);
    ctx.restore();
  }
}

function clipLaunch(ctx, shot) {
  if (!shot.from || shot.age >= .18) return;
  const angle = shot.baseHeading ?? Math.atan2(shot.vy, shot.vx), f = [Math.cos(angle), Math.sin(angle)];
  const n = [-f[1], f[0]], { x, y } = shot.from, length = 3000;
  ctx.beginPath(); ctx.moveTo(x + n[0] * length, y + n[1] * length);
  ctx.lineTo(x - n[0] * length, y - n[1] * length);
  ctx.lineTo(x + (f[0] - n[0]) * length, y + (f[1] - n[1]) * length);
  ctx.lineTo(x + (f[0] + n[0]) * length, y + (f[1] + n[1]) * length);
  ctx.closePath(); ctx.clip();
}

export function drawShot(ctx, images, shot, time = 0) {
  if (!Number.isFinite(shot.x) || !Number.isFinite(shot.y)) return;
  const enemy = shot.side === 'enemy', angle = Math.atan2(shot.vy, shot.vx);
  const radius = shot.r || 4, kind = shot.kind, age = shot.age || 0;
  ctx.save(); clipLaunch(ctx, shot);
  if (kind === 'missile' || kind === 'seeker') {
    const size = enemy ? 38 : 34;
    if (!enemy) ctx.filter = 'hue-rotate(155deg)';
    stamp(ctx, images.missile, shot.x, shot.y, size, size, angle + .9);
  } else if (kind === 'spiral') {
    stamp(ctx, images.spiral, shot.x, shot.y, 36, 36, angle - 2.4);
    bloom(ctx, shot.x, shot.y, radius * 2.1, '#68ffcb', .16);
  } else {
    const hyper = kind === 'hyper', nova = kind === 'nova', laser = kind === 'laser';
    const image = enemy ? images.enemyRound : hyper || nova ? images.hyperRound : images.playerRound;
    const w = enemy ? radius * 6 : laser ? 33 : hyper || nova ? 29 : kind === 'drone' ? 21 : 26;
    const h = enemy ? radius * 9 : laser ? 64 : hyper || nova ? 49 : kind === 'drone' ? 34 : 43;
    const pivot = enemy ? [.502, .672] : hyper || nova ? [.456, .599] : [.568, .36];
    stamp(ctx, image, shot.x, shot.y, w, h, angle + (enemy ? -Math.PI / 2 : Math.PI / 2), 1, pivot);
    if (enemy || hyper || laser) {
      const colour = enemy ? '#ff7968' : hyper || nova ? '#c78aff' : '#96f9ff';
      bloom(ctx, shot.x, shot.y, radius * 2.5, colour, .13 + .025 * Math.sin(time * 17 + age * 7));
    }
  }
  ctx.restore();
}

export function drawHazards(ctx, images, game) {
  for (const field of game.fields || []) {
    const age = field.age, remaining = field.life - age;
    if (age < 0 || remaining <= 0) continue;
    const warming = age < field.warning, readyAt = clamp((age - field.warning) / .4);
    const fade = Math.min(clamp(age / .5), clamp(remaining / .5));
    const opacity = (warming ? .18 + .25 * clamp(age / field.warning) : .65 + .2 * readyAt) * fade;
    const image = field.visual === 'wormhole' ? images.wormhole : images.gravityField;
    const angle = (warming ? .05 : .13) * age;
    ctx.save();
    bloom(ctx, field.x, field.y, field.r, warming ? '#b29ce8' : '#db6da7', opacity * .14);
    stamp(ctx, image, field.x, field.y, field.r * 2.12, field.r * 1.855, angle, opacity);
    // A soft circular edge marks the actual force reach beyond the perspective texture.
    const edge = ctx.createRadialGradient(field.x, field.y, field.r * .88, field.x, field.y, field.r);
    edge.addColorStop(0, 'transparent'); edge.addColorStop(.75, warming ? '#b894d71b' : '#d684c42b'); edge.addColorStop(1, 'transparent');
    ctx.globalAlpha *= fade; ctx.fillStyle = edge;
    ctx.fillRect(field.x - field.r, field.y - field.r, field.r * 2, field.r * 2);
    ctx.restore();
  }
  for (const rock of game.hazards || []) {
    if (rock.kind !== 'asteroid' || rock.hp <= 0) continue;
    // The opaque source bounds span .90 of the cell, matching the model diameter.
    const size = rock.r * 2 / .9;
    stamp(ctx, images.asteroid, rock.x, rock.y, size, size, rock.angle || 0);
    if (rock.hurt > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      stamp(ctx, images.asteroid, rock.x, rock.y, size, size, rock.angle || 0, Math.min(.62, rock.hurt * 5));
      ctx.restore();
    }
  }
}

export function drawDrones(ctx, images, game) {
  for (const drone of game.drones || []) {
    if (drone.hp <= 0) continue;
    const bank = Math.sin(drone.angle) * .12, size = 24;
    const remaining = game.timers?.drones ?? 1, alpha = Math.min(1, remaining / .3);
    stamp(ctx, images.drone, drone.x, drone.y, size, size, -Math.PI / 2 + bank, alpha);
    const fired = .6 - (drone.fireAt - game.time);
    if (fired >= 0 && fired < .11) {
      const muzzle=drone.muzzle||{x:drone.x,y:drone.y-7},a=(1-fired/.11)*alpha;
      stamp(ctx, images.muzzle, muzzle.x, muzzle.y, 16, 16, 0, a * .65);
      bloom(ctx, muzzle.x, muzzle.y, 6, '#a5f8ff', a * .6);
    }
    if (drone.hp < drone.maxHP) bloom(ctx, drone.x, drone.y + 3, 4, '#ffb994', alpha * .35);
  }
}

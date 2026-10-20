// Keep the same world-space reaction lane even in a short desktop preview.
export function playfield(width, height) {
  const ratio = width / 360;
  const worldHeight = Math.max(700, Math.ceil(height / ratio));
  return { width: 360, height: worldHeight, paddleY: worldHeight - Math.min(120, Math.max(90, 126 / ratio)) };
}

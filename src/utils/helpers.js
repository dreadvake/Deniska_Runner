// src/utils/helpers.js

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
export function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Axis-aligned bounding box collision detection.
 * Returns true if rect A and rect B overlap.
 * Each rect should have properties: x, y, width, height.
 */
export function rectsCollide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

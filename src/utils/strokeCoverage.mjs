/** Cover a continuous brush stroke, never the gap between separate gestures. */
export function coverStroke(samples, start, end, radius, covered) {
  const vx = end.x - start.x, vy = end.y - start.y;
  const lengthSquared = vx * vx + vy * vy;
  samples.forEach((p, i) => {
    const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
      ((p.x - start.x) * vx + (p.y - start.y) * vy) / lengthSquared));
    if (Math.hypot(p.x - start.x - t * vx, p.y - start.y - t * vy) <= radius) covered.add(i);
  });
  return covered.size / samples.length;
}

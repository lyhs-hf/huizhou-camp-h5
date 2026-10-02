// rAF timestamps describe the frame start, which may precede a later effect.
export function frameProgress(now, start, duration) {
  return Math.max(0, Math.min(1, (now - start) / duration));
}

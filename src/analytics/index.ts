export type AnalyticsAdapter = (
  event: string,
  payload?: Record<string, unknown>,
) => void;
// Adapter must never receive lead contact fields.
let adapter: AnalyticsAdapter = (event, payload) =>
  console.debug("[journey]", event, payload ?? {});
export const setAnalyticsAdapter = (next: AnalyticsAdapter) => {
  adapter = next;
};
export function track(event: string, payload?: Record<string, unknown>) {
  adapter(event, payload);
}

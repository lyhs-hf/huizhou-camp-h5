import type { LeadPayload } from "../content/types";
export type LeadAdapter = (
  payload: LeadPayload,
  signal?: AbortSignal,
) => Promise<{ success: boolean }>;
export const demoAdapter: LeadAdapter = async (_payload, signal) =>
  new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve({ success: true });
    }, 750);
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
  });
let adapter: LeadAdapter = demoAdapter;
/** Replace with a reviewed HTTPS adapter for launch. Contacts stay in transient form memory. */
export const setLeadAdapter = (next: LeadAdapter) => {
  adapter = next;
};
export const submitLead: LeadAdapter = (payload, signal) =>
  adapter(payload, signal);

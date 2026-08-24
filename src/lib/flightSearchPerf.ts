/**
 * Lightweight instrumentation for the flight-search pipeline.
 * Zero cost in production builds beyond a few Date.now() calls.
 */

export type FlightSearchPhase =
  | "search_clicked"
  | "request_started"
  | "response_received"
  | "results_processed"
  | "first_results_rendered"
  | "all_results_rendered";

type Timeline = Partial<Record<FlightSearchPhase, number>>;

let current: Timeline = {};
let currentLabel = "";

export function startFlightSearchTimer(label: string) {
  current = { search_clicked: Date.now() };
  currentLabel = label;
}

export function markFlightSearch(phase: FlightSearchPhase) {
  if (!current.search_clicked) current.search_clicked = Date.now();
  if (current[phase] != null) return; // first occurrence only
  current[phase] = Date.now();
}

/** Logs the elapsed time of every recorded phase relative to the click. */
export function reportFlightSearchTimings(extra?: Record<string, unknown>) {
  const t0 = current.search_clicked;
  if (!t0) return;

  const rel = (phase: FlightSearchPhase) =>
    current[phase] != null ? `${current[phase]! - t0}ms` : "—";

  // eslint-disable-next-line no-console
  console.log(
    `⏱️ flight-search [${currentLabel}]`,
    {
      request_started: rel("request_started"),
      response_received: rel("response_received"),
      results_processed: rel("results_processed"),
      first_results_rendered: rel("first_results_rendered"),
      all_results_rendered: rel("all_results_rendered"),
      ...extra,
    },
  );
}

export function flightSearchElapsed() {
  return current.search_clicked ? Date.now() - current.search_clicked : 0;
}

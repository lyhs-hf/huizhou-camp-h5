import { useRef, useEffect, useState, useCallback } from "react";
import { useJourney } from "../app/JourneyContext";
import { track } from "../analytics";
import type { InteractionId, JourneyStamp } from "../content/types";
export function useInteraction(
  id: InteractionId,
  stamp: JourneyStamp,
  event: string,
) {
  const { state, dispatch } = useJourney();
  const [done, setDone] = useState(state.completedInteractions.includes(id));
  const started = useRef(false);
  function start() {
    if (!started.current) {
      track(event + "_start");
      started.current = true;
    }
    dispatch({ type: "lock", value: true });
  }
  function unlock() {
    dispatch({ type: "lock", value: false });
  }
  const complete = useCallback(() => {
    if (!done) {
      track(event + "_complete");
      dispatch({ type: "complete", id, stamp });
      setDone(true);
    }
    dispatch({ type: "lock", value: false });
  }, [done, dispatch, event, id, stamp]);
  function retry() {
    dispatch({ type: "retry", id });
    setDone(false);
    started.current = false;
  }
  useEffect(
    () => () => {
      dispatch({ type: "lock", value: false });
    },
    [dispatch],
  );
  return { done, start, unlock, complete, retry };
}
export function useReducedMotion() {
  const [value, setValue] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setValue(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return value;
}

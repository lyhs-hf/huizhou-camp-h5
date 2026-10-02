import { useEffect, useState, type ReactNode } from "react";
import type { InteractionId } from "../content/types";
import { useJourney } from "../app/JourneyContext";
import { stationCopy } from "../content/copy";
export function StationHeader({ id, quiet = false, introduce = false }: { id: InteractionId; quiet?: boolean; introduce?: boolean }) {
  return (
    <div className={"scene-introduction" + (quiet ? " quiet-heading" : "")}>
      <h1 className="sr-only">{stationCopy[id].title}</h1>
      {introduce && <p className="scene-reason">{stationCopy[id].context}</p>}
    </div>
  );
}
export function StationFinish({ id }: { id: InteractionId }) {
  return (
    <div className="scene-afterword" role="status">
      {stationCopy[id].finish.map((x, i) => (
        <p key={x} className={i === 0 ? "first" : ""}>
          {x}
        </p>
      ))}
    </div>
  );
}
export function StationTools({ done, onRetry, onAssist, onInfo, assistLabel = "慢慢完成这一步", progressKey = "", quiet = false }: {
  done: boolean; onRetry: () => void; onAssist: () => void; onInfo: () => void;
  assistLabel?: string; progressKey?: string | number; quiet?: boolean;
}) {
  const { state: { locked } } = useJourney();
  const [waiting, setWaiting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    setWaiting(false);
    if (done || quiet || locked) return;
    const timer = setTimeout(() => setWaiting(true), 8000);
    return () => clearTimeout(timer);
  }, [done, progressKey, quiet, locked]);
  useEffect(() => { if (done || quiet) setMenu(false); }, [done, quiet]);
  const canHelp = !done && (waiting || requested) && !quiet && !locked;
  return <div className={"scene-edge-tools" + (quiet ? " quiet-tools" : "")} data-interaction>
    {(done || canHelp) && <button className="station-more" aria-label="更多体验选项" aria-expanded={menu} onClick={() => setMenu(!menu)}>···</button>}
    {menu && !quiet && (done || canHelp) && <div className="station-menu">
      <button className="knowledge-button" onClick={(e) => { e.currentTarget.focus(); onInfo(); }}>这一站，孩子在经历什么？</button>
      {done ? <button onClick={() => { onRetry(); setMenu(false); setRequested(false); }}>重新体验</button>
        : <button onClick={() => { setRequested(true); onAssist(); }}>{assistLabel}</button>}
    </div>}
  </div>;
}
export function Stage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={"interaction-stage " + className} data-interaction>
      {children}
    </div>
  );
}

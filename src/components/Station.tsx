import { useEffect, useState, type ReactNode } from "react";
import type { InteractionId } from "../content/types";
import { useJourney } from "../app/JourneyContext";
import { stationCopy } from "../content/copy";
export function StationHeader({ id, quiet = false, introduce = false }: { id: InteractionId; quiet?: boolean; introduce?: boolean }) {
  return (
    <div className={"station-heading" + (quiet ? " quiet-heading" : "")}>
      <div className="eyebrow">
        {id === "macaque"
          ? "DAY 4 · 山林里的一站"
          : id === "year"
            ? "DAY 3 · 老宅里的一站"
            : "DAY 2 · 指尖的一站"}
      </div>
      <h1>{stationCopy[id].title}</h1>
      {introduce && <p className="scene-reason">{stationCopy[id].context}</p>}
    </div>
  );
}
export function StationFinish({ id }: { id: InteractionId }) {
  return (
    <div className="station-finish" role="status">
      <span className="stamp-mark">{stationCopy[id].stamp}</span>
      {stationCopy[id].finish.map((x, i) => (
        <p key={x} className={i === 0 ? "first" : ""}>
          {x}
        </p>
      ))}
      <small className="route-label">{stationCopy[id].route}</small>
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
  return <div className={"station-tools editorial-tools" + (quiet ? " quiet-tools" : "")} data-interaction>
    <button className="knowledge-button" onClick={(e) => { e.currentTarget.focus(); onInfo(); }}>
      这一站，孩子在经历什么？<span aria-hidden>＋</span>
    </button>
    {(done || canHelp) && <button className="station-more" aria-label="更多体验选项" aria-expanded={menu} onClick={() => setMenu(!menu)}>···</button>}
    {canHelp && !menu && <button className="help-whisper" onClick={() => { setRequested(true); setMenu(true); }}>需要一点帮助？</button>}
    {menu && !quiet && (done || canHelp) && <div className="station-menu">
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

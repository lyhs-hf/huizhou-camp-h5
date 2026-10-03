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
const childValue: Record<InteractionId,string> = {
  lantern:"从认识一种年俗，到亲手做一盏灯，再带着它走进古村的夜。",
  ink:"从听说一种非遗，到靠近材料，看见并触碰它的纹样。",
  year:"从站在旁边看过年，到亲手做一份年礼，把它带进一家人的年。",
  macaque:"从多看几秒动物，到学会带着问题去观察。",
};
export function ChildValue({id,onInfo}:{id:InteractionId;onInfo:()=>void}) {
  return <div className="child-value" data-testid="child-value"><small>孩子刚才真正经历的是：</small><p>{childValue[id]}</p><button onClick={e=>{e.currentTarget.focus();onInfo();}}>再了解一点 <svg viewBox="0 0 24 12" aria-hidden><path d="M1 6H22M17 1L22 6L17 11"/></svg></button></div>;
}
export function StationFinish({ id, onInfo }: { id: InteractionId; onInfo:()=>void }) {
  return (
    <div className="scene-afterword" role="status">
      {stationCopy[id].finish.map((x, i) => (
        <p key={x} className={i === 0 ? "first" : ""}>
          {x}
        </p>
      ))}
      <ChildValue id={id} onInfo={onInfo}/>
    </div>
  );
}
export function StationTools({ done, onRetry, onAssist, assistLabel = "慢慢完成这一步", progressKey = "", quiet = false }: {
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

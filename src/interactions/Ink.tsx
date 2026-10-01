import { asset } from "../utils/asset";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useInteraction } from "../hooks/useInteraction";
import { Stage, StationHeader, StationFinish, StationTools } from "../components/Station";
const segments = [
  "M140 280 C172 257 143 243 159 219 L140 206",
  "M159 219 C175 196 148 181 163 159 L143 147",
  "M163 159 C179 138 151 120 168 100 C177 88 160 77 176 62 L145 90",
];
type Phase = "discover" | "trace" | "finish" | "rest" | "done";
export function Ink({ onInfo }: { onInfo: () => void }) {
  const action = useInteraction("ink", "墨", "ink");
  const [phase, setPhase] = useState<Phase>(action.done ? "done" : "discover");
  const [angle, setAngle] = useState(0);
  const [segment, setSegment] = useState(0);
  const [traces, setTraces] = useState<{ x: number; y: number }[]>([]);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const bins = useRef(new Set<number>());
  const previousPoint = useRef<{ x: number; y: number } | null>(null);
  const origin = useRef<{ x: number; last: number; distance: number } | null>(null);
  const complete = action.complete;
  useEffect(() => {
    if (phase !== "rest") return;
    const t = setTimeout(() => { setPhase("done"); complete(); }, 2200);
    return () => clearTimeout(t);
  }, [phase, complete]);
  function finishSegment() {
    bins.current.clear(); previousPoint.current = null; setTraces([]);
    if (segment === 2) { setSegment(3); setPhase("finish"); }
    else setSegment(segment + 1);
  }
  function draw(e: PointerEvent) {
    if (!origin.current) return;
    const dx = e.clientX - origin.current.x;
    origin.current.distance += Math.abs(e.clientX - origin.current.last);
    origin.current.last = e.clientX;
    if (phase === "discover") { setAngle(Math.max(-4, Math.min(4, dx / 12))); return; }
    if (phase !== "trace") return;
    const path = paths.current[segment]; const matrix = path?.getScreenCTM();
    if (!path || !matrix) return;
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
    const start = previousPoint.current ?? point;
    previousPoint.current = point;
    const vx = point.x - start.x, vy = point.y - start.y;
    const strokeLengthSquared = vx * vx + vy * vy;
    const length = path.getTotalLength();
    // Cover the swept brush stroke, including space between pointer events.
    // Sparse mouse / touch events must not require pixel-perfect sampling.
    for (let i = 0; i < 40; i++) {
      const p = path.getPointAtLength(length * i / 39);
      const t = strokeLengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
        ((p.x - start.x) * vx + (p.y - start.y) * vy) / strokeLengthSquared));
      if (Math.hypot(p.x - start.x - t * vx, p.y - start.y - t * vy) < 12) bins.current.add(i);
    }
    setTraces(Array.from(bins.current, i => {
      const p = path.getPointAtLength(length * i / 39);
      return { x: p.x, y: p.y };
    }));
    if (bins.current.size >= 30) { finishSegment(); origin.current = null; action.unlock(); }
  }
  function release() {
    const motion = origin.current;
    if (motion && phase === "discover" && motion.distance >= 45) setPhase("trace");
    if (motion && phase === "finish" && motion.distance >= 45) { setAngle(0); setPhase("rest"); }
    origin.current = null; previousPoint.current = null; action.unlock();
  }
  function assist() {
    action.start();
    if (phase === "discover") setPhase("trace");
    else if (phase === "trace") finishSegment();
    else if (phase === "finish") { setAngle(0); setPhase("rest"); }
    action.unlock();
  }
  const quiet = phase === "rest";
  return <>
    <StationHeader id="ink" quiet={quiet} />
    <Stage className={"ink-stage ink-world phase-" + phase + (quiet ? " visual-rest" : "")}>
      <div className="ink-object" style={{ transform: `rotate(${angle}deg) scale(${phase === "rest" || action.done ? 1.035 : 1})` }}>
        <img src={asset("assets/ink/ink.webp")} alt="有细腻浮雕纹样的徽墨墨锭" draggable={false} />
        <svg viewBox="0 0 300 330" className="ink-trace" data-testid="ink-path" data-phase={phase}
          role="button" tabIndex={phase === "rest" || phase === "done" ? -1 : 0}
          aria-label={phase === "discover" ? "左右轻转，发现墨面纹样" : phase === "finish" ? "轻扫收笔，让侧光掠过墨面" : "沿墨锭纹样分段描金"}
          onPointerDown={e => { if (quiet || action.done) return; action.start(); previousPoint.current = null; origin.current = { x: e.clientX, last: e.clientX, distance: 0 }; e.currentTarget.setPointerCapture(e.pointerId); draw(e); }}
          onPointerMove={draw} onPointerUp={release} onPointerCancel={() => { origin.current = null; previousPoint.current = null; action.unlock(); }}
          onKeyDown={e => {
            if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && phase === "discover") { e.preventDefault(); setAngle(e.key === "ArrowLeft" ? -4 : 4); }
            if (e.key === "Enter" && phase === "discover") { e.preventDefault(); setPhase("trace"); }
            if (e.key === "Enter" && phase === "trace") { e.preventDefault(); finishSegment(); }
            if (e.key === "Enter" && phase === "finish") { e.preventDefault(); setAngle(0); setPhase("rest"); }
          }}>
          {segments.map((d, i) => <g key={d}>
            <path ref={el => { paths.current[i] = el; }} d={d} className="trace-guide" data-segment={i} style={{ opacity: phase === "trace" && i === segment ? .65 : 0 }} />
            <path d={d} className="gold-line" style={{ opacity: i < segment || action.done ? 1 : 0 }} />
          </g>)}
          {traces.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r=".7" fill="#B69A67" />)}
        </svg>
        <div className={"ink-side-light " + (quiet ? "sweeping" : "")} style={{ opacity: quiet ? undefined : Math.abs(angle) / 16 }} />
      </div>
      {!quiet && !action.done && <div className="stage-hint">{phase === "discover" ? "轻轻转动，看看墨面" : phase === "trace" ? "沿着这一段纹样，慢慢描金" : "轻轻一扫，收笔"}</div>}
    </Stage>
    {action.done ? <StationFinish id="ink" /> : !quiet && <p className="interaction-note">{phase === "discover" ? "先看看它，不急着落笔。" : phase === "trace" ? "一段，再一段。金线留在墨面。" : "把这一笔，轻轻收好。"}</p>}
    <StationTools done={action.done} quiet={quiet} progressKey={phase + segment} onInfo={onInfo}
      onRetry={() => { action.retry(); setPhase("discover"); setSegment(0); setAngle(0); bins.current.clear(); previousPoint.current = null; setTraces([]); }}
      onAssist={assist} assistLabel={phase === "discover" ? "帮助发现纹样" : phase === "trace" ? "描好这一段" : "轻轻收笔"} />
  </>;
}

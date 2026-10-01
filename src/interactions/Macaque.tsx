import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useInteraction } from "../hooks/useInteraction";
import { Stage, StationHeader, StationFinish, StationTools } from "../components/Station";
type Phase = "search" | "focus" | "observe" | "record" | "rest" | "done";
export function Macaque({ onInfo }: { onInfo: () => void }) {
  const action = useInteraction("macaque", "山", "macaque");
  const [phase, setPhase] = useState<Phase>(action.done ? "done" : "search");
  const [view, setView] = useState({ x: 0, y: 0 });
  const [focus, setFocus] = useState(action.done ? 1 : 0);
  const [entry, setEntry] = useState("");
  const search = useRef<{ x: number; y: number; view: typeof view } | null>(null);
  const wheel = useRef<{ x: number; focus: number } | null>(null);
  const complete = action.complete;
  const near = Math.hypot(view.x + 105, view.y - 35) < 32;
  useEffect(() => {
    if (phase === "observe") { const t = setTimeout(() => setPhase("record"), 3000); return () => clearTimeout(t); }
    if (phase === "rest") { const t = setTimeout(() => { setPhase("done"); complete(); }, 1400); return () => clearTimeout(t); }
  }, [phase, complete]);
  function wheelMove(e: PointerEvent) {
    if (wheel.current) setFocus(Math.max(0, Math.min(1, wheel.current.focus + (e.clientX - wheel.current.x) / 160)));
  }
  function releaseWheel() { wheel.current = null; action.unlock(); if (focus > .85) setPhase("observe"); }
  const quiet = phase === "observe" || phase === "rest";
  return <>
    <StationHeader id="macaque" quiet={phase === "rest"} />
    <Stage className={"macaque-stage field-observation phase-" + phase + (phase === "rest" ? " visual-rest" : "")}>
      <div className={"binocular " + (phase === "search" ? "search-window" : "") + (phase === "observe" ? " breathing-forest" : "")} data-testid="binocular">
        {phase === "search" ? <>
          <div className="search-world" style={{ transform: `translate(${view.x}px,${view.y}px)` }}>
            <img className="forest" src="/assets/macaque/forest.webp" alt="比望远镜窗口更宽的冬日山林" />
            <img className="search-subject" src="/assets/macaque/macaque.webp" alt="林间非中央位置的短尾猴" />
          </div>
          <div className="search-view" data-testid="search-view" role="group" aria-label="拖动望远镜视野，在林间寻找" tabIndex={0}
            onPointerDown={e => { action.start(); search.current = { x: e.clientX, y: e.clientY, view }; e.currentTarget.setPointerCapture(e.pointerId); }}
            onPointerMove={e => { if (search.current) setView({ x: Math.max(-165, Math.min(80, search.current.view.x + e.clientX - search.current.x)), y: Math.max(-75, Math.min(75, search.current.view.y + e.clientY - search.current.y)) }); }}
            onPointerUp={() => { search.current = null; action.unlock(); if (near) setPhase("focus"); }} onPointerCancel={() => { search.current = null; action.unlock(); }}
            onKeyDown={e => { if (e.key.startsWith("Arrow")) { e.preventDefault(); setView(v => ({ x: Math.max(-165, Math.min(80, v.x + (e.key === "ArrowRight" ? 20 : e.key === "ArrowLeft" ? -20 : 0))), y: Math.max(-75, Math.min(75, v.y + (e.key === "ArrowDown" ? 20 : e.key === "ArrowUp" ? -20 : 0))) })); } else if (e.key === "Enter" && near) { e.preventDefault(); setPhase("focus"); } }} />
        </> : <>
          <img className="forest" src="/assets/macaque/forest.webp" alt="冬季山林" />
          <img className="macaque-sharp" src="/assets/macaque/macaque.webp" alt="山林中自然侧身停驻的短尾猴" style={{ opacity: focus }} />
          <img className="macaque-blurred" src="/assets/macaque/macaque.webp" alt="" style={{ opacity: 1 - focus }} />
        </>}
        <span className="crosshair" aria-hidden />
      </div>
      {phase === "search" && <div className="stage-hint">{near ? "好像有什么……" : "轻移视野，在林间找一找"}</div>}
      {phase === "focus" && <>
        <div className="focus-wheel" data-testid="focus-wheel" role="slider" tabIndex={0} aria-label="望远镜调焦轮" aria-valuenow={Math.round(focus * 100)} aria-valuemin={0} aria-valuemax={100}
          onPointerDown={e => { action.start(); wheel.current = { x: e.clientX, focus }; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={wheelMove} onPointerUp={releaseWheel} onPointerCancel={() => { wheel.current = null; action.unlock(); }}
          onKeyDown={e => { if (["ArrowLeft", "ArrowRight", "End", "Home"].includes(e.key)) { e.preventDefault(); const value = e.key === "End" ? 1 : e.key === "Home" ? 0 : Math.min(1, Math.max(0, focus + (e.key === "ArrowRight" ? .1 : -.1))); setFocus(value); if (value > .85) setPhase("observe"); } }}>
          <div style={{ transform: `translateX(${focus * 22}px)` }} /><span />
        </div><div className="stage-hint">慢慢调焦，让眼前清晰</div>
      </>}
      {phase === "observe" && <p className="observe-pause" role="status">别急着点。先看三秒。</p>}
      {phase === "record" && <div className="field-notebook" data-testid="field-notebook"><h2>记下一件你刚刚注意到的事</h2><div>{["位置", "姿态", "周围环境"].map(x => <button key={x} onClick={() => { setEntry(x); setPhase("rest"); }}>{x}<span aria-hidden> ·</span></button>)}</div></div>}
      {(phase === "rest" || action.done) && <div className="recorded-dimension">{entry ? `已收录：${entry}` : "观察已收好"}</div>}
    </Stage>
    {action.done && <StationFinish id="macaque" />}
    <StationTools done={action.done} quiet={quiet} progressKey={phase} onInfo={onInfo}
      onRetry={() => { action.retry(); setPhase("search"); setView({ x: 0, y: 0 }); setFocus(0); setEntry(""); }}
      onAssist={() => { if (phase === "search") { setView({ x: -105, y: 35 }); setPhase("focus"); } else if (phase === "focus") { setFocus(1); setPhase("observe"); } }}
      assistLabel={phase === "search" ? "帮助寻找山林中的身影" : "辅助调焦"} />
  </>;
}

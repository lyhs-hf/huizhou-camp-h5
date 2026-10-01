import { asset } from "../utils/asset";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useInteraction } from "../hooks/useInteraction";
import { useJourney } from "../app/JourneyContext";
import { Stage, StationHeader, StationFinish, StationTools } from "../components/Station";
type Phase = "search" | "focus" | "observe" | "record" | "rest" | "done";
export function Macaque({ onInfo }: { onInfo: () => void }) {
  const action = useInteraction("macaque", "山", "macaque");
  const { state, dispatch } = useJourney();
  const [phase, setPhase] = useState<Phase>(action.done ? "done" : "search");
  const [view, setView] = useState({ x: 0, y: 0 });
  const [focus, setFocus] = useState(action.done ? 1 : 0);
  const [entry, setEntry] = useState(state.observation?.discovery ?? "");
  const [question, setQuestion] = useState(state.observation?.question ?? "");
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
    <StationHeader id="macaque" quiet={phase === "rest"} introduce={phase === "search" && view.x === 0 && view.y === 0} />
    <Stage className={"macaque-stage field-observation phase-" + phase + (phase === "rest" ? " visual-rest" : "")}>
      <div className={"binocular " + (phase === "search" ? "search-window" : "") + (phase === "observe" ? " breathing-forest" : "")} data-testid="binocular">
        {phase === "search" ? <>
          <div className="search-world" style={{ transform: `translate(${view.x}px,${view.y}px)` }}>
            <img className="forest" src={asset("assets/macaque/search-final.webp")} alt="更宽的冬日山林视野，短尾猴停在右侧岩石上" />
          </div>
          <div className="search-view" data-testid="search-view" role="group" aria-label="拖动望远镜视野，在林间寻找" tabIndex={0}
            onPointerDown={e => { action.start(); search.current = { x: e.clientX, y: e.clientY, view }; e.currentTarget.setPointerCapture(e.pointerId); }}
            onPointerMove={e => { if (search.current) setView({ x: Math.max(-165, Math.min(80, search.current.view.x + e.clientX - search.current.x)), y: Math.max(-75, Math.min(75, search.current.view.y + e.clientY - search.current.y)) }); }}
            onPointerUp={() => { search.current = null; action.unlock(); if (near) setPhase("focus"); }} onPointerCancel={() => { search.current = null; action.unlock(); }}
            onKeyDown={e => { if (e.key.startsWith("Arrow")) { e.preventDefault(); setView(v => ({ x: Math.max(-165, Math.min(80, v.x + (e.key === "ArrowRight" ? 20 : e.key === "ArrowLeft" ? -20 : 0))), y: Math.max(-75, Math.min(75, v.y + (e.key === "ArrowDown" ? 20 : e.key === "ArrowUp" ? -20 : 0))) })); } else if (e.key === "Enter" && near) { e.preventDefault(); setPhase("focus"); } }} />
        </> : <>
          <img className="forest" src={asset("assets/macaque/forest.webp")} alt="冬季山林" />
          <img className="macaque-sharp" src={asset("assets/macaque/macaque.webp")} alt="山林中自然侧身停驻的短尾猴" style={{ opacity: focus }} />
          <img className="macaque-blurred" src={asset("assets/macaque/macaque.webp")} alt="" style={{ opacity: 1 - focus }} />
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
      {phase === "observe" && <p className="observe-pause" role="status">先看三秒：<br />它坐在哪儿，身体怎样放着？</p>}
      {phase === "record" && <div className="field-notebook" data-testid="field-notebook"><h2>山林观察记录</h2><p>{entry ? "看见之后，我还想知道：" : "只记录这张画面能看见的事。"}</p>
        {!entry ? <div>{["它坐在岩石上。", "它的前肢靠近身体。"].map(x => <button key={x} onClick={() => setEntry(x)}><span aria-hidden>○</span>我看到{x}</button>)}</div> : <><p className="record-fact">我看到：{entry}</p><div>{["它会一直停在这里吗？", "它为什么选这个落脚处？"].map(x => <button key={x} onClick={() => { setQuestion(x); dispatch({ type: "observation", discovery: entry, question: x }); setPhase("rest"); }}><span aria-hidden>○</span>{x}</button>)}</div></>}
      </div>}
      {(phase === "rest" || action.done) && <div className="recorded-dimension"><span>我看到：{entry}<br /><small>我还想知道：{question}</small></span></div>}
    </Stage>
    {action.done && <StationFinish id="macaque" />}
    <StationTools done={action.done} quiet={quiet || phase === "record"} progressKey={phase} onInfo={onInfo}
      onRetry={() => { action.retry(); setPhase("search"); setView({ x: 0, y: 0 }); setFocus(0); setEntry(""); setQuestion(""); }}
      onAssist={() => { if (phase === "search") { setView({ x: -105, y: 35 }); setPhase("focus"); } else if (phase === "focus") { setFocus(1); setPhase("observe"); } }}
      assistLabel={phase === "search" ? "帮助寻找山林中的身影" : "慢慢调清楚"} />
  </>;
}

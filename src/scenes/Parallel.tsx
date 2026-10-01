import { asset } from "../utils/asset";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useJourney } from "../app/JourneyContext";
import { track } from "../analytics";
type Choice = "tea" | "incense" | "view";
type Phase = "split" | "choose" | "moment" | "rejoin" | "done";
const incensePath = "M118 188 H178";
export function Parallel({ ready, onReady }: { ready: boolean; onReady: (value: boolean) => void }) {
  const { dispatch } = useJourney();
  const [phase, setPhase] = useState<Phase>(ready ? "done" : "split");
  const [split, setSplit] = useState(50);
  const [choice, setChoice] = useState<Choice>("view");
  const [engaged, setEngaged] = useState(false);
  const [settled, setSettled] = useState(false);
  const [beat, setBeat] = useState(ready ? 2 : 0);
  const [ripples, setRipples] = useState<{ x: number; y: number }[]>([]);
  const [wipes, setWipes] = useState<string[]>([]);
  const [stroke, setStroke] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const ritual = useRef<SVGSVGElement>(null); const incense = useRef<SVGPathElement>(null);
  const bins = useRef(new Set<number>());
  const motion = useRef<{ x: number; y: number; length: number; line: string; at: number } | null>(null);
  const origin = useRef<{ x: number; split: number } | null>(null);
  const wipedDistance = useRef(0);
  const teaProgress = useRef(0);
  const teaStartedAt = useRef<number | null>(null);
  useEffect(() => {
    if (phase !== "moment" || !engaged) return;
    const t = setTimeout(() => setSettled(true), 2500);
    return () => clearTimeout(t);
  }, [phase, engaged]);

  useEffect(() => {
    if (phase !== "rejoin") return;
    const a = setTimeout(() => setBeat(1), 1800), b = setTimeout(() => setBeat(2), 2800), c = setTimeout(() => { setPhase("done"); onReady(true); }, 7000);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }, [phase, onReady]);
  useEffect(() => () => { dispatch({ type: "lock", value: false }); }, [dispatch]);
  function release() { origin.current = null; dispatch({ type: "lock", value: false }); track("parent_child_slider", { childRatio: Math.round(split) }); }
  function select(value: Choice) { setChoice(value); setPhase("moment"); setEngaged(false); setSettled(false); setWipes([]); setStroke(0); wipedDistance.current = 0; teaProgress.current = 0; teaStartedAt.current = null; bins.current.clear(); track("mother_moment_select", { choice: value }); }
  function point(e: PointerEvent) { const m = ritual.current?.getScreenCTM(); return m ? new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()) : null; }
  function down(e: PointerEvent) {
    if (engaged) return;
    dispatch({ type: "lock", value: true }); e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e); if (!p) { dispatch({ type: "lock", value: false }); return; }
    if (choice === "tea" && Math.hypot((p.x - 150) / 65, (p.y - 220) / 32) > 1.6) { dispatch({ type: "lock", value: false }); return; }
    if (choice === "tea" && teaStartedAt.current === null) teaStartedAt.current = performance.now();
    motion.current = { x: p.x, y: p.y, length: 0, line: `M${p.x} ${p.y}`, at: performance.now() };
    if (choice === "view") setWipes(w => [...w, motion.current!.line]);
    if (choice === "tea") setRipples([{ x: 150, y: 220 }]);
  }
  function move(e: PointerEvent) {
    const p = point(e); if (!p || !motion.current || engaged) return;
    const d = Math.hypot(p.x - motion.current.x, p.y - motion.current.y);
    motion.current.length += d; motion.current.x = p.x; motion.current.y = p.y;
    if (choice === "tea") {
      teaProgress.current += d;
      setStroke(Math.min(1, teaProgress.current / 120));
      if (teaProgress.current >= 120 && performance.now() - (teaStartedAt.current ?? performance.now()) >= 600) setEngaged(true);
    } else if (choice === "incense" && incense.current) {
      let nearest = 0, distance = Infinity; const length = incense.current.getTotalLength();
      for (let i = 0; i < 24; i++) { const q = incense.current.getPointAtLength(length * i / 23); const delta = Math.hypot(q.x - p.x, q.y - p.y); if (delta < distance) { nearest = i; distance = delta; } }
      if (distance < 14) bins.current.add(nearest);
      setStroke(bins.current.size / 24); if (bins.current.size >= 18) setEngaged(true);
    } else if (choice === "view") {
      motion.current.line += ` L${p.x} ${p.y}`;
      setWipes(w => [...w.slice(0, -1), motion.current!.line]);
      wipedDistance.current += d;
      if (wipedDistance.current > 380) setEngaged(true);
    }
  }
  function up() { if (choice === "tea" && motion.current && teaProgress.current >= 120 && performance.now() - (teaStartedAt.current ?? performance.now()) >= 600) setEngaged(true); motion.current = null; dispatch({ type: "lock", value: false }); }
  return <>
    <div className="eyebrow">DAY 5 · 山顶亲子时光</div>
    {phase === "split" ? <h1 className="parallel-title">同一段时间，<br />两个人可以拥有<br />不同内容。</h1> : phase === "choose" ? <h1 className="mother-choice-title">这一小时，<br />如果留给你，<br />你想怎么过？</h1> : phase === "moment" ? <h1 className={"private-title" + (choice === "view" && engaged ? " quiet-heading" : "")}>{choice === "tea" ? "一盏茶的时间。" : choice === "incense" ? "慢慢，留一缕香。" : "什么都不做，只看山。"}</h1> : <h1 className="parallel-title quiet-heading">同一段旅行。</h1>}
    {phase === "split" || phase === "rejoin" || phase === "done" ? <div ref={box} className={"parallel-images " + (phase === "rejoin" ? "rejoining" : "")} data-interaction>
      <img className="parent-image" src={asset("assets/parallel/parent.webp")} alt="山顶山景前，一杯茶与一缕香的安静时光" />
      <div className="child-view" style={{ width: phase === "split" ? split + "%" : "50%" }}><img src={asset("assets/parallel/child.webp")} alt="孩子在山顶体验文化手作的意境" /></div>
      {phase === "split" && <><span className="parallel-label child-label" style={{ opacity: split < 30 ? 0 : 1 }}>孩子 · 继续探索</span><span className="parallel-label parent-label" style={{ opacity: split > 70 ? 0 : 1 }}>大人 · 慢下来</span>
        <div className="divider" style={{ left: split + "%" }} role="slider" tabIndex={0} aria-label="亲子平行时光分屏" aria-valuemin={18} aria-valuemax={82} aria-valuenow={Math.round(split)} data-testid="divider"
          onPointerDown={e => { dispatch({ type: "lock", value: true }); origin.current = { x: e.clientX, split }; e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerMove={e => { if (origin.current) setSplit(Math.min(82, Math.max(18, origin.current.split + (e.clientX - origin.current.x) / box.current!.getBoundingClientRect().width * 100))); }} onPointerUp={release} onPointerCancel={release}
          onKeyDown={e => { if (["ArrowLeft", "ArrowRight", "Home"].includes(e.key)) { e.preventDefault(); const value = e.key === "Home" ? 50 : Math.min(82, Math.max(18, split + (e.key === "ArrowRight" ? 10 : -10))); setSplit(value); track("parent_child_slider", { childRatio: value }); } }}><span>‹ ›</span></div>
      </>}
    </div> : phase === "choose" ? <>
      <img className="mother-choice-art" src={asset("assets/parallel/parent.webp")} alt="窗前的一盏茶与山景" />
      <div className="mother-slips" data-interaction>{([["tea", "点茶"], ["incense", "篆香"], ["view", "什么都不做，只看山"]] as const).map(([value, label]) => <button key={value} onClick={() => select(value)}>{label}<span aria-hidden> ↗</span></button>)}</div>
    </> : <div className={"private-moment " + choice + (engaged ? " engaged" : "")} data-interaction>
      <img src={choice === "view" ? asset("assets/mountain/panorama.webp") : choice === "tea" ? asset("assets/parallel/tea-final.webp") : asset("assets/parallel/incense-final.webp")} alt={choice === "view" ? "窗外黄山冬景" : choice === "tea" ? "窗前的茶器与茶筅" : "冬景前的一方香灰与香篆"} />
      <svg ref={ritual} preserveAspectRatio={choice === "view" ? "none" : "xMidYMid slice"} viewBox="0 0 300 330" className="ritual-surface" data-testid="mother-ritual" aria-disabled={engaged} role="button" tabIndex={0} aria-label={choice === "tea" ? "缓缓划过茶面，让茶筅带起水纹" : choice === "incense" ? "沿香篆路径慢慢划过" : "慢慢擦开窗面雾气"}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (engaged) return; if (choice === "tea") { teaProgress.current += 40; setStroke(Math.min(1, teaProgress.current / 120)); setRipples([{ x: 150, y: 220 }]); if (teaProgress.current >= 120) setEngaged(true); } else if (choice === "incense") { setStroke(s => { const n = Math.min(1, s + .25); if (n >= .75) setEngaged(true); return n; }); } else { setWipes(w => { const n = [...w, `M40 ${70 + w.length * 85} H260`]; wipedDistance.current += 160; if (wipedDistance.current > 380) setEngaged(true); return n; }); } } }}>
        {choice === "tea" && stroke > 0 && <path className="tea-foam" d="M135 220 Q143 213 155 217 Q170 223 158 227 Q145 230 140 222" style={{ transform: `rotate(${Math.sin(stroke * Math.PI * 4) * 12}deg)` }} />}
        {choice === "tea" && ripples.map((r, i) => <g key={i} className="tea-ripple">{[0, 1, 2].map(j => <ellipse key={j} cx={r.x} cy={r.y} rx={14 + j * 9} ry={6 + j * 4} style={{ animationDelay: j * .35 + "s" }} />)}</g>)}
        {choice === "incense" && <><path ref={incense} d={incensePath} className="incense-guide" /><path d={incensePath} className="incense-drawn" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - stroke * 100} />{engaged && <path className="quiet-smoke" d="M150 180 C175 145 120 125 155 80 C170 60 150 50 150 30" />}</>}
        {choice === "view" && <><defs><mask id="window-wipe"><rect width="300" height="330" fill="white" />{wipes.map((d, i) => <path key={i} d={d} stroke="black" strokeWidth="78" strokeLinecap="round" fill="none" />)}</mask></defs><rect className="window-mist" width="300" height="330" fill="#E0E3DF" mask="url(#window-wipe)" /></>}
      </svg>
      {!engaged && <p className="moment-note">{choice === "tea" ? "缓缓划过茶面" : choice === "incense" ? "沿着香篆，慢慢划过" : "用指尖，缓缓擦开窗面"}</p>}
      {settled && <button className="keep-moment" onClick={() => { setPhase("rejoin"); dispatch({ type: "lock", value: false }); }}>收好这一小时<span aria-hidden> →</span></button>}
    </div>}
    {phase === "split" && <><p className="divider-hint">向右，孩子画面展开 · 向左，大人画面展开</p><button className="mother-enter" onClick={() => setPhase("choose")}>把这一小时，留给自己<span aria-hidden> →</span></button></>}
    {(phase === "rejoin" || phase === "done") && <div className="parallel-reunion" role="status">{beat >= 1 && <p>给孩子一段探索，<br />也给自己一段旅行。</p>}{beat >= 2 && <h2 className="second-beat">晚一点，<br />再一起看山。</h2>}</div>}
  </>;
}

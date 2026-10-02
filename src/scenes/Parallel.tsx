import { useMaterialPassage } from "../components/ScenePassage";
import { asset } from "../utils/asset";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useJourney } from "../app/JourneyContext";
import { track } from "../analytics";
import { coverStroke } from "../utils/strokeCoverage.mjs";
type Choice = "tea" | "incense" | "view";
type Phase = "split" | "choose" | "moment" | "rejoin" | "done";
const incensePath = "M390 535 H333 V512 H446 V561 H307 V486 H478 V577";
export function Parallel({ ready, onReady }: { ready: boolean; onReady: (value: boolean) => void }) {
  const { dispatch } = useJourney();
  const passage=useMaterialPassage();
  const [phase, setPhase] = useState<Phase>(ready ? "done" : "split");
  const [split, setSplit] = useState(50);
  const [touchedDivider, setTouchedDivider] = useState(false);
  const [choice, setChoice] = useState<Choice>("view");
  const [engaged, setEngaged] = useState(false);
  const [settled, setSettled] = useState(false);
  const [beat, setBeat] = useState(ready ? 2 : 0);
  const [ripples, setRipples] = useState<{ x: number; y: number }[]>([]);
  const [stroke, setStroke] = useState(0);
  const [covered, setCovered] = useState<number[]>([]);
  const [teaTip, setTeaTip] = useState({ x: 150, y: 222 });
  const box = useRef<HTMLDivElement>(null);
  const ritual = useRef<SVGSVGElement>(null); const incense = useRef<SVGPathElement>(null);
  const bins = useRef(new Set<number>());
  const motion = useRef<{ x: number; y: number; length: number; line: string; at: number } | null>(null);
  const origin = useRef<{ x: number; split: number } | null>(null);
  const teaProgress = useRef(0);
  const scentTip = incense.current && covered.length ? incense.current.getPointAtLength(incense.current.getTotalLength() * Math.max(...covered) / 99) : null;
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
  function select(value: Choice) { setChoice(value); setPhase("moment"); setEngaged(value === "view"); setSettled(false); setCovered([]); setStroke(0); teaProgress.current = 0; teaStartedAt.current = null; bins.current.clear(); track("mother_moment_select", { choice: value }); }
  function point(e: PointerEvent) { const m = ritual.current?.getScreenCTM(); return m ? new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()) : null; }
  function down(e: PointerEvent) {
    if (engaged || motion.current || !e.isPrimary) return;
    e.preventDefault();
    dispatch({ type: "lock", value: true }); e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e); if (!p) { dispatch({ type: "lock", value: false }); return; }
    if (choice === "tea" && Math.hypot((p.x - 150) / 65, (p.y - 222) / 32) > 1.6) { dispatch({ type: "lock", value: false }); return; }
    if (choice === "tea" && teaStartedAt.current === null) teaStartedAt.current = performance.now();
    motion.current = { x: p.x, y: p.y, length: 0, line: `M${p.x} ${p.y}`, at: performance.now() };
    if (choice === "tea") setRipples([{ x: 150, y: 222 }]);
  }
  function move(e: PointerEvent) {
    const p = point(e); if (!p || !motion.current || engaged) return;
    const d = Math.hypot(p.x - motion.current.x, p.y - motion.current.y);
    const previous = { x: motion.current.x, y: motion.current.y };
    motion.current.length += d; motion.current.x = p.x; motion.current.y = p.y;
    if (choice === "tea") {
      teaProgress.current += d;
      setTeaTip({ x: Math.max(115, Math.min(185, p.x)), y: Math.max(211, Math.min(232, p.y)) });
      setStroke(Math.min(1, teaProgress.current / 90));
      if (teaProgress.current >= 90 && performance.now() - (teaStartedAt.current ?? performance.now()) >= 450) setEngaged(true);
    } else if (choice === "incense" && incense.current) {
      const length = incense.current.getTotalLength();
      const samples = Array.from({ length: 100 }, (_, i) => incense.current!.getPointAtLength(length * i / 99));
      const progress = coverStroke(samples, previous, p, 18, bins.current);
      setCovered([...bins.current]); setStroke(progress);
      if (progress >= .76) setEngaged(true);
    }
  }
  function up() { if (choice === "tea" && motion.current && teaProgress.current >= 90 && performance.now() - (teaStartedAt.current ?? performance.now()) >= 450) setEngaged(true); motion.current = null; dispatch({ type: "lock", value: false }); }
  return <div className={"parallel-space parallel-" + phase + (engaged ? " sensory-rest" : "")}>
    {passage.layer}
    <h1 className="sr-only">{phase === "split" ? "同一段时间，两个人可以拥有不同内容。" : phase === "choose" ? "这一小时，如果留给你，你想怎么过？" : phase === "moment" ? choice === "tea" ? "一盏茶的时间。" : choice === "incense" ? "慢慢，留一缕香。" : "什么都不做，只看山。" : "同一段旅行。"}</h1>
    {(phase === "split" || phase === "choose") && <p className="parallel-whisper">{phase === "split" ? <>孩子继续探索。<br/>这一小时，属于你。</> : <>不必赶时间。<br/>这一刻，想怎么过？</>}</p>}
    {(phase === "rejoin" || phase === "done") && <img className="reunion-window" src={asset("assets/parallel/parent.webp")} alt="两个世界合拢，窗外是同一片黄山"/>}
    {phase === "split" || phase === "rejoin" ? <div ref={box} className={"parallel-images " + (phase === "rejoin" ? "rejoining" : "")} data-interaction>
      <img className="parent-image" src={asset("assets/parallel/parent.webp")} alt="山顶山景前，一杯茶与一缕香的安静时光" />
      <div className="child-view" style={{ width: phase === "split" ? split + "%" : "50%" }}><img src={asset("assets/parallel/child.webp")} alt="孩子在山顶体验文化手作的意境" /></div>
      {phase === "split" && <><span className="parallel-label child-label" style={{ opacity: split < 30 ? 0 : 1 }}>孩子 · 继续探索</span><span className="parallel-label parent-label" style={{ opacity: split > 70 ? 0 : 1 }}>大人 · 慢下来</span>
        <div className="divider" style={{ left: split + "%" }} role="slider" tabIndex={0} aria-label="亲子平行时光分屏" aria-valuemin={18} aria-valuemax={82} aria-valuenow={Math.round(split)} data-testid="divider"
          onPointerDown={e => { if(origin.current||!e.isPrimary)return;e.preventDefault();setTouchedDivider(true); dispatch({ type: "lock", value: true }); origin.current = { x: e.clientX, split }; e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerMove={e => { if (origin.current) setSplit(Math.min(82, Math.max(18, origin.current.split + (e.clientX - origin.current.x) / box.current!.getBoundingClientRect().width * 100))); }} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={()=>{if(origin.current)release();}}
          onKeyDown={e => { if (["ArrowLeft", "ArrowRight", "Home"].includes(e.key)) { e.preventDefault(); const value = e.key === "Home" ? 50 : Math.min(82, Math.max(18, split + (e.key === "ArrowRight" ? 10 : -10))); setSplit(value); track("parent_child_slider", { childRatio: value }); } }}><span>‹ ›</span></div>
      </>}
    </div> : phase === "choose" ? <>
      <img className="mother-choice-art" src={asset("assets/parallel/parent.webp")} alt="窗前的一盏茶与山景" />
      <div className="mother-slips" data-interaction>{([["tea", "点茶"], ["incense", "篆香"], ["view", "什么都不做，只看山"]] as const).map(([value, label]) => <button key={value} onClick={() => passage.enter("window",()=>select(value),value==="tea"?"directors-cut/tea-clear-table.webp":value==="incense"?"parallel/incense-blank.webp":"parallel/parent.webp")}>{label}<span aria-hidden> ↗</span></button>)}</div>
    </> : phase === "moment" ? <div className={"private-moment " + choice + (engaged ? " engaged" : "")} data-interaction>
      <img src={choice === "view" ? asset("assets/parallel/parent.webp") : choice === "tea" ? asset("assets/directors-cut/tea-clear-table.webp") : asset("assets/parallel/incense-blank.webp")} alt={choice === "view" ? "窗外黄山冬景" : choice === "tea" ? "窗前的茶器与茶筅" : "冬景前的一方平整香灰，香迹由指尖形成"} />
      {choice === "view" ? <svg className="window-atmosphere" viewBox="0 0 300 330" preserveAspectRatio="none" aria-hidden><defs><linearGradient id="window-cloud"><stop stopColor="#f2f2ea" stopOpacity="0"/><stop offset=".5" stopColor="#f2f2ea" stopOpacity=".18"/><stop offset="1" stopColor="#f2f2ea" stopOpacity="0"/></linearGradient></defs><path fill="url(#window-cloud)" d="M-80 65 Q70 30 170 65 T400 65 V160 H-80Z"/></svg> : <svg ref={ritual} preserveAspectRatio="xMidYMid slice" viewBox={choice === "incense" ? "0 0 780 859" : "0 0 300 330"} className="ritual-surface" data-testid="mother-ritual" aria-disabled={engaged} role="button" tabIndex={0} aria-label={choice === "tea" ? "缓缓划过茶面，让茶筅带起水纹" : "沿香篆路径慢慢划过"}
        onPointerDown={down} onPointerMove={move} onPointerUp={e => { move(e); up(); }} onPointerCancel={() => { motion.current = null; dispatch({ type: "lock", value: false }); }} onLostPointerCapture={()=>{if(motion.current){motion.current=null;dispatch({type:"lock",value:false});}}}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (engaged) return; if (choice === "tea") { teaProgress.current = 90; setStroke(1); setRipples([{ x: 150, y: 222 }]); setEngaged(true); } else { setStroke(s => { const n = Math.min(1, s + .34); setCovered(Array.from({ length: Math.round(n * 100) }, (_, i) => i)); if (n >= 1) setEngaged(true); return n; }); } } }}>
        {choice === "tea" && stroke > 0 && <g className="tea-material" clipPath="url(#tea-lip)"><defs><clipPath id="tea-lip"><ellipse cx="150" cy="222" rx="49" ry="11"/></clipPath><radialGradient id="tea-froth" cx=".35" cy=".25"><stop stopColor="#eeecd9"/><stop offset=".65" stopColor="#e0e1c8"/><stop offset="1" stopColor="#c0c9ae" stopOpacity="0"/></radialGradient></defs><ellipse cx="150" cy="222" rx="49" ry="11" fill="url(#tea-froth)" opacity={stroke * .64}/>{Array.from({ length: 90 }, (_, i) => <circle key={i} cx={150 + Math.cos(i * 2.4) * (6 + i * .45)} cy={222 + Math.sin(i * 2.4) * (2 + i * .095)} r={.16 + i % 3 * .08} fill="#738267" opacity={stroke * .22}/>)}</g>}
        {choice === "tea" && stroke > 0 && !engaged && <g className="tea-whisk" transform={`translate(${teaTip.x} ${teaTip.y}) rotate(-20)`}><path d="M0 -9 L0 -47" stroke="#8d7045" strokeWidth="4"/>{[-6,-3,0,3,6].map(x => <path key={x} d={`M0 -14 Q${x * 2} -3 ${x} 8`} fill="none" stroke="#c3ad7d" strokeWidth=".8"/>)}</g>}
        {choice === "tea" && ripples.map((r, i) => <g key={i} className="tea-ripple" clipPath="url(#tea-lip)">{[0, 1, 2].map(j => <ellipse key={j} cx={r.x} cy={r.y} rx={14 + j * 9} ry={6 + j * 4} style={{ animationDelay: j * .35 + "s" }} />)}</g>)}
        {choice === "incense" && <><defs><filter id="scent-grain"><feTurbulence type="fractalNoise" baseFrequency=".08 .32" numOctaves="2" seed="8" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="2.3"/></filter><linearGradient id="scent-powder"><stop stopColor="#655744"/><stop offset=".5" stopColor="#93816a"/><stop offset="1" stopColor="#6c5b47"/></linearGradient><mask id="formed-incense"><rect width="780" height="859" fill="black" />{covered.map(i => { const p = incense.current?.getPointAtLength(incense.current.getTotalLength() * i / 99); return p && <circle key={i} cx={p.x} cy={p.y} r="10" fill="white"/>; })}</mask></defs><path ref={incense} d={incensePath} className="incense-guide" style={{opacity:engaged?0:undefined}} /><path d={incensePath} className="incense-drawn" style={{filter:"url(#scent-grain)",stroke:"url(#scent-powder)"}} mask="url(#formed-incense)" />{engaged && <path className="quiet-smoke" d={`M${scentTip?.x ?? 478} ${scentTip?.y ?? 577} c25 -50 -30 -62 0 -106 c22 -35 -25 -53 0 -92`} />}</>}
      </svg>}
      {!engaged && stroke === 0 && <p className="moment-note">{choice === "tea" ? "茶筅轻动，看看茶面怎样变化" : "沿灰面回纹轻划，留下一缕香"}</p>}
      {settled && <button className="keep-moment" onClick={() => passage.enter("window",()=>{ setPhase("rejoin"); dispatch({ type: "lock", value: false }); })}>收好这一小时<span aria-hidden> →</span></button>}
    </div> : null}
    {phase === "split" && <>{!touchedDivider && <p className="divider-hint">轻移分界，看看彼此的这一刻</p>}<button className="mother-enter" onClick={() => passage.enter("window",()=>setPhase("choose"))}>把这一小时，留给自己<span aria-hidden> →</span></button></>}
    {phase === "done" && <button className="parallel-return" onClick={()=>passage.enter("window",()=>{onReady(false);setPhase("choose");setBeat(0);setSettled(false);})}>再留一会儿</button>}
    {(phase === "rejoin" || phase === "done") && <div className="parallel-reunion" role="status">{beat >= 1 && <p>给孩子一段探索，<br />也给自己一段旅行。</p>}{beat >= 2 && <h2 className="second-beat">晚一点，<br />再一起看山。</h2>}</div>}
  </div>;
}

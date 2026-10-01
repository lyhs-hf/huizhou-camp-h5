import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useInteraction } from "../hooks/useInteraction";
import { Stage, StationHeader, StationFinish, StationTools } from "../components/Station";
type Phase = "dough" | "press" | "strike" | "red" | "red-rest" | "pages" | "reflection" | "done";
export function NewYear({ onInfo }: { onInfo: () => void }) {
  const action = useInteraction("year", "年", "new_year");
  const [phase, setPhase] = useState<Phase>(action.done ? "done" : "dough");
  const [shot, setShot] = useState(action.done ? 2 : 0);
  const [hits, setHits] = useState(0);
  const [beat, setBeat] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const origin = useRef<{ x: number; y: number; at: number } | null>(null);
  const stage = useRef<HTMLDivElement>(null); const mould = useRef<HTMLDivElement>(null);
  const lastHit = useRef(-Infinity); const complete = action.complete;
  useEffect(() => {
    if (phase === "press") { const t = setTimeout(() => setPhase("strike"), 550); return () => clearTimeout(t); }
    if (phase === "red-rest") { const t = setTimeout(() => { setPhase("pages"); setShot(0); }, 1650); return () => clearTimeout(t); }
    if (phase === "reflection") {
      const a = setTimeout(() => setBeat(1), 1200), b = setTimeout(() => setBeat(2), 2200), c = setTimeout(() => { setPhase("done"); complete(); }, 3500);
      return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
    }
  }, [phase, complete]);
  function hit() {
    if (performance.now() - lastHit.current < 350) return;
    lastHit.current = performance.now(); setHits(hits + 1);
    if (hits === 2) setPhase("red");
  }
  function down(e: PointerEvent) { action.start(); origin.current = { x: e.clientX, y: e.clientY, at: performance.now() }; e.currentTarget.setPointerCapture(e.pointerId); }
  function move(e: PointerEvent) { if (origin.current) setOffset({ x: e.clientX - origin.current.x, y: e.clientY - origin.current.y }); }
  function cancel() { origin.current = null; setOffset({ x: 0, y: 0 }); action.unlock(); }
  function up(e: PointerEvent) {
    if (!origin.current) return;
    const r = (phase === "dough" ? mould.current : stage.current)!.getBoundingClientRect();
    if (phase === "dough" && ((e.clientX > r.left - 20 && e.clientX < r.right + 20 && e.clientY > r.top - 20 && e.clientY < r.bottom + 20) || (Math.hypot(offset.x, offset.y) < 10 && performance.now() - origin.current.at >= 400))) setPhase("press");
    if (phase === "strike" && e.clientX > r.left + r.width * .16 && e.clientX < r.right - r.width * .16 && e.clientY > r.top + r.height * .2 && e.clientY < r.bottom) hit();
    cancel();
  }
  function pageForward() { if (shot < 2) setShot(shot + 1); else { setBeat(0); setPhase("reflection"); } }
  const quiet = phase === "red-rest" || phase === "reflection" && beat === 0;
  const inHouse = ["pages", "reflection", "done"].includes(phase);
  return <>
    <StationHeader id="year" quiet={quiet || inHouse && !action.done} />
    <Stage className={"year-stage year-process phase-" + phase + (quiet ? " visual-rest" : "")}>
      <div ref={stage} className={"year-image hit-" + hits + " " + (inHouse ? "house-space" : "")} data-phase={phase} data-hits={hits}>
        <img key={inHouse ? shot : "table"} className={inHouse ? "year-page" : ""} src={inHouse ? ["/assets/new-year/couplet.webp", "/assets/new-year/courtyard.webp", "/assets/new-year/banquet.webp"][shot] : "/assets/new-year/table.webp"}
          alt={inHouse ? ["孩子手写楹联的意境", "老宅天井里的自然光", "一家人围坐年宴的意境"][shot] : "木桌上的传统木模与食桃"} draggable={false} />
        {(phase === "dough" || phase === "press" || phase === "strike") && <div ref={mould} className="mould-target" data-testid="mould-target"><span>木模</span></div>}
        {(phase === "dough" || phase === "press") && <button className={"rice-dough " + (phase === "press" ? "pressed" : "")} data-testid="rice-dough" aria-label="拖动或按压米团入模" style={phase === "press" ? undefined : { transform: `translate(${offset.x}px,${offset.y}px)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); setPhase("press"); } }} />}
        {phase === "strike" && <>
          <div key={hits} className={hits > 0 ? "mould-weight" : ""} />
          <button className="mallet" data-testid="mallet" aria-label="轻敲木模，三次脱模" style={{ transform: `translate(${offset.x}px,${offset.y}px) rotate(-16deg)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); hit(); } }}><img src="/assets/new-year/mallet.webp" alt="小木槌" draggable={false} /></button>
        </>}
        {(hits >= 2 && !inHouse) && <img className={"peach " + (hits === 2 ? "peach-loosening" : "peach-released")} src="/assets/new-year/peach.webp" alt={hits === 2 ? "边缘刚刚松动的食桃" : "完整脱模的食桃"} />}
        {phase === "red" && <button className="dot-red" aria-label="点一点朱红" onClick={() => setPhase("red-rest")}><span className="sr-only">点一点朱红</span></button>}
        {phase === "red-rest" && <span className="red-point vermilion-spread" />}
        {phase === "pages" && <div className="year-page-gesture" role="group" aria-label="左右轻推，走进年里" tabIndex={0}
          onPointerDown={down} onPointerMove={move} onPointerCancel={cancel} onPointerUp={e => { if (origin.current) { const dx = e.clientX - origin.current.x; if (dx < -45) pageForward(); else if (dx > 45) setShot(Math.max(0, shot - 1)); } cancel(); }}
          onKeyDown={e => { if (e.key === "ArrowRight") { e.preventDefault(); pageForward(); } else if (e.key === "ArrowLeft") { e.preventDefault(); setShot(Math.max(0, shot - 1)); } }} />}
        {inHouse && <div className="year-caption">{["写楹联", "天井里的光", "一家人，围坐一席年宴"][shot]}</div>}
      </div>
      {!quiet && !inHouse && <div className="stage-hint">{phase === "dough" ? "把米团，轻轻压入木模" : phase === "press" ? "米团贴进纹样" : phase === "strike" ? ["轻敲木模，感受它的分量", "再一下，年礼慢慢松动", "最后一下，把年礼敲出来"][hits] : "点一点朱红"}</div>}
    </Stage>
    {phase === "pages" && <button className="year-step" onClick={pageForward}>{["轻推，走进天井", "轻推，围坐年宴", "把这一席年留在心里"][shot]}<span aria-hidden> →</span></button>}
    {phase === "reflection" && beat > 0 && <div className="year-reflection" role="status"><p>你刚才不是看了一段年俗介绍。</p>{beat === 2 && <p className="second-beat">而是亲手把“年”，一步一步做出来。</p>}</div>}
    {action.done && <><StationFinish id="year" /><div className="water-route">南屏 <svg viewBox="0 0 140 20"><path d="M0 10 Q25 0 50 10 T100 10 T140 10" /></svg> 宏村</div></>}
    <StationTools done={action.done} quiet={quiet || phase === "reflection"} progressKey={phase + hits + shot} onInfo={onInfo}
      onRetry={() => { action.retry(); setPhase("dough"); setShot(0); setHits(0); setBeat(0); lastHit.current = -Infinity; }}
      onAssist={() => { if (phase === "dough") setPhase("press"); else if (phase === "strike") hit(); else if (phase === "red") setPhase("red-rest"); else if (phase === "pages") pageForward(); }}
      assistLabel={phase === "dough" ? "辅助压入木模" : phase === "strike" ? "辅助轻敲一次" : phase === "red" ? "辅助点朱" : "轻推这一页"} />
  </>;
}

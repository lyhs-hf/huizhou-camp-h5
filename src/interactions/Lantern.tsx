import { asset } from "../utils/asset";
import { decodeImages } from "../utils/decodeImage";
import { useState, useRef, useEffect, type PointerEvent } from "react";
import { useInteraction } from "../hooks/useInteraction";
import {
  StationHeader,
  StationFinish,
  StationTools,
  Stage,
} from "../components/Station";
export function Lantern({ onInfo, onMother }: { onInfo: () => void; onMother: () => void }) {
  const action = useInteraction("lantern", "灯", "fish_lantern");
  const [phase, setPhase] = useState(action.done ? 3 : 0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState(0);
  const [holding, setHolding] = useState(false);
  const [brushMarks, setBrushMarks] = useState<string[]>([]);
  const brush = useRef<SVGSVGElement>(null);
  const complete = action.complete;
  useEffect(() => {
    void decodeImages(["unpainted.webp", "lit-unpainted.webp", "night-hand.webp", "lit-final.webp", "mother-theatre-tea.webp"].map(file=>asset("assets/lantern/"+file)));
  }, []);
  useEffect(() => {
    if (phase !== 3 || action.done) return;
    const image = new Image(); image.src = asset("assets/lantern/mother-theatre-tea.webp");
    const rest = setTimeout(() => { complete(); }, 4200);
    return () => clearTimeout(rest);
  }, [phase, action.done, complete, onMother]);
  const resting = phase === 3 && !action.done;
  const origin = useRef<{ x: number; y: number } | null>(null);
  const target = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prev = useRef<{x:number;y:number} | null>(null);
  const finishTouch = useRef<{id:number;x:number;y:number} | null>(null);
  const suppressFinishClick = useRef(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function paperDown(e: PointerEvent) {
    if (!e.isPrimary || origin.current) return;
    e.preventDefault();
    action.start();
    origin.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function paperMove(e: PointerEvent) {
    if (!origin.current) return;
    setDrag({
      x: e.clientX - origin.current.x,
      y: e.clientY - origin.current.y,
    });
  }
  function paperUp(e: PointerEvent) {
    if (!origin.current) return;
    const r = target.current!.getBoundingClientRect();
    if (
      e.clientX > r.left - 20 &&
      e.clientX < r.right + 20 &&
      e.clientY > r.top - 20 &&
      e.clientY < r.bottom + 20
    )
      setPhase(1);
    origin.current = null;
    setDrag({ x: 0, y: 0 });
    action.unlock();
  }
  function paint(e: PointerEvent) {
    if (!prev.current) return;
    const matrix = brush.current?.getScreenCTM();
    if (!matrix) return;
    const events=e.nativeEvent.getCoalescedEvents?.()??[];
    for(const event of events.length?events:[e]) {
      const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
      const distance=Math.hypot(event.clientX-prev.current.x,event.clientY-prev.current.y);
      prev.current={x:event.clientX,y:event.clientY};
      setBrushMarks(m=>[...m.slice(0,-1),m.at(-1)+` L${p.x} ${p.y}`]);
      // Participation controls only when the user may put the brush down.
      // Colour is exclusively revealed by the actual path mask below.
      setColor(c=>Math.min(1,c+distance/100));
    }
  }
  function putBrushDown(){prev.current=null;action.unlock();setPhase(2);}
  function holdStart(e: PointerEvent) {
    if (!e.isPrimary || holding) return;
    e.preventDefault();
    action.start();
    e.currentTarget.setPointerCapture(e.pointerId);
    setHolding(true);
    timer.current = setTimeout(() => {
      setPhase(3);
      setHolding(false);

    }, 600);
  }
  function holdEnd() {
    if (timer.current) clearTimeout(timer.current);
    setHolding(false);
    action.unlock();
  }
  function assist() {
    action.start();
    if (phase === 0) setPhase(1);
    else if (phase === 1) {
      if(color>.3)putBrushDown();
    } else {
      setPhase(3);

    }
    action.unlock();
  }
  function retry() {
    holdEnd();
    action.retry();
    setPhase(0);
    setColor(0);
    setBrushMarks([]);
  }
  return (
    <>
    <StationHeader id="lantern" quiet={resting} introduce={phase === 0} />
      <Stage className={"lantern-stage phase-" + phase + (resting ? " visual-rest" : "")}>
        <img className="lantern-worktable" src={asset("assets/directors-cut/lantern-worktable.webp")} alt="" aria-hidden/>
        {phase === 3 && <svg className="lantern-reflection" viewBox="0 0 300 360" preserveAspectRatio="none" aria-hidden><defs><radialGradient id="lantern-warmth"><stop stopColor="#e6a452" stopOpacity=".52"/><stop offset="1" stopColor="#d49b51" stopOpacity="0"/></radialGradient></defs><ellipse cx="145" cy="190" rx="125" ry="130" fill="url(#lantern-warmth)"/><path d="M130 160 L110 335 L195 335 L178 160Z" fill="url(#lantern-warmth)" opacity=".4"/></svg>}
        <div
          ref={target}
          className="lantern-target"
          data-testid="lantern-target"
        >
          <svg className="fish-material" viewBox="0 0 780 390" preserveAspectRatio="none" role="img" aria-label={phase===0?"鳌鱼鱼灯竹篾骨架":phase===3?"暖光透过手绘鱼灯":"纸面贴合的鳌鱼鱼灯"}>
            <defs>
              <mask id="fish-wrap" maskUnits="userSpaceOnUse" x="0" y="0" width="780" height="390" style={{maskType:"alpha"}}><ellipse className={"paper-wrap " + (phase>0?"wrapped":"")} cx="390" cy="195" rx="440" ry="230" fill="white"/></mask>
              <mask id="fish-paint" maskUnits="userSpaceOnUse" x="0" y="0" width="780" height="390" style={{maskType:"alpha"}}>{brushMarks.map((d,i)=><path key={i} d={d} fill="none" stroke="white" strokeWidth="44" className={phase>=2?"brush-settled":""} strokeLinecap="round"/>)}</mask>
            </defs>
            <image href={asset("assets/lantern/skeleton-final.webp")} width="780" height="390" className="fish-bone" style={{opacity:phase===0?1:0}}/>
            <g mask="url(#fish-wrap)">
              {/* The untouched paper is truly neutral pixels, independent of Safari SVG CSS filters. */}
              <image href={asset("assets/lantern/unpainted.webp")} width="780" height="390" data-testid="unpainted-paper"/>
              {brushMarks.length>0&&<image href={asset("assets/lantern/unlit.webp")} width="780" height="390" mask="url(#fish-paint)" data-testid="painted-paper"/>}
              <image href={asset("assets/lantern/lit-unpainted.webp")} width="780" height="390" className="fish-warm-light" style={{opacity:phase===3?1:0}}/>
              {brushMarks.length>0&&<image href={asset("assets/lantern/lit-final.webp")} width="780" height="390" mask="url(#fish-paint)" className="fish-warm-light" style={{opacity:phase===3?1:0}}/>}
            </g>
          </svg>
              {phase === 1 && <svg ref={brush} className="paint-guide" data-testid="paint" viewBox="0 0 780 390" preserveAspectRatio="none" role="button" tabIndex={0} aria-label="轻划灯纸，为鱼灯添色"
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setBrushMarks(m => [...m, `M80 ${100 + m.length * 90} H700`]); setColor(c => Math.min(1,c+.34)); } }}
                onPointerDown={e => { if(!e.isPrimary||prev.current!==null)return;e.preventDefault();action.start(); prev.current = {x:e.clientX,y:e.clientY}; e.currentTarget.setPointerCapture(e.pointerId); const m = e.currentTarget.getScreenCTM(); if (m) { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); setBrushMarks(v => [...v, `M${p.x} ${p.y}`]); } }} onPointerMove={paint} onPointerUp={e => { paint(e); prev.current = null; action.unlock(); }} onPointerCancel={() => { prev.current = null; action.unlock(); }} onLostPointerCapture={()=>{if(prev.current!==null){prev.current=null;action.unlock();}}} />}
        </div>
        {phase === 0 && (
          <button
            className="paper-piece"
            aria-label="拖动灯纸覆上灯骨"
            data-testid="paper"
            style={{ transform: `translate(${drag.x}px,${drag.y}px)` }}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPhase(1); } }}
            onPointerDown={paperDown}
            onPointerMove={paperMove}
            onPointerUp={paperUp}
            onLostPointerCapture={()=>{if(origin.current){origin.current=null;setDrag({x:0,y:0});action.unlock();}}}
            onPointerCancel={() => {
              origin.current = null;
              setDrag({ x: 0, y: 0 });
              action.unlock();
            }}
          >
            <img
              src={asset("assets/directors-cut/production-paper.webp")}
              alt="半透明灯纸"
              draggable={false}
            />
            <span>灯纸</span>
          </button>
        )}
        {phase===1&&color>.3&&<button className="material-finish lantern-brush-finish"
          onPointerDown={e=>{suppressFinishClick.current=e.pointerType==="touch";if(e.pointerType!=="touch"||!e.isPrimary)return;e.preventDefault();finishTouch.current={id:e.pointerId,x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);}}
          onPointerUp={e=>{const start=finishTouch.current;if(!start||start.id!==e.pointerId)return;e.preventDefault();finishTouch.current=null;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)<=12)putBrushDown();}}
          onPointerCancel={()=>{finishTouch.current=null;}}
          onLostPointerCapture={()=>{finishTouch.current=null;}}
          onClick={e=>{if(e.detail===0||!suppressFinishClick.current)putBrushDown();suppressFinishClick.current=false;}}>收好这一笔颜色</button>}
        {phase === 2 && (
          <button
            className={"light-button " + (holding ? "holding" : "")}
            onPointerDown={holdStart}
            onPointerUp={holdEnd}
            onPointerCancel={holdEnd}
            onLostPointerCapture={holdEnd}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setPhase(3);
          
              }
            }}
            aria-label="长按600毫秒点亮鱼灯"
          >
            长按，点亮它
            <span />
          </button>
        )}
        {phase < 3 && !(phase === 1 && color > 0) && (
          <div className="stage-hint">
            {
              [
                "轻轻覆上灯纸",
                "轻划灯纸，给它添一点颜色",
                "让灯火，从里面慢慢亮起",
              ][phase]
            }
          </div>
        )}
      </Stage>
      {action.done ? (
        <StationFinish id="lantern" onInfo={onInfo}/>
      ) : !resting ? (
        <p className="interaction-note">
          一张纸，一点颜色，
          <br />
          把手里的灯，交给夜晚。
        </p>
      ) : null}
      {action.done && <button className="mother-perspective" onClick={onMother}><img src={asset("assets/lantern/mother-theatre-tea.webp")} alt="古戏台的一盏茶"/>妈妈这一刻 <span aria-hidden>→</span></button>}
      <StationTools
        progressKey={phase}
        quiet={resting}
        done={action.done}
        onRetry={retry}
        onAssist={assist}
        onInfo={onInfo}
        assistLabel={
          ["轻点，覆上灯纸", "轻点，添上颜色", "轻点，点亮鱼灯"][phase]
        }
      />
    </>
  );
}

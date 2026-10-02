import { asset } from "../utils/asset";
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
    for (const file of ["night-hand.webp", "lit-final.webp", "mother-theatre-tea.webp"]) {
      const image = new Image(); image.src = asset("assets/lantern/" + file);
    }
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
  const prev = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function paperDown(e: PointerEvent) {
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
    if (prev.current === null) return;
    const matrix = brush.current?.getScreenCTM();
    if (matrix) {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
      setBrushMarks(m => [...m.slice(0, -1), m.at(-1) + ` L${p.x} ${p.y}`]);
    }
    const distance = Math.abs(e.clientX - prev.current);
    prev.current = e.clientX;
    setColor((c) => {
      const next = Math.min(1, c + distance / 180);
      if (next === 1) setPhase(2);
      return next;
    });
  }
  function holdStart(e: PointerEvent) {
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
      setColor(1);
      setPhase(2);
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
          {phase === 0 ? (
            <img
              src={asset("assets/lantern/skeleton-final.webp")}
              alt="鳌鱼鱼灯竹篾骨架"
              draggable={false}
            />
          ) : (
            <>
              {phase === 1 ? <svg className="painted-paper" viewBox="0 0 780 390" preserveAspectRatio="none" aria-hidden><defs><mask id="fish-paint"><rect width="780" height="390" fill="black"/>{brushMarks.map((d, i) => <path key={i} d={d} fill="none" stroke="white" strokeWidth="115" strokeLinecap="round"/>)}</mask></defs><image href={asset("assets/lantern/unlit.webp")} width="780" height="390" style={{ filter: "grayscale(1)" }}/><image href={asset("assets/lantern/unlit.webp")} width="780" height="390" mask="url(#fish-paint)"/></svg> : <img
                className="lantern-base"
                style={{ filter: `grayscale(${phase >= 2 ? 0 : 1 - color})` }}
                src={asset("assets/lantern/unlit.webp")}
                alt="纸面贴合的鳌鱼鱼灯"
                draggable={false}
              />}
              <img
                className="lantern-color"
                style={{ opacity: phase === 3 ? 1 : 0 }}
                src={asset("assets/lantern/lit-final.webp")}
                alt="暖光透过手绘鱼灯"
                draggable={false}
              />
              {phase === 1 && <svg ref={brush} className="paint-guide" data-testid="paint" viewBox="0 0 780 390" preserveAspectRatio="none" role="button" tabIndex={0} aria-label="轻划灯纸，为鱼灯添色"
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setBrushMarks(m => [...m, `M80 ${100 + m.length * 90} H700`]); setColor(c => { const n = Math.min(1, c + .34); if (n === 1) setPhase(2); return n; }); } }}
                onPointerDown={e => { action.start(); prev.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId); const m = e.currentTarget.getScreenCTM(); if (m) { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); setBrushMarks(v => [...v, `M${p.x} ${p.y}`]); } }} onPointerMove={paint} onPointerUp={e => { paint(e); prev.current = null; action.unlock(); }} onPointerCancel={() => { prev.current = null; action.unlock(); }} />}
            </>
          )}
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
            onPointerCancel={() => {
              origin.current = null;
              setDrag({ x: 0, y: 0 });
              action.unlock();
            }}
          >
            <img
              src={asset("assets/lantern/paper.webp")}
              alt="半透明灯纸"
              draggable={false}
            />
            <span>灯纸</span>
          </button>
        )}
        {phase === 2 && (
          <button
            className={"light-button " + (holding ? "holding" : "")}
            onPointerDown={holdStart}
            onPointerUp={holdEnd}
            onPointerCancel={holdEnd}
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
        <StationFinish id="lantern" />
      ) : !resting ? (
        <p className="interaction-note">
          一张纸，一点颜色，
          <br />
          把手里的灯，交给夜晚。
        </p>
      ) : null}
      {action.done && <button className="mother-perspective" onClick={onMother}>同一时间，看看妈妈这一刻</button>}
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

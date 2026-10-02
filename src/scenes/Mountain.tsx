import { asset } from "../utils/asset";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useJourney } from "../app/JourneyContext";
import { useReducedMotion } from "../hooks/useInteraction";
type Shot = "near" | "cloud" | "summit" | "caption";
export function Mountain({ onRest }: { onRest: (value: boolean) => void }) {
  const { dispatch } = useJourney();
  const reduced = useReducedMotion();
  const [shot, setShot] = useState<Shot>("near");
  const [push, setPush] = useState(0);
  const [settled, setSettled] = useState(false);
  const hand = useRef<{ y: number; distance: number } | null>(null);
  const moving = useRef(false);
  const cloud = useRef<SVGSVGElement>(null);
  const peaks = useRef<HTMLImageElement>(null);
  useEffect(() => {
    onRest(!settled);
  }, [settled, onRest]);
  useEffect(() => {
    const image = new Image(); image.src = asset("assets/mountain/panorama.webp");
  }, []);
  useEffect(() => {
    if (shot === "near") return;
    if (shot === "summit") {
      const began = performance.now();
      let frame = 0, clearFrames = 0;
      let quietTimer: ReturnType<typeof setTimeout> | undefined;
      const watchArrival = () => {
        // Start stillness after the world is visibly clear, rather than from
        // React's phase change. A busy phone can paint the cloud fade late.
        const visible = performance.now() - began >= (reduced ? 0 : 1200)
          && cloud.current && Number(getComputedStyle(cloud.current).opacity) <= .01
          && peaks.current?.complete && peaks.current.naturalWidth > 0;
        clearFrames = visible ? clearFrames + 1 : 0;
        if (clearFrames >= 2) quietTimer = setTimeout(() => setShot("caption"), 3200);
        else frame = requestAnimationFrame(watchArrival);
      };
      frame = requestAnimationFrame(watchArrival);
      return () => { cancelAnimationFrame(frame); clearTimeout(quietTimer); };
    }
    const timer = setTimeout(() => {
      if (shot === "cloud") setShot("summit");
      else setSettled(true);
    }, shot === "cloud" ? (reduced ? 700 : 2600) : 1200);
    return () => clearTimeout(timer);
  }, [shot, reduced]);
  useEffect(() => () => { dispatch({ type: "lock", value: false }); }, [dispatch]);
  function enterCloud() {
    if (moving.current) return;
    moving.current = true; setPush(1); setShot("cloud");
    hand.current = null; dispatch({ type: "lock", value: false });
  }
  function move(e: PointerEvent) {
    if (!hand.current) return;
    hand.current.distance = Math.max(0, hand.current.y - e.clientY);
    setPush(Math.min(.65, hand.current.distance / 250));
  }
  return <div className={"cloud-arrival shot-"+shot+(settled?" arrival-settled":"")} data-shot={shot} data-interaction>
    <div className="cloud-camera" role={shot==="near"?"button":"group"} tabIndex={shot==="near"?0:-1} aria-label={shot==="near"?"向上推开近景，穿过云层":shot==="cloud"?"正在穿过云层":"黄山群峰的静观时刻"} data-testid="cloud-camera"
      onPointerDown={e=>{if(shot!=="near")return;dispatch({type:"lock",value:true});hand.current={y:e.clientY,distance:0};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={move} onPointerUp={e=>{move(e);if((hand.current?.distance??0)>=70)enterCloud();else {hand.current=null;setPush(0);dispatch({type:"lock",value:false});}}}
      onPointerCancel={()=>{hand.current=null;setPush(0);dispatch({type:"lock",value:false});}}
      onKeyDown={e=>{if(shot==="near"&&["ArrowUp","Enter"," "].includes(e.key)){e.preventDefault();enterCloud();}}}>
      <img ref={peaks} className="arrival-peaks" src={asset("assets/mountain/panorama.webp")} alt="穿云之后，黄山冬日群峰第一次完整展开" draggable={false}/>
      <div className="arrival-near" style={{transform:reduced?undefined:`translateY(${push*90}px) scale(${1+push*.12})`}}><img src={asset("assets/directors-cut/mountain-near.webp")} alt="残雪山路、近处的岩石与松枝" draggable={false}/></div>
      <img className="arrival-pine" src={asset("assets/directors-cut/forest-foreground.webp")} alt="" style={{transform:reduced?undefined:`translateY(${push*270}px) scale(${1+push*.25})`}} aria-hidden/>
      <div className="cloud-whiteout" aria-hidden/>
      <svg ref={cloud} className="arrival-cloud" viewBox="0 0 390 844" preserveAspectRatio="none" style={{opacity:shot==="near"?push*.78:undefined}} aria-hidden>
        <defs><linearGradient id="cloud-depth" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#e8eeed" stopOpacity=".1"/><stop offset=".5" stopColor="#edf1ef" stopOpacity=".98"/><stop offset="1" stopColor="#e7eeec" stopOpacity=".4"/></linearGradient><filter id="cloud-edge" x="-30%" y="-20%" width="160%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".009 .014" numOctaves="2" seed="8" result="mist"/><feDisplacementMap in="SourceGraphic" in2="mist" scale="65"/><feGaussianBlur stdDeviation="8"/></filter></defs>
        <defs><filter id="fog-density" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .008" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values=".26 0 0 0 .71 .26 0 0 0 .75 .26 0 0 0 .74 0 0 0 0 1"/><feGaussianBlur stdDeviation="3"/></filter></defs>
        <g filter="url(#cloud-edge)">{[0,1,2].map(i=><path key={i} className={"cloud-bank cloud-bank-"+i} d={`M-250 ${-120+i*170} Q50 ${-210+i*130} 450 ${-80+i*170} T800 ${-120+i*170} V${820+i*180} H-250Z`} fill="url(#cloud-depth)"/>)}</g>
        <rect className="cloud-density" x="-100" y="-180" width="600" height="1250" filter="url(#fog-density)" opacity=".8"/>
      </svg>
    </div>
    {shot==="near"&&<p className="cloud-invitation">再往前，是云。<br/><small>向上轻推，走进去</small></p>}
    {shot==="caption"&&<div className="arrival-caption"><h1>从徽州人间，<br/>走到黄山云端。</h1>{settled&&<p>DAY 4 · 玉屏 · 迎客松 · 北海<br/>DAY 5 · 黄山冬日 · 日出可选</p>}</div>}
    {shot!=="caption"&&<h1 className="sr-only">穿过云层，抵达黄山</h1>}
  </div>;
}

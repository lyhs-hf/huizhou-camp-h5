import { asset } from "../utils/asset";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useJourney } from "../app/JourneyContext";
import { useReducedMotion } from "../hooks/useInteraction";
type Shot = "near" | "cloud" | "summit" | "caption";
export function Mountain({ onRest,onSummit }: { onRest: (value: boolean) => void;onSummit:(value:boolean)=>void }) {
  const { dispatch } = useJourney();
  const reduced = useReducedMotion();
  const [shot, setShot] = useState<Shot>("near");
  const [push, setPush] = useState(0);
  const [settled, setSettled] = useState(false);
  const hand = useRef<{ y: number; distance: number } | null>(null);
  const moving = useRef(false);
  const cloud = useRef<SVGSVGElement>(null);
  const peaks = useRef<HTMLImageElement>(null);
  useEffect(()=>{onSummit(shot==="summit"||shot==="caption");},[shot,onSummit]);
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
      onPointerDown={e=>{if(shot!=="near"||hand.current||!e.isPrimary)return;e.preventDefault();dispatch({type:"lock",value:true});hand.current={y:e.clientY,distance:0};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={move} onPointerUp={e=>{if(!hand.current)return;move(e);if((hand.current?.distance??0)>=70)enterCloud();else {hand.current=null;setPush(0);dispatch({type:"lock",value:false});}}}
      onPointerCancel={()=>{hand.current=null;setPush(0);dispatch({type:"lock",value:false});}}
      onLostPointerCapture={()=>{if(hand.current){hand.current=null;setPush(0);dispatch({type:"lock",value:false});}}}
      onKeyDown={e=>{if(shot==="near"&&["ArrowUp","Enter"," "].includes(e.key)){e.preventDefault();enterCloud();}}}>
      <img ref={peaks} className="arrival-peaks" src={asset("assets/mountain/panorama.webp")} alt="穿云之后，黄山冬日群峰第一次完整展开" draggable={false}/>
      <div className="arrival-near" style={{transform:reduced?undefined:`translateY(${push*90}px) scale(${1+push*.12})`}}><img src={asset("assets/directors-cut/mountain-near.webp")} alt="残雪山路、近处的岩石与松枝" draggable={false}/></div>
      <img className="arrival-pine" src={asset("assets/directors-cut/forest-foreground.webp")} alt="" style={{transform:reduced?undefined:`translateY(${push*270}px) scale(${1+push*.25})`}} aria-hidden/>
      {(shot==="summit"||shot==="caption")&&<svg className="summit-atmosphere" viewBox="0 0 860 1528" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs><linearGradient id="summit-vapor" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#eef2ed" stopOpacity="0"/><stop offset=".5" stopColor="#eef2ed" stopOpacity=".35"/><stop offset="1" stopColor="#eef2ed" stopOpacity="0"/></linearGradient><mask id="summit-depth"><rect width="860" height="1528" fill="white"/><path d="M0 0H860V390H0Z M0 650 Q220 630 330 980 Q350 1290 440 1528H0Z" fill="black"/></mask></defs>
        <g mask="url(#summit-depth)" fill="url(#summit-vapor)">
          <path className="valley-cloud distant-cloud" d="M-80 520Q230 450 460 550T980 530V710Q610 620 430 660T-80 640Z"/>
          <path className="valley-cloud close-cloud" d="M250 890Q520 760 740 870T1060 810V1200Q850 1050 690 1100T250 1020Z"/>
        </g>
      </svg>}
      <svg ref={cloud} className="arrival-cloud" viewBox="0 0 390 844" preserveAspectRatio="none" style={{opacity:shot==="near"?push*.78:undefined}} aria-hidden>
        <defs>
          <radialGradient id="cloud-soft"><stop stopColor="#eef0e9" stopOpacity=".86"/><stop offset=".4" stopColor="#d9e2df" stopOpacity=".68"/><stop offset="1" stopColor="#b3c7c8" stopOpacity="0"/></radialGradient>
          <radialGradient id="cloud-shadow"><stop stopColor="#93b1b7" stopOpacity=".3"/><stop offset="1" stopColor="#a2bab9" stopOpacity="0"/></radialGradient>
        </defs>
        {[0,1,2,3].map(i=><g key={i} className={"cloud-bank cloud-bank-"+i}>
          <ellipse cx={i%2?330:60} cy={180+i*170} rx="410" ry="240" fill="url(#cloud-soft)"/>
          <ellipse cx={i%2?20:360} cy={260+i*170} rx="290" ry="180" fill="url(#cloud-shadow)"/>
        </g>)}
      </svg>
      {(shot==="summit"||shot==="caption")&&<img className="summit-pine" src={asset("assets/directors-cut/forest-foreground.webp")} alt="" aria-hidden/>}

    </div>
    {shot==="near"&&<p className="cloud-invitation">再往前，是云。<br/><small>向上轻推，走进去</small></p>}
    {shot==="caption"&&<div className="arrival-caption"><h1>从徽州人间，<br/>走到黄山云端。</h1>{settled&&<p>DAY 4 · 玉屏 · 迎客松 · 北海<br/>DAY 5 · 黄山冬日 · 日出可选</p>}</div>}
    {shot!=="caption"&&<h1 className="sr-only">穿过云层，抵达黄山</h1>}
  </div>;
}

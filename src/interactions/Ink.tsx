import { asset } from "../utils/asset";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { useInteraction } from "../hooks/useInteraction";
import { useJourney } from "../app/JourneyContext";
import { coverStroke } from "../utils/strokeCoverage.mjs";
import { Stage, StationHeader, StationFinish, StationTools } from "../components/Station";
const segments = [
  "M315 1008 C324 970 344 939 374 923 C395 915 418 904 440 885 C475 867 503 847 490 818 L455 788",
  "M455 788 C421 766 397 749 410 721 C418 699 446 686 462 670 C495 643 503 620 484 598 L430 569",
  "M430 569 C400 561 390 547 405 530 C429 502 469 481 493 453 C523 420 510 405 483 385 L443 351",
];
type Phase = "discover" | "trace" | "rest" | "done";
export function Ink({ onInfo }: { onInfo: () => void }) {
  const action = useInteraction("ink", "墨", "ink");
  const { state, dispatch } = useJourney();
  const [phase, setPhase] = useState<Phase>(action.done ? "done" : "discover");
  const [angle, setAngle] = useState(0);
  const [covered, setCovered] = useState<number[][]>(action.done ? state.inkGold : [[],[],[]]);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const [materialPoints,setMaterialPoints]=useState<{x:number;y:number}[][]>([]);
  useLayoutEffect(()=>{setMaterialPoints(paths.current.map(path=>path?Array.from({length:40},(_,i)=>{const p=path.getPointAtLength(path.getTotalLength()*i/39);return{x:p.x,y:p.y};}):[]));},[]);
  const bins = useRef(state.inkGold.map(branch => new Set(branch)));
  const previous = useRef<{x:number;y:number}|null>(null);
  const hand = useRef<{x:number;last:number;distance:number}|null>(null);
  const complete = action.complete;
  useEffect(()=>{if(phase!=="rest")return;dispatch({type:"inkGold",value:covered});const timer=setTimeout(()=>{setPhase("done");complete();},2600);return()=>clearTimeout(timer);},[phase,complete,covered,dispatch]);
  function revealMaterial() {
    setCovered(bins.current.map(branch => [...branch]));
    if (bins.current.every(branch => branch.size >= 30)) {
      setAngle(0); setPhase("rest"); hand.current=null; previous.current=null; action.unlock();
    }
  }
  function move(e:PointerEvent) {
    if(!hand.current)return;
    hand.current.distance+=Math.abs(e.clientX-hand.current.last);hand.current.last=e.clientX;
    if(phase==="discover"){setAngle(Math.max(-5,Math.min(5,(e.clientX-hand.current.x)/10)));return;}
    if(phase!=="trace")return;
    const matrix=paths.current[0]?.getScreenCTM();if(!matrix)return;
    const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());
    // All relief belongs to one object. Crossing a branch must never release
    // the hand or require an invisible ordering / a new pointerdown.
    const radius = Math.max(26, 16 / Math.hypot(matrix.a, matrix.b));
    materialPoints.forEach((samples, i) => coverStroke(samples, previous.current??p, p, radius, bins.current[i]));
    previous.current=p; revealMaterial();
  }
  function cancel(){hand.current=null;previous.current=null;action.unlock();}
  function release(){if(hand.current&&phase==="discover"&&hand.current.distance>=45){setAngle(0);setPhase("trace");}cancel();}
  function assist(){if(phase==="discover"){setAngle(0);setPhase("trace");}else if(phase==="trace"){
    const branch=bins.current.findIndex(b=>b.size<30);
    if(branch>=0)bins.current[branch]=new Set(Array.from({length:40},(_,n)=>n));
    revealMaterial();
  }action.unlock();}
  const quiet=phase==="rest";
  return <>
    <StationHeader id="ink" quiet={quiet} introduce={phase==="discover"}/>
    <Stage className={"ink-stage ink-world phase-"+phase+(quiet?" visual-rest":"")}>
      <div className="ink-object" style={{transform:`rotate(${angle}deg) scale(${quiet||action.done?1.06:1})`}}>
        <img src={asset("assets/ink/ink.webp")} alt="侧光里浮现松枝凸纹的徽墨墨锭" draggable={false}/>
        <svg viewBox="0 0 780 1170" className="ink-trace" data-testid="ink-path" data-phase={phase} role="button" tabIndex={quiet||action.done?-1:0} aria-label={phase==="discover"?"轻转墨锭，发现凸纹":"沿凸纹轻描，金留在指尖走过的地方"}
          onPointerDown={e=>{if(quiet||action.done||hand.current||!e.isPrimary)return;e.preventDefault();action.start();previous.current=null;hand.current={x:e.clientX,last:e.clientX,distance:0};e.currentTarget.setPointerCapture(e.pointerId);move(e);}}
          onPointerMove={move} onPointerUp={e=>{move(e);release();}} onPointerCancel={()=>{hand.current=null;previous.current=null;action.unlock();}}
          onLostPointerCapture={cancel}
          onKeyDown={e=>{if(phase==="discover"&&["ArrowLeft","ArrowRight"].includes(e.key)){e.preventDefault();setAngle(e.key==="ArrowLeft"?-5:5);}if(e.key==="Enter"&&!quiet&&!action.done){e.preventDefault();assist();}}}>
          <defs><linearGradient id="ink-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8f7142"/><stop offset=".35" stopColor="#d8be7e"/><stop offset=".62" stopColor="#b7985c"/><stop offset="1" stopColor="#ddca95"/></linearGradient>
            {segments.map((_,i)=><mask key={i} id={"ink-leaf-"+i}><rect width="780" height="1170" fill="black"/>{covered[i].map(n=>{const p=materialPoints[i]?.[n];return p && <circle key={n} cx={p.x} cy={p.y} r="8" fill="white"/>;})}</mask>)}
          </defs>
          {segments.map((d,i)=><g key={d}><path ref={el=>{paths.current[i]=el;}} d={d} className="trace-guide" data-segment={i} style={{opacity:phase==="trace"&&covered[i].length<30?1:0}}/><path d={d} className="gold-line" mask={`url(#ink-leaf-${i})`} style={{opacity:phase==="discover"?0:1,stroke:"url(#ink-metal)"}}/></g>)}
        </svg>
        <div className={"ink-side-light "+(quiet?"sweeping":"")} style={{maskImage:`url(${asset("assets/ink/ink.webp")})`,maskSize:"contain",maskRepeat:"no-repeat",maskPosition:"center",opacity:quiet?undefined:Math.abs(angle)/12,transform:quiet?undefined:`translateX(${angle*7}%)`}}/>
      </div>
      {!quiet&&!action.done&&<div className="stage-hint">{phase==="discover"?"轻轻转动，侧光会找到纹样":"顺着亮起的凸纹描金，可以抬手接着描"}</div>}
    </Stage>
    {action.done&&<StationFinish id="ink"/>}
    <StationTools done={action.done} quiet={quiet} progressKey={phase+covered.map(b=>b.length).join(",")} onInfo={onInfo} onRetry={()=>{action.retry();setPhase("discover");setAngle(0);bins.current=[new Set(),new Set(),new Set()];previous.current=null;hand.current=null;setCovered([[],[],[]]);}} onAssist={assist} assistLabel={phase==="discover"?"让侧光显出凸纹":"帮助留下这一枝金纹"}/>
  </>;
}

import { asset } from "../utils/asset";
import { useEffect, useRef, useState, type PointerEventHandler, type RefObject } from "react";
import { useReducedMotion } from "../hooks/useInteraction";

const soft = [100,50,65,40,45,60,42,92,20,130,30,190,60,210,85,230,125,230,150,208,190,188,188,120,166,90,151,63,133,41,100,50];
const formed = [100,20,80,49,44,57,38,91,12,134,29,193,60,215,85,241,127,241,154,215,180,193,186,132,162,91,145,58,120,50,100,20];
function contour(amount: number) {
  const p = soft.map((n,i)=>n+(formed[i]-n)*amount);
  return `M${p[0]} ${p[1]} ` + Array.from({length:5},(_,i)=>"C"+p.slice(2+i*6,8+i*6).join(" ")).join(" ")+"Z";
}
type RiceProps = { amount?:number;red?:boolean;name?:string };
export function RicePeach(props:RiceProps) {
  return <svg viewBox="0 0 200 250" className="rice-material" aria-hidden><RiceSurface {...props}/></svg>;
}
function RiceSurface({ amount=1, red=false, name="rice" }:RiceProps) {
  return <>
    <defs><clipPath id={name+"-shape"}><path d={contour(amount)}/></clipPath></defs>
    <path d={contour(amount)} transform="translate(2 4)" fill="#726047" opacity=".35"/>
    <g clipPath={`url(#${name}-shape)`}>
      <image href={asset("assets/directors-cut/production-rice.webp")} x="-10" y="-13" width="220" height="280" preserveAspectRatio="none" style={{filter:amount<.98?`blur(${(1-amount)*7}px)`:undefined}}/>
    </g>
    {red&&<g className="rice-vermilion"><circle cx="101" cy="125" r="8" fill="#ad362c" opacity=".7"/><circle cx="99" cy="123" r="5.5" fill="#c54c3b" opacity=".65"/></g>}
  </>;
}

interface Props {
  phase:string;hits:number;offset:{x:number;y:number};held:boolean;
  mould:RefObject<HTMLDivElement|null>;
  down:PointerEventHandler<HTMLButtonElement>;move:PointerEventHandler<HTMLButtonElement>;up:PointerEventHandler<HTMLButtonElement>;
  cancel:()=>void;press:()=>void;hit:()=>void;dot:()=>void;
}
export function YearCraft({phase,hits,offset,held,mould,down,move,up,cancel,press,hit,dot}:Props) {
  const reduced=useReducedMotion();
  const [material,setMaterial]=useState(0);
  const frame=useRef(0);
  useEffect(()=>{
    if(phase!=="press")return;
    if(reduced){setMaterial(1);return;}
    const start=performance.now();
    const soften=(now:number)=>{const t=Math.max(0,Math.min(1,(now-start)/500));setMaterial(1-(1-t)**3);if(t<1)frame.current=requestAnimationFrame(soften);};
    frame.current=requestAnimationFrame(soften);
    return()=>cancelAnimationFrame(frame.current);
  },[phase,reduced]);
  const released=["release","red","red-rest"].includes(phase);
  return <div className={"craft-board craft-"+phase+(held?" hand-down":"")} data-testid="year-craft">
    <svg className="craft-wood" viewBox="0 0 390 380" aria-hidden>
      <ellipse className="craft-shadow" cx="194" cy="233" rx="118" ry="94" fill="#21160f" opacity=".24"/>
      <g className={"wood-body "+(released?"wood-away":"")}>
        <g className={hits>0&&!released?"wood-impact":""} key={hits}>
          <image href={asset("assets/directors-cut/production-mould.webp")} x="45" y="0" width="295" height="370" preserveAspectRatio="none"/>
          {phase==="strike"&&<g className={"mould-rice "+(hits===2?"rice-loosening":"")} transform="translate(110 37) scale(.81 .85)">
            <g className="rice-material"><RiceSurface name="mould-rice"/></g>
          </g>}
        </g>
      </g>
    {hits>0&&<g className="contact-mallet" key={hits} transform="translate(170 150)"><g className="mallet-rebound"><image href={asset("assets/directors-cut/production-mallet.webp")} x="-12" y="-26" width="130" height="56"/></g></g>}

    </svg>
    {!released&&<div ref={mould} className="mould-target craft-cavity-target" data-testid="mould-target"/>}
    {(phase==="dough"||phase==="press")&&<button className={"rice-dough craft-dough "+(phase==="press"?"pressed":"")} aria-label="拖动或按压米团入模" data-testid="rice-dough"
      style={phase==="press"?undefined:{transform:`translate(${offset.x}px,${offset.y}px)`}}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onLostPointerCapture={cancel}
      onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();press();}}}>
      <RicePeach amount={phase==="press"?material:0} name="soft-dough"/>
    </button>}
    {phase==="strike"&&<button className="mallet craft-mallet" data-testid="mallet" aria-label="轻敲木模，三次脱模" style={{transform:`translate(${offset.x}px,${offset.y}px)`}}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onLostPointerCapture={cancel}
      onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();hit();}}}>
      <svg viewBox="0 0 160 130" aria-hidden><image href={asset("assets/directors-cut/production-mallet.webp")} x="0" y="20" width="160" height="90" preserveAspectRatio="xMidYMid meet" transform="rotate(-26 80 65)"/></svg>
    </button>}
    {released&&<div className="crafted-peach"><RicePeach red={phase==="red-rest"} name="finished-rice"/></div>}
    {phase==="red"&&<button className="dot-red craft-red-touch" aria-label="点一点朱红" onClick={dot}><span className="sr-only">点一点朱红</span><span className="red-brush-tip" aria-hidden/></button>}
  </div>;
}

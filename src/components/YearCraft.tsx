import { useEffect, useRef, useState, type PointerEventHandler, type RefObject } from "react";
import { useReducedMotion } from "../hooks/useInteraction";

const soft = [100,50,65,40,45,60,42,92,20,130,30,190,60,210,85,230,125,230,150,208,190,188,188,120,166,90,151,63,133,41,100,50];
const formed = [100,20,80,49,44,57,38,91,12,134,29,193,60,215,85,241,127,241,154,215,180,193,186,132,162,91,145,58,120,50,100,20];
function contour(amount: number) {
  const p = soft.map((n,i)=>n+(formed[i]-n)*amount);
  return `M${p[0]} ${p[1]} ` + Array.from({length:5},(_,i)=>"C"+p.slice(2+i*6,8+i*6).join(" ")).join(" ")+"Z";
}
const leaves = [
  "M98 88 Q62 75 60 112 Q85 119 98 88Z", "M108 112 Q137 83 151 113 Q147 137 108 112Z",
  "M94 138 Q55 123 54 161 Q80 170 94 138Z", "M106 161 Q143 138 151 167 Q139 190 106 161Z",
  "M93 185 Q67 174 67 198 Q79 211 93 185Z",
];
type RiceProps = { amount?:number;red?:boolean;name?:string };
export function RicePeach(props:RiceProps) {
  return <svg viewBox="0 0 200 250" className="rice-material" aria-hidden><RiceSurface {...props}/></svg>;
}
function RiceSurface({ amount=1, red=false, name="rice" }:RiceProps) {
  return <>
    <defs>
      <radialGradient id={name+"-rice"} cx=".35" cy=".25" r=".8"><stop stopColor="#faf7e7"/><stop offset=".62" stopColor="#e5dcc4"/><stop offset="1" stopColor="#b9aa8b"/></radialGradient>
      <filter id={name+"-grain"}><feTurbulence type="fractalNoise" baseFrequency=".42" numOctaves="2" seed="9"/><feColorMatrix type="saturate" values="0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    </defs>
    <path d={contour(amount)} transform="translate(2 4)" fill="#a2967a" opacity=".8"/>
    <path d={contour(amount)} fill={`url(#${name}-rice)`}/>
    <path d={contour(amount)} fill="#f3ebd6" opacity=".16" filter={`url(#${name}-grain)`}/>
    <g opacity={amount} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M103 57 Q119 100 101 135 Q87 175 101 209" stroke="#b6a788" strokeWidth="3.2"/>
      <path d="M100 56 Q116 99 98 134 Q84 174 98 208" stroke="#fff9e9" strokeWidth="2"/>
      {leaves.map(d=><g key={d}><path d={d} stroke="#bbae90" strokeWidth="2.6"/><path d={d} transform="translate(-1 -1.5)" stroke="#fff9e7" strokeWidth="1.8"/></g>)}
      <path d="M74 102L96 93 M120 121L140 111 M69 151L91 140 M118 172L140 161 M77 198L91 186" stroke="#c9bca0" strokeWidth="1.4"/>
      <path d="M88 35 Q47 80 45 133 Q47 210 95 223 Q148 215 158 163" stroke="#fff9e5" opacity=".6" strokeWidth="1.5"/>
    </g>
    {red&&<g className="rice-vermilion"><circle cx="101" cy="125" r="8" fill="#b44031"/><circle cx="99" cy="123" r="5.5" fill="#c54c3b" opacity=".65"/></g>}
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
    const soften=(now:number)=>{const t=Math.min(1,(now-start)/500);setMaterial(1-(1-t)**3);if(t<1)frame.current=requestAnimationFrame(soften);};
    frame.current=requestAnimationFrame(soften);
    return()=>cancelAnimationFrame(frame.current);
  },[phase,reduced]);
  const released=["release","red","red-rest"].includes(phase);
  return <div className={"craft-board craft-"+phase+(held?" hand-down":"")} data-testid="year-craft">
    <svg className="craft-wood" viewBox="0 0 390 380" aria-hidden>
      <defs>
        <linearGradient id="craft-wood-tone" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#98734c"/><stop offset=".42" stopColor="#765335"/><stop offset="1" stopColor="#4b3222"/></linearGradient>
        <radialGradient id="craft-cavity"><stop stopColor="#48301f"/><stop offset=".75" stopColor="#332216"/><stop offset="1" stopColor="#a48150"/></radialGradient>
        <filter id="craft-timber-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".08 .48" numOctaves="2" seed="15"/><feColorMatrix type="saturate" values="0"/></filter><clipPath id="craft-wood-clip"><path d="M183 24C123 16 76 67 72 126C62 187 92 244 153 262L153 339Q181 357 215 335L213 256C276 239 306 179 299 120C293 63 250 23 183 24Z"/></clipPath>
      </defs>
      <ellipse className="craft-shadow" cx="194" cy="233" rx="118" ry="94" fill="#21160f" opacity=".24"/>
      <g className={"wood-body "+(released?"wood-away":"")}>
        <g className={hits>0&&!released?"wood-impact":""} key={hits}>
          <path d="M183 32C123 24 76 75 72 134C62 195 92 252 153 270L153 347Q181 365 215 343L213 264C276 247 306 187 299 128C293 71 250 31 183 32Z" fill="#3f2a1c"/>
          <path d="M183 24C123 16 76 67 72 126C62 187 92 244 153 262L153 339Q181 357 215 335L213 256C276 239 306 179 299 120C293 63 250 23 183 24Z" fill="url(#craft-wood-tone)" stroke="#b29263" strokeWidth="1.5"/>
          <g clipPath="url(#craft-wood-clip)"><rect width="390" height="380" filter="url(#craft-timber-grain)" opacity=".25" style={{mixBlendMode:"soft-light"}}/></g><g clipPath="url(#craft-wood-clip)" fill="none" stroke="#d7b782" opacity=".12">
            {Array.from({length:24},(_,i)=><path key={i} d={`M40 ${25+i*14} Q150 ${i*14-4} 220 ${40+i*14} T320 ${25+i*14}`} strokeWidth={i%3===0?1.8:.7}/>)}
          </g>
          <path d={contour(1)} transform="translate(111 40) scale(.8 .84)" fill="url(#craft-cavity)" stroke="#3e291a" strokeWidth="4"/>
          <g transform="translate(111 40) scale(.8 .84)" fill="none" stroke="#a68451" opacity=".4">
            {leaves.map(d=><path key={d} d={d} strokeWidth="2"/>)}
            <path d="M103 57Q119 100 101 135Q87 175 101 209" strokeWidth="3"/>
          </g>
          {phase==="strike"&&<g className={"mould-rice "+(hits===2?"rice-loosening":"")} transform="translate(110 37) scale(.81 .85)">
            <g className="rice-material"><RiceSurface name="mould-rice"/></g>
          </g>}
        </g>
      </g>
    {hits>0&&<g className="contact-mallet" key={hits} transform="translate(187 157)"><g className="mallet-rebound"><rect x="0" y="-8" width="104" height="13" rx="5" fill="#795536"/><rect x="-13" y="-30" width="35" height="51" rx="6" fill="#a07c51" stroke="#553a25"/><path d="M-6 -25V16M3 -25V16M28 -3H98" stroke="#c9a974" opacity=".4"/></g></g>}
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
      <svg viewBox="0 0 160 130" aria-hidden><defs><linearGradient id="mallet-timber" x2="1" y2="1"><stop stopColor="#c4a371"/><stop offset=".4" stopColor="#9a7648"/><stop offset="1" stopColor="#583c24"/></linearGradient></defs><g transform="rotate(-26 80 65)"><rect x="20" y="53" width="130" height="18" rx="6" fill="url(#mallet-timber)" stroke="#573c27"/><rect x="19" y="29" width="47" height="68" rx="9" fill="url(#mallet-timber)" stroke="#6e4c30"/><path d="M28 35V88M39 33V91M50 34V90M69 60H140" stroke="#dfbf87" opacity=".3"/></g></svg>
    </button>}
    {released&&<div className="crafted-peach"><RicePeach red={phase==="red-rest"} name="finished-rice"/></div>}
    {phase==="red"&&<button className="dot-red craft-red-touch" aria-label="点一点朱红" onClick={dot}><span className="sr-only">点一点朱红</span><span className="red-brush-tip" aria-hidden/></button>}
  </div>;
}

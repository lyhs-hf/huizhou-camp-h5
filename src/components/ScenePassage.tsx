import { useEffect, useRef, useState } from "react";
import { useId } from "react";
import { useJourney } from "../app/JourneyContext";
import { useReducedMotion } from "../hooks/useInteraction";

export type PassageState = { material: string; phase: "cover" | "uncover" };
const tones: Record<string, [string, string]> = {
  warm: ["#c29159", "#39291e"], ink: ["#2f322b", "#0a0c09"],
  wood: ["#93714e", "#493323"], forest: ["#647461", "#18271f"],
  mist: ["#eef2ef", "#aabbb5"], window: ["#d1d8d0", "#716755"],
  paper: ["#f4f0e6", "#d5cebe"],
};

/** A material closes the outgoing view before opening the incoming space. */
export function ScenePassage({ material, phase }: PassageState) {
  const [light, dark] = tones[material] ?? tones.paper;
  const unique = useId().replace(/:/g, "");
  const stem = "passage-" + material + unique;
  const opening = phase === "uncover";
  return <div className={`film-transition svg-passage film-${material} film-${phase}`} aria-hidden data-interaction data-testid="film-transition">
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <defs>
        <radialGradient id={stem + "-tone"} cx=".55" cy=".45" r=".8"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></radialGradient>
        <filter id={stem + "-grain"}><feTurbulence type="fractalNoise" baseFrequency={material === "wood" ? ".025 .32" : ".08"} numOctaves="1" seed="17"/><feColorMatrix type="saturate" values="0"/></filter>
        <mask id={stem + "-edge"} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
          <rect width="1000" height="1000" fill={opening ? "white" : "black"}/>
          <g className={`passage-boundary passage-${phase} boundary-${material}`} fill={opening ? "black" : "white"}>
            {material === "forest" || material === "window" ? <rect x="-100" y="-100" width="1200" height="1200"/> :
              <path d="M500 -100C850 -120 1040 90 1100 390C1210 720 1000 1000 720 1120C370 1270 -50 1060 -130 720C-240 350 -50 35 260 -55Q380 -130 500 -100Z"/>}
          </g>
        </mask>
      </defs>
      <g mask={`url(#${stem}-edge)`}>
        <rect width="1000" height="1000" fill={`url(#${stem}-tone)`}/>
        <rect width="1000" height="1000" filter={`url(#${stem}-grain)`} opacity={material === "mist" ? .12 : .075} style={{mixBlendMode:"soft-light"}}/>
        {material === "wood" && <g stroke="#ccae7e" opacity=".1" fill="none">{Array.from({length:17},(_,i)=><path key={i} d={`M-60 ${i*66}Q390 ${i*66-75} 1040 ${i*66+50}`} strokeWidth="2"/>)}</g>}
        {material === "forest" && <g fill="none" stroke="#1e3025" strokeLinecap="round" opacity=".48"><path d="M-80 740Q400 380 950 -50" strokeWidth="18"/>{Array.from({length:8},(_,i)=><path key={i} d={`M${i*135-30} ${710-i*100}l-90 -120m90 120l155 10m-155 -10l-10 -175`} strokeWidth="5"/>)}</g>}
        {material === "window" && <g stroke="#534631" opacity=".32"><path d="M140 0V1000M840 0V1000" strokeWidth="28"/><path d="M0 760H1000" strokeWidth="20"/></g>}
        {material === "mist" && <g fill="#f0f3ef" opacity=".25"><path d="M-100 330Q260 100 710 300T1200 260V660Q730 480 310 610T-100 590Z"/><path d="M-100 680Q280 490 640 670T1200 580V1000H-100Z"/></g>}
      </g>
    </svg>
  </div>;
}

export function useMaterialPassage() {
  const reduced = useReducedMotion();
  const { dispatch } = useJourney();
  const [passage, setPassage] = useState<PassageState | null>(null);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); dispatch({type:"lock",value:false}); }, [dispatch]);
  function enter(material: string, change: () => void) {
    if (busy.current) return;
    busy.current = true;
    dispatch({type:"lock",value:true});
    setPassage({material,phase:"cover"});
    timers.current.push(setTimeout(() => {
      change(); dispatch({type:"lock",value:true}); setPassage({material,phase:"uncover"});
      timers.current.push(setTimeout(() => { setPassage(null); busy.current=false; dispatch({type:"lock",value:false}); },reduced?120:850));
    },reduced?80:650));
  }
  return { enter, layer: passage && <ScenePassage {...passage}/> };
}

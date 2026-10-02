import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import { useJourney } from "../app/JourneyContext";
import { useReducedMotion } from "../hooks/useInteraction";
import { asset } from "../utils/asset";

export type PassageState = { material:string;phase:"cover"|"uncover";bridgeImage?:string;forestComplete?:boolean };
const materialWorld:Record<string,{image?:string;point:[number,number];tone:string}>={
  warm:{image:"directors-cut/lantern-worktable.webp",point:[.5,.53],tone:"#35251c"},
  ink:{point:[.5,.28],tone:"#0b0d0a"},
  wood:{image:"directors-cut/year-craft-table.webp",point:[.49,.49],tone:"#493323"},
  forest:{point:[.78,.3],tone:"#253b32"},
  mist:{image:"directors-cut/mountain-near.webp",point:[.5,.72],tone:"#dce5df"},
  window:{image:"parallel/parent.webp",point:[.55,.6],tone:"#bcc6bd"},
  paper:{point:[.52,.66],tone:"#f2efe5"},
};

/** The next world's actual material fills the outgoing lens. Soft masks hide
 * the cut; it never passes through an unrelated slide or a flat wipe card. */
export function ScenePassage({material,phase,bridgeImage,forestComplete=false}:PassageState){
  const world=materialWorld[material]??materialWorld.paper;
  const node=useRef<HTMLDivElement>(null);
  const [size,setSize]=useState({w:390,h:844});
  useLayoutEffect(()=>{const el=node.current;if(!el)return;const read=()=>{const b=el.getBoundingClientRect();setSize({w:b.width,h:b.height});};read();const ob=new ResizeObserver(read);ob.observe(el);return()=>ob.disconnect();},[]);
  const id="passage"+useId().replace(/[^a-zA-Z0-9_-]/g,"");
  const w=size.w,h=size.h,cx=w*world.point[0],cy=h*world.point[1];
  const forestW=Math.max(w*1.8,h*2.2),forestH=h*1.24;
  const opening=phase==="uncover",photo=bridgeImage??world.image;
  return <div ref={node} className={`film-transition svg-passage film-${material} film-${phase}`} aria-hidden data-interaction data-testid="film-transition">
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <radialGradient id={id+"-feather"}><stop offset="0" stopColor="white"/><stop offset=".25" stopColor="white"/><stop offset=".56" stopColor="white" stopOpacity=".75"/><stop offset="1" stopColor="white" stopOpacity="0"/></radialGradient>
        <radialGradient id={id+"-unfeather"}><stop offset="0" stopColor="black"/><stop offset=".25" stopColor="black"/><stop offset=".56" stopColor="black" stopOpacity=".75"/><stop offset="1" stopColor="black" stopOpacity="0"/></radialGradient>
        <radialGradient id={id+"-ink"} cx=".48" cy=".45" r=".7"><stop stopColor="#32332c"/><stop offset="1" stopColor="#090b09"/></radialGradient>
        <radialGradient id={id+"-forest"}><stop offset=".25" stopColor="#102019" stopOpacity="0"/><stop offset=".75" stopColor="#102019" stopOpacity=".28"/><stop offset="1" stopColor="#09140e" stopOpacity=".45"/></radialGradient>
        <linearGradient id={id+"-fog"} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#e8eeeb" stopOpacity="0"/><stop offset=".45" stopColor="#e8eeeb" stopOpacity=".85"/><stop offset="1" stopColor="#dce6df" stopOpacity=".35"/></linearGradient>
        <mask id={id+"-lens"} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <rect width={w} height={h} fill={opening?"white":"black"}/>
          <circle className={"material-lens lens-"+phase} cx={cx} cy={cy} r={Math.hypot(w,h)} fill={`url(#${id}-${opening?"unfeather":"feather"})`} style={{transformOrigin:`${cx}px ${cy}px`}}/>
        </mask>
      </defs>
      <g className={"material-world material-"+phase} mask={`url(#${id}-lens)`}>
        <rect width={w} height={h} fill={material==="ink"?`url(#${id}-ink)`:world.tone}/>
        {photo&&<image href={asset("assets/"+photo)} width={w} height={h} preserveAspectRatio="xMidYMid slice"/>}
        {material==="ink"&&<image href={asset("assets/ink/ink.webp")} y="45" width={w} height={h*.72} preserveAspectRatio="xMidYMid meet"/>}
        {material==="forest"&&<>
          <image href={asset("assets/directors-cut/forest-observation.webp")} x={w*.5-forestW*(forestComplete?.70:.32)} y={h*.5-forestH*(forestComplete?.56:.5)} width={forestW} height={forestH} preserveAspectRatio="none" style={{filter:forestComplete?"brightness(.95) saturate(.82)":"brightness(.83) saturate(.78) blur(.8px)"}}/>
          <rect width={w} height={h} fill={`url(#${id}-forest)`}/>
          <image href={asset("assets/directors-cut/forest-foreground.webp")} width={w} height={h} preserveAspectRatio="none" opacity=".92"/>
        </>}
        {material==="mist"&&<><image href={asset("assets/directors-cut/forest-foreground.webp")} width={w} height={h} preserveAspectRatio="xMidYMid slice" opacity=".6"/><g className="passage-vapor" fill={`url(#${id}-fog)`}><path d={`M${-w} ${h*.18}Q${w*.3} ${h*.04} ${w*1.2} ${h*.3}V${h*1.3}H${-w}Z`}/><path d={`M${-w} ${h*.55}Q${w*.5} ${h*.3} ${w*2} ${h*.63}V${h*1.5}H${-w}Z`}/></g></>}
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
  function enter(material: string, change: () => void, bridgeImage?: string) {
    if (busy.current) return;
    busy.current = true;
    dispatch({type:"lock",value:true});
    setPassage({material,phase:"cover",bridgeImage});
    timers.current.push(setTimeout(() => {
      change(); dispatch({type:"lock",value:true}); setPassage({material,phase:"uncover",bridgeImage});
      timers.current.push(setTimeout(() => { setPassage(null); busy.current=false; dispatch({type:"lock",value:false}); },reduced?120:850));
    },reduced?80:650));
  }
  return { enter, layer: passage && <ScenePassage {...passage}/> };
}

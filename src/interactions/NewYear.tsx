import { asset } from "../utils/asset";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type CSSProperties } from "react";
import { useInteraction } from "../hooks/useInteraction";
import { Stage, StationHeader, StationFinish, StationTools } from "../components/Station";
import { RicePeach, YearCraft } from "../components/YearCraft";
type Phase = "dough" | "press" | "strike" | "release" | "red" | "red-rest" | "paper" | "pages" | "reflection" | "done";
export function NewYear({ onInfo }: { onInfo: () => void }) {
  const action = useInteraction("year", "年", "new_year");
  const [phase, setPhase] = useState<Phase>(action.done ? "done" : "dough");
  const [shot, setShot] = useState(action.done ? 2 : 0);
  const [hits, setHits] = useState(0);
  const [beat, setBeat] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [opened, setOpened] = useState(action.done);
  const [written, setWritten] = useState(action.done);
  const [held, setHeld] = useState(false);
  const roomStep = useRef(0);
  const origin = useRef<{ x: number; y: number; at: number } | null>(null);
  const stage = useRef<HTMLDivElement>(null); const mould = useRef<HTMLDivElement>(null);
  const [size,setSize]=useState({width:375,height:812});
  useLayoutEffect(()=>{
    const element=stage.current;if(!element)return;
    const update=()=>{const r=element.getBoundingClientRect();setSize({width:r.width,height:r.height});};
    update();const observer=new ResizeObserver(update);observer.observe(element);return()=>observer.disconnect();
  },[]);
  const lastHit = useRef(-Infinity); const complete = action.complete;
  useEffect(() => {
    if (phase === "press") { const t = setTimeout(() => setPhase("strike"), 550); return () => clearTimeout(t); }
    if (phase === "release") { const t = setTimeout(() => setPhase("red"), 1000); return () => clearTimeout(t); }
    if (phase === "red-rest") { const t = setTimeout(() => { setPhase("paper"); setShot(0); }, 1650); return () => clearTimeout(t); }
    if (phase === "reflection") {
      const a = setTimeout(() => setBeat(1), 1200), b = setTimeout(() => setBeat(2), 2200), c = setTimeout(() => { setPhase("done"); complete(); }, 3500);
      return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
    }
  }, [phase, complete]);
  useEffect(() => {
    if (!opened || written) return;
    const timer = setTimeout(() => { setWritten(true); setPhase("pages"); }, 2350);
    return () => clearTimeout(timer);
  }, [opened, written]);
  function hit() {
    if (performance.now() - lastHit.current < 350) return;
    lastHit.current = performance.now(); setHits(hits + 1);
    if (hits === 2) setPhase("release");
  }
  function down(e: PointerEvent) { if(origin.current||!e.isPrimary)return;e.preventDefault();setHeld(true);action.start(); origin.current = { x: e.clientX, y: e.clientY, at: performance.now() }; e.currentTarget.setPointerCapture(e.pointerId); }
  function move(e: PointerEvent) { if (origin.current) setOffset({ x: e.clientX - origin.current.x, y: e.clientY - origin.current.y }); }
  function cancel() { origin.current = null;setHeld(false); setOffset({ x: 0, y: 0 }); action.unlock(); }
  function up(e: PointerEvent) {
    if (!origin.current) return;
    const r = mould.current!.getBoundingClientRect();
    if (phase === "dough" && ((e.clientX > r.left - 20 && e.clientX < r.right + 20 && e.clientY > r.top - 20 && e.clientY < r.bottom + 20) || (Math.hypot(offset.x, offset.y) < 10 && performance.now() - origin.current.at >= 400))) setPhase("press");
    if (phase === "strike" && e.clientX > r.left - 30 && e.clientX < r.right + 30 && e.clientY > r.top - 30 && e.clientY < r.bottom + 30) hit();
    cancel();
  }
  function enterRoom(direction: number) {
    if (!written || performance.now() - roomStep.current < 900) return;
    roomStep.current = performance.now();
    setShot(s => Math.max(0, Math.min(2, s + direction)));
  }
  const quiet = phase === "red-rest" || phase === "reflection" && beat === 0;
  const inHouse = ["paper", "pages", "reflection", "done"].includes(phase);
  return <>
    <StationHeader id="year" quiet={quiet || inHouse && !action.done} introduce={phase === "dough"} />
    <Stage className={"year-stage year-process phase-" + phase + (quiet ? " visual-rest" : "")}>
      <div ref={stage} className={"year-image hit-" + hits + " " + (inHouse ? "house-space" : "")} data-phase={phase} data-hits={hits}>
        {inHouse ? <>
          <div className="room-stack" data-room={shot}>
            <svg className="room-camera" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none">
              <defs>{[1,2].map(i=><mask key={i} id={"room-door-"+i} maskUnits="userSpaceOnUse" x="0" y="0" width={size.width} height={size.height}>
                <rect width={size.width} height={size.height} fill="black"/>
                <rect className={"room-door-opening "+(held?"door-in-hand":"")} x={size.width*(i===1?.7:.34)} y={size.height*(i===1?.12:.42)} width={size.width*(i===1?.3:.28)} height={size.height*(i===1?.6:.43)} fill="white" style={{transformOrigin:`${size.width*(i===1?.85:.48)}px ${size.height*(i===1?.42:.635)}px`,transform:`scale(${Math.max(.001,(i<=shot?1:i===shot+1?Math.min(.38,Math.max(0,-offset.x/size.width)*.6):0)*(i===1?8:4.5))})`}}/>
              </mask>)}</defs>
              {["couplet", "courtyard", "banquet"].map((name,i)=><g key={name} aria-hidden={i!==shot} mask={i?`url(#room-door-${i})`:undefined}>
                <image className={"room-depth"+(i===0&&phase==="paper"?" table-recede":"")} href={asset(i===0?"assets/directors-cut/year-craft-table.webp":`assets/new-year/${name}.webp`)} width={size.width} height={size.height} preserveAspectRatio="xMidYMid slice" role="img" aria-label={["老宅木桌上的红纸与笔墨","循着光走进老宅天井","把年礼带到一家人的年宴"][i]} style={{transformOrigin:`${size.width*(i===0?(phase==="paper"?.5:.85):.48)}px ${size.height*(i===0?(phase==="paper"?.5:.42):.635)}px`,transform:`scale(${1+Math.max(0,shot-i)*.18})`}}/>
                {i>0&&<path d={`M6 0V${size.height}M${size.width-6} 0V${size.height}M0 6H${size.width}`} stroke="#453427" strokeOpacity=".45" strokeWidth="12" fill="none"/>}
              </g>)}
            </svg>
          </div>
          {shot === 0 && <div className={"year-keepsake"+(phase==="paper"?" arriving":"")} style={{"--rice-from-x":size.width*.119+"px","--rice-from-y":-.38*size.height+.0878*size.width+7+"px","--rice-from-scale":size.width*.3818/82} as CSSProperties} role="img" aria-label="刚刚做好的年礼，留在桌边"><RicePeach red name="keepsake-rice"/></div>}
          <div style={{clipPath: opened ? undefined : `inset(0 0 ${Math.max(0,62-Math.hypot(offset.x,offset.y)*.6)}% 0)`}} className={"wish-paper director-paper " + (opened ? "paper-open " : "paper-folded ") + (shot > 0 ? "at-door" : "")} aria-label="展开的红纸上，一笔新春祝愿">
            <svg viewBox="0 0 100 155" aria-hidden><defs><filter id="red-fibers"><feTurbulence type="fractalNoise" baseFrequency=".6 .02" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="100" height="155" filter="url(#red-fibers)" opacity=".12"/>{["M18 36 Q50 32 78 37","M25 51 Q48 46 74 50","M13 69 Q48 62 86 67","M52 19 Q54 59 17 91","M59 63 Q70 83 88 89","M32 91 L34 137 L69 137 L69 90 Z","M35 113 H67"].map((d,i)=><path key={d} className="spring-brush" d={d} style={{animationDelay:i*.18+"s"}}/>)}</svg>
          </div>
        </> : <><img className="year-table" src={asset("assets/directors-cut/year-craft-table.webp")} alt="老宅里等待年礼的空木桌" draggable={false}/>
          <YearCraft phase={phase} hits={hits} offset={offset} held={held} mould={mould} down={down} move={move} up={up} cancel={cancel}
            press={()=>setPhase("press")} hit={hit} dot={()=>setPhase("red-rest")}/></>}
        {phase === "pages" && written && <div className="year-page-gesture" role="group" aria-label="左右轻推，走进年里" tabIndex={0}
          onPointerDown={down} onPointerMove={move} onPointerCancel={cancel} onLostPointerCapture={cancel} onPointerUp={e => { if (origin.current) { const dx = e.clientX - origin.current.x; if (Math.abs(dx) > 45) enterRoom(dx < 0 ? 1 : -1); } cancel(); }}
          onKeyDown={e => { if (["ArrowRight", "ArrowLeft"].includes(e.key)) { e.preventDefault(); enterRoom(e.key === "ArrowRight" ? 1 : -1); } }} />}
        {phase === "paper" && !opened && <button className="red-paper-touch" aria-label="轻拉红纸，展开一份新春祝愿" data-testid="red-paper" onPointerDown={down} onPointerMove={move} onPointerCancel={cancel} onLostPointerCapture={cancel}
          onPointerUp={e=>{if(origin.current&&Math.hypot(e.clientX-origin.current.x,e.clientY-origin.current.y)>40)setOpened(true);cancel();}} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();setOpened(true);}}}><span className="sr-only">轻拉红纸，展开一份新春祝愿</span></button>}
        {inHouse && <div className="year-caption">{[phase === "paper" ? "桌边，有一张红纸" : "把新春祝愿，带进年里", "天井里的光", "一家人，围坐一席年宴"][shot]}{phase === "pages" && written && shot < 2 && <small>{shot === 0 ? "向左轻推，带着红纸走进天井" : "再向左，带着祝愿走向年宴"}</small>}</div>}
      </div>
      {!quiet && !inHouse && <div className="stage-hint">{phase === "dough" ? "把米团，轻轻压入木模" : phase === "press" ? "米粉慢慢贴进纹样" : phase === "strike" ? ["拿起木槌，轻敲木模", "再一下，年礼慢慢松动", "最后一下，把年礼敲出来"][hits] : phase==="release"?"木模离开，纹样留在米粉里":"点一点朱红"}</div>}
    </Stage>
    {phase === "pages" && shot === 2 && <button className="year-step" onClick={() => { setBeat(0); setPhase("reflection"); }}>把这一席年留在心里<span aria-hidden> →</span></button>}
    {phase === "reflection" && beat > 0 && <div className="year-reflection" role="status"><p>一张桌，原来在一座老宅里。</p>{beat === 2 && <p className="second-beat">年礼、红纸、天井，<br />最后，是一席年。</p>}</div>}
    {action.done && <><StationFinish id="year" /><div className="water-route">南屏 <svg viewBox="0 0 140 20"><path d="M0 10 Q25 0 50 10 T100 10 T140 10" /></svg> 宏村</div></>}
    <StationTools done={action.done} quiet={quiet || phase === "reflection"} progressKey={phase + hits + shot} onInfo={onInfo}
      onRetry={() => { action.retry(); setPhase("dough"); setShot(0); setHits(0); setBeat(0); setOpened(false); setWritten(false); lastHit.current = -Infinity; }}
      onAssist={() => { if (phase === "dough") setPhase("press"); else if (phase === "strike") hit(); else if (phase === "red") setPhase("red-rest"); else if (phase === "paper") setOpened(true); else if (phase === "pages" && shot < 2) enterRoom(1); }}
      assistLabel={phase === "dough" ? "轻压入木模" : phase === "strike" ? "轻敲一下" : phase === "red" ? "点一点朱红" : "轻推这一页"} />
  </>;
}

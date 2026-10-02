import { asset } from "../utils/asset";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { useInteraction } from "../hooks/useInteraction";
import { useJourney } from "../app/JourneyContext";
import { StationTools } from "../components/Station";
const details = [
  { id: "body", x: 70, y: 54, w: 11, h: 22, fact: "它坐着，前肢收在身前。" },
  { id: "rock", x: 70, y: 72, w: 17, h: 12, fact: "它脚下是岩石，边缘留着残雪。" },
  { id: "pine", x: 85, y: 69, w: 16, h: 20, fact: "它旁边，松枝伸进了视野。" },
];
export function Macaque({ onInfo }: { onInfo: () => void }) {
  const action = useInteraction("macaque", "山", "macaque");
  const { state, dispatch } = useJourney();
  const [camera, setCamera] = useState(action.done ? {x:.70,y:.56} : { x: .32, y: .5 });
  const [found, setFound] = useState(action.done);
  const [seen, setSeen] = useState<string[]>(action.done ? details.filter(d=>state.observation?.discovery.includes(d.fact)).map(d=>d.id) : []);
  const [notebook, setNotebook] = useState(false);
  const [question, setQuestion] = useState(state.observation?.question ?? "");
  const [gaze, setGaze] = useState({ x: .5, y: .5 });
  const [looking, setLooking] = useState(false);
  const [caption, setCaption] = useState("");
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const regions = useRef<(HTMLSpanElement | null)[]>([]);
  const noteTitle = useRef<HTMLHeadingElement>(null);
  const discovered = useRef(action.done);
  const visited = useRef(new Set(seen));
  const gesture = useRef<{ x: number; y: number; lastX: number; lastY: number; distance: number; camera: typeof camera } | null>(null);
  const cameraPosition = useRef(camera);
  useEffect(() => { if (notebook) noteTitle.current?.focus({ preventScroll: true }); }, [notebook]);
  const positionCamera = useCallback((position: typeof camera) => {
    cameraPosition.current = position;
    // Transform and visibility must describe the same pointer event. React may
    // coalesce a fast sweep; keep the viewing instrument synchronous with hand.
    if (world.current) world.current.style.transform = `translate(${-position.x * 100}%,${-position.y * 100}%)`;
    setCamera(position);
  }, []);
  const observe = useCallback((x: number, y: number, distance: number) => {
    const box = viewport.current!.getBoundingClientRect();
    const body = regions.current[0]!.getBoundingClientRect();
    const visibleWidth = Math.max(0, Math.min(body.right, box.right) - Math.max(body.left, box.left));
    const visibleHeight = Math.max(0, Math.min(body.bottom, box.bottom) - Math.max(body.top, box.top));
    if (!discovered.current && visibleWidth * visibleHeight >= body.width * body.height * .65 && distance > 25) {
      discovered.current = true; setFound(true); setCaption("先别急着拍。看看它现在在做什么。");
      const attention = { x: details[0].x / 100, y: .56 };
      positionCamera(attention);
      if (gesture.current) { gesture.current.camera = attention; gesture.current.x = x; gesture.current.y = y; }
      return;
    }
    if (!discovered.current || distance < 12) return;
    regions.current.forEach((node, i) => {
      if (!node) return;
      const r = node.getBoundingClientRect();
      if (x < Math.max(r.left, box.left) || x > Math.min(r.right, box.right) || y < Math.max(r.top, box.top) || y > Math.min(r.bottom, box.bottom)) return;
      if (!visited.current.has(details[i].id)) {
        visited.current.add(details[i].id); setSeen([...visited.current]);
      }
      setCaption(details[i].fact);
    });
  }, [positionCamera]);
  function down(e: PointerEvent<HTMLDivElement>) {
    if (notebook || action.done) return;
    action.start(); e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, distance: 0, camera: cameraPosition.current };
    setLooking(true);
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    const g = gesture.current; if (!g || !world.current || !viewport.current) return;
    g.distance += Math.hypot(e.clientX - g.lastX, e.clientY - g.lastY); g.lastX = e.clientX; g.lastY = e.clientY;
    const size = world.current.getBoundingClientRect(), box = viewport.current.getBoundingClientRect();
    const halfX = box.width / size.width / 2, halfY = box.height / size.height / 2;
    const gain = discovered.current ? .22 : 1;
    positionCamera({ x: Math.max(halfX, Math.min(1 - halfX, g.camera.x - (e.clientX - g.x) / size.width * gain)), y: Math.max(halfY, Math.min(1 - halfY, g.camera.y - (e.clientY - g.y) / size.height * gain)) });
    setGaze({ x: Math.max(.08, Math.min(.92, (e.clientX - box.left) / box.width)), y: Math.max(.12, Math.min(.88, (e.clientY - box.top) / box.height)) });
    observe(e.clientX, e.clientY, g.distance);
  }
  function end(cancelled = false) {
    gesture.current = null; setLooking(false); action.unlock();
    if (!cancelled && visited.current.has("body") && visited.current.size >= 2) setNotebook(true);
  }
  function save() {
    const facts = details.filter(d => visited.current.has(d.id)).map(d => d.fact).join(" ");
    dispatch({ type: "observation", discovery: facts, question: question.trim() });
    setNotebook(false); action.complete();
  }
  return <div className={"forest-observation" + (found ? " discovered" : "") + (looking ? " looking" : "")} data-interaction data-found={found} data-seen={seen.join(",")}>
    <h1 className="sr-only">进入山林，发现一只短尾猴</h1>
    <div ref={viewport} className="forest-viewport" role="group" aria-label="移动山林视野，近看身体与岩石" tabIndex={0} data-testid="forest-view"
      onPointerDown={down} onPointerMove={move} onPointerUp={e => { move(e); end(); }} onPointerCancel={() => end(true)}
      onKeyDown={e => { if (!notebook && !action.done && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const dx=e.key==="ArrowRight"?.07:e.key==="ArrowLeft"?-.07:0,dy=e.key==="ArrowDown"?.08:e.key==="ArrowUp"?-.08:0;
        const look=found?{x:Math.max(.1,Math.min(.9,gaze.x+dx)),y:Math.max(.15,Math.min(.85,gaze.y+dy))}:{x:.5,y:.5};
        setGaze(look); if(!found)positionCamera({x:Math.max(.14,Math.min(.86,cameraPosition.current.x+dx)),y:Math.max(.4,Math.min(.6,cameraPosition.current.y+dy))});
        requestAnimationFrame(()=>{if(!viewport.current)return;const b=viewport.current.getBoundingClientRect();observe(b.x+b.width*look.x,b.y+b.height*look.y,30);if(visited.current.has("body")&&visited.current.size>=2)setNotebook(true);});
      } }}>
      <div ref={world} className="forest-world" style={{ transform: `translate(${-camera.x * 100}%,${-camera.y * 100}%)` }}>
        <img src={asset("assets/directors-cut/forest-observation.webp")} alt="冬季松林里，一只短尾猴坐在带残雪的岩石上" draggable={false}/>
        {details.map((d,i)=><span key={d.id} ref={el=>{regions.current[i]=el;}} className="forest-detail" data-detail={d.id} style={{left:d.x+"%",top:d.y+"%",width:d.w+"%",height:d.h+"%"}} aria-hidden/>)}
      </div>
      <svg className="forest-air" viewBox="0 0 390 844" preserveAspectRatio="none" aria-hidden><defs><linearGradient id="forest-mist"><stop stopColor="#bac7c0" stopOpacity="0"/><stop offset=".5" stopColor="#bac7c0" stopOpacity=".12"/><stop offset="1" stopColor="#bac7c0" stopOpacity="0"/></linearGradient></defs><path fill="url(#forest-mist)" d="M-200 250 Q150 200 450 310 T800 280 V520 H-200Z"/></svg>
      <div className="forest-focus" style={{background:`radial-gradient(ellipse 150px 175px at ${gaze.x*100}% ${gaze.y*100}%,transparent 25%,#10201955 75%,#09140e88)`}} aria-hidden/>
      <img className="near-pine" src={asset("assets/directors-cut/forest-foreground.webp")} alt="" style={{transform:`translate(${(camera.x-.32)*-32}px,${(camera.y-.5)*-22}px)`}} aria-hidden/>
    </div>
    {!found && <p className="forest-invitation">松枝后，好像有一个身影。<br/><small>轻移视野，往林子里看一看</small></p>}
    {found && !notebook && !action.done && <p className="forest-caption" role="status">{caption || "轻移目光，看看它的身体与脚下。"}</p>}
    {notebook && <div className="observation-page" role="dialog" aria-modal="false" aria-label="自然观察札记" data-testid="field-notebook"><span>山林 · 一页观察札记</span><h2 ref={noteTitle} tabIndex={-1}>刚才，我留意到</h2>{details.filter(d=>seen.includes(d.id)).map(d=><p key={d.id}>{d.fact}</p>)}<label>还有一个问题<input maxLength={100} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="我还想知道……（可选）"/></label><button onClick={save}>收起这页札记<span aria-hidden> →</span></button></div>}
    {action.done && <p className="forest-conclusion">观察，不只是多看一会儿。<br/>是知道自己在找什么。</p>}
    <StationTools done={action.done} quiet={notebook} progressKey={seen.join(",")+found} onInfo={onInfo} onRetry={()=>{action.retry();setFound(false);discovered.current=false;visited.current.clear();setSeen([]);positionCamera({x:.32,y:.5});setCaption("");}}
      onAssist={()=>{setCaption(found?"让目光从它的前肢，移到脚下的岩石。":"往右边的岩石看一看。向左轻移视野。");}} assistLabel="给我一点观察提示"/>
  </div>;
}

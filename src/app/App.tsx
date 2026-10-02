import { asset } from "../utils/asset";
import { useRef, useState, useEffect, useCallback } from "react";
import { useJourney } from "./JourneyContext";
import type { SceneId, InteractionId } from "../content/types";
import { sceneNames } from "../content/copy";
import { track } from "../analytics";
import { useReducedMotion } from "../hooks/useInteraction";
import { Prologue, Hero, Expectations, FirstRoute } from "../scenes/Opening";
import { Lantern } from "../interactions/Lantern";
import { Ink } from "../interactions/Ink";
import { NewYear } from "../interactions/NewYear";
import { Macaque } from "../interactions/Macaque";
import { Mountain } from "../scenes/Mountain";
import { Parallel } from "../scenes/Parallel";
import { Closing } from "../scenes/Closing";
import { KnowledgeDrawer } from "../components/KnowledgeDrawer";
import { LeadSheet } from "../components/LeadSheet";
import { Sheet } from "../components/Sheet";
export function App() {
  const { state, dispatch } = useJourney();
  const scene = state.currentScene;
  const reduced = useReducedMotion();
  const [film, setFilm] = useState<{material:string;phase:"cover"|"uncover"}|null>(null);
  const transitionTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [knowledge, setKnowledge] = useState<InteractionId | null>(null);
  const [lead, setLead] = useState(false);
  const [mother, setMother] = useState(false);
  const [motherSettled, setMotherSettled] = useState(false);
  const openMother = useCallback(() => { setMotherSettled(false); setMother(true); }, []);
  const [parallelReady, setParallelReady] = useState(false);
  const [mountainResting, setMountainResting] = useState(false);
  useEffect(() => {
    if (!mother) return;
    setMotherSettled(false);
    const timer = setTimeout(() => setMotherSettled(true), 2500);
    return () => clearTimeout(timer);
  }, [mother]);
  const [toast, setToast] = useState("");
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const transitioning = useRef(false);
  const canvas = useRef<HTMLElement>(null);
  const ids: Record<number, InteractionId> = {
    4: "lantern",
    5: "ink",
    6: "year",
    7: "macaque",
  };
  const coreReady = !ids[scene] || state.completedInteractions.includes(ids[scene]);
  const allowed = scene !== 0 && (scene !== 2 || state.expectation !== null) && coreReady && (scene !== 9 || parallelReady) && (scene !== 8 || !mountainResting);
  const modal = knowledge !== null || lead || mother;
  const immersive = scene >= 4 && scene <= 9;
  const [edgeAwake, setEdgeAwake] = useState(false);
  useEffect(() => {
    setEdgeAwake(false);
    const timer = setTimeout(() => setEdgeAwake(true), 6500);
    return () => clearTimeout(timer);
  }, [scene, state.locked]);
  useEffect(()=>()=>{transitionTimers.current.forEach(clearTimeout);},[]);
  useEffect(()=>{
    const next:Record<number,string[]>={3:["directors-cut/lantern-worktable.webp","lantern/skeleton-final.webp","lantern/unlit.webp"],4:["ink/ink.webp"],5:["new-year/table.webp","new-year/dough-final.webp","directors-cut/year-writing-table.webp"],6:["directors-cut/forest-observation.webp","directors-cut/forest-foreground.webp"],7:["directors-cut/mountain-near.webp","mountain/panorama.webp"],8:["parallel/parent.webp","parallel/child.webp","parallel/tea-final.webp","parallel/incense-blank.webp"]};
    for(const file of next[scene]??[]){const image=new Image();image.src=asset("assets/"+file);}
  },[scene]);
  function go(value: number) {
    if (modal || state.locked || transitioning.current) return;
    if (value > scene && !allowed) {
      if (scene === 2) setToast("先留下一张属于你的行旅纸签。");
      return;
    }
    if (value < 1 || value > 10) return;
    if (scene === 1 && value > scene) track("journey_start");
    if (value === 8) track("mountain_enter");
    transitioning.current = true;
    const arrival=()=>{if(value===8)setMountainResting(true);dispatch({type:"scene",scene:value as SceneId});};
    const materials:Record<number,string>={3:"warm",4:"ink",5:"wood",6:"forest",7:"mist",8:"window",9:"paper"};
    const material=materials[Math.min(scene,value)];
    if(!material){arrival();transitionTimers.current.push(setTimeout(()=>{transitioning.current=false;},520));return;}
    setFilm({material,phase:"cover"});
    transitionTimers.current.push(setTimeout(()=>{arrival();setFilm({material,phase:"uncover"});
      transitionTimers.current.push(setTimeout(()=>{setFilm(null);transitioning.current=false;},reduced?120:850));
    },reduced?80:650));
  }
  useEffect(() => {
    if (scene > 0) {
      const title = canvas.current?.querySelector<HTMLElement>("h1");
      title?.setAttribute("tabindex", "-1");
      title?.focus({ preventScroll: true });
    }
  }, [scene]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (scene === 10) return;
      if (
        modal ||
        state.locked ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.closest("[data-interaction]")
      )
        return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(scene + 1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(scene - 1);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  });
  const content = [
    <Prologue />,
    <Hero />,
    <Expectations />,
    <FirstRoute />,
    <Lantern onInfo={() => setKnowledge("lantern")} onMother={openMother} />,
    <Ink onInfo={() => setKnowledge("ink")} />,
    <NewYear onInfo={() => setKnowledge("year")} />,
    <Macaque onInfo={() => setKnowledge("macaque")} />,
    <Mountain onRest={setMountainResting} />,
    <Parallel ready={parallelReady} onReady={setParallelReady} />,
    <Closing
      onLead={() => {
        track("lead_cta_click");
        setLead(true);
      }}
    />,
  ][scene];
  return (
    <div className="desktop-shell">
      <main
        ref={canvas}
        className={
          "journey-canvas scene-" + scene + (immersive ? " immersive-canvas" : "") + (modal ? " modal-open" : "")
        }
        aria-label="一卷冬日行旅"
        data-scene={scene}
        onPointerDown={(e) => {
          if (
            scene === 10 ||
            modal ||
            state.locked ||
            (e.target as HTMLElement).closest("[data-interaction],button")
          )
            return;
          swipe.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          if (!swipe.current) return;
          const dy = e.clientY - swipe.current.y;
          const dx = e.clientX - swipe.current.x;
          swipe.current = null;
          if (state.locked || Math.abs(dx) > Math.abs(dy)) return;
          if (dy < -60) go(scene + 1);
          else if (dy > 60) go(scene - 1);
        }}
        onPointerCancel={() => {
          swipe.current = null;
        }}
      >
        {scene > 1 && !immersive && (
          <header className="scene-header" inert={modal}>
            <button aria-label="返回上一幕" onClick={() => go(scene - 1)}>
              ‹
            </button>
            <span>一卷冬日行旅</span>
            <small>{String(scene).padStart(2, "0")} / 10</small>
          </header>
        )}
        {immersive && <button className={"edge-back" + (edgeAwake ? " awake" : "")} aria-label="返回上一幕" inert={modal} onClick={() => go(scene - 1)}>‹</button>}
        <div
          key={scene}
          className={
            "scene-content scene-body-" +
            scene +
            (state.direction < 0 ? " backwards" : "")
          }
          inert={modal}
        >
          {content}
        </div>
        {scene > 0 && scene < 10 && !immersive && (
          <footer
            className={"scene-footer " + (scene === 1 ? "hero-footer" : "")}
            inert={modal}
          >
            <span className="chapter-label">
              {scene === 1 ? "HUÍZHŌU · HUÁNGSHĀN" : sceneNames[scene]}
            </span>
            {(coreReady && (scene !== 9 || parallelReady) && (scene !== 8 || !mountainResting)) && <button
              className="continue"
              onClick={() => go(scene + 1)}
              disabled={!allowed}
            >
              {scene === 1
                ? "向上，启程"
                : scene === 2
                  ? "带上这份期待"
                  : scene === 9
                    ? "收好这一卷"
                    : "继续行旅"}
              <span aria-hidden>↑</span>
            </button>}
          </footer>
        )}
        {immersive && allowed && !modal && <button className="scene-departure" onClick={() => go(scene + 1)}>
          {scene === 4 ? "灯火之后，走近一锭墨" : scene === 5 ? "墨香里，走进徽州年" : scene === 6 ? "推开门，走向山林" : scene === 7 ? "循着山雾，走向黄山" : scene === 8 ? "把云端的一小时，留给自己" : "收好这一卷"}<span aria-hidden> →</span>
        </button>}
        {film && <div className={"film-transition film-"+film.material+" film-"+film.phase} aria-hidden data-testid="film-transition">
          {film.material==="forest"&&<img src={asset("assets/directors-cut/forest-foreground.webp")} alt=""/>}
          {film.material==="mist"&&<svg viewBox="0 0 390 844" preserveAspectRatio="none"><defs><filter id="travel-cloud"><feTurbulence type="fractalNoise" baseFrequency=".009" numOctaves="2" seed="6"/><feColorMatrix type="matrix" values=".3 0 0 0 .7 .3 0 0 0 .73 .3 0 0 0 .71 0 0 0 0 1"/><feGaussianBlur stdDeviation="7"/></filter></defs><rect width="390" height="844" filter="url(#travel-cloud)"/></svg>}
        </div>}
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
        {knowledge && (
          <KnowledgeDrawer id={knowledge} onClose={() => setKnowledge(null)} />
        )}{" "}
        {lead && <LeadSheet onClose={() => setLead(false)} />}
        {mother && <Sheet className="theatre-sheet" titleId="mother-title" onClose={() => setMother(false)}>
          <div className="mother-interlude">
            <img src={asset("assets/lantern/mother-theatre-tea.webp")} alt="古戏台前，一盏徽州茶与妈妈的片刻停留意境" />
            <h2 id="mother-title">孩子在灯纸上添颜色。<br />你在茶里，留一段时间。</h2>
            <p>一盏徽州茶，<br />一曲黄梅戏。</p>
            {motherSettled && <button className="mother-leave" onClick={() => setMother(false)}>继续行旅<span aria-hidden> →</span></button>}
          </div>
        </Sheet>}
      </main>
      <span className="outside-caption">一卷冬日行旅 · 新东方文旅</span>
    </div>
  );
}

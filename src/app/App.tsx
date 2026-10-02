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
import { ScenePassage, type PassageState } from "../components/ScenePassage";
import { useJourneySound } from "../components/JourneySound";
export function App() {
  const { state, dispatch } = useJourney();
  const scene = state.currentScene;
  const reduced = useReducedMotion();
  const [film, setFilm] = useState<PassageState|null>(null);
  const transitionTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [knowledge, setKnowledge] = useState<InteractionId | null>(null);
  const [lead, setLead] = useState(false);
  const [mother, setMother] = useState(false);
  const [motherSettled, setMotherSettled] = useState(false);
  const openMother = useCallback(() => { setMotherSettled(false); setMother(true); }, []);
  const [parallelReady, setParallelReady] = useState(false);
  const [mountainResting, setMountainResting] = useState(false);
  const music = useJourneySound(scene, (mountainResting && scene === 8) || knowledge !== null || lead || mother);
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
  useEffect(() => {
    const surface = canvas.current;
    const protectGesture = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && !target.closest('input,textarea,[contenteditable="true"],img.saved-preview')) event.preventDefault();
    };
    surface?.addEventListener("selectstart", protectGesture);
    surface?.addEventListener("contextmenu", protectGesture);
    return () => {
      surface?.removeEventListener("selectstart", protectGesture);
      surface?.removeEventListener("contextmenu", protectGesture);
    };
  }, []);
  useEffect(()=>{
    const next:Record<number,string[]>={3:["directors-cut/lantern-worktable.webp","lantern/skeleton-final.webp","lantern/unlit.webp"],4:["ink/ink.webp"],5:["directors-cut/year-craft-table.webp","directors-cut/year-writing-table.webp"],6:["directors-cut/forest-observation.webp","directors-cut/forest-foreground.webp"],7:["directors-cut/mountain-near.webp","mountain/panorama.webp"],8:["parallel/parent.webp","parallel/child.webp","directors-cut/tea-clear-table.webp","parallel/incense-blank.webp"]};
    for(const file of next[scene]??[]){const image=new Image();image.src=asset("assets/"+file);}
  },[scene]);
  function go(value: number) {
    if (modal || state.locked || transitioning.current) return;
    if (value > scene && !allowed) {
      if (scene === 2) setToast("先留下一张属于你的行旅纸签。");
      return;
    }
    if (value < 1 || value > 10) return;
    if (scene === 1 && value > scene) { music.start(); track("journey_start"); }
    if (value === 8) track("mountain_enter");
    transitioning.current = true;
    const arrival=()=>{if(value===8)setMountainResting(true);dispatch({type:"scene",scene:value as SceneId});};
    const materials:Record<number,string>={1:"paper",2:"paper",3:"paper",4:"warm",5:"ink",6:"wood",7:"forest",8:"mist",9:"window",10:"paper"};
    const material=materials[value];
    const bridgeImage=value===6&&state.completedInteractions.includes("year")?"new-year/banquet.webp":undefined;
    const forestComplete=value===7&&state.completedInteractions.includes("macaque");
    if(!material){arrival();transitionTimers.current.push(setTimeout(()=>{transitioning.current=false;},520));return;}
    setFilm({material,phase:"cover",bridgeImage,forestComplete});
    transitionTimers.current.push(setTimeout(()=>{arrival();setFilm({material,phase:"uncover",bridgeImage,forestComplete});
      transitionTimers.current.push(setTimeout(()=>{setFilm(null);transitioning.current=false;},reduced?120:850));
    },reduced?80:650));
  }
  useEffect(() => {
    if (scene > 0 && !film) {
      const title = canvas.current?.querySelector<HTMLElement>("h1");
      title?.setAttribute("tabindex", "-1");
      title?.focus({ preventScroll: true });
    }
  }, [scene,film]);
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
          <header className="scene-header" inert={modal||film!==null}>
            <button aria-label="返回上一幕" onClick={() => go(scene - 1)}>
              ‹
            </button>
            <span>一卷冬日行旅</span>
            <small>{String(scene).padStart(2, "0")} / 10</small>
          </header>
        )}
        {immersive && <button className={"edge-back" + (edgeAwake ? " awake" : "")} aria-label="返回上一幕" inert={modal||film!==null} onClick={() => go(scene - 1)}>‹</button>}
        <div
          key={scene}
          className={
            "scene-content scene-body-" +
            scene +
            (state.direction < 0 ? " backwards" : "")
          }
          inert={modal||film!==null}
        >
          {content}
        </div>
        {scene > 0 && scene < 10 && !immersive && (
          <footer
            className={"scene-footer " + (scene === 1 ? "hero-footer" : "")}
            inert={modal||film!==null}
          >
            <span className="chapter-label">
              {scene === 1 ? "轻音乐伴你启程" : sceneNames[scene]}
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
        {music.element}
        {film && <ScenePassage {...film}/>}
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

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useJourney } from "../app/JourneyContext";
import { useReducedMotion } from "../hooks/useInteraction";
export function Mountain({ onRest }: { onRest: (value: boolean) => void }) {
  const { dispatch } = useJourney();
  const [height, setHeight] = useState(0);
  const [settled, setSettled] = useState(false);
  const above = height >= .85;
  useEffect(() => {
    setSettled(false); onRest(above);
    if (!above) return;
    const timer = setTimeout(() => { setSettled(true); onRest(false); }, 1500);
    return () => { clearTimeout(timer); onRest(false); };
  }, [above, onRest]);
  const origin = useRef<{ y: number; value: number } | null>(null);
  const reduced = useReducedMotion();
  const drag = (e: PointerEvent) => {
    if (origin.current)
      setHeight(
        Math.max(
          0,
          Math.min(
            1,
            origin.current.value + (origin.current.y - e.clientY) / 230,
          ),
        ),
      );
  };
  return (
    <>
      <div
        className="mountain-art"
        data-interaction
        role="slider"
        tabIndex={0}
        aria-label="向上推动画面，进入黄山云端"
        aria-valuenow={Math.round(height * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={(e) => {
          dispatch({ type: "lock", value: true });
          origin.current = { y: e.clientY, value: height };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={drag}
        onPointerUp={() => {
          origin.current = null;
          dispatch({ type: "lock", value: false });
        }}
        onPointerCancel={() => {
          origin.current = null;
          dispatch({ type: "lock", value: false });
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            setHeight((h) =>
              Math.max(
                0,
                Math.min(1, h + (e.key === "ArrowUp" ? 0.15 : -0.15)),
              ),
            );
          }
        }}
      >
        <img
          className="mountain-panorama"
          src="/assets/mountain/panorama.webp"
          alt="黄山冬日峰峦与云海"
          style={{
            transform: `translateY(${reduced ? 0 : height * 20}px) scale(1.12)`,
          }}
        />
        {["clouds", "snow", "rocks", "pine", "forest"].map((layer, i) => (
          <img
            key={layer}
            className={"mountain-layer " + layer}
            src={"/assets/mountain/" + layer + ".webp"}
            alt=""
            draggable={false}
            style={{
              transform: `translateY(${reduced ? 0 : height * (50 + i * 28)}px)`,
              opacity: layer === "forest" ? 1 - height * 0.7 : layer === "clouds" ? .38 : 1,
            }}
          />
        ))}
      </div>
      <div className="mountain-heading">
        <div className="eyebrow">DAY 4 — DAY 5</div>
        <h1>
          从徽州人间，
          <br />
          走到黄山云端。
        </h1>
      </div>
      <div
        className="mountain-route"
        style={{ opacity: Math.max(0, 1 - height * 3) }}
      >
        <small>DAY 4</small>
        <p>
          玉屏景区 · 迎客松
          <br />
          守松相关文化内容
        </p>
        <span>北海区域</span>
      </div>
      <div
        className="mountain-route later"
        style={{ opacity: above && settled ? 1 : 0 }}
      >
        <small>DAY 5</small>
        <p>
          冬日黄山 · 日出可选
          <br />
          山顶亲子时光
        </p>
      </div>
      <div className="mountain-instruction" data-interaction>
        <button onClick={() => setHeight((h) => (h > 0.5 ? 0 : 1))}>
          {height > 0.5 ? "回望山下" : "向上轻推，慢慢入云"}
        </button>
      </div>
    </>
  );
}

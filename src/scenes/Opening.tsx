import { useEffect } from "react";
import { useJourney } from "../app/JourneyContext";
import { expectations } from "../content/copy";
import { routeFirst } from "../content/route";
import { track } from "../analytics";
export function Prologue() {
  const { dispatch } = useJourney();
  useEffect(() => {
    track("h5_open");
    const begin = performance.now();
    let settled = false;
    const image = new Image();
    image.src = "/assets/hero/hero.webp";
    const finish = () => {
      if (settled) return;
      settled = true;
      dispatch({ type: "scene", scene: 1 });
    };
    image.onload = () =>
      setTimeout(finish, Math.max(0, 1800 - (performance.now() - begin)));
    image.onerror = () => setTimeout(finish, 1800);
    const fallback = setTimeout(finish, 6500);
    return () => {
      settled = true;
      clearTimeout(fallback);
      image.onload = null;
      image.onerror = null;
    };
  }, [dispatch]);
  return (
    <div className="prologue">
      <svg viewBox="0 0 320 130" aria-hidden>
        <path d="M10 101 H44 V77 L69 57 94 77 V101 H115 L155 53 180 75 222 24 264 80 277 80 M238 85 229 52 224 35 M223 48 201 47 M229 57 253 51 M213 42 223 35 242 34" />
        <circle cx="78" cy="22" r="1" />
        <circle cx="190" cy="11" r="1" />
        <circle cx="277" cy="29" r="1" />
      </svg>
      <span className="prologue-seal">徽州 · 黄山</span>
      <p>一卷冬日行旅</p>
    </div>
  );
}
export function Hero() {
  return (
    <>
      <img
        className="hero-image"
        src="/assets/hero/hero.webp"
        alt="鱼灯、徽州白墙黛瓦与远处冬雪黄山的行旅意境"
        fetchPriority="high"
      />
      <div className="hero-wash" />
      <div className="hero-brand">
        <strong>新东方文旅</strong>
        <span>一卷冬日行旅</span>
      </div>
      <div className="hero-copy">
        <div className="hero-kicker">徽州 · 黄山 / 冬日</div>
        <h1>
          把一个中国年，
          <br />
          过进孩子的
          <br />
          记忆里。
        </h1>
        <p>6天，从徽州灯火走到黄山冬雪</p>
      </div>
      <div className="hero-product">徽州过大年 · 黄山冬雪亲子六日营</div>
    </>
  );
}
export function Expectations() {
  const { state, dispatch } = useJourney();
  return (
    <>
      <div className="eyebrow">启程之前 · 留一张纸签</div>
      <h1 className="expectation-title">
        如果这个寒假
        <br />
        只能留下一种记忆，
        <br />
        你更希望孩子
        <br />
        带回来什么？
      </h1>
      <div className="paper-options" data-interaction>
        {expectations.map((x) => (
          <button
            className={
              "paper-option " + (state.expectation === x.id ? "selected" : "")
            }
            key={x.id}
            onClick={() => {
              dispatch({ type: "expectation", value: x.id });
              track("expectation_select", { expectation: x.id });
            }}
            aria-pressed={state.expectation === x.id}
          >
            <span className="choice-number">{x.number}</span>
            <div>
              <strong>{x.title}</strong>
              <small>{x.note}</small>
            </div>
            {state.expectation === x.id && (
              <span className="choice-seal" aria-label="已选择">
                记
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="quiet-note">
        没有标准答案，
        <br />
        这只决定你的行旅卷最后如何展开。
      </p>
    </>
  );
}
export function FirstRoute() {
  return (
    <>
      <div className="eyebrow">六天 · 一段完整的冬日</div>
      <h1>先从人间出发。</h1>
      <div className="route-intro">
        <div className="route-ink-line" />
        {routeFirst.map((name, i) => (
          <div
            className={"route-first-node " + (i === 1 ? "warm-node" : "")}
            key={name}
          >
            <small>D{i + 1}</small>
            <span className="route-dot" />
            <p>{name}</p>
          </div>
        ))}
      </div>
      <p className="quiet-note">
        灯火在前，冬雪在后。
        <br />
        我们先到徽州的青石巷里去。
      </p>
    </>
  );
}

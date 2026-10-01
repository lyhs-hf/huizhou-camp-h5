import { useState, useRef, useEffect } from "react";
import { useJourney } from "../app/JourneyContext";
import { route } from "../content/route";
import { results } from "../content/results";
import { valueCopy } from "../content/copy";
import { renderCard } from "../utils/saveCard";
import { track } from "../analytics";
export function Closing({ onLead }: { onLead: () => void }) {
  const { state, dispatch } = useJourney();
  const expectation = state.expectation ?? "family";
  const result = results[expectation];
  const card = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState("");
  const imageUrl = useRef("");
  useEffect(() => {
    track("route_overview_view");
    track("result_generated", { expectation });
    dispatch({ type: "result" });
    return () => {
      if (imageUrl.current) URL.revokeObjectURL(imageUrl.current);
    };
  }, [dispatch, expectation]);
  async function save() {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const blob = await renderCard(card.current!);
      if (imageUrl.current) URL.revokeObjectURL(imageUrl.current);
      imageUrl.current = URL.createObjectURL(blob);
      setImage(imageUrl.current);
      const a = document.createElement("a");
      a.download = "我的冬日行旅卷.png";
      a.href = imageUrl.current;
      a.click();
      track("result_save", { expectation });
    } catch (e) {
      setError(e instanceof Error ? e.message : "请稍后再试");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="closing-content">
      <div className="closing-opening">
        <div className="eyebrow">归卷 · 把记忆串成一段旅程</div>
        <h1>
          你刚刚体验的，
          <br />
          只是这6天中的
          <br />
          几个片段。
        </h1>
        <p>
          一卷冬日行旅
          <br />
          从徽州灯火，到黄山冬雪。
        </p>
      </div>
      <section className="full-route" aria-label="六日完整路线">
        <div className="route-landscape" />
        <div className="eyebrow">六日 · 山水行旅图</div>
        {route.map((day) => (
          <article className="route-day" key={day.day}>
            <div className="day-number">D{day.day}</div>
            <div>
              <h2>{day.title}</h2>
              <p>{day.places.join(" · ")}</p>
              <small>{day.subtitle}</small>
            </div>
            {(day.day === 2
              ? ["灯", "墨"]
              : day.day === 3
                ? ["年"]
                : day.day === 4
                  ? ["山"]
                  : []
            )
              .filter((x) =>
                state.collectedStamps.includes(x as "灯" | "墨" | "年" | "山"),
              )
              .map((x, i) => (
                <span
                  key={x}
                  className="route-stamp"
                  data-testid="collected-stamp"
                  style={{ top: 20 + i * 35 }}
                >
                  {x}
                </span>
              ))}
          </article>
        ))}
      </section>
      <section className="value-section">
        <div className="eyebrow">一家人，都有所获得</div>
        <h1>
          一条好路线，
          <br />
          不是把景点
          <br />
          排在一起。
        </h1>
        <div className="values">
          {valueCopy.map((x) => (
            <div key={x.title}>
              <h3>{x.title}</h3>
              <p>{x.body}</p>
            </div>
          ))}
        </div>
        <div className="value-outro">
          <h2>新东方文旅。</h2>
          <p>把文化变成动作，<br />把知识变成问题，<br />把自然变成观察。</p>
          <p>让体验与家人的关系，<br />成为一段完整旅行。</p>
        </div>
      </section>
      <section className="result-section">
        <div ref={card} className="result-card" data-testid="result-card">
          <div className="result-brand">
            新东方文旅 <span>徽州 · 黄山</span>
          </div>
          <h2>我的冬日行旅卷</h2>
          <div className="result-art">
            <img
              src={result.image}
              alt="与你的旅行期待相伴的冬日意境"
              loading="eager"
            />
            <span>
              六天，从徽州灯火
              <br />
              走到黄山冬雪
            </span>
          </div>
          <div className="result-text">
            <small>你可能更在意：</small>
            <h3>{result.headline}</h3>
            <p>{result.details}</p>
            <div className="result-focus">{result.focus}</div>
            <div className="result-stamps">
              {["灯", "墨", "年", "山"].map((x) => (
                <span
                  key={x}
                  className={
                    state.collectedStamps.includes(
                      x as "灯" | "墨" | "年" | "山",
                    )
                      ? "collected"
                      : ""
                  }
                >
                  {x}
                </span>
              ))}
            </div>
          </div>
          <footer>
            把一个中国年，过进孩子的记忆里。
            <small>行旅意境呈现 · 非真实团期照片</small>
          </footer>
        </div>
        <button
          className="outline-button save-button"
          onClick={save}
          disabled={saving}
        >
          {saving ? "正在收好这一卷…" : "保存我的冬日行旅卷"}
        </button>
        <div role="status" className="save-status">
          {error || (image ? "行旅卷已生成，也可以长按下图保存。" : "")}
        </div>
        {image && (
          <img
            className="saved-preview"
            src={image}
            alt="已生成的高分辨率冬日行旅卷，可长按保存"
            data-testid="saved-image"
          />
        )}
      </section>
      <section className="closing-cta">
        <div className="eyebrow">新东方文旅</div>
        <h2>
          这个冬天，
          <br />
          想和孩子一起
          <br />
          走进这卷山水吗？
        </h2>
        <p>徽州过大年 · 黄山冬雪亲子六日营</p>
        <small className="price">¥10,880起｜具体以实际营期为准</small>
        <button
          className="primary"
          onClick={(e) => {
            e.currentTarget.focus();
            onLead();
          }}
        >
          获取完整营期资料
        </button>
        <small>具体体验安排以实际营期与行程资料为准。</small>
      </section>
      <p className="asset-disclosure">
        本页场景与手作视觉为生成的行旅意境。
        <br />
        线路内容依据所提供资料整理，不代替实际行程合同。
      </p>
    </div>
  );
}

import { useState, useEffect, useRef, type FormEvent } from "react";
import { Sheet } from "./Sheet";
import { submitLead } from "../services/lead";
import { validateLead } from "../services/validation.mjs";
import { track } from "../analytics";
import { useJourney } from "../app/JourneyContext";
export function LeadSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useJourney();
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const successRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    dispatch({ type: "lead", value: "idle" });
    return () => abort.current?.abort();
  }, [dispatch]);
  useEffect(() => {
    if (state.leadState === "success") successRef.current?.focus();
  }, [state.leadState]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (state.leadState === "submitting") return;
    track("lead_submit_attempt");
    const validation = validateLead(phone, age);
    if (validation) {
      setError(validation);
      if (validation.includes("手机号")) phoneRef.current?.focus();
      return;
    }
    setError("");
    dispatch({ type: "lead", value: "submitting" });
    abort.current = new AbortController();
    try {
      const response = await submitLead(
        { phone: phone.trim(), age, name: name.trim() || undefined },
        abort.current.signal,
      );
      if (!response.success) throw new Error("Submission failed");
      setPhone("");
      setName("");
      track("lead_submit_success", { demo: true });
      dispatch({ type: "lead", value: "success" });
    } catch {
      if (abort.current.signal.aborted) return;
      track("lead_submit_error", { reason: "request_failed" });
      dispatch({ type: "lead", value: "error" });
      setError("这次未能提交，请稍后再试。");
    }
  }
  return (
    <Sheet onClose={onClose} titleId="lead-title">
      {state.leadState === "success" ? (
        <div
          ref={successRef}
          className="lead-success"
          role="status"
          tabIndex={-1}
        >
          <span className="stamp-mark">已收到</span>
          <h2 id="lead-title">
            谢谢你，
            <br />
            与这卷冬日相遇。
          </h2>
          <p>
            演示提交已完成。
            <br />
            联系方式没有保存，也未发送给真实客服。
          </p>
          <button className="primary" onClick={onClose}>
            回到我的行旅卷
          </button>
        </div>
      ) : (
        <>
          <div className="eyebrow">新东方文旅 · 行旅咨询</div>
          <h2 id="lead-title">
            如果这趟旅行，
            <br />
            也像你想给孩子的寒假，
          </h2>
          <p className="sheet-intro">可以留下一个联系方式。</p>
          <form onSubmit={submit} noValidate>
            <label htmlFor="phone">
              家长手机号 <span>必填</span>
            </label>
            <input
              ref={phoneRef}
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="11位手机号"
              maxLength={11}
              aria-required="true"
              aria-invalid={Boolean(error && error.includes("手机号"))}
              aria-describedby="lead-error"
            />
            <label htmlFor="age">
              孩子年龄段 <span>必填</span>
            </label>
            <select
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              aria-required="true"
              aria-invalid={Boolean(error && error.includes("年龄段"))}
              aria-describedby="lead-error"
            >
              <option value="">请选择</option>
              <option>5–8岁</option>
              <option>9–12岁</option>
              <option>13–16岁</option>
            </select>
            <label htmlFor="name">
              称呼 / 微信 <span>可选</span>
            </label>
            <input
              id="name"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="方便我们称呼你"
              maxLength={60}
            />
            <div id="lead-error" className="form-error" role="alert">
              {error}
            </div>
            <button
              type="submit"
              className="primary"
              disabled={state.leadState === "submitting"}
            >
              {state.leadState === "submitting"
                ? "正在提交…"
                : "获取营期与完整资料"}
            </button>
            <p className="privacy">
              提交信息仅用于本次行程资料与咨询联系。
              <br />
              当前为演示，联系方式不会被保存。
            </p>
          </form>
        </>
      )}
    </Sheet>
  );
}

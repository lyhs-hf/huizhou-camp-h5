import { useEffect, useRef, useState, type ReactNode } from "react";
export function Sheet({
  children,
  onClose,
  titleId,
  className = "",
}: {
  children: ReactNode;
  onClose: () => void;
  titleId: string;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const begin = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const p = panel.current!;
    const focusables = () =>
      Array.from(
        p.querySelectorAll<HTMLElement>('button,input,select,[tabindex="0"]'),
      ).filter((el) => !el.hasAttribute("disabled"));
    focusables()[0]?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
      }
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) {
          e.preventDefault();
          p.focus();
          return;
        }
        if (!p.contains(document.activeElement)) {
          e.preventDefault();
          f[0].focus();
        } else if (
          e.shiftKey &&
          (document.activeElement === f[0] || document.activeElement === p)
        ) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      requestAnimationFrame(() => previous?.focus({ preventScroll: true }));
    };
  }, []);
  return (
    <div
      className="sheet-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        className={"sheet " + className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ transform: `translateY(${offset}px)` }}
      >
        <div
          className="sheet-grip"
          data-interaction
          onPointerDown={(e) => {
            begin.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (begin.current !== null)
              setOffset(Math.max(0, e.clientY - begin.current));
          }}
          onPointerUp={() => {
            if (offset > 70) onClose();
            else setOffset(0);
            begin.current = null;
          }}
          onPointerCancel={() => {
            setOffset(0);
            begin.current = null;
          }}
        />
        <button className="sheet-close" aria-label="关闭抽屉" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

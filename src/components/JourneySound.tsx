import { useCallback, useEffect, useRef, useState } from "react";
import { useJourney } from "../app/JourneyContext";
import { asset } from "../utils/asset";
import { frameProgress } from "../utils/frameProgress.mjs";

export function useJourneySound(scene: number, quiet: boolean) {
  const { state, dispatch } = useJourney();
  const audio = useRef<HTMLAudioElement>(null);
  const intention = useRef(false);
  const started = useRef(false);
  const fade = useRef(0);
  const targetVolume = useRef(.6);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    const player = audio.current;
    if (!player) return;
    intention.current = true;
    // Keep the call to play inside the user's activation, including Safari.
    if (!player.getAttribute("src")) player.src = asset("assets/audio/winter-passage.mp3");
    player.volume = targetVolume.current;
    dispatch({ type: "sound", value: true });
    void player.play().then(() => {
      if (!intention.current || document.hidden) player.pause();
    }).catch(() => {
      // Background interruption is not a user's decision to mute.
      if (intention.current && !document.hidden) {
        intention.current = false;
        dispatch({ type: "sound", value: false });
      }
    });
  }, [dispatch]);

  const pause = useCallback(() => {
    intention.current = false;
    audio.current?.pause();
    dispatch({ type: "sound", value: false });
  }, [dispatch]);

  useEffect(() => {
    const player = audio.current;
    const onHidden = () => {
      if (document.hidden) audio.current?.pause();
      else if (intention.current) play();
    };
    const onPageHide = () => audio.current?.pause();
    const onPageShow = () => { if (!document.hidden && intention.current) play(); };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      cancelAnimationFrame(fade.current);
      player?.pause();
    };
  }, [play]);

  useEffect(() => {
    targetVolume.current = scene === 7 ? .35 : scene === 5 || scene === 9 ? .45 : .6;
    const player = audio.current;
    if (!player) return;
    cancelAnimationFrame(fade.current);
    const begin = performance.now(), initial = player.volume;
    const ease = (now: number) => {
      const fraction = frameProgress(now, begin, 900);
      player.volume = Math.max(0, Math.min(1, initial + (targetVolume.current - initial) * fraction));
      if (fraction < 1) fade.current = requestAnimationFrame(ease);
    };
    fade.current = requestAnimationFrame(ease);
  }, [scene]);

  return {
    start: () => { if (!started.current) { started.current = true; play(); } },
    element: <>
      <audio ref={audio} loop preload="none" data-testid="journey-bgm" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      {scene > 1 && <button className={"sound-toggle" + (quiet ? " sound-quiet" : "")} aria-label={state.soundEnabled ? "关闭背景音乐" : "开启背景音乐"}
        aria-pressed={state.soundEnabled} data-playing={playing} onClick={() => intention.current ? pause() : play()}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M5 9H8L12 5V19L8 15H5Z"/>
          {state.soundEnabled ? <><path d="M16 8Q20 12 16 16"/><path d="M19 5Q25 12 19 19"/></> : <path d="M16 9L22 15M22 9L16 15"/>}
        </svg>
      </button>}
    </>,
  };
}

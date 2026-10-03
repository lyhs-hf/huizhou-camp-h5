import { useCallback, useEffect, useRef, useState } from "react";
import { useJourney } from "../app/JourneyContext";
import { asset } from "../utils/asset";
export type MusicState="a"|"b"|"c"|"d";
export function musicForScene(scene:number):MusicState { return scene<4?"a":scene<7?"b":scene<9?"c":"d"; }
const PERIOD=160/3; // 16 bars at 72 BPM, shared by all four arrangements.
type Voice={source:AudioBufferSourceNode;gain:GainNode;state:MusicState};
export function useJourneySound(scene:number,quiet:boolean,summit=false) {
  const {state,dispatch}=useJourney();
  const context=useRef<AudioContext|null>(null);
  const filter=useRef<BiquadFilterNode|null>(null);
  const output=useRef<GainNode|null>(null);
  const voices=useRef<Voice[]>([]);
  const buffers=useRef(new Map<MusicState,Promise<AudioBuffer>>());
  const intention=useRef(false),started=useRef(false),serial=useRef(0),alive=useRef(true);
  const wanted=useRef(musicForScene(scene));wanted.current=musicForScene(scene);
  const musicalOrigin=useRef<number|null>(null);
  const [playing,setPlaying]=useState(false),[loaded,setLoaded]=useState<string[]>([]);
  const [active,setActive]=useState<MusicState>("a");
  const ensure=useCallback(()=>{
    if(context.current)return context.current;
    const Constructor=window.AudioContext||(window as typeof window&{webkitAudioContext:typeof AudioContext}).webkitAudioContext;
    const ctx=new Constructor();context.current=ctx;
    const tone=ctx.createBiquadFilter();tone.type="lowpass";tone.frequency.value=7000;filter.current=tone;
    const gain=ctx.createGain();gain.gain.value=.65;output.current=gain;
    tone.connect(gain);gain.connect(ctx.destination);
    ctx.onstatechange=()=>{if(alive.current)setPlaying(ctx.state==="running"&&intention.current);};
    return ctx;
  },[]);
  const load=useCallback((key:MusicState)=>{
    const cached=buffers.current.get(key);if(cached)return cached;
    const ctx=ensure();
    const promise=fetch(asset(`assets/audio/journey-${key}.mp3`)).then(r=>{if(!r.ok)throw Error("Music unavailable");return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).then(b=>{if(alive.current)setLoaded(list=>[...new Set([...list,key])]);return b;});
    buffers.current.set(key,promise);return promise;
  },[ensure]);
  const change=useCallback(async(key:MusicState,cue?:number)=>{
    const ticket=++serial.current;
    try {
      const buffer=await load(key),ctx=ensure();
      if(!alive.current||ticket!==serial.current||!intention.current)return;
      const current=voices.current.find(v=>v.state===key);
      if(current&&cue===undefined)return;
      const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;source.loopEnd=key==="c"&&cue===undefined?PERIOD/2:PERIOD;source.loopStart=cue??0;
      source.connect(gain);gain.connect(filter.current!);
      const at=ctx.currentTime,fade=1.25;
      // All arrangements share the same bars. Their musical phase stays aligned.
      musicalOrigin.current??=at;
      if(cue!==undefined)musicalOrigin.current=at-cue;
      const offset=cue??((at-musicalOrigin.current)%source.loopEnd);
      gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(1,at+fade);
      for(const old of voices.current){old.gain.gain.cancelScheduledValues(at);old.gain.gain.setValueAtTime(old.gain.gain.value,at);old.gain.gain.linearRampToValueAtTime(0,at+fade);old.source.stop(at+fade+.02);}
      source.start(at,offset);voices.current=[{source,gain,state:key}];
      setActive(key);setPlaying(ctx.state==="running");
      const next=({a:"b",b:"c",c:"d",d:null} as const)[key];if(next)void load(next).catch(()=>{});
    }catch{if(alive.current){setPlaying(false);intention.current=false;dispatch({type:"sound",value:false});}}
  },[dispatch,ensure,load]);
  const play=useCallback(()=>{
    intention.current=true;dispatch({type:"sound",value:true});
    const ctx=ensure(); // resume is called synchronously inside the user's gesture.
    void ctx.resume().then(()=>{if(!intention.current||document.hidden){void ctx.suspend();return;}setPlaying(true);void change(wanted.current);}).catch(()=>{intention.current=false;setPlaying(false);dispatch({type:"sound",value:false});});
  },[change,dispatch,ensure]);
  const pause=useCallback(()=>{intention.current=false;serial.current++;void context.current?.suspend();setPlaying(false);dispatch({type:"sound",value:false});},[dispatch]);
  useEffect(()=>{if(intention.current)void change(musicForScene(scene));},[scene,change]);
  useEffect(()=>{if(scene===8&&summit&&intention.current)void change("c",PERIOD/2);},[scene,summit,change]);
  useEffect(()=>{
    const ctx=context.current;if(!ctx||!filter.current||!output.current)return;
    const at=ctx.currentTime;
    filter.current.frequency.cancelScheduledValues(at);filter.current.frequency.setTargetAtTime(scene===5?1450:scene===7?2400:7000,at,.45);
    output.current.gain.cancelScheduledValues(at);output.current.gain.setTargetAtTime(quiet?.48:scene===7?.46:.65,at,.35);
    for(const voice of voices.current)if(voice.state==="c"){
      voice.source.loopStart=scene===7||!summit?0:PERIOD/2;
      voice.source.loopEnd=scene===7||!summit?PERIOD/2:PERIOD;
    }
  },[scene,quiet,summit,active,playing]);
  useEffect(()=>{
    alive.current=true;
    const hide=()=>{void context.current?.suspend();setPlaying(false);};
    const show=()=>{if(intention.current&&!document.hidden)play();};
    const visibility=()=>document.hidden?hide():show();
    document.addEventListener("visibilitychange",visibility);window.addEventListener("pagehide",hide);window.addEventListener("pageshow",show);
    return()=>{alive.current=false;document.removeEventListener("visibilitychange",visibility);window.removeEventListener("pagehide",hide);window.removeEventListener("pageshow",show);void context.current?.close();};
  },[play]);
  return {start:()=>{if(!started.current){started.current=true;play();}},element:<>
    <span hidden data-testid="journey-bgm" data-state={active} data-playing={playing} data-loaded={loaded.join(",")} data-looplength={PERIOD} data-contextstate={context.current?.state??"unstarted"}/>
    {scene>1&&<button className={"sound-toggle"+(quiet?" sound-quiet":"")} aria-label={state.soundEnabled?"关闭背景音乐":"开启背景音乐"} aria-pressed={state.soundEnabled} data-playing={playing} onClick={()=>intention.current?pause():play()}><svg viewBox="0 0 24 24" aria-hidden><path d="M5 9H8L12 5V19L8 15H5Z"/>{state.soundEnabled?<><path d="M16 8Q20 12 16 16"/><path d="M19 5Q25 12 19 19"/></>:<path d="M16 9L22 15M22 9L16 15"/>}</svg></button>}
  </>};
}

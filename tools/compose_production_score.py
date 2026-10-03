"""一卷冬日行旅 — hand-written, four-movement acoustic score.
Build-time PCM sampler; no General MIDI renderer or scale-note generator.
Requires recorded samples in /tmp/huizhou-acoustic-samples (see ATTRIBUTION.txt).
Only finished, mastered MP3s ship; raw sample libraries remain outside the repo.
"""
from pathlib import Path
import math, re, subprocess, wave, json
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
SAMPLES=Path('/tmp/huizhou-acoustic-samples')
WORK=Path('/tmp/huizhou-acoustic-score');WORK.mkdir(exist_ok=True)
SR=32000; BEAT=60/72; PERIOD=64*BEAT; N=round(PERIOD*SR)
# Eight-bar antecedent / answer. Every pitch, rest and cadence is authored.
MELODY=[
 [(66,.15,1.1),(69,1.5,.65),(71,2.3,.65),(69,3.1,.65)],
 [(66,.0,.85),(64,1.1,.6),(66,2.0,.85),(62,3.15,.65)],
 [(64,.1,.65),(66,1.0,.7),(69,2.0,.8),(73,3.0,.65)],
 [(71,.0,1.3),(69,1.65,.6),(66,2.65,.8)],
 [(67,.15,.8),(66,1.2,.65),(64,2.3,1.25)],
 [(64,.1,.6),(61,1.0,.8),(62,2.0,.65),(64,3.0,.65)],
 [(66,.0,1.25),(69,1.65,.65),(67,2.55,.55),(66,3.25,.5)],
 [(64,.0,1.05),(62,1.5,1.75)],
]
# Inversions and inner-voice motion prevent one repeated chord/drone.
HARMONY=[
 [38,57,62,66,69],[45,57,61,64,69],[47,54,62,66,69],[43,55,59,62,66],
 [40,55,59,64,66],[45,55,61,64,69],[38,57,62,66,69],[45,57,62,64,69],
 [38,57,62,66,73],[47,54,59,62,69],[43,55,59,62,69],[45,55,61,64,71],
 [40,55,59,64,67],[45,57,61,64,69],[38,57,62,66,69],[45,57,61,64,69],
]
cache={}; banks={}
def pcm(path):
 if path not in cache:
  data=subprocess.check_output(['ffmpeg','-xerror','-v','error','-i',str(path),'-f','f32le','-ac','2','-ar',str(SR),'-'])
  a=np.frombuffer(data,np.float32).reshape(-1,2).copy()
  # Preserve recorded attacks, taking out only leading recording silence.
  energy=np.max(np.abs(a),axis=1); hits=np.flatnonzero(energy>max(.0001,float(energy.max())*.006))
  if len(hits):a=a[max(0,int(hits[0])-int(SR*.012)):]
  peak=float(np.quantile(np.max(np.abs(a),axis=1),.997))
  a*=.48/max(peak,.02)
  cache[path]=a
 return cache[path]
def rootnote(name):
 m=re.search(r'([A-G](?:#)?)(\d)',name); names={'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
 return (int(m[2])+1)*12+names[m[1]]
for kind in ['piano','harp','flute','cello']:
 banks[kind]=[(rootnote(f.name)+(12 if kind in ['flute','cello'] else 0),f) for f in sorted((SAMPLES/kind).glob('*')) if f.suffix in ['.wav','.flac']]
 assert banks[kind],kind

def voice(kind,pitch,duration,velocity=0.6):
 bank=banks[kind]
 if kind=='piano':
  layer=7 if velocity>.64 else 4
  bank=[(root,f) for root,f in bank if f.name.endswith('v'+str(layer)+'.flac')]
 source,path=min(bank,key=lambda x:abs(x[0]-pitch));a=pcm(path)
 rate=2**((pitch-source)/12)
 # A recorded source no more than two semitones away for melody/piano.
 length=min(len(a)/rate,SR*(duration+(2.8 if kind in ['piano','harp'] else .26)))
 pos=np.arange(int(length),dtype=np.float64)*rate
 out=np.column_stack([np.interp(pos,np.arange(len(a)),a[:,c]) for c in [0,1]]).astype(np.float32)
 t=np.arange(len(out))/SR
 if kind in ['flute','cello']:
  attack=.05 if kind=='flute' else .24
  env=np.minimum(1,t/attack)
  # Breath-led crescendo and relaxed release, preserving source fluctuations.
  env*=.72+.28*np.sin(np.pi*np.minimum(1,t/max(duration,.1)))
  env*=np.exp(-np.maximum(0,t-duration)/(0.07 if kind=='flute' else .12))
 else:
  env=np.ones(len(out));release=duration+(.2 if kind=='piano' else .4)
  env*=np.exp(-np.maximum(0,t-release)/(.6 if kind=='piano' else .8))
  env[:min(120,len(out))]*=np.linspace(0,1,min(120,len(out)))
 env[-min(256,len(out)):] *=np.linspace(1,0,min(256,len(out)))
 return out*env[:,None]*velocity

def add_circular(bus,a,seconds,gain=1,pan=0):
 a=a*np.array([math.sqrt((1-pan)/2),math.sqrt((1+pan)/2)],np.float32)*gain
 start=round(seconds*SR)%N
 first=min(N-start,len(a));bus[start:start+first]+=a[:first]
 left=len(a)-first
 if left:bus[:left]+=a[first:]

def reverb(a):
 # Periodic convolution carries real release tails across the loop boundary.
 # Short natural-room reflections; no audible repeating delay line.
 rng=np.random.default_rng(730)
 out=np.zeros_like(a)
 for ch in range(2):
  ir=np.zeros(N,np.float32)
  for at,g in [(0.029,.23),(0.047,.18),(0.073,.12),(0.109,.08)]:ir[round((at+ch*.007)*SR)]=g
  tail=int(SR*1.7);t=np.arange(tail)/SR
  noise=rng.normal(0,1,tail).astype(np.float32)
  noise=np.convolve(noise,np.ones(13)/13,mode='same')
  ir[int(.12*SR):int(.12*SR)+tail]+=noise*np.exp(-t*4.4)*.0032
  out[:,ch]=np.fft.irfft(np.fft.rfft(a[:,ch])*np.fft.rfft(ir),n=N).astype(np.float32)
 return out

def render(stage):
 dry=np.zeros((N,2),np.float32);send=np.zeros_like(dry)
 rng=np.random.default_rng(947)
 def note(kind,pitch,beat,length,vel,gain=1,pan=0):
  # Microtiming affects interpretation, never selects notes or harmony.
  jitter=float(rng.normal(0,.008)) if kind in ['piano','harp'] else .012*math.sin(beat*.7)
  audio=voice(kind,pitch,length*BEAT,vel)
  add_circular(dry,audio,beat*BEAT+jitter,gain,pan)
  add_circular(send,audio,beat*BEAT+jitter,gain*{'piano':.16,'harp':.2,'flute':.24,'cello':.28}[kind],pan)
 for bar,chord in enumerate(HARMONY):
  start=bar*4;phrase=MELODY[bar%8];arc=[.88,.93,1.03,.92,.83,.9,1.04,.8][bar%8]
  quiet_forest=stage=='C' and bar<8
  # Melodic placement: A breath, B string warmth, C open summit, D piano return.
  for j,(pitch,at,length) in enumerate(phrase):
   if quiet_forest:
    if bar in [0,3,6] and j==0:note('flute',pitch,start+at,length*1.6,.48,.30,.12)
    continue
   main='harp' if stage=='B' else 'piano' if stage in ['C','D'] else 'flute'
   dynamic=(.64 if stage=='B' else .61 if stage=='A' else .71 if stage=='C' else .66)*arc
   # Repeat develops the phrase rather than mechanically replaying every bar.
   if bar>=8 and bar%8==2 and j==3:pitch=74
   if bar>=8 and bar%8==3 and j==0:pitch=73
   note(main,pitch,start+at,length,dynamic,.49 if main=='flute' else .56,-.1 if main=='piano' else .16)
   if stage=='D' and bar in [3,7,11,15] and j==0:note('flute',pitch,start+at+.08,length*1.3,.43,.16,.24)
   if stage=='B' and bar in [4,5,12,13] and j<2:note('flute',pitch,start+at+.045,length*.9,.39,.13,.22)
  # Sustained low acoustic foundation, harmonic changes in each bar.
  if bar%2==0:
   note('cello',chord[0]+12,start+.07,6.9,.43,.16 if quiet_forest else .17,-.22)
  note('piano',chord[0],start+.025,2.65,.46,.24 if stage!='C' else .19,-.15)
  if quiet_forest:
   if bar%3==0:note('harp',chord[3],start+2.25,1.4,.42,.2,-.32)
   continue
  if stage=='A':pattern=[(.18,2,.38),(1.75,4,.32),(2.8,3,.36)]
  elif stage=='B':pattern=[(.05,2,.48),(.8,3,.4),(1.75,4,.43),(2.5,3,.37),(3.25,2,.4)]
  elif stage=='C':pattern=[(.12,2,.42),(1.45,3,.38),(2.75,4,.43)]
  else:pattern=[(.09,1,.39),(.85,2,.4),(2.0,3,.36),(2.85,4,.37)]
  for at,v,vel in pattern:
   inst='harp' if stage in ['A','C','D'] else 'piano'
   note(inst,chord[v],start+at,1.65,vel*arc,.24 if stage!='B' else .27,-.3)
  # Quiet answer in the inner voice: a composed countermelody, not a pad.
  if stage in ['C','D'] and bar>=8:
   note('cello',chord[2],start+.45,2.8,.35,.11,-.23)
  if stage=='B':
   per=SAMPLES/'percussion'
   for at,name,level,pan in [(0,'BDrumNewhit_v1_rr1_Sum.wav',.04,0),(1.65,'Claves1_Hit_v1_rr1_Sum.wav',.026,-.32),(3.15,'Claves1_Hit_v1_rr2_Sum.wav',.02,.24)]:
    path=per/name
    if path.exists():add_circular(dry,pcm(path),BEAT*(start+at)+.01,level*(.7 if bar<4 else 1),pan)
   if bar in [7,15]:add_circular(dry,pcm(per/'Triangle3-HitM_v1_rr1_Sum.wav'),BEAT*(start+2.85),.014,.35)
 mix=dry+reverb(send)
 # De-click the PCM loop, without a noticeable fade-out / restart.
 width=int(SR*.02); delta=mix[-1]-mix[0];mix[:width]+=delta*np.linspace(1,0,width)[:,None]
 peak=float(np.max(np.abs(mix)));mix*=.8/max(peak,.1)
 path=WORK/f'{stage}-mix.wav'
 with wave.open(str(path),'w') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(mix,-.99,.99)*32767).astype(np.int16).tobytes())
 filt='highpass=f=45,lowpass=f=11500,loudnorm=I=-19:TP=-1:LRA=10:print_format=json'
 info=subprocess.run(['ffmpeg','-hide_banner','-i',str(path),'-af',filt,'-f','null','-'],capture_output=True,text=True,check=True).stderr
 stats=json.JSONDecoder().raw_decode(info[info.rfind('{'):])[0];master=f"highpass=f=45,lowpass=f=11500,loudnorm=I=-19:TP=-1:LRA=10:measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:offset={stats['target_offset']}:linear=true"
 dest=ROOT/f'public/assets/audio/journey-{stage.lower()}.mp3'
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(path),'-af',master,'-ar','44100','-c:a','libmp3lame','-b:a','160k','-metadata','title=一卷冬日行旅 · '+stage,'-metadata','comment=Original score; Salamander piano by Alexander Holm CC BY 3.0; VSCO2 CE CC0. See ATTRIBUTION.txt.',str(dest)],check=True)
 print(stage,round(PERIOD,3),dest.stat().st_size,'raw LRA',stats['input_lra'],flush=True)
if __name__=='__main__':
 for stage in 'ABCD':render(stage)

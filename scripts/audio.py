"""Generate original, seamless local ambience and a soft music loop; no network audio."""
import wave,math,struct,random
random.seed(7)
rate=22050
for name in ['music','nature','victory']:
 data=[];duration=8
 for i in range(rate*duration):
  t=i/rate
  if name=='victory':
   value=sum(.06*math.sin(2*math.pi*f*t)*math.exp(-t*2) for f in [523.25,659.25,783.99])*min(1,t*40)
  elif name=='music':
   step=int(t/.5);freq=[261.63,329.63,392,523.25,440,392,329.63,293.66][step%8];phase=t%.5
   value=.16*math.sin(2*math.pi*freq*t)*math.exp(-phase*9)*min(1,phase*100)
  else:
   value=.025*(random.random()*2-1)+.025*math.sin(2*math.pi*(1200+100*math.sin(t*math.pi))*t)*(math.sin(t*math.pi*2)**16)
  # Fade boundary to avoid loop clicks.
  value*=min(1,t*10,(duration-t)*10)
  data.append(struct.pack('<h',int(value*32767)))
 with wave.open('assets/'+name+'.wav','wb') as w:w.setparams((1,2,rate,0,'NONE','not compressed'));w.writeframes(b''.join(data))

"""Rasterize approved original SVGs into transparent native 1x/2x/3x sprites.
Requires scripts/requirements-art.txt; never replaces or edits the SVG originals.
"""
from pathlib import Path
import hashlib, io, json
import cairosvg
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SIZES={'firefly':(24,24),'bird':(40,25),'butterfly':(28,28),'autumn-leaf':(20,20),'snowflake':(12,12),'flower-petal':(16,16),'glimmer':(24,24)}
OUT=ROOT/'assets/ambient';OUT.mkdir(parents=True,exist_ok=True)
provenance=[]
for name,(w,h) in SIZES.items():
 source=ROOT/'artwork/ambient'/f'{name}.svg';data=source.read_bytes()
 for scale in (1,2,3):
  # Supersample each density for smooth transparent edges and downsample in RGBA.
  png=cairosvg.svg2png(bytestring=data,output_width=w*scale*4,output_height=h*scale*4)
  image=Image.open(io.BytesIO(png)).convert('RGBA').resize((w*scale,h*scale),Image.Resampling.LANCZOS)
  assert image.getchannel('A').getextrema()[0]==0, f'{name}: transparency missing'
  assert image.getchannel('A').getextrema()[1]>0, f'{name}: empty sprite'
  suffix='' if scale==1 else f'@{scale}x'
  image.save(OUT/f'{name}{suffix}.png',optimize=True)
 provenance.append({'id':name,'source':str(source.relative_to(ROOT)),'source_sha256':hashlib.sha256(data).hexdigest(),'native_path':f'assets/ambient/{name}.png','scales':[1,2,3],'logical_size':[w,h]})
(OUT/'provenance.json').write_text(json.dumps({'renderer':'CairoSVG 2.8.2 + Pillow, 4x supersampling/Lanczos','assets':provenance},indent=2)+'\n')
print('Prepared seven approved transparent sprites at three native densities.')

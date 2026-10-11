from pathlib import Path
from PIL import Image, ImageDraw
from collections import deque
import json,shutil,re
base=Path(__file__).parent
asset=base/'assets';out=asset/'learning-v4';out.mkdir(exist_ok=True)
drive=Path('G:/My Drive/krukan/Pic/Techno asset')
generated=Path('C:/Users/ikan/.codex/generated_images/01a12445-4c30-7700-9012-ea66bb6215c8')
names=['socks','shoe','tie','wash','meal','plate','paste','brush','cup','book','pencil','bag','carry','crystal','insert','lid','press','hole','soil','seed','water','flower','pillow','lie','blanket','wet','soap','rinse','towel','mouse','keyboard','eye','rock','leaf','moon','star']
src=generated/'exec-f46a5690-b7a0-4d0f-8e15-f451c50354ce.png'
im=Image.open(src).convert('RGBA');shutil.copy2(src,out/'activity-atlas-6x6-v4.png');shutil.copy2(src,drive/'p1-activity-atlas-6x6-v4.png')
manifest={'version':4,'sourceSize':im.size,'columns':6,'rows':6,'normalizedSize':[320,320],'minimumPadding':48,'assets':{}}
for i,name in enumerate(names):
    col,row=i%6,i//6
    box=(round(col*im.width/6),round(row*im.height/6),round((col+1)*im.width/6),round((row+1)*im.height/6))
    tile=im.crop(box);w,h=tile.size
    # Drop narrow cell-border fragments and tiny disconnected transparent-background noise.
    tile=tile.crop((5,5,w-5,h-5));w,h=tile.size;a=tile.getchannel('A');mask=a.point(lambda v:255 if v>=90 else 0);pix=mask.load();seen=set();components=[]
    for y in range(h):
        for x in range(w):
            if not pix[x,y] or (x,y) in seen:continue
            q=deque([(x,y)]);seen.add((x,y));group=[]
            while q:
                xx,yy=q.popleft();group.append((xx,yy))
                for nx,ny in [(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)]:
                    if 0<=nx<w and 0<=ny<h and pix[nx,ny] and (nx,ny) not in seen:seen.add((nx,ny));q.append((nx,ny))
            components.append(group)
    biggest=max(map(len,components));clean=Image.new('L',(w,h));cp=clean.load()
    for group in components:
        if len(group)>=max(18,biggest*.08):
            for x,y in group:cp[x,y]=a.getpixel((x,y))
    tile.putalpha(clean);bounds=clean.getbbox();tile=tile.crop(bounds);tile.thumbnail((224,224),Image.Resampling.LANCZOS)
    final=Image.new('RGBA',(320,320));final.alpha_composite(tile,((320-tile.width)//2,(320-tile.height)//2));final.save(out/f'{name}.png')
    manifest['assets'][name]={'sourceCell':i,'sourceBox':box,'contentBox':final.getchannel('A').getbbox()}
scene=Image.open(generated/'exec-165e341e-29cd-4c05-9c68-6f7e46f35a42.png').convert('RGB')
sceneNames=['plan','pictures','fix','mouse-use','keyboard-use','team']
for i,name in enumerate(sceneNames):
    c,r=i%3,i//3;box=(round(c*scene.width/3)+12,round(r*scene.height/2)+12,round((c+1)*scene.width/3)-12,round((r+1)*scene.height/2)-12)
    tile=scene.crop(box);tile.thumbnail((560,560),Image.Resampling.LANCZOS);tile.save(out/f'scene-{name}.jpg',quality=88)
shutil.copy2(generated/'exec-165e341e-29cd-4c05-9c68-6f7e46f35a42.png',drive/'p1-lesson-scenes-3x2-v4.png')
poses={'welcome':'techno-002-wave-hello.png','present':'techno-009-present-an-empty-area-with-open-hand.png','read':'techno-071-hold-book-open-reading.png','think':'techno-084-rest-chin-on-hand-thinking.png','mouse':'techno-058-use-computer-mouse-at-small-desk.png','keys':'techno-059-hold-keyboard-proudly.png','reward':'techno-074-celebrate-with-small-trophy.png','map':'techno-053-hold-miniature-planet-hologram.png'}
for alias,name in poses.items():shutil.copy2(drive/name,out/f'techno-{alias}.png')
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
shutil.copy2(out/'manifest.json',drive/'p1-learning-assets-v4-manifest.json')
contact=Image.new('RGB',(960,960),'#f4eff8');d=ImageDraw.Draw(contact)
for i,name in enumerate(names):
    tile=Image.open(out/f'{name}.png');tile.thumbnail((140,140));x=(i%6)*160+10;y=(i//6)*160;contact.paste(tile,(x,y),tile);d.text((x,y+140),f'{i:02} {name}',fill='#382447')
contact.save(out/'contact-sheet.jpg',quality=90)
# Reuse the actual planet code from the subject selector, scoped to prevent collisions.
source=(base.parent.parent/'Class-P1-Subject-Galaxy.html').read_text(encoding='utf-8')
selectors=['.halo','.ring','.ring.front','.planet','.planet::before','.planet::after','.el-thunder .planet','.el-thunder .planet::before','.el-thunder .aura','.bolt','.bolt.b1','.bolt.b2']
rules=[]
for selector in selectors:
    match=re.search(re.escape(selector)+r'\{([^}]+)\}',source)
    if match:rules.append('.shared-solar '+selector+'{'+match.group(1)+'}')
for name in ['spinband','zap']:
    match=re.search(r'@keyframes '+name+r'\{([^\n]+)',source)
    if match:rules.append('@keyframes '+name+'{'+match.group(1))
(base/'shared-planet.css').write_text('\n'.join(rules),encoding='utf-8')
bolt=re.search(r"const BOLT='([^']+)'",source).group(1)
(out/'planet-bolt.svg').write_text(bolt,encoding='utf-8')
print('Prepared 36 isolated padded images, 6 scenes, 8 Techno poses and shared planet CSS')

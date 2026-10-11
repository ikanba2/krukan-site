"""One-time migration of the existing lesson shell; do not run twice."""
from pathlib import Path
import shutil,json
from PIL import Image
folder=Path(__file__).resolve().parent
source=folder/'offline.source.html'
s=source.read_text(encoding='utf-8')
if '__LOGIN_SCRIPT__' not in s:
    s=s.replace('__BATTLE_STYLE__','__BATTLE_STYLE__\n__LOGIN_STYLE__')
    s=s.replace('<script>','<script>__PHASER_LIBRARY__</script>\n<script>',1)
    s=s.replace("const ASSETS={ship:'__SHIP__',techno:'__TECHNO__'};","const ASSETS={ship:'__SHIP__',techno:'__TECHNO__',boss:'__BOSS_FULL__',shooter:'__SHOOTER__',portrait:'__PORTRAIT__'};")
    start=s.index("const STORE='krukan-p1-offline-v1';")
    end=s.index('let step=',start)
    s=s[:start]+"let storageOK=true,state;\n"+s[end:]
    old="function persist(){try{localStorage.setItem(STORE,JSON.stringify(state));storageOK=true}catch(e){storageOK=false}}"
    new="function persist(){if(!currentRider)return;try{StudentRepository.save(currentRider.id,state);storageOK=true}catch(e){storageOK=false}const status=$('#save-status');if(status){status.textContent=storageOK?'✓ บันทึกอัตโนมัติ':'บันทึกไม่ได้ · แจ้งครู';status.classList.toggle('failed',!storageOK)}}"
    s=s.replace(old,new)
    s=s.replace('<button class="quiet" id="help-btn">','<button class="quiet hidden" id="account-btn"></button><button class="quiet" id="help-btn">')
    s=s.replace('function renderMap(){stopBattle();','function renderMap(){if(!currentRider)return renderLogin();stopBattle();')
    s=s.replace("${state.complete?'↻ เล่นหน่วย 2 อีกครั้ง':'▶ เริ่มภารกิจหน่วย 2'}","${state.complete?'↻ เล่นหน่วย 2 อีกครั้ง':state.lesson&&state.lesson.step>0?'▶ เล่นภารกิจต่อ':'▶ เริ่มภารกิจหน่วย 2'}")
    s=s.replace("step=7;renderLesson();window.scrollTo(0,0)","battlePreview=true;step=7;renderLesson();window.scrollTo(0,0)")
    s=s.replace("$('#start-btn').onclick=startLesson;","$('#start-btn').onclick=resumeLesson;")
    s=s.replace('function startLesson(){step=0;','function startLesson(){battlePreview=false;step=0;')
    s=s.replace('function renderLesson(){stopBattle();lessonOpen=true;','function renderLesson(){if(!currentRider)return renderLogin();stopBattle();if(!battlePreview){state.lesson={step,order:[...order],hintLevel};persist()}lessonOpen=true;')
    s=s.replace('function refreshTask(kind){',"function refreshTask(kind){state.lesson={step,order:[...order],hintLevel};persist();")
    s=s.replace("state.attempts.push({kind,order:[...order],correct,hints:hintLevel,at:","state.attempts.push({unit:2,kind,order:[...order],correct,points:order.filter((id,i)=>id===t.cards[i][0]).length,maxPoints:4,hints:hintLevel,at:")
    s=s.replace('state.lastChallengeCorrect=correct;nextStep();','state.lastChallengeCorrect=correct;persist();nextStep();')
    s=s.replace('function teacher(){','function teacherDetail(){')
    s=s.replace('ต้นแบบออฟไลน์ ไม่มีบัญชีนักเรียนหรือการตรวจสิทธิ์ ข้อมูลนี้เป็นการลองบนเครื่องนี้ ห้ามใช้เก็บคะแนนจริงของนักเรียนหลายคน','ผลของ Rider ${currentRider.id.slice(1)} · ${esc(currentRider.name)} เก็บแยกบนเบราว์เซอร์เครื่องนี้ ต้องเชื่อม GAS จึงจะรวมผลจากหลายเครื่องได้')
    s=s.replace("state={version:1,attempts:[],hintCount:0,complete:false,reflection:'',teacherExplain:false,teacherCheck:false};persist();",'state=blankState();persist();')
    s=s.replace("a.download='Techno-P1-ผลทดลอง.json'","a.download='Techno-P1-'+currentRider.id+'-ผลทดลอง.json'")
    s=s.replace("{prototype:true,exportedAt:new Date().toISOString(),...state}","{prototype:true,riderId:currentRider.id,name:currentRider.name,exportedAt:new Date().toISOString(),...state}")
    s=s.replace("function footer(){return '<div", "function footer(){return '<span id=\"save-status\" class=\"save-status-pill\">'+(storageOK?'✓ บันทึกอัตโนมัติ':'บันทึกไม่ได้ · แจ้งครู')+'</span><div")
    s=s.replace('__BATTLE_SCRIPT__\nrenderMap();','__BATTLE_SCRIPT__\n__LOGIN_SCRIPT__\nstate=blankState();\n$(\'#account-btn\').onclick=logout;\nrenderLogin();')
    source.write_text(s,encoding='utf-8')
drive=Path('G:/My Drive/krukan/Pic/Techno asset')
generated=Path('C:/Users/ikan/.codex/generated_images/01a12445-4c30-7700-9012-ea66bb6215c8/exec-9df2223c-962a-41f0-b833-d52855d75d72.png')
name='maskrider-techno-shooter-3x2-v1.png'
if not (drive/name).exists():shutil.copy2(generated,drive/name)
shutil.copy2(drive/name,folder/'assets'/name)
shutil.copy2(drive/'07-golden-parasite-3x3.png',folder/'assets/golden-parasite-3x3.png')
shutil.copy2(drive/'techno-003-thumbs-up.png',folder/'assets/techno-003-thumbs-up.png')
sheet=Image.open(generated)
poses=['ready','shoot','dodge','shield','hurt','victory']
for i,pose in enumerate(poses):
    p=drive/f'maskrider-techno-shooter-{pose}-v1.png'
    if not p.exists():sheet.crop(((i%3)*512,(i//3)*512,(i%3+1)*512,(i//3+1)*512)).save(p)
    shutil.copy2(p,folder/'assets'/p.name)
manifest={'sheet':name,'frameWidth':512,'frameHeight':512,'columns':3,'rows':2,'frames':dict(zip(poses,range(6))),'monsterSheet':'07-golden-parasite-3x3.png','monsterFrames':{'ready':3,'rangedAttack':6,'hurt':5,'jump':7,'defeated':8},'tool':'Built-in image_gen','references':['Maskrider-Techno-Rear-Reference.png','techno-003-thumbs-up.png'],'prompt':'Generate a transparent 1536x1024 sprite sheet, exact 3 columns x 2 rows, six 512x512 cells, same black silver magenta chibi Maskrider Techno as both references. Row 1: rear three-quarter ready with energy blaster, firing upwards, dodge left. Row 2: rear guarding with cyan shield, rear hurt recoil, front victory fist raised. Full bodies, consistent scale, aligned feet, no grid lines, no words, no environment.','notes':'Sprite sheet poses are event illustrations, not sequential walk-cycle frames. Use frame 5 for monster hurt (clutching chest), 6 for ranged attack, 8 for defeated kneeling pose. New Techno alpha preserved. Individual PNGs are exact cell crops, no repainting.'}
(drive/'maskrider-techno-shooter-v1-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(folder/'assets/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Updated shell; saved sheet and six pose PNGs to Drive asset folder and offline assets folder')

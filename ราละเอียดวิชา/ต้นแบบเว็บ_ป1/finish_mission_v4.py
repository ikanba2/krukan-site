from pathlib import Path
import shutil
p=Path(__file__).parent
f=p/'skill-games.js';s=f.read_text(encoding='utf-8')
s=s.replace("คลิกเก็บแกน 💎","คลิกเก็บแกน").replace("กดแป้นส่งพลัง ⚡","กดแป้นส่งพลัง").replace("คลิก 💎 ให้โดน","คลิกแกนให้โดน").replace("เลื่อนเมาส์ · คลิกแกน 💎","เลื่อนเมาส์ · คลิกแกน")
s=s.replace("${type==='mouse'?'🖱️':'⌨️'}", "${art(type==='mouse'?'mouse':'keyboard')}")
s=s.replace("const junk=['🪨','🍂','🌙']", "const junk=['rock','leaf','moon']")
s=s.replace("${i===g.target?'💎':junk[i%3]}", "${i===g.target?art('crystal'):art(junk[i%3])}")
s=s.replace("ดู 💎 แล้วคลิกใหม่นะ", "ดูแกนแล้วคลิกใหม่นะ")
s=s.replace("$('#skill-score').textContent='⭐ '+g.correct", "$('#skill-score').innerHTML=art('star','','hud-art')+' '+g.correct")
s=s.replace('id="skill-score">⭐ 0','id="skill-score">${art(\'star\',\'\',\'hud-art\')} 0')
s=s.replace('src="${ASSETS.portrait}" alt="Techno">','src="${LEARNING_ASSETS[\'techno-\'+(type===\'mouse\'?\'mouse\':\'keys\')]}" alt="Techno">')
s=s.replace('src="${ASSETS.portrait}" alt="Techno ยกนิ้ว"','src="${LEARNING_ASSETS[\'techno-reward\']}" alt="Techno รับรางวัล"')
f.write_text(s,encoding='utf-8')
# Keep existing score storage while adding checkpoint drafts for freely selected stages.
f=p/'mission-learning.js';s=f.read_text(encoding='utf-8')
s=s.replace("function enterStage(index){if(!currentRider)return;stopBattle();", "function enterStage(index){if(!currentRider)return;state.stageDrafts=state.stageDrafts||{};if(lessonOpen)state.stageDrafts[step]={order:[...order],hintLevel};stopBattle();")
s=s.replace('step=Number(index);order=[];hintLevel=0;feedback=null;', 'step=Number(index);const draft=state.stageDrafts[step];order=draft?.order?[...draft.order]:[];hintLevel=draft?.hintLevel||0;feedback=null;')
s=s.replace("function enhanceActivityArt(){const stage=lessonRoute[step];", "function enhanceActivityArt(){const stage=lessonRoute[step];const guide=$('.guide img');if(guide)guide.src=LEARNING_ASSETS['techno-'+(stageTopic()?.pose||'present')];")
s+='\nASSETS.portrait=LEARNING_ASSETS["techno-welcome"];\n'
f.write_text(s,encoding='utf-8')
drive=Path('G:/My Drive/krukan/Pic/Techno asset/P1-Learning-v4');drive.mkdir(exist_ok=True)
for file in (p/'assets/learning-v4').iterdir():
    if file.is_file():shutil.copy2(file,drive/file.name)
print('Updated games, stage drafts, and copied learning assets to Drive folder')

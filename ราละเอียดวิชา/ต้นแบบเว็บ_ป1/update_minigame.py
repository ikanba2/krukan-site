from pathlib import Path

p = Path(__file__).with_name('offline.source.html')
s = p.read_text(encoding='utf-8')
changes = [
    ('</style>', '__BATTLE_STYLE__\n</style>'),
    ('function renderMap(){lessonOpen=false;', 'function renderMap(){stopBattle();lessonOpen=false;'),
    ("function modal(html){$('#modal-root')", "function modal(html){pauseBattle();$('#modal-root')"),
    ("const stepLabels=['คิดก่อนเรียน','รับภารกิจ','ดูวิธีคิด','ฝึกและทดลอง','ทำกับเพื่อน','ท้าทายบอส','สะท้อนคิด','รับแกนพลัง'];", "const stepLabels=['คิดก่อนเรียน','รับภารกิจ','ดูวิธีคิด','ฝึกและทดลอง','ทำกับเพื่อน','ภารกิจใหม่','สะท้อนคิด','สู้มอนสเตอร์','รับแกนพลัง'];"),
    ('function renderLesson(){lessonOpen=true;', 'function renderLesson(){stopBattle();lessonOpen=true;'),
    ('จาก 8', 'จาก ${stepLabels.length}'),
    ('จบภารกิจวันนี้ →', 'ไปสู้มอนสเตอร์ →'),
    ('ลองโจทย์บอสอีกครั้ง', 'ลองโจทย์ใหม่อีกครั้ง'),
    ('if(lessonOpen&&step===7)renderLesson()', 'if(lessonOpen&&step===8)renderLesson()'),
    ('function bindStage(){', 'function bindStage(){if(step===7){bindBattle();return}'),
    (' return `<h2>${state.complete?', ' if(step===7)return battleUI();\n return `<h2>${state.complete?'),
    ('renderMap();\n</script>', '__BATTLE_SCRIPT__\nrenderMap();\n</script>'),
]
for old, new in changes:
    assert old in s, old
    s = s.replace(old, new)
# A replay entry lets the design reviewer try the minigame without repeating the lesson.
old = "$('#start-btn').onclick=startLesson;"
new = "const preview=document.createElement('section');preview.className='minigame-entry';preview.innerHTML='<div><h3>ลองมินิเกมหลังภารกิจ</h3><p>ตัวอย่างการต่อสู้ · เข้าตรงนี้เพื่อดูรูปแบบเกมได้</p></div><button class=\"secondary\" id=\"battle-preview\">⚡ ลองสู้มอนสเตอร์</button>';document.querySelector('.boss-panel').after(preview);$('#battle-preview').onclick=()=>{step=7;renderLesson();window.scrollTo(0,0)};$('#start-btn').onclick=startLesson;"
assert old in s
s = s.replace(old, new)
p.write_text(s, encoding='utf-8')

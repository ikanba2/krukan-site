"""Build a local, file-openable Grade 3 course from the handoff plan."""
from pathlib import Path
import json
HERE=Path(__file__).resolve().parent
plan=json.loads((HERE.parent/'แผนพัฒนาเว็บ_ป3_9บท_ส่งต่อAI'/'course-plan.json').read_text(encoding='utf-8'))
(HERE/'p3-data.js').write_text('window.P3DATA='+json.dumps(plan,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('wrote',HERE/'p3-data.js',len(plan['units']),'units',plan['stageCount'],'stages')

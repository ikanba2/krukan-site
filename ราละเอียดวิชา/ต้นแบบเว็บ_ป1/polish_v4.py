from pathlib import Path
p=Path(__file__).parent
f=p/'mission-learning.js';s=f.read_text(encoding='utf-8')
s=s.replace("function enhanceActivityArt(){const stage=lessonRoute[step];", "function enhanceActivityArt(){if($('#task-reading'))$('#task-reading').remove();const stage=lessonRoute[step];")
s=s.replace("${record?.done?'done':''}", "${record?.done||state.routeDone?.[i]?'done':''}")
s=s.replace("${record?.done?'<small>ผ่านแล้ว</small>':''}", "${record?.done||state.routeDone?.[i]?'<small>ผ่านแล้ว</small>':''}")
s=s.replace("nextStep=function(){if(stageTopic())", "nextStep=function(){state.routeDone=state.routeDone||{};state.routeDone[step]=true;if(stageTopic())")
s=s.replace("kind:'topic-before',activityId:", "kind:'topic-before',contentVersion:4,activityId:")
s+='''
['food','teeth','practice','mouse','partner'].forEach(key=>topicData[key].questions.forEach(q=>{q.options.reverse();q.answer=1}));
topicData.model.questions[1].options.reverse();topicData.model.questions[1].answer=1;
'''
f.write_text(s,encoding='utf-8')
f=p/'battle-phaser.js';s=f.read_text(encoding='utf-8').replace('<div class="overlay-badge">⚡</div>','<div class="overlay-badge">${art(\'crystal\')}</div>').replace('⚡ ยิงพลัง','ยิงพลัง').replace('🛡 ใช้โล่','ใช้โล่').replace('🌟 ชนะมอนสเตอร์แล้ว!','ชนะมอนสเตอร์แล้ว!').replace('💪 มาลองกันอีกครั้ง','มาลองกันอีกครั้ง');f.write_text(s,encoding='utf-8')
f=p/'learning-expanded.js';s=f.read_text(encoding='utf-8').replace('⭐ ทำได้แล้ว!','ทำได้แล้ว!').replace('💡 ดูภาพแรกนะ','ดูภาพแรกนะ');f.write_text(s,encoding='utf-8')
f=p/'skill-games.js';s=f.read_text(encoding='utf-8').replace('⭐ ทำได้แล้ว!','ทำได้แล้ว!');f.write_text(s,encoding='utf-8')
f=p/'mission-ui-v4.css';s=f.read_text(encoding='utf-8')+'''
.overlay-badge .edu-art{width:70px;height:70px}.timeline-node:not(:nth-child(9n)):after{content:'';position:absolute;right:-9px;top:24px;width:8px;height:2px;background:#79618d;pointer-events:none}.timeline-node.done:after{background:#75e8dd}
@media(max-width:850px){.timeline-node:after{display:block}.timeline-node:nth-child(6n):after{display:none}.timeline-node:nth-child(9n):not(:nth-child(6n)):after{display:block}}
@media(max-width:600px){.timeline-node:after{display:block}.timeline-node:nth-child(6n):after{display:block}.timeline-node:nth-child(4n):after{display:none}.timeline-node:nth-child(9n):not(:nth-child(4n)):after{display:block}.timeline-node:last-child:after{display:none}}
''';f.write_text(s,encoding='utf-8')
print('Polished timeline, removed redundant reader link, balanced quiz choices')

from pathlib import Path
p=Path(__file__).parent
f=p/'login-school.js'
s=f.read_text(encoding='utf-8')
s=s.replace('academicYear:currentRider.academicYear,classId:', 'academicYear:currentRider.academicYear,academicYearId:currentRider.academicYearId,classId:')
s=s.replace('academicYear:schoolDB.displayYear,classId:classConfig.classId', 'academicYear:schoolDB.displayYear,academicYearId:classConfig.id,classId:classConfig.classId')
s=s.replace("saveSchool('add_students:'+names.length);teacherDashboard()", "saveSchool('add_students:'+names.length);if(teacherViewYear===schoolDB.displayYear&&!currentRider)renderLogin();teacherDashboard()")
s=s.replace("if(!r.active){currentRider=null;state=blankState();updateAccount()}", "if(!r.active){renderLogin()}")
s=s.replace("teacherDashboard();toast('บันทึกแล้ว คะแนนเดิมยังอยู่')", "if(teacherViewYear===schoolDB.displayYear&&!currentRider)renderLogin();teacherDashboard();toast('บันทึกแล้ว คะแนนเดิมยังอยู่')")
s=s.replace('<button class="primary" id="export-class">', '${currentRider&&!currentRider.guest&&currentRider.academicYear===teacherViewYear?\'<button class="secondary" id="observe-current">สังเกตนักเรียนที่กำลังเล่น</button>\':\'\'}<button class="primary" id="export-class">')
s=s.replace("$('#view-year').onchange=", "if($('#observe-current'))$('#observe-current').onclick=teacherDetail;$('#view-year').onchange=")
f.write_text(s,encoding='utf-8')
f=p/'learning-expanded.js'
s=f.read_text(encoding='utf-8').replace('ลองตามแผนของ Techno: หนังสือ → ดินสอ → ปิด → ถือไป','ใส่ของให้ครบ · ปิดกระเป๋า · ถือไปเรียน')
f.write_text(s,encoding='utf-8')
f=p/'offline.source.html'
s=f.read_text(encoding='utf-8')
s=s.replace('มาคิด ทดลอง และแก้ปัญหา เพื่อคืนแสงให้ทั้ง 9 สถานี','มาเล่นด้วยกัน · ช่วย Techno คืนพลัง')
s=s.replace('เลือกสถานีเพื่อดูว่าจะได้เรียนรู้อะไร','แตะสถานี · ไปเล่นกัน')
s=s.replace('<p>${esc(u.new)}</p><span class="station-status', '<p>${[\'ดูของให้ดี\',\'เรียงภาพทีละขั้น\',\'ลองแล้วแก้\',\'บอกให้ทำตาม\',\'รู้จักคอมพิวเตอร์\',\'ส่งคำสั่ง\',\'ช่วยกันหา\',\'คิดก่อนทำ\',\'วาดแล้วเก็บ\'][i]}</p><span class="station-status')
s=s.replace('ดูแผนการเรียนรู้ ↗','ดูด่าน ↗')
s=s.replace('ตัวอย่างการต่อสู้ · เข้าตรงนี้เพื่อดูรูปแบบเกมได้','ช่วย Techno สู้บอส!')
f.write_text(s,encoding='utf-8')
print('Updated guest/year interface')

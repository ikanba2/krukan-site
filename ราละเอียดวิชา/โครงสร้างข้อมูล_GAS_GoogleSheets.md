# โครงสร้างข้อมูล Techno Academy: Google Sheets + GAS

วันที่ออกแบบ 10 ตุลาคม 2569 — ยังไม่สร้างชีตหรือเผยแพร่ GAS รอ Script ID และ Spreadsheet ID จากครู

## วิธีทำงานเมื่อขึ้นระบบจริง

Google Sites ฝังหน้าเว็บที่ให้บริการด้วย GAS HtmlService หน้าเว็บเรียกฟังก์ชันฝั่ง GAS ด้วย google.script.run จากนั้น GAS ตรวจสิทธิ์ อ่าน/เขียน Google Sheets และจัดเก็บไฟล์ใน Drive ครูใช้ GAS ที่ผูกกับชีตนั้นได้ แต่ Web App ต้องเปิดชีตด้วย SpreadsheetApp.openById(SPREADSHEET_ID) ที่ตั้งค่าไว้ ไม่พึ่ง active spreadsheet ของหน้าชีต

ต้นแบบปัจจุบันยังบันทึกในเบราว์เซอร์เครื่องที่ใช้งาน จึงยังไม่รวมผลจากหลายเครื่อง บัญชีและรหัสผ่านทดลองตรวจในหน้าเว็บ เมื่อขึ้นระบบจริงต้องเปลี่ยนเป็นตรวจสิทธิ์และรหัสบน GAS ทั้งหมด

## บทบาทและปีการศึกษา

| บทบาท | ใช้งานได้ |
|---|---|
| ผู้เข้าชม | เล่นบทเรียน เกมเมาส์ เกมแป้น และบอส ผลอยู่ในหน่วยความจำของรอบนั้น ไม่เขียนคะแนนนักเรียน ไม่อัปโหลดผลงาน |
| นักเรียน | เลือก Rider Code ของปีที่แอดมินตั้ง ใส่รหัสห้อง แล้วจึงแสดงชื่อ–สกุล ดูและบันทึกเฉพาะข้อมูลของตน |
| ครู | ดูผลรายปี จัดการการลงทะเบียนและชื่อในห้องที่ได้รับสิทธิ์ บันทึกการสังเกต/ข้อเสนอแนะ |
| แอดมิน | จัดการปี ห้อง บัญชีครู สิทธิ์ และปีที่แสดงหน้าผู้เรียน |

DISPLAY_ACADEMIC_YEAR_ID เป็นการเลือกปีหน้าผู้เรียน ไม่ใช่การลบหรือแทนที่ปีเก่า ปีที่ครูเลือกดูในรายงานแยกจากการตั้งค่านี้ เซสชันนักเรียนผูกกับ enrollmentId และปีที่เข้าระบบ การเปลี่ยนปีให้กลับหน้าเลือกรหัสเพื่อไม่ส่งผลไปผิดปี

แยก studentId (ตัวบุคคล) จาก enrollmentId (ลงทะเบียนในปี/ห้องนั้น) และ riderCode (รหัสที่เด็กเห็น) ใช้ UUID เป็นคีย์ ไม่ใช้ชื่อ เลขแถว หรือ Rider 01 เป็นคีย์หลัก Rider 01 ปี 2569 และ Rider 01 ปี 2570 จึงมีผลคนละชุด เมื่อลงทะเบียนเด็กคนเดิมในปีใหม่ให้เลือก studentId เดิมและสร้าง enrollmentId ใหม่; นักเรียนใหม่สร้างทั้งสอง ID

ต้นแบบมี ป.1/1 หนึ่งห้องต่อปี โครงสร้างจริงรองรับหลายห้องผ่าน Classes และสิทธิ์ครู classIds การสร้างปีใหม่เริ่มรายชื่อว่าง ไม่คัดลอกคะแนนเก่า การแก้ชื่อรักษา ID และประวัติ การพักบัญชีใช้ active=false แทนลบประวัติ

## แท็บใน Google Sheets

| แท็บ | คอลัมน์หลัก / หน้าที่ |
|---|---|
| Settings | key, value, updatedBy, updatedAt; SPREADSHEET_ID, DISPLAY_ACADEMIC_YEAR_ID, DATA_ROOT_FOLDER_ID, CONTENT_VERSION |
| AcademicYears | academicYearId, label เช่น 2569, status, createdAt |
| StaffUsers | staffId, username, displayName, role, classIdsJson, passwordHash, passwordSalt, active, createdAt |
| Classes | classId, academicYearId, grade, className, studentPasswordHash, studentPasswordSalt, active |
| Students | studentId, fullName, active, createdAt, updatedAt; เก็บเท่าที่จำเป็น |
| Enrollments | enrollmentId, studentId, academicYearId, classId, riderCode, active, createdAt |
| Attempts | attemptId, requestId, enrollmentId, unitId, activityId, kind, answerJson, points, maxPoints, correct, hints, contentVersion, clientAt, serverAt |
| SkillGameResults | attemptId, requestId, enrollmentId, unitId, type, alphabet, speedMs, points, maxPoints, wrongPresses, timeouts, inputCountsJson, reactionMsJson, seconds, serverAt |
| BattleResults | battleId, requestId, enrollmentId, unitId, won, gameScore, durationSeconds, serverAt |
| Progress | enrollmentId, unitId, routeVersion, stageId, checkpointJson, learningComplete, reflection, teacherExplain, teacherCheck, updatedAt |
| TeacherObservations | observationId, enrollmentId, unitId, rubricJson, note, staffId, serverAt; ผู้เรียนไม่แก้ผลสังเกตครู |
| Files | fileRecordId, driveFileId, folderId, enrollmentId, academicYearId, activityId, mimeType, sizeBytes, purpose, visibility, createdBy, createdAt |
| AuditLog | auditId, actorId, action, entityType, entityId, detailJson, serverAt; บันทึกการแก้ข้อมูล/ปี/สิทธิ์ |

คีย์ที่ซ้ำไม่ได้: Enrollments(academicYearId,classId,riderCode), Progress(enrollmentId,unitId), requestId ในตารางผล ใช้ข้อมูลปีจาก enrollment ที่เซิร์ฟเวอร์ตรวจแล้ว ไม่เชื่อค่าปี/คะแนน/สิทธิ์ที่หน้าเว็บส่งมา

## แยกคะแนนเพื่ออ่านผลได้ถูกต้อง

หน่วย 2 มี 17 ด่านภายในหน่วยเดิม ไม่ใช่เพิ่มเป็น 17 หน่วยหลักสูตร: ลองก่อน → เรื่องราว → ดูตัวอย่าง → ฝึกคลิก → รองเท้า → กินข้าว → แปรงฟัน → กระเป๋า → ฝึกแป้น → เครื่องพลัง → ดอกไม้ → เตรียมนอน → ทำกับเพื่อน → ลองเอง → สะท้อนคิด → บอส → รับดาว

แบบก่อนเรียนและหลังเรียนเป็นการเรียง 4 ภาพ คะแนนเต็ม 4 ทั้งคู่ แต่ต่างบริบท เก็บครั้งแรกและครั้งลองซ้ำครบทุกครั้ง รายงานแสดงก่อนเรียนครั้งแรก หลังเรียนครั้งแรก และครั้งล่าสุดแยกกันเพื่อไม่ทำให้ผลหลังเรียนดูดีเกินจริงจากการฝึกซ้ำ เก็บการใช้คำใบ้และจำนวนรอบประกอบด้วย

ฝึกเรียงภาพ 7 บริบท มี 3–4 ขั้น เกมเมาส์/แป้นเต็ม 8 ดาวต่อรอบ และคะแนนบอสเป็นความสำเร็จเกม แยกจากผลตัวชี้วัดการลำดับขั้นตอน ห้ามเอาคะแนนเกมมาทดแทนหลักฐานการเรียนรู้ กิจกรรมกระเป๋ายอมรับหนังสือ/ดินสอได้ทั้งสองลำดับก่อนปิดกระเป๋า

เกมแป้นให้ตัวสีดำบนแผ่นสีอ่อนตกลงมา เลือก A S D F หรือ ก ด ส า กดให้ถูกภายใน 10 หรือ 6 วินาที ตอนนี้เป็นการฝึกหาแป้น ไม่ต้องกดตรงเส้นจังหวะแบบ Guitar Hero ข้อมูลแยกคีย์บอร์ดจริงกับการแตะปุ่มจอ การแตะปุ่มไม่ถือเป็นหลักฐานการใช้คีย์บอร์ดจริง

## ภาพและไฟล์ใน Drive

วาง DATA_ROOT_FOLDER_ID ในโฟลเดอร์แม่เดียวกับชีต ตามที่ครูกำหนด ภายในสร้าง Assets สำหรับภาพบทเรียนที่เผยแพร่ได้ และ Submissions/<academicYearId>/<classId>/<enrollmentId> สำหรับผลงานนักเรียน ใช้ ID ในชื่อโฟลเดอร์เพื่อลดการเผยชื่อเด็ก คลังตัวละครเดิม G:/My Drive/krukan/Pic/Techno asset ใช้เป็นคลังกลางต่อได้ เก็บ Drive file ID อ้างอิง ไม่ต้องสร้างสำเนาทุกปี

รูปไม่อยู่ในเซลล์ชีต เก็บตัวไฟล์ใน Drive และเก็บ file ID/ข้อมูลกำกับใน Files GAS ตรวจสิทธิ์ เจ้าของ enrollment ชนิดไฟล์ และขนาดสูงสุดก่อนรับไฟล์ นักเรียนเข้าถึงเฉพาะงานตน ครูเฉพาะห้องที่รับผิดชอบ หน้าเว็บสาธารณะไม่เผยผลคะแนน/ผลงาน/รายชื่อจริง การเปิดภาพสาธารณะจำกัดเฉพาะ asset ที่อนุญาต ไม่เปิดโฟลเดอร์ผลงานเด็กทั้งโฟลเดอร์

## สัญญาการเรียกข้อมูล

| ฟังก์ชัน GAS ที่เตรียมใช้ | ผล/สิทธิ์ |
|---|---|
| getPublicConfig() | ปีที่เปิด รหัส Rider ที่ active เนื้อหา/asset ไม่มีชื่อ–สกุลหรือผลคะแนน |
| studentLogin({riderCode,password}) | ตรวจปีปัจจุบัน/ห้อง ส่งชื่อและโทเคนเซสชันที่ผูก enrollment ให้เฉพาะหลังรหัสถูก |
| staffLogin({username,password}) | ตรวจฝั่งเซิร์ฟเวอร์ ส่งโทเคนและขอบเขตสิทธิ์ |
| getMyProgress(token) | คืนเฉพาะผลของ enrollment ในโทเคน |
| saveLearningAttempt(token,payload) | ตรวจ activity/contentVersion/คำตอบ คำนวณคะแนนใหม่ บันทึกแบบไม่ซ้ำ requestId |
| saveSkillResult / saveBattleResult | ตรวจค่าผลเกมและขอบเขต เก็บแยกจากการเรียน คะแนนเกมจากเบราว์เซอร์เป็นผลฝึก ไม่ใช่ข้อสอบที่กันโกงได้ |
| saveCheckpoint(token,payload) | เก็บจุดค้าง/สะท้อนคิด ไม่อนุญาตแก้ผลสังเกตครู |
| getClassReport(token,yearId,classId) | ครูเฉพาะห้องที่ได้รับสิทธิ์ แอดมินตามขอบเขตที่ตั้ง |
| upsertStudent / enrollStudent / setEnrollmentActive | ครู/แอดมิน ตรวจห้อง คง ID เดิมเมื่อแก้ชื่อ |
| createAcademicYear / setDisplayYear / manageStaff | แอดมินเท่านั้น ตรวจสิทธิ์ทุกครั้งและบันทึก AuditLog |
| saveTeacherObservation / uploadSubmission | ตรวจบทบาท/เจ้าของงานก่อนเขียน |
| logout(token) | ยกเลิกเซสชัน |

รูปแบบคำตอบใช้ {ok:true,data,serverAt} หรือ {ok:false,error:{code,message,retryable}} เรียก google.script.run แบบ asynchronous พร้อม success/failure handler แสดง “บันทึกแล้ว” เมื่อ GAS ตอบรับเท่านั้น ช่วงไม่มีเครือข่ายแสดง “รอส่ง” เก็บคิวตาม enrollment ในเครื่อง ส่งซ้ำด้วย requestId เดิมและไม่ส่งคิวของผู้เข้าชม บันทึกชุดเล็ก ๆ ด้วย LockService.getScriptLock และ batch reads/writes เพื่อป้องกันผลซ้ำ/การเขียนทับเมื่อหลายคนเล่นพร้อมกัน

โทเคนเซสชันสุ่มมีวันหมดอายุ เก็บและตรวจฝั่งเซิร์ฟเวอร์ ไม่ให้ client ส่ง role แล้วใช้ตามนั้น ไม่คืน hash/salt ให้หน้าเว็บ รหัสห้อง 1234 ใช้ตามความตั้งใจต้นแบบได้ แต่ใช้ร่วมทั้งห้องจึงเป็นการระบุตัวตนแบบครูดูแล ไม่ยืนยันว่าเด็กไม่เลือก Code ของเพื่อน ระบบจริงต้องมีการกำกับห้องและจัดการรหัสโดยครู

## ก่อนเชื่อม GAS

ยืนยัน Spreadsheet ID, Script ID/Deployment URL, โฟลเดอร์ข้อมูล, บัญชีครู/แอดมิน, ปี/ห้องจริง และรายชื่อ จากนั้นย้ายข้อมูลต้นแบบเฉพาะรายการที่ครูยืนยัน ไม่เอาผลทดสอบของผู้พัฒนาเป็นผลนักเรียน ทดสอบอย่างน้อยสองเครื่อง การส่งซ้ำ ปีใหม่ Code ซ้ำ การแก้ชื่อ การพักบัญชี และการบันทึกล้มเหลว ก่อนใช้จริง

แหล่งอ้างอิงทางเทคนิค: [HtmlService และ google.script.run](https://developers.google.com/apps-script/guides/html/communication), [Bound scripts](https://developers.google.com/apps-script/guides/bound), [Web Apps](https://developers.google.com/apps-script/guides/web), [LockService](https://developers.google.com/apps-script/reference/lock/lock-service), [Drive service](https://developers.google.com/apps-script/reference/drive)


## เพิ่มเติมรุ่นเนื้อหา 4: เรียนในภารกิจ

Attempts เพิ่ม kind=topic-before และ contentVersion=4 ระบุ activityId=u2-<เรื่อง>, points, max, answers, at รวม 11 เรื่อง 13 ข้อ แยกผลก่อน/หลังหน่วยและเกม รายงานครูแสดงผลรวมก่อนรายเรื่องและจำนวนเรื่อง

Progress/checkpoint ต้องรองรับ missionStages (phase, answers, preSaved, visited, done), stageDrafts (order, hintLevel) และ routeDone พร้อม enrollmentId เดิม ด่านยังใช้ routeVersion=3 เพราะเลขด่านทั้ง 17 ไม่เปลี่ยน การเปลี่ยนชื่อหรือปีที่แสดงต้องไม่เปลี่ยนเจ้าของผล ให้ GAS ตรวจ session/บทบาทและ enrollmentId ฝั่งเซิร์ฟเวอร์ รวมทั้งป้องกันบันทึกซ้ำด้วย attemptId; preSaved ในต้นแบบเป็นเพียงตัวช่วยฝั่งหน้าจอ

## ผลคะแนนรุ่น 5
Progress เพิ่ม stageScores ตามเลขด่าน 0–16: points/maxPoints/at และ soundOff บันทึกตาม enrollmentId เดิม คะแนนฝึกหน่วยรวมคะแนนที่ดีที่สุดราย activityId 9 กิจกรรมเต็ม 31 โดย GAS ต้องคำนวณจาก Attempts ที่ตรวจสอบแล้ว พลังรายด่านเต็ม 170 แยกจากคะแนนแบบก่อน–หลังเต็ม 4 ไม่เชื่อคะแนนรวมที่ส่งจากหน้าเว็บเพียงอย่างเดียว


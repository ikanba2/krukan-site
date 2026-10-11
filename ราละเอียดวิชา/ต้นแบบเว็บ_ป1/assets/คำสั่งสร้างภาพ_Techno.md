# คำสั่งสร้างภาพ Techno สำหรับเกมยิง

ใช้ built-in image_gen; transparent_background=true; ภาพอ้างอิงสองไฟล์ใน Techno asset เดิม ไม่แก้ภาพต้นฉบับ

คำสั่งที่ส่ง:

Use case: stylized-concept. Asset type: production 2D shooter game character sprite sheet. Generate a NEW sprite sheet for the original Maskrider Techno character shown in the two reference images. Image 1 defines the exact rear armor silhouette, black coat, silver and magenta pink armor; image 2 defines front helmet glowing pink eyes and chibi proportions. Maintain this exact identity, glossy high quality 3D rendered chibi styling. Transparent background. Landscape 1536x1024 sheet, EXACT uniform 3 columns x 2 rows of 512x512 cells. Six separate full body figures with ample transparent padding, centered within each cell, feet aligned consistently, no overlap between cells, no text or grid lines. First row left: rear three-quarter battle-ready standing facing away and slightly upward toward an enemy at top of screen, small magenta energy blaster raised. First row center: same rear three-quarter aiming and firing energy blaster upwards, tiny magenta muzzle flash. First row right: same rear view dodging left, slight sideways lean with coat movement. Second row left: same rear three-quarter guarding with glowing cyan circular shield held forward toward top of screen. Second row center: same rear view recoiling after taking a hit, subtle arms and coat motion, no blood, child-friendly. Second row right: front three-quarter victory pose fist raised and glowing pink eyes. All six figures are the same scale and fully visible, armored black silver pink Techno, two arms and legs only. No environment, no floor, no shadow plate, no words, no logos or watermarks. The images are references, not edit targets.

การตรวจ: RGBA 1536×1024 มี alpha=0 ในพื้นที่พื้นหลัง คง alpha เดิม ไม่เปลี่ยนภาพด้วยการวาดทับ ไฟล์ย่อยเป็นการตัดช่องตามตารางเพื่อใช้งาน สถานะในเกมเลือกตามเหตุการณ์ ไม่ใช่ภาพต่อเนื่องของการเดิน

ครูกำหนดธีมและให้ภาพต้นแบบ ผู้พัฒนาสร้างคำสั่งภาพ ตรวจท่า ผูกเหตุการณ์ เขียนระบบบทเรียน/เกม และทดสอบ UI การใช้ AI ควรเปิดเผยตามเกณฑ์ประกวดและให้งานครู/ข้อมูลการใช้งานจริงเป็นส่วนหลักของผลงาน

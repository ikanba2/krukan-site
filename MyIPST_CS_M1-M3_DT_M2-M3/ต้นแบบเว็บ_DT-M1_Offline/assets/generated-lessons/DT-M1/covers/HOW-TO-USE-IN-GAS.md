# วิธีนำภาพปก ม.1 ไปใช้ใน Google Apps Script

ไฟล์ปกถูกแยกเป็น WebP ไว้ใน Google Drive แล้ว จำนวน 8 ภาพ: ปกชั้นเรียน 1 ภาพ และปกบทเรียน 7 ภาพ ภาพเป็นไฟล์ Drive โดยตรง ไม่ได้ฝัง Base64 ลงใน HTML

## ไฟล์และข้อมูล

- โฟลเดอร์ Drive: https://drive.google.com/drive/folders/1nQsBcvWOLX-h18POvryePTRgDQsPM7jJ
- ภาพปกที่นำไปแสดง: **DT-M1-Course-Cover.webp** และ **DT-M1-C01-Cover.webp** ถึง **DT-M1-C07-Cover.webp**
- **cover-manifest.json** มี **driveFileId**, **driveUrl** สำหรับเปิดตรวจใน Drive และ **embedUrl** สำหรับกำหนดเป็น **img src**
- ใช้เฉพาะไฟล์ WebP ชื่อ **\*-Cover.webp** ในหน้าเว็บ; ไฟล์ PNG ใน **source-sheets/** เก็บเป็นต้นฉบับและภาพจากการสร้างเป็นชุด
- ไฟล์ปกทั้ง 8 มีสิทธิ์ Drive **anyone: reader** แล้ว จึงเปิดดูได้โดยผู้เรียนที่ไม่ได้ล็อกอินบัญชีเจ้าของ

## เรียกภาพใน HTML ของ GAS

สร้าง URL จาก **driveFileId** ใน manifest ดังนี้:

~~~javascript
function driveImageUrl_(fileId) {
  return 'https://drive.google.com/uc?export=view&id='
    + encodeURIComponent(fileId);
}
~~~

ส่ง URL ไปยัง HTML template จาก **Code.gs**:

~~~javascript
const COVER_IDS = {
  course: '1ftN0OIfMovS4RHFxkGUCfFssAIRj-vPa',
  c01: '1HsmIeP9B3m1uZthjlpPcDdbnWPArrGgP',
  c02: '13CDeiTGEWOJsUWDv2V864DgjZxIAGGtD',
  c03: '1rsSShmi6pTE122ywwLnjOOmwZoGrLpiK',
  c04: '17t8I9QjXCuDBfLb2b11XxnVtcmmGpTjM',
  c05: '1P1Mg3mg7x6CkdB0XVgWRLRHXTwc6SA_k',
  c06: '1SfMoRDRvBnzaj2mcZhhiXwjaAzv2eQBo',
  c07: '19Z07PcQ4mff2FMZcMyNNLABsztKFE-MR'
};

function doGet() {
  const page = HtmlService.createTemplateFromFile('Index');
  page.courseCoverUrl = driveImageUrl_(COVER_IDS.course);
  page.chapterCoverUrls = Object.fromEntries(
    Object.entries(COVER_IDS)
      .filter(([key]) => key !== 'course')
      .map(([key, id]) => [key, driveImageUrl_(id)])
  );
  return page.evaluate();
}
~~~

จาก **Index.html** เรียก URL ที่ส่งมา:

~~~html
<img
  src="<?= courseCoverUrl ?>"
  alt="ปกวิชาออกแบบและเทคโนโลยี ม.1"
  fetchpriority="high"
  decoding="async">

<img
  src="<?= chapterCoverUrls.c01 ?>"
  alt="บทที่ 1 เทคโนโลยีรอบตัว ต่อสู้กับโกเลมพฤกษา"
  loading="lazy"
  decoding="async">
~~~

ใช้ **courseCoverUrl** กับภาพหลักเหนือ fold และให้ปกบทใช้ **loading="lazy"** เพื่อไม่ให้เบราว์เซอร์โหลดภาพทุกบทก่อนจำเป็น URL ใช้เป็น **src** โดยตรง จึงไม่ต้องวาง Base64 หรือเรียก **google.script.run** เพื่อขนข้อมูลภาพผ่านหน้าเว็บ

## จัดวางภาพโดยไม่ตัดตัวละคร

ภาพจาก contact sheet มีสัดส่วนราว 1.56:1 ส่วนปกบทที่ 5 เป็น 16:9 เพื่อไม่ให้เขา ดาบ หรือเท้าตัวละครถูกตัด ใช้ **object-fit: contain** และทำสีพื้นหลังให้เข้าธีม:

~~~css
.course-cover,
.chapter-cover {
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #0b1722;
}

.course-cover img,
.chapter-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}
~~~

ถ้าต้องการให้ภาพเต็มกรอบด้วย **object-fit: cover** ให้ตรวจภาพที่ขนาดมือถือและเดสก์ท็อปก่อน เพราะขอบบนหรือล่างของงานต่อสู้อาจถูกตัด

## ตรวจสิทธิ์และปัญหารูปไม่ขึ้น

เปิด **embedUrl** จาก manifest ในหน้าต่างไม่ระบุตัวตน (Incognito) ก่อนทดสอบหน้า GAS; ควรเห็นไฟล์ภาพโดยไม่ต้องล็อกอิน หากเปลี่ยนสิทธิ์ Drive ในอนาคต ให้ผู้เรียนหรือบัญชีที่เปิดเว็บมีสิทธิ์อ่านภาพด้วย ทดสอบหลัง Deploy GAS ด้วยบัญชีผู้เรียนจริงอีกครั้ง

อย่าใช้ **driveUrl** ซึ่งเป็นลิงก์หน้า preview ของ Drive เป็น **img src** เพราะจะเปิดหน้า Drive แทนภาพ และอย่าใช้ **thumbnailLink** จาก Drive API เป็น URL ถาวร: เอกสาร Google ระบุว่าลิงก์ thumbnail หมดอายุได้และไม่เหมาะกับการใช้ตรงในเว็บแอปเนื่องจากข้อจำกัด CORS ([Drive API: files resource](https://developers.google.com/workspace/drive/api/reference/rest/v3/files)). การอ่านภาพยังขึ้นกับ ACL/สิทธิ์ของไฟล์ใน Drive ([Drive API: sharing files](https://developers.google.com/workspace/drive/api/guides/manage-sharing)).

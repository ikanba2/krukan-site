/* ค่าประจำวิชา (ไฟล์เดียวที่ต่างกันระหว่างวิชา นอกจากไฟล์ข้อมูล)
   ไฟล์ส่วนกลางทุกไฟล์อ่านค่าจากที่นี่: ชื่อวิชา ชั้น จำนวนบท เลข Sector ปลายภาค คีย์เก็บข้อมูลในเครื่อง และลิงก์เว็บแอป */
window.DT_CFG = {
  code: 'DT-M1',                    /* รหัสวิชา ใช้ในชื่อไฟล์ส่งออก */
  slug: 'dt-m1',                    /* ใช้ในชื่อภาพฉาก assets/arena-<slug>-cNN.webp */
  grade: 'ม.1',
  subject: 'การออกแบบและเทคโนโลยี',
  full: 'การออกแบบและเทคโนโลยี ม.1',
  short: 'ออกแบบและเทคโนโลยี ม.1',
  room: 'ม.1/1',                    /* ห้องเริ่มต้น */
  key: 'krukan-dt-m1',              /* คำนำหน้าคีย์ localStorage */
  chapters: 7,
  finalNo: 8,                       /* เลข SECTOR ของสรุปและสอบปลายภาค = จำนวนบท + 1 */
  guestWork: true,                  /* ผู้เข้าชมทำชิ้นงานได้ พิมพ์/บันทึก PDF ได้ แต่ส่งให้ครูไม่ได้ */
  appUrl: 'https://script.google.com/macros/s/AKfycbwskynQQMr-JI81FeUly0H4P_sw6sFRMyhH9rBEPWw7boOpq9UOznAR-DW3yRd76DxIvg/exec'
};

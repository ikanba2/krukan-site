/* ด่านเดินตามช่องของ ป.3: บท 2 (เงื่อนไข: ประตูเปิด/ปิด) และบท 7 (ทำซ้ำ) · ใช้ตัวสร้างด่านเดียวกับ ป.2 */
Object.assign(QUEST.PACK,{
  p3u2a:{title:'ภารกิจ A: พาหุ่นเก็บผลึกไปประตูป่า',mode:'build',n:4,size:[4,4,5,5],len:[4,5,6,7],obst:[1,2,2,3],items:[0,1,1,2],turn:1},
  p3u2g1:{title:'เกม: ทายก่อนว่าหุ่นจะไปหยุดตรงไหน',mode:'predict',n:4,size:[4,5,5,5],len:[3,4,5,6],obst:[1,1,2,2],items:[0,0,0,0],turn:1},
  p3u2sb:{title:'สนามทดลอง: ประตูเปิด หรือ ปิด',mode:'branch',n:3,size:[4,4,5],len:[3,4,4],obst:[0,1,1],items:[0,0,0],turn:1},
  p3u2b:{title:'ภารกิจ B: เขียนทั้งตอนประตูเปิดและปิด',mode:'branch',n:4,size:[4,5,5,5],len:[4,4,5,5],obst:[1,1,2,2],items:[0,1,1,2],turn:1},
  p3u2g2:{title:'เกม: ซ่อมโปรแกรมที่มีบั๊ก',mode:'debug',bug:'any',n:4,size:[4,5,5,5],len:[5,6,7,8],obst:[1,2,2,3],items:[0,1,1,1],turn:2},
  p3u2boss:{title:'ดวลบอส: ประตูคู่ของ Venom Mantis',mode:'branch',n:4,size:[5,5,6,6],len:[5,6,6,7],obst:[2,2,3,3],items:[1,1,2,2],turn:2,lives:3},
  p3u7a:{title:'ภารกิจ A: ใช้ทำซ้ำให้โปรแกรมสั้น',mode:'build',n:4,size:[5,5,5,6],len:[4,5,6,7],obst:[0,0,1,1],items:[0,0,0,1],turn:1,keep:.85,repFrom:0,tight:true},
  p3u7g1:{title:'เกม: เก็บผลึกด้วยบัตรทำซ้ำ',mode:'build',n:4,size:[5,5,6,6],len:[5,6,7,8],obst:[1,1,2,2],items:[1,1,1,2],turn:1,keep:.8,repFrom:0,tight:true},
  p3u7sb:{title:'สนามทดลอง: ลองจำนวนรอบ',mode:'build',n:3,size:[5,5,6],len:[4,5,6],obst:[0,1,1],items:[0,0,1],turn:1,keep:.85,repFrom:0},
  p3u7b:{title:'ภารกิจ B: โปรแกรมสั้นที่สุด',mode:'build',n:4,size:[5,6,6,6],len:[6,7,8,9],obst:[1,1,2,2],items:[1,2,2,3],turn:1,keep:.8,repFrom:0,tight:true},
  p3u7g2:{title:'เกม: ซ่อมโปรแกรมทำซ้ำ',mode:'debug',bug:'any',n:4,size:[5,5,6,6],len:[6,7,8,9],obst:[1,2,2,3],items:[0,1,1,1],turn:2},
  p3u7boss:{title:'ดวลบอส: ป่าหนามของ Venom Mantis',mode:'two',n:4,size:[5,6,6,6],len:[6,7,8,9],obst:[2,2,3,3],items:[1,1,2,2],turn:1,keep:.8,repFrom:0,tight:true,lives:3}
});

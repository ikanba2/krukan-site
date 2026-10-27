/* ===== Techno Talk: เนื้อหาภาษาอังกฤษ (ข้อมูลล้วน) =====
   3 ระดับ × 5 หน่วย: คำศัพท์ (WORDS) + ประโยค (sents) + ชุดจัดกลุ่ม (sorts) ทุกประโยคมีภาพประกอบ (spec จาก art-scene.js)
   ประโยค: [อังกฤษ, ไทย, สรรพนามประธาน, ภาพ] · คู่ถามตอบ (qa): [คำถาม, ไทย, สรรพนาม, ภาพ, คำตอบ, ไทย, สรรพนาม, ภาพ]
   ความถูกต้องของไวยากรณ์ตรวจด้วย test_engine.js (be/do/does/s ของ he she it ฯลฯ) */
const PERSON = { I: ['tom'], you: ['mei'], he: ['ben'], she: ['anna'], we: ['tom', 'mei'], they: ['ben', 'anna', 'mei'] };
const PN_TH = { I: 'ฉัน', you: 'เธอ', he: 'เขา', she: 'เธอ', it: 'มัน', we: 'พวกเรา', they: 'พวกเขา' };
const kidsOf = (p, mood, pose, o) => { const items = PERSON[p].map(id => K_(id, mood, pose, o)); return items.length === 1 ? items[0] : G_(...items); };
const actsOf = (p, act) => { const items = PERSON[p].map(id => ACT_(act, id)); return items.length === 1 ? items[0] : G_(...items); };
const plus = (fig, ...more) => G_(...(fig.k === 'group' ? fig.items : [fig]), ...more);
const withThing = (p, thing, mood) => plus(kidsOf(p, mood || 'happy'), thing);

/* ---------- คำศัพท์: id: [อังกฤษ, ไทย, ภาพ] ---------- */
const WORDS = {
  // สรรพนาม
  I: ['I', 'ฉัน / ผม', PR_('I')], you: ['you', 'เธอ / คุณ', PR_('you')], he: ['he', 'เขา (ผู้ชาย)', PR_('he')], she: ['she', 'เธอ (ผู้หญิง)', PR_('she')], it: ['it', 'มัน', PR_('it')], we: ['we', 'พวกเรา', PR_('we')], they: ['they', 'พวกเขา', PR_('they')],
  // คน
  boy: ['boy', 'เด็กผู้ชาย', K_('tom', 'happy')], girl: ['girl', 'เด็กผู้หญิง', K_('mei', 'happy')], mom: ['mom', 'แม่', K_('mom', 'happy')], dad: ['dad', 'พ่อ', K_('dad', 'happy')], baby: ['baby', 'ทารก', K_('baby', 'happy')],
  teacher: ['teacher', 'ครู', K_('teacherF', 'happy')], friend: ['friend', 'เพื่อน', G_(K_('tom', 'happy'), K_('ben', 'happy'))],
  // ความรู้สึก
  happy: ['happy', 'มีความสุข', K_('tom', 'happy')], sad: ['sad', 'เศร้า', K_('tom', 'sad')], angry: ['angry', 'โกรธ', K_('tom', 'angry')], tired: ['tired', 'เหนื่อย', K_('tom', 'tired')], hungry: ['hungry', 'หิว', K_('tom', 'hungry')], scared: ['scared', 'กลัว', K_('tom', 'scared')],
  // สัตว์
  cat: ['cat', 'แมว', A_('cat')], dog: ['dog', 'หมา', A_('dog')], bird: ['bird', 'นก', A_('bird')], fish: ['fish', 'ปลา', A_('fish')], rabbit: ['rabbit', 'กระต่าย', A_('rabbit')], duck: ['duck', 'เป็ด', A_('duck')],
  pig: ['pig', 'หมู', A_('pig')], cow: ['cow', 'วัว', A_('cow')], monkey: ['monkey', 'ลิง', A_('monkey')], elephant: ['elephant', 'ช้าง', A_('elephant')], frog: ['frog', 'กบ', A_('frog')], lion: ['lion', 'สิงโต', A_('lion')],
  // ของใช้และสี
  ball: ['ball', 'ลูกบอล', T_('ball')], bag: ['bag', 'กระเป๋า', T_('bag')], book: ['book', 'หนังสือ', T_('book')], pen: ['pen', 'ปากกา', T_('pen')], pencil: ['pencil', 'ดินสอ', T_('pencil')], ruler: ['ruler', 'ไม้บรรทัด', T_('ruler')], desk: ['desk', 'โต๊ะเรียน', T_('desk')], chair: ['chair', 'เก้าอี้', T_('chair')],
  red: ['red', 'สีแดง', T_('ball', 1, 'red')], blue: ['blue', 'สีฟ้า / น้ำเงิน', T_('ball', 1, 'blue')], yellow: ['yellow', 'สีเหลือง', T_('ball', 1, 'yellow')], green: ['green', 'สีเขียว', T_('ball', 1, 'green')], pink: ['pink', 'สีชมพู', T_('ball', 1, 'pink')],
  // อาหาร
  apple: ['apple', 'แอปเปิล', T_('apple')], banana: ['banana', 'กล้วย', T_('banana')], orange: ['orange', 'ส้ม', T_('orange')], milk: ['milk', 'นม', T_('milk')], egg: ['egg', 'ไข่', T_('egg')], rice: ['rice', 'ข้าว', T_('rice')], bread: ['bread', 'ขนมปัง', T_('bread')], water: ['water', 'น้ำ', T_('water')], cake: ['cake', 'เค้ก', T_('cake')], icecream: ['ice cream', 'ไอศกรีม', T_('icecream')],
  // กริยา
  run: ['run', 'วิ่ง', ACT_('run', 'tom')], jump: ['jump', 'กระโดด', ACT_('jump', 'tom')], swim: ['swim', 'ว่ายน้ำ', ACT_('swim', 'tom')], dance: ['dance', 'เต้นรำ', ACT_('dance', 'mei')], sing: ['sing', 'ร้องเพลง', ACT_('sing', 'mei')], walk: ['walk', 'เดิน', ACT_('walk', 'tom')],
  read: ['read', 'อ่าน', ACT_('read', 'mei')], eat: ['eat', 'กิน', ACT_('eat', 'tom')], drink: ['drink', 'ดื่ม', ACT_('drink', 'mei')], fly: ['fly', 'บิน', A_('bird')], write: ['write', 'เขียน', ACT_('write', 'tom')], play: ['play', 'เล่น', ACT_('play', 'tom')], sleep: ['sleep', 'นอนหลับ', ACT_('sleep', 'mei')],
  // กิจวัตร
  wakeup: ['wake up', 'ตื่นนอน', DAY_('wakeup', 'tom')], brush: ['brush teeth', 'แปรงฟัน', DAY_('brush', 'ben')], bath: ['take a bath', 'อาบน้ำ', DAY_('bath', 'tom')], breakfast: ['eat breakfast', 'กินอาหารเช้า', DAY_('breakfast', 'mei')],
  gosch: ['go to school', 'ไปโรงเรียน', DAY_('school', 'anna')], homework: ['do homework', 'ทำการบ้าน', DAY_('homework', 'mei')], bed: ['go to bed', 'เข้านอน', DAY_('bed', 'tom')],
  rain: ['rain', 'ฝน', T_('rain')],
  // สถานที่
  home: ['home', 'บ้าน', T_('home')], school: ['school', 'โรงเรียน', T_('school')], park: ['park', 'สวนสาธารณะ', T_('park')], zoo: ['zoo', 'สวนสัตว์', T_('zoo')]
};
const wd = id => ({ id, en: WORDS[id][0], th: WORDS[id][1], pic: WORDS[id][2] });

/* ---------- หมวดคำศัพท์สำหรับฝึกเขียน (เรียงคำสั้นไปยาว) ใช้ใน scene-write.js · ทุกคำต้องมีเส้นเขียนใน letters.js ---------- */
const WRITE_CATS = [
  { id: 'animals', th: 'สัตว์', en: 'Animals', color: '#ff8a1e', icon: 'cat', words: ['cat', 'dog', 'pig', 'cow', 'fish', 'bird', 'duck', 'frog', 'lion', 'monkey', 'rabbit', 'elephant'] },
  { id: 'food', th: 'อาหาร', en: 'Food', color: '#ee4a4a', icon: 'apple', words: ['egg', 'milk', 'rice', 'cake', 'bread', 'apple', 'water', 'orange', 'banana', 'icecream'] },
  { id: 'school', th: 'ของใช้', en: 'Things', color: '#3d8bff', icon: 'book', words: ['pen', 'bag', 'ball', 'book', 'desk', 'chair', 'ruler', 'pencil'] },
  { id: 'colors', th: 'สี', en: 'Colors', color: '#9a5ae8', icon: 'red', words: ['red', 'blue', 'pink', 'green', 'yellow'] },
  { id: 'people', th: 'คนรอบตัว', en: 'People', color: '#ff5aa6', icon: 'mom', words: ['mom', 'dad', 'boy', 'girl', 'baby', 'friend', 'teacher'] },
  { id: 'feelings', th: 'ความรู้สึก', en: 'Feelings', color: '#ffb02e', icon: 'happy', words: ['sad', 'happy', 'angry', 'tired', 'hungry', 'scared'] },
  { id: 'actions', th: 'คำกริยา', en: 'Actions', color: '#17c4a8', icon: 'run', words: ['run', 'eat', 'fly', 'swim', 'sing', 'jump', 'walk', 'read', 'play', 'dance', 'drink', 'write', 'sleep'] },
  { id: 'places', th: 'สถานที่', en: 'Places', color: '#3fb54a', icon: 'school', words: ['zoo', 'home', 'park', 'school'] },
  { id: 'pron', th: 'คำแทนตัว', en: 'Pronouns', color: '#8a5cf0', icon: 'he', words: ['I', 'he', 'it', 'we', 'you', 'she', 'they'] }
];

/* ---------- ระดับ ---------- */
const LEVELS = [
  { id: 1, key: 'starter', en: 'Starter', th: 'เริ่มต้น', grade: 'อนุบาล – ป.1', color: '#27c4a8', bg: 'meadow', eg: 'I am happy.', blurb: 'ทำความรู้จักสรรพนาม I you he she it we they กับคำศัพท์ใกล้ตัว และประโยค am / is / are' },
  { id: 2, key: 'explorer', en: 'Explorer', th: 'ก้าวหน้า', grade: 'ป.1 – ป.2', color: '#ff9a3c', bg: 'sunset', eg: 'She likes cake.', blurb: 'ประโยคบอกการกระทำ like / likes · have / has · can · กิน ดื่ม พร้อมคำกริยาที่เติม s' },
  { id: 3, key: 'master', en: 'Master', th: 'เก่ง', grade: 'ป.2 – ป.3', color: '#9a6ae8', bg: 'dusk', eg: 'Does he like fish?', blurb: 'กิจวัตรประจำวัน คำถาม Do / Does / Is / Are ประโยคปฏิเสธ และถามตอบ Where / What' }
];

/* ---------- หน่วยการเรียน ---------- */
// sort: ชุดจัดกลุ่ม { title, th, groups:[{id,en,th,color}], items:[[กลุ่ม, ข้อความหรือรหัสคำ, ภาพ?]] }
const G_COL = ['#ff7ab2', '#4aa8ff', '#ffb02e', '#58c864'];
const UNITS = [
  /* ======================= ระดับ 1 เริ่มต้น ======================= */
  {
    id: '1-1', level: 1, en: 'Who is it?', th: 'ใครเอ่ย (สรรพนาม)', icon: PR_('he'), kind: 'pron',
    words: ['I', 'you', 'he', 'she', 'it', 'we', 'they'],
    sents: [['I am Tom.', 'ฉันชื่อทอม', 'I', PR_('I')], ['You are Mei.', 'เธอชื่อเหมย', 'you', PR_('you')], ['He is Ben.', 'เขาชื่อเบน', 'he', PR_('he')], ['She is Anna.', 'เธอชื่อแอนนา', 'she', PR_('she')], ['It is a cat.', 'มันคือแมว', 'it', PR_('it')], ['We are friends.', 'พวกเราเป็นเพื่อนกัน', 'we', PR_('we')], ['They are kids.', 'พวกเขาเป็นเด็ก ๆ', 'they', PR_('they')]],
    sorts: [{ title: 'He, She or It?', th: 'ใช้คำไหนแทน', groups: [{ id: 'he', en: 'he', th: 'ผู้ชาย 1 คน' }, { id: 'she', en: 'she', th: 'ผู้หญิง 1 คน' }, { id: 'it', en: 'it', th: 'สัตว์หรือสิ่งของ' }],
      items: [['he', null, K_('tom', 'happy')], ['he', null, K_('ben', 'happy')], ['he', null, K_('dad', 'happy')], ['she', null, K_('mei', 'happy')], ['she', null, K_('anna', 'happy')], ['she', null, K_('mom', 'happy')], ['it', null, A_('cat')], ['it', null, A_('dog')], ['it', null, T_('ball')], ['it', null, A_('bird')]] }]
  },
  {
    id: '1-2', level: 1, en: 'People', th: 'คนรอบตัว', icon: K_('mom', 'happy'), kind: 'be',
    words: ['boy', 'girl', 'mom', 'dad', 'baby', 'teacher', 'friend'],
    sents: [['He is a boy.', 'เขาเป็นเด็กผู้ชาย', 'he', K_('tom', 'happy')], ['She is a girl.', 'เธอเป็นเด็กผู้หญิง', 'she', K_('mei', 'happy')], ['She is my mom.', 'เธอเป็นแม่ของฉัน', 'she', K_('mom', 'happy')], ['He is my dad.', 'เขาเป็นพ่อของฉัน', 'he', K_('dad', 'happy')], ['He is a baby.', 'เขาเป็นทารก', 'he', K_('baby', 'happy')], ['She is a teacher.', 'เธอเป็นครู', 'she', K_('teacherF', 'happy')], ['They are friends.', 'พวกเขาเป็นเพื่อนกัน', 'they', G_(K_('tom', 'happy'), K_('ben', 'happy'))]],
    sorts: [{ title: 'He or She?', th: 'ผู้ชายหรือผู้หญิง', groups: [{ id: 'he', en: 'he', th: 'ผู้ชาย' }, { id: 'she', en: 'she', th: 'ผู้หญิง' }],
      items: [['he', 'boy'], ['he', 'dad'], ['he', 'brother', K_('brother', 'happy')], ['she', 'girl'], ['she', 'mom'], ['she', 'sister', K_('sister', 'happy')], ['he', null, K_('ben', 'happy')], ['she', null, K_('anna', 'happy')]] }]
  },
  {
    id: '1-3', level: 1, en: 'Feelings', th: 'ความรู้สึก', icon: K_('mei', 'happy'), kind: 'be',
    words: ['happy', 'sad', 'angry', 'tired', 'hungry', 'scared'],
    sents: [['I am happy.', 'ฉันมีความสุข', 'I', K_('tom', 'happy')], ['She is sad.', 'เธอเศร้า', 'she', K_('anna', 'sad')], ['He is angry.', 'เขาโกรธ', 'he', K_('ben', 'angry')], ['We are tired.', 'พวกเราเหนื่อย', 'we', G_(K_('tom', 'tired'), K_('mei', 'tired'))], ['You are hungry.', 'เธอหิว', 'you', K_('mei', 'hungry')], ['They are scared.', 'พวกเขากลัว', 'they', G_(K_('ben', 'scared'), K_('anna', 'scared'), K_('mei', 'scared'))]],
    sorts: [{ title: 'Happy or Not happy?', th: 'สุขหรือไม่สุข', groups: [{ id: 'happy', en: 'happy', th: 'มีความสุข' }, { id: 'not', en: 'not happy', th: 'ไม่มีความสุข' }],
      items: [['happy', null, K_('tom', 'happy')], ['happy', null, K_('mei', 'happy')], ['happy', null, K_('anna', 'happy')], ['not', null, K_('tom', 'sad')], ['not', null, K_('ben', 'angry')], ['not', null, K_('mei', 'scared')], ['not', null, K_('anna', 'tired')], ['not', null, K_('tom', 'hungry')]] }]
  },
  {
    id: '1-4', level: 1, en: 'Animals', th: 'สัตว์น่ารัก', icon: A_('cat'), kind: 'be',
    words: ['cat', 'dog', 'bird', 'fish', 'rabbit', 'duck'],
    sents: [['It is a cat.', 'มันคือแมว', 'it', A_('cat')], ['It is a dog.', 'มันคือหมา', 'it', A_('dog')], ['It is a bird.', 'มันคือนก', 'it', A_('bird')], ['It is a fish.', 'มันคือปลา', 'it', A_('fish')], ['They are rabbits.', 'พวกมันคือกระต่าย', 'they', A_('rabbit', 3)], ['They are ducks.', 'พวกมันคือเป็ด', 'they', A_('duck', 3)]],
    sorts: [{ title: 'It is... or They are...?', th: 'หนึ่งตัวหรือหลายตัว', groups: [{ id: 'one', en: 'It is', th: 'มี 1 ตัว' }, { id: 'many', en: 'They are', th: 'มีหลายตัว' }],
      items: [['one', null, A_('cat')], ['one', null, A_('dog')], ['one', null, A_('bird')], ['one', null, A_('pig')], ['many', null, A_('duck', 3)], ['many', null, A_('rabbit', 2)], ['many', null, A_('cow', 3)], ['many', null, A_('frog', 2)]] }]
  },
  {
    id: '1-5', level: 1, en: 'Things & Colors', th: 'ของใช้และสี', icon: T_('ball', 1, 'red'), kind: 'be',
    words: ['ball', 'bag', 'book', 'pen', 'red', 'blue', 'yellow', 'green', 'pink'],
    sents: [['It is a red ball.', 'มันคือลูกบอลสีแดง', 'it', T_('ball', 1, 'red')], ['It is a blue bag.', 'มันคือกระเป๋าสีน้ำเงิน', 'it', T_('bag', 1, 'blue')], ['It is a green book.', 'มันคือหนังสือสีเขียว', 'it', T_('book', 1, 'green')], ['They are pink pens.', 'พวกมันคือปากกาสีชมพู', 'they', T_('pen', 3, 'pink')], ['It is a yellow pencil.', 'มันคือดินสอสีเหลือง', 'it', T_('pencil', 1, 'yellow')], ['They are red balls.', 'พวกมันคือลูกบอลสีแดง', 'they', T_('ball', 2, 'red')]],
    sorts: [{ title: 'Color groups', th: 'จัดกลุ่มตามสี', groups: [{ id: 'red', en: 'red', th: 'สีแดง' }, { id: 'blue', en: 'blue', th: 'สีน้ำเงิน' }, { id: 'green', en: 'green', th: 'สีเขียว' }],
      items: [['red', null, T_('ball', 1, 'red')], ['red', null, T_('bag', 1, 'red')], ['red', null, T_('book', 1, 'red')], ['blue', null, T_('ball', 1, 'blue')], ['blue', null, T_('bag', 1, 'blue')], ['blue', null, T_('pen', 1, 'blue')], ['green', null, T_('book', 1, 'green')], ['green', null, T_('pencil', 1, 'green')], ['green', null, T_('ball', 1, 'green')]] }]
  },
  /* ======================= ระดับ 2 ก้าวหน้า ======================= */
  {
    id: '2-1', level: 2, en: 'I like...', th: 'ฉันชอบ…', icon: T_('apple'), kind: 'like',
    words: ['apple', 'banana', 'orange', 'milk', 'cake', 'rice', 'icecream'],
    sents: [['I like apples.', 'ฉันชอบแอปเปิล', 'I', withThing('I', T_('apple'))], ['You like milk.', 'เธอชอบนม', 'you', withThing('you', T_('milk'))], ['He likes bananas.', 'เขาชอบกล้วย', 'he', withThing('he', T_('banana'))], ['She likes cake.', 'เธอชอบเค้ก', 'she', withThing('she', T_('cake'))], ['We like rice.', 'พวกเราชอบข้าว', 'we', withThing('we', T_('rice'))], ['They like ice cream.', 'พวกเขาชอบไอศกรีม', 'they', plus(kidsOf('they', 'happy'), T_('icecream'))], ['It likes fish.', 'มันชอบปลา', 'it', G_(A_('cat'), A_('fish'))]],
    sorts: [{ title: 'Fruit or Not fruit?', th: 'ผลไม้หรือไม่ใช่', groups: [{ id: 'fruit', en: 'fruit', th: 'ผลไม้' }, { id: 'not', en: 'not fruit', th: 'ไม่ใช่ผลไม้' }],
      items: [['fruit', 'apple'], ['fruit', 'banana'], ['fruit', 'orange'], ['not', 'cake'], ['not', 'rice'], ['not', 'icecream'], ['not', 'milk'], ['not', 'bread']] }]
  },
  {
    id: '2-2', level: 2, en: 'Action words', th: 'คำกริยา (เติม s)', icon: ACT_('run', 'tom'), kind: 'verb',
    words: ['run', 'jump', 'swim', 'dance', 'sing', 'walk'],
    sents: [['I run.', 'ฉันวิ่ง', 'I', actsOf('I', 'run')], ['You jump.', 'เธอกระโดด', 'you', actsOf('you', 'jump')], ['He swims.', 'เขาว่ายน้ำ', 'he', actsOf('he', 'swim')], ['She dances.', 'เธอเต้นรำ', 'she', actsOf('she', 'dance')], ['We sing.', 'พวกเราร้องเพลง', 'we', actsOf('we', 'sing')], ['They walk.', 'พวกเขาเดิน', 'they', actsOf('they', 'walk')], ['It runs.', 'มันวิ่ง', 'it', G_(T_('speed'), A_('dog'))]],
    sorts: [{ title: 'run or runs?', th: 'กริยาต้องเติม s ไหม', groups: [{ id: 'base', en: 'run', th: 'ไม่เติม s' }, { id: 's', en: 'runs', th: 'เติม s' }],
      items: [['base', 'I'], ['base', 'you'], ['base', 'we'], ['base', 'they'], ['s', 'he'], ['s', 'she'], ['s', 'it']] }]
  },
  {
    id: '2-3', level: 2, en: 'I have...', th: 'ฉันมี…', icon: T_('bag'), kind: 'have',
    words: ['bag', 'pen', 'ball', 'book', 'cat', 'dog'],
    sents: [['I have a bag.', 'ฉันมีกระเป๋า', 'I', withThing('I', T_('bag'))], ['You have a pen.', 'เธอมีปากกา', 'you', withThing('you', T_('pen'))], ['He has a ball.', 'เขามีลูกบอล', 'he', withThing('he', T_('ball'))], ['She has a book.', 'เธอมีหนังสือ', 'she', withThing('she', T_('book'))], ['We have a cat.', 'พวกเรามีแมว', 'we', plus(kidsOf('we', 'happy'), A_('cat'))], ['They have a dog.', 'พวกเขามีหมา', 'they', plus(G_(K_('ben', 'happy'), K_('anna', 'happy')), A_('dog'))]],
    sorts: [{ title: 'have or has?', th: 'ใช้ have หรือ has', groups: [{ id: 'have', en: 'have', th: 'have' }, { id: 'has', en: 'has', th: 'has' }],
      items: [['have', 'I'], ['have', 'you'], ['have', 'we'], ['have', 'they'], ['has', 'he'], ['has', 'she'], ['has', 'it']] }]
  },
  {
    id: '2-4', level: 2, en: 'I can...', th: 'ฉันทำได้…', icon: ACT_('swim', 'mei'), kind: 'can',
    words: ['run', 'swim', 'jump', 'sing', 'dance', 'read', 'fly'],
    sents: [['I can run.', 'ฉันวิ่งได้', 'I', actsOf('I', 'run')], ['You can swim.', 'เธอว่ายน้ำได้', 'you', actsOf('you', 'swim')], ['He can jump.', 'เขากระโดดได้', 'he', actsOf('he', 'jump')], ['She can sing.', 'เธอร้องเพลงได้', 'she', actsOf('she', 'sing')], ['We can dance.', 'พวกเราเต้นได้', 'we', actsOf('we', 'dance')], ['They can read.', 'พวกเขาอ่านได้', 'they', actsOf('they', 'read')], ['It can fly.', 'มันบินได้', 'it', A_('bird')]],
    sorts: [{ title: 'Fly, swim or run?', th: 'สัตว์ทำอะไรได้', groups: [{ id: 'fly', en: 'fly', th: 'บิน' }, { id: 'swim', en: 'swim', th: 'ว่ายน้ำ' }, { id: 'run', en: 'run', th: 'วิ่ง' }],
      items: [['fly', 'bird'], ['swim', 'fish'], ['run', 'dog'], ['run', 'cat'], ['run', 'rabbit'], ['run', 'pig'], ['swim', null, A_('fish', 2)], ['fly', null, A_('bird', 2)]] }]
  },
  {
    id: '2-5', level: 2, en: 'Eat & Drink', th: 'กินและดื่ม', icon: T_('bread'), kind: 'eat',
    words: ['eat', 'drink', 'egg', 'bread', 'water', 'milk', 'rice'],
    sents: [['I eat rice.', 'ฉันกินข้าว', 'I', withThing('I', T_('rice'))], ['You drink water.', 'เธอดื่มน้ำ', 'you', withThing('you', T_('water'))], ['He eats an egg.', 'เขากินไข่', 'he', withThing('he', T_('egg'))], ['She drinks milk.', 'เธอดื่มนม', 'she', withThing('she', T_('milk'))], ['We eat bread.', 'พวกเรากินขนมปัง', 'we', withThing('we', T_('bread'))], ['They drink water.', 'พวกเขาดื่มน้ำ', 'they', plus(kidsOf('they', 'happy'), T_('water'))]],
    sorts: [{ title: 'Eat or Drink?', th: 'กินหรือดื่ม', groups: [{ id: 'eat', en: 'eat', th: 'กิน' }, { id: 'drink', en: 'drink', th: 'ดื่ม' }],
      items: [['eat', 'egg'], ['eat', 'bread'], ['eat', 'rice'], ['eat', 'apple'], ['eat', 'cake'], ['drink', 'water'], ['drink', 'milk'], ['drink', null, T_('water')]] }]
  },
  /* ======================= ระดับ 3 เก่ง ======================= */
  {
    id: '3-1', level: 3, en: 'My day', th: 'กิจวัตรประจำวัน', icon: DAY_('wakeup', 'tom'), kind: 'day',
    words: ['wakeup', 'brush', 'bath', 'breakfast', 'gosch', 'homework', 'bed'],
    sents: [['I wake up.', 'ฉันตื่นนอน', 'I', DAY_('wakeup', 'tom')], ['She brushes her teeth.', 'เธอแปรงฟัน', 'she', DAY_('brush', 'anna')], ['He takes a bath.', 'เขาอาบน้ำ', 'he', DAY_('bath', 'ben')], ['We eat breakfast.', 'พวกเรากินอาหารเช้า', 'we', DAY_('breakfast', 'tom')], ['They go to school.', 'พวกเขาไปโรงเรียน', 'they', DAY_('school', 'mei')], ['You do homework.', 'เธอทำการบ้าน', 'you', DAY_('homework', 'mei')], ['I go to bed.', 'ฉันเข้านอน', 'I', DAY_('bed', 'tom')]],
    sorts: [{ title: 'Morning or Night?', th: 'เช้าหรือกลางคืน', groups: [{ id: 'morning', en: 'morning', th: 'ตอนเช้า' }, { id: 'night', en: 'night', th: 'ตอนกลางคืน' }],
      items: [['morning', 'wakeup'], ['morning', 'breakfast'], ['morning', 'gosch'], ['night', 'homework'], ['night', 'bath'], ['night', 'bed']] }]
  },
  {
    id: '3-2', level: 3, en: 'Do you like...?', th: 'ถามว่าชอบไหม', icon: G_(K_('mei', 'smile'), T_('qmark')), kind: 'do',
    words: ['milk', 'cat', 'rice', 'fish', 'cake', 'apple'],
    qa: [
      ['Do you like milk?', 'เธอชอบนมไหม', 'you', G_(K_('mei', 'smile'), T_('milk'), T_('qmark')), 'Yes, I do.', 'ใช่ ฉันชอบ', 'I', G_(K_('mei', 'happy'), T_('check'))],
      ['Does she like cats?', 'เธอชอบแมวไหม', 'she', G_(K_('anna', 'smile'), A_('cat'), T_('qmark')), 'Yes, she does.', 'ใช่ เธอชอบ', 'she', G_(K_('anna', 'happy'), T_('check'))],
      ['Do they like rice?', 'พวกเขาชอบข้าวไหม', 'they', G_(K_('ben', 'smile'), K_('anna', 'smile'), T_('rice'), T_('qmark')), 'No, they do not.', 'ไม่ พวกเขาไม่ชอบ', 'they', G_(K_('ben', 'sad'), K_('anna', 'sad'), T_('cross'))],
      ['Does he like fish?', 'เขาชอบปลาไหม', 'he', G_(K_('ben', 'smile'), A_('fish'), T_('qmark')), 'No, he does not.', 'ไม่ เขาไม่ชอบ', 'he', G_(K_('ben', 'sad'), T_('cross'))],
      ['Do we like cake?', 'พวกเราชอบเค้กไหม', 'we', G_(K_('tom', 'smile'), K_('mei', 'smile'), T_('cake'), T_('qmark')), 'Yes, we do.', 'ใช่ พวกเราชอบ', 'we', G_(K_('tom', 'happy'), K_('mei', 'happy'), T_('check'))],
      ['Do you like apples?', 'เธอชอบแอปเปิลไหม', 'you', G_(K_('mei', 'smile'), T_('apple'), T_('qmark')), 'No, I do not.', 'ไม่ ฉันไม่ชอบ', 'I', G_(K_('mei', 'sad'), T_('cross'))]
    ],
    sorts: [{ title: 'Do or Does?', th: 'ใช้ Do หรือ Does', groups: [{ id: 'do', en: 'Do', th: 'Do' }, { id: 'does', en: 'Does', th: 'Does' }],
      items: [['do', 'I'], ['do', 'you'], ['do', 'we'], ['do', 'they'], ['does', 'he'], ['does', 'she'], ['does', 'it']] }]
  },
  {
    id: '3-3', level: 3, en: 'Is it...? Are you...?', th: 'ถามว่าใช่ไหม', icon: G_(A_('cat'), T_('qmark')), kind: 'be-q',
    words: ['happy', 'teacher', 'cat', 'friend', 'sad', 'tired'],
    qa: [
      ['Are you happy?', 'เธอมีความสุขไหม', 'you', G_(K_('mei', 'smile'), T_('qmark')), 'Yes, I am.', 'ใช่ ฉันมีความสุข', 'I', G_(K_('mei', 'happy'), T_('check'))],
      ['Is he a teacher?', 'เขาเป็นครูไหม', 'he', G_(K_('teacherM', 'smile'), T_('qmark')), 'No, he is not.', 'ไม่ เขาไม่ใช่ครู', 'he', G_(K_('ben', 'smile'), T_('cross'))],
      ['Is it a cat?', 'มันคือแมวไหม', 'it', G_(A_('cat'), T_('qmark')), 'Yes, it is.', 'ใช่ มันคือแมว', 'it', G_(A_('cat'), T_('check'))],
      ['Are they friends?', 'พวกเขาเป็นเพื่อนกันไหม', 'they', G_(K_('ben', 'smile'), K_('anna', 'smile'), T_('qmark')), 'Yes, they are.', 'ใช่ พวกเขาเป็นเพื่อนกัน', 'they', G_(K_('ben', 'happy'), K_('anna', 'happy'), T_('check'))],
      ['Is she sad?', 'เธอเศร้าไหม', 'she', G_(K_('anna', 'smile'), T_('qmark')), 'No, she is not.', 'ไม่ เธอไม่เศร้า', 'she', G_(K_('anna', 'happy'), T_('cross'))],
      ['Are we tired?', 'พวกเราเหนื่อยไหม', 'we', G_(K_('tom', 'smile'), K_('mei', 'smile'), T_('qmark')), 'Yes, we are.', 'ใช่ พวกเราเหนื่อย', 'we', G_(K_('tom', 'tired'), K_('mei', 'tired'), T_('check'))]
    ],
    sorts: [{ title: 'am, is or are?', th: 'ใช้ am is หรือ are', groups: [{ id: 'am', en: 'am', th: 'am' }, { id: 'is', en: 'is', th: 'is' }, { id: 'are', en: 'are', th: 'are' }],
      items: [['am', 'I'], ['am', null, PR_('I')], ['is', 'he'], ['is', 'she'], ['is', 'it'], ['are', 'you'], ['are', 'we'], ['are', 'they']] }]
  },
  {
    id: '3-4', level: 3, en: 'Not', th: 'ประโยคปฏิเสธ', icon: G_(K_('tom', 'sad'), T_('cross')), kind: 'not',
    words: ['sad', 'tired', 'milk', 'cat', 'dog', 'rain'],
    sents: [['I am not sad.', 'ฉันไม่เศร้า', 'I', G_(K_('tom', 'happy'), T_('cross'))], ['It is not a dog.', 'มันไม่ใช่หมา', 'it', G_(A_('cat'), T_('cross'))], ['She does not like fish.', 'เธอไม่ชอบปลา', 'she', G_(K_('anna', 'sad'), A_('fish'), T_('cross'))], ['We are not tired.', 'พวกเราไม่เหนื่อย', 'we', G_(K_('tom', 'happy'), K_('mei', 'happy'), T_('cross'))], ['They do not like rain.', 'พวกเขาไม่ชอบฝน', 'they', G_(K_('ben', 'sad'), K_('anna', 'sad'), T_('rain'))], ['I do not like milk.', 'ฉันไม่ชอบนม', 'I', G_(K_('tom', 'sad'), T_('milk'), T_('cross'))]],
    sorts: [{ title: 'do not or does not?', th: 'ใช้ do not หรือ does not', groups: [{ id: 'do', en: 'do not', th: 'do not' }, { id: 'does', en: 'does not', th: 'does not' }],
      items: [['do', 'I'], ['do', 'you'], ['do', 'we'], ['do', 'they'], ['does', 'he'], ['does', 'she'], ['does', 'it']] }]
  },
  {
    id: '3-5', level: 3, en: 'Where & What', th: 'ที่ไหน และ อะไร', icon: G_(T_('school'), T_('qmark')), kind: 'wh',
    words: ['home', 'school', 'park', 'zoo', 'book', 'cake'],
    qa: [
      ['Where are you?', 'คุณอยู่ที่ไหน', 'you', G_(K_('mei', 'smile'), T_('qmark')), 'I am at school.', 'ฉันอยู่ที่โรงเรียน', 'I', G_(K_('mei', 'happy'), T_('school'))],
      ['Where is she?', 'เธออยู่ที่ไหน', 'she', G_(K_('anna', 'smile'), T_('qmark')), 'She is at home.', 'เธออยู่ที่บ้าน', 'she', G_(K_('anna', 'happy'), T_('home'))],
      ['What is it?', 'นี่คืออะไร', 'it', G_(T_('book'), T_('qmark')), 'It is a book.', 'มันคือหนังสือ', 'it', T_('book')],
      ['Where are they?', 'พวกเขาอยู่ที่ไหน', 'they', G_(K_('ben', 'smile'), K_('anna', 'smile'), T_('qmark')), 'They are in the park.', 'พวกเขาอยู่ในสวนสาธารณะ', 'they', G_(K_('ben', 'happy'), K_('anna', 'happy'), T_('park'))],
      ['What do you like?', 'เธอชอบอะไร', 'you', G_(K_('mei', 'open', 'point'), T_('qmark')), 'I like cake.', 'ฉันชอบเค้ก', 'I', G_(K_('mei', 'happy'), T_('cake'))],
      ['Where is he?', 'เขาอยู่ที่ไหน', 'he', G_(K_('ben', 'smile'), T_('qmark')), 'He is at the zoo.', 'เขาอยู่ที่สวนสัตว์', 'he', G_(K_('ben', 'happy'), T_('zoo'))]
    ],
    sorts: [{ title: 'Where or What?', th: 'คำถาม Where หรือ What', groups: [{ id: 'where', en: 'Where', th: 'ถามสถานที่' }, { id: 'what', en: 'What', th: 'ถามสิ่งของ' }],
      items: [['where', 'Where are you?'], ['where', 'Where is she?'], ['where', 'Where are they?'], ['where', 'Where is he?'], ['what', 'What is it?'], ['what', 'What do you like?'], ['what', 'What is this?'], ['what', 'What do they eat?']] }]
  }
];
const unitOf = id => UNITS.find(u => u.id === id);
const unitsOfLevel = lv => UNITS.filter(u => u.level === lv);
// รูปแบบประโยคมาตรฐาน: { en, th, p (สรรพนาม), pic }
// ประโยคที่ประธานเป็น you ใส่มือชี้ (mark 'you') ในภาพเสมอ ภาพเด็กคนเดียวจะได้ไม่เหมือนประโยค he / she
const markYou = (p, pic) => (p === 'you' && pic && pic.k !== 'pron' && !pic.mark) ? Object.assign({}, pic.k === 'group' ? pic : G_(pic), { mark: 'you' }) : pic;
const sentOf = r => ({ en: r[0], th: r[1], p: r[2], pic: markYou(r[2], r[3]) });
const qaOf = r => ({ q: { en: r[0], th: r[1], p: r[2], pic: markYou(r[2], r[3]) }, a: { en: r[4], th: r[5], p: r[6], pic: markYou(r[6], r[7]) } });
// ประโยคทั้งหมดของหน่วย (ถ้าเป็นถามตอบ คือทั้งคำถามและคำตอบ)
const allSents = u => u.qa ? u.qa.flatMap(r => { const x = qaOf(r); return [x.q, x.a]; }) : u.sents.map(sentOf);

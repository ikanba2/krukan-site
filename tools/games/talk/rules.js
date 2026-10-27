/* ===== Techno Talk: เนื้อหา 'หลักภาษา' ของทุกหน่วย (ข้อมูลล้วน ใช้ใน scene-rule.js) =====
   แต่ละหน่วยมี 3–4 หน้า สอนว่าคำไหนใช้คู่กับคำไหน และทำไม (เช่น I คู่กับ am · he she it คู่กับ is)
   ชนิดหน้า (k):
     meaning  การ์ดความหมาย items: [[อังกฤษ, ไทย, คำอธิบาย, ภาพ]]
     pair     จับคู่ประธานกับคำช่วย groups: [{ subs: [ประธาน], to: คำที่ใช้คู่, ex: ตัวอย่าง }] · before = คำช่วยขึ้นก่อนประธาน (Do / Does)
     formula  สูตรประโยค parts: [[คำ, หน้าที่]] · ex: [[ตัวอย่าง, คำแปล]]
     change   เปลี่ยนรูปประโยค rows: [[ก่อน, หลัง]] · note: สิ่งที่เปลี่ยน (คำที่เปลี่ยนจะเป็นสีส้ม)
     qa       ถามตอบ rows: [[คำถาม, คำตอบ]]
     tip      ข้อควรจำ lines: [ข้อความ] · ex: [[ตัวอย่าง, คำแปล]]
   ทุกหน้ามี t (หัวข้อ) en (สูตรสั้นบนป้าย) say (โค้ชอธิบายเป็นประโยคเต็ม บอกเหตุผล)
   ประโยคตัวอย่างทุกประโยคผ่านตัวตรวจไวยากรณ์ใน test_engine.js */
const RULES = {
  '1-1': [
    { k: 'meaning', t: 'คำแทนตัวมี 7 คำ', en: 'I · you · he · she · it · we · they', say: 'คำแทนตัวใช้แทนชื่อคน สัตว์ หรือสิ่งของ จะได้ไม่ต้องพูดชื่อซ้ำไปซ้ำมา แตะการ์ดเพื่อฟังเสียงนะ',
      items: [['I', 'ฉัน / ผม', 'ตัวเราเอง คนที่กำลังพูด', PR_('I')], ['you', 'เธอ / คุณ', 'คนที่เรากำลังคุยด้วย', PR_('you')], ['he', 'เขา', 'ผู้ชาย 1 คนที่เราพูดถึง', PR_('he')], ['she', 'เธอ', 'ผู้หญิง 1 คนที่เราพูดถึง', PR_('she')],
        ['it', 'มัน', 'สัตว์หรือสิ่งของ 1 อย่าง', PR_('it')], ['we', 'พวกเรา', 'ตัวเรารวมกับเพื่อน', PR_('we')], ['they', 'พวกเขา', 'คนอื่นหลายคน หรือของหลายอย่าง', PR_('they')]] },
    { k: 'pair', t: 'คำแทนตัวต้องจับคู่กับ am · is · are', en: 'I am · He is · We are', say: 'I ใช้คู่กับ am เท่านั้น ส่วน he she it เป็นหนึ่งคนหรือหนึ่งสิ่งจึงใช้ is และ you we they ใช้ are แตะคำแทนตัวเพื่อดูว่าคู่กับคำไหน',
      groups: [{ subs: ['I'], to: 'am', ex: 'I am Tom.' }, { subs: ['he', 'she', 'it'], to: 'is', ex: 'He is Ben.' }, { subs: ['you', 'we', 'they'], to: 'are', ex: 'We are friends.' }] },
    { k: 'formula', t: 'เรียงประโยคแนะนำตัว', en: 'I + am + ชื่อ', say: 'ประโยคภาษาอังกฤษเริ่มด้วยว่าใคร แล้วตามด้วย am is หรือ are แล้วจึงบอกชื่อ เหมือนพูดว่า ฉัน เป็น ทอม',
      parts: [['I', 'ใคร'], ['am', 'คู่กับ I'], ['Tom', 'ชื่อ']], ex: [['I am Tom.', 'ฉันชื่อทอม'], ['She is Anna.', 'เธอชื่อแอนนา'], ['You are Mei.', 'เธอชื่อเหมย']] },
    { k: 'tip', t: 'I เขียนตัวใหญ่เสมอ', en: 'I = ตัวพิมพ์ใหญ่', say: 'I เป็นคำพิเศษ ต้องเขียนเป็นตัวพิมพ์ใหญ่ทุกครั้ง และทุกประโยคขึ้นต้นด้วยตัวพิมพ์ใหญ่ จบด้วยจุด',
      lines: ['I เขียนเป็นตัวพิมพ์ใหญ่ทุกครั้ง ไม่ว่าจะอยู่ตรงไหนของประโยค', 'ขึ้นต้นประโยคด้วยตัวพิมพ์ใหญ่ และจบประโยคด้วยจุด ( . )'], ex: [['I am Tom.', 'ฉันชื่อทอม'], ['They are kids.', 'พวกเขาเป็นเด็ก ๆ']] }
  ],
  '1-2': [
    { k: 'pair', t: 'บอกว่าใครเป็นใคร', en: 'I am · He is · They are', say: 'พูดถึงตัวเองใช้ I am พูดถึงผู้ชายหรือผู้หญิงหนึ่งคนใช้ he is หรือ she is ถ้าหลายคนใช้ they are',
      groups: [{ subs: ['I'], to: 'am', ex: 'I am a girl.' }, { subs: ['he', 'she'], to: 'is', ex: 'She is a teacher.' }, { subs: ['you', 'we', 'they'], to: 'are', ex: 'They are friends.' }] },
    { k: 'formula', t: 'คนหนึ่งคนใส่ a ข้างหน้า', en: 'He + is + a + boy', say: 'เวลาบอกว่าคนหนึ่งคนเป็นอะไร ต้องใส่ a ไว้หน้าคำนั้น เพราะ a แปลว่าหนึ่ง เช่น a boy คือเด็กผู้ชายหนึ่งคน',
      parts: [['He', 'ใคร'], ['is', 'คู่กับ he'], ['a', 'หนึ่ง'], ['boy', 'เป็นอะไร']], ex: [['He is a boy.', 'เขาเป็นเด็กผู้ชาย'], ['She is a teacher.', 'เธอเป็นครู']] },
    { k: 'change', t: 'หลายคนไม่ใส่ a แต่เติม s', en: 'a friend › friends', say: 'ถ้าพูดถึงหลายคน เปลี่ยนเป็น they are แล้วเติม s ท้ายคำ และไม่ต้องใส่ a เพราะไม่ใช่คนเดียวแล้ว',
      rows: [['He is a friend.', 'They are friends.'], ['She is a girl.', 'They are girls.']], note: 'หลายคน: they are + เติม s ไม่ใส่ a' },
    { k: 'formula', t: 'my แปลว่า ของฉัน', en: 'my mom · my dad', say: 'my แปลว่าของฉัน วางไว้หน้าคน เช่น my mom คือแม่ของฉัน เมื่อมี my แล้วไม่ต้องใส่ a',
      parts: [['She', 'ใคร'], ['is', 'คู่กับ she'], ['my', 'ของฉัน'], ['mom', 'แม่']], ex: [['She is my mom.', 'เธอเป็นแม่ของฉัน'], ['He is my dad.', 'เขาเป็นพ่อของฉัน']] }
  ],
  '1-3': [
    { k: 'formula', t: 'บอกความรู้สึก', en: 'I + am + happy', say: 'บอกความรู้สึกให้พูดว่าใคร ตามด้วย am is หรือ are แล้วจึงบอกความรู้สึก เช่น I am happy แปลว่าฉันมีความสุข',
      parts: [['I', 'ใคร'], ['am', 'คู่กับ I'], ['happy', 'ความรู้สึก']], ex: [['I am happy.', 'ฉันมีความสุข'], ['He is angry.', 'เขาโกรธ'], ['They are scared.', 'พวกเขากลัว']] },
    { k: 'pair', t: 'ความรู้สึกของใคร ใช้คำไหน', en: 'I am · She is · We are', say: 'ความรู้สึกของใครก็ใช้ am is are ตามคนนั้น I ใช้ am he she it ใช้ is ส่วน you we they ใช้ are',
      groups: [{ subs: ['I'], to: 'am', ex: 'I am happy.' }, { subs: ['he', 'she', 'it'], to: 'is', ex: 'She is sad.' }, { subs: ['you', 'we', 'they'], to: 'are', ex: 'We are tired.' }] },
    { k: 'tip', t: 'ความรู้สึกไม่ต้องใส่ a', en: 'I am happy.', say: 'คำบอกความรู้สึกไม่ใช่สิ่งของที่นับได้ จึงไม่ใส่ a พูดว่า I am happy ไม่ใช่ I am a happy',
      lines: ['ความรู้สึกไม่ใช่สิ่งของ จึงไม่ใส่ a ข้างหน้า', 'ถูก: I am happy.   ผิด: I am a happy.'], ex: [['You are hungry.', 'เธอหิว'], ['We are tired.', 'พวกเราเหนื่อย']] }
  ],
  '1-4': [
    { k: 'formula', t: 'สัตว์ 1 ตัว', en: 'It + is + a + cat', say: 'สัตว์หนึ่งตัวใช้ it แทน แล้วตามด้วย is และใส่ a หน้าชื่อสัตว์ เพราะมีแค่ตัวเดียว',
      parts: [['It', 'สัตว์ 1 ตัว'], ['is', 'คู่กับ it'], ['a', 'หนึ่ง'], ['cat', 'สัตว์']], ex: [['It is a cat.', 'มันคือแมว'], ['It is a dog.', 'มันคือหมา']] },
    { k: 'formula', t: 'สัตว์หลายตัว', en: 'They + are + rabbits', say: 'สัตว์หลายตัวใช้ they แทน ตามด้วย are แล้วเติม s ท้ายชื่อสัตว์ ไม่ต้องใส่ a',
      parts: [['They', 'หลายตัว'], ['are', 'คู่กับ they'], ['rabbits', 'เติม s']], ex: [['They are rabbits.', 'พวกมันคือกระต่าย'], ['They are ducks.', 'พวกมันคือเป็ด']] },
    { k: 'change', t: '1 ตัว เปลี่ยนเป็นหลายตัว', en: 'a cat › cats', say: 'เปลี่ยนจากหนึ่งตัวเป็นหลายตัว ให้เปลี่ยน it is เป็น they are ตัด a ออก แล้วเติม s ท้ายชื่อสัตว์',
      rows: [['It is a cat.', 'They are cats.'], ['It is a duck.', 'They are ducks.'], ['It is a bird.', 'They are birds.']], note: 'it is a … › they are … + s' },
    { k: 'tip', t: 'คำพิเศษ fish', en: 'one fish · two fish', say: 'fish เป็นคำพิเศษ ปลาหลายตัวก็ยังเขียนว่า fish ไม่ต้องเติม s',
      lines: ['ปลา 1 ตัว: It is a fish.', 'ปลาหลายตัวก็ยังเป็น fish ไม่เติม s'], ex: [['It is a fish.', 'มันคือปลา'], ['They are fish.', 'พวกมันคือปลา']] }
  ],
  '1-5': [
    { k: 'formula', t: 'สีอยู่หน้าสิ่งของ', en: 'a + red + ball', say: 'ภาษาอังกฤษวางสีไว้หน้าสิ่งของ a red ball แปลว่าลูกบอลสีแดง ซึ่งเรียงกลับกับภาษาไทย',
      parts: [['It', 'สิ่งของ'], ['is', 'คู่กับ it'], ['a', 'หนึ่ง'], ['red', 'สี'], ['ball', 'ของ']], ex: [['It is a red ball.', 'มันคือลูกบอลสีแดง'], ['It is a blue bag.', 'มันคือกระเป๋าสีน้ำเงิน']] },
    { k: 'tip', t: 'ไทยกับอังกฤษเรียงต่างกัน', en: 'red ball = ลูกบอลสีแดง', say: 'ภาษาไทยพูดชื่อของก่อนแล้วจึงบอกสี แต่ภาษาอังกฤษบอกสีก่อนแล้วจึงพูดชื่อของ',
      lines: ['ภาษาไทย: ลูกบอล + สีแดง', 'ภาษาอังกฤษ: red + ball  (สีมาก่อน)'], ex: [['It is a green book.', 'มันคือหนังสือสีเขียว'], ['It is a yellow pencil.', 'มันคือดินสอสีเหลือง']] },
    { k: 'change', t: 'ของหลายชิ้น', en: 'a pink pen › pink pens', say: 'ของหลายชิ้นใช้ they are ตัด a ออก แล้วเติม s ที่ชื่อของ ส่วนคำบอกสีไม่ต้องเติม s',
      rows: [['It is a pink pen.', 'They are pink pens.'], ['It is a red ball.', 'They are red balls.']], note: 'เติม s ที่ของ ไม่เติมที่สี' }
  ],
  '2-1': [
    { k: 'pair', t: 'like หรือ likes', en: 'I like · She likes', say: 'he she it เป็นหนึ่งคนหรือหนึ่งสิ่งที่เราพูดถึง จึงต้องเติม s เป็น likes ส่วน I you we they ใช้ like เฉย ๆ',
      groups: [{ subs: ['I', 'you', 'we', 'they'], to: 'like', ex: 'We like rice.' }, { subs: ['he', 'she', 'it'], to: 'likes', ex: 'She likes cake.' }] },
    { k: 'formula', t: 'บอกว่าชอบอะไร', en: 'He + likes + bananas', say: 'บอกว่าชอบอะไรให้พูดว่าใคร ตามด้วย like หรือ likes แล้วบอกสิ่งที่ชอบ',
      parts: [['He', 'ใคร'], ['likes', 'ชอบ (เติม s)'], ['bananas', 'สิ่งที่ชอบ']], ex: [['He likes bananas.', 'เขาชอบกล้วย'], ['I like apples.', 'ฉันชอบแอปเปิล'], ['It likes fish.', 'มันชอบปลา']] },
    { k: 'tip', t: 'ผลไม้ที่นับได้ เติม s', en: 'apples · bananas', say: 'ถ้าชอบผลไม้ที่นับเป็นลูกได้ ให้พูดแบบเติม s เพราะหมายถึงผลไม้ชนิดนั้นทั้งหมด ส่วนของที่นับเป็นลูกไม่ได้ เช่น นม ข้าว ไม่เติม s',
      lines: ['ผลไม้นับเป็นลูกได้ เติม s: apples · bananas · oranges', 'นับเป็นลูกไม่ได้ ไม่เติม s: milk · rice'], ex: [['I like apples.', 'ฉันชอบแอปเปิล'], ['You like milk.', 'เธอชอบนม']] }
  ],
  '2-2': [
    { k: 'pair', t: 'กริยาเติม s เมื่อเป็น he she it', en: 'I run · He runs', say: 'เมื่อพูดถึง he she it ที่เป็นคนเดียวหรือสิ่งเดียว ต้องเติม s ที่คำกริยา ส่วน I you we they ไม่ต้องเติม',
      groups: [{ subs: ['I', 'you', 'we', 'they'], to: 'run', ex: 'They walk.' }, { subs: ['he', 'she', 'it'], to: 'runs', ex: 'He swims.' }] },
    { k: 'change', t: 'เปลี่ยนประธาน กริยาเปลี่ยนตาม', en: 'I run. › He runs.', say: 'ดูคำสีส้มนะ เมื่อประธานเปลี่ยนเป็น he she หรือ it คำกริยาจะเติม s ทันที',
      rows: [['I run.', 'He runs.'], ['We sing.', 'She sings.'], ['You jump.', 'It jumps.']], note: 'he she it + กริยาเติม s' },
    { k: 'change', t: 'เติม s ท้ายคำกริยา', en: 'dance › dances', say: 'คำกริยาส่วนใหญ่เติม s ต่อท้ายได้เลย เช่น swim เป็น swims dance เป็น dances',
      rows: [['swim', 'swims'], ['dance', 'dances'], ['walk', 'walks']], note: 'ใช้กับ he she it' }
  ],
  '2-3': [
    { k: 'pair', t: 'have หรือ has', en: 'I have · He has', say: 'I you we they ใช้ have ส่วน he she it ใช้ has ซึ่งเป็นคำใหม่ ไม่ได้เติม s ต่อท้าย have',
      groups: [{ subs: ['I', 'you', 'we', 'they'], to: 'have', ex: 'I have a bag.' }, { subs: ['he', 'she', 'it'], to: 'has', ex: 'He has a ball.' }] },
    { k: 'formula', t: 'บอกว่ามีอะไร', en: 'She + has + a + book', say: 'บอกว่ามีอะไรให้พูดว่าใคร ตามด้วย have หรือ has แล้วใส่ a หน้าของหนึ่งชิ้น',
      parts: [['She', 'ใคร'], ['has', 'มี'], ['a', 'หนึ่ง'], ['book', 'สิ่งของ']], ex: [['She has a book.', 'เธอมีหนังสือ'], ['We have a cat.', 'พวกเรามีแมว']] },
    { k: 'change', t: 'เปลี่ยนเป็น he she', en: 'have › has', say: 'เมื่อเปลี่ยนประธานเป็น he หรือ she ให้เปลี่ยน have เป็น has ทุกครั้ง',
      rows: [['I have a pen.', 'He has a pen.'], ['They have a dog.', 'She has a dog.']], note: 'he she it ใช้ has' }
  ],
  '2-4': [
    { k: 'formula', t: 'can แปลว่า ทำได้', en: 'He + can + jump', say: 'can แปลว่าทำได้ วางไว้หน้าคำกริยา และคำกริยาหลัง can ไม่ต้องเติม s เสมอ',
      parts: [['He', 'ใคร'], ['can', 'ทำได้'], ['jump', 'ไม่เติม s']], ex: [['He can jump.', 'เขากระโดดได้'], ['It can fly.', 'มันบินได้']] },
    { k: 'pair', t: 'ทุกคนใช้ can เหมือนกัน', en: 'I can · She can', say: 'can ไม่เปลี่ยนรูป ไม่ว่าประธานจะเป็นใคร ก็ใช้ can เหมือนกันหมด',
      groups: [{ subs: ['I', 'you', 'we', 'they'], to: 'can', ex: 'We can dance.' }, { subs: ['he', 'she', 'it'], to: 'can', ex: 'She can sing.' }] },
    { k: 'change', t: 'มี can แล้ว ตัด s ออก', en: 'swims › can swim', say: 'ปกติ he she ต้องเติม s ที่กริยา แต่ถ้ามี can อยู่ข้างหน้า ให้ใช้กริยาแบบไม่เติม s',
      rows: [['He swims.', 'He can swim.'], ['She sings.', 'She can sing.']], note: 'can + กริยาไม่เติม s' }
  ],
  '2-5': [
    { k: 'pair', t: 'eat หรือ eats', en: 'I eat · He eats', say: 'he she it ต้องเติม s เป็น eats ส่วน I you we they ใช้ eat',
      groups: [{ subs: ['I', 'you', 'we', 'they'], to: 'eat', ex: 'I eat rice.' }, { subs: ['he', 'she', 'it'], to: 'eats', ex: 'He eats an egg.' }] },
    { k: 'pair', t: 'drink หรือ drinks', en: 'You drink · She drinks', say: 'ดื่มก็ใช้หลักเดียวกัน he she it เติม s เป็น drinks ส่วน I you we they ใช้ drink',
      groups: [{ subs: ['I', 'you', 'we', 'they'], to: 'drink', ex: 'You drink water.' }, { subs: ['he', 'she', 'it'], to: 'drinks', ex: 'She drinks milk.' }] },
    { k: 'tip', t: 'a กับ an', en: 'an egg · a cake', say: 'คำที่ขึ้นต้นด้วยเสียงสระ a e i o u ให้ใช้ an แทน a เพราะออกเสียงต่อกันได้ง่ายกว่า',
      lines: ['ขึ้นต้นด้วยเสียงสระ a e i o u ใช้ an: an egg · an apple', 'นอกนั้นใช้ a: a cake · a banana'], ex: [['He eats an egg.', 'เขากินไข่'], ['We eat bread.', 'พวกเรากินขนมปัง']] }
  ],
  '3-1': [
    { k: 'change', t: 'กิจวัตรของ he she', en: 'I wake up. › He wakes up.', say: 'เล่ากิจวัตรของ he หรือ she ต้องเติม s ที่คำกริยาเสมอ ดูคำสีส้มที่เปลี่ยนไปนะ',
      rows: [['I wake up.', 'He wakes up.'], ['We eat breakfast.', 'She eats breakfast.'], ['They go to school.', 'He goes to school.']], note: 'he she + กริยาเติม s หรือ es' },
    { k: 'tip', t: 'บางคำเติม es', en: 'brushes · goes · does', say: 'คำที่ลงท้ายด้วย sh หรือ o ต้องเติม es แทน s เช่น brush เป็น brushes go เป็น goes do เป็น does',
      lines: ['brush › brushes   (ลงท้าย sh เติม es)', 'go › goes  ·  do › does   (ลงท้าย o เติม es)', 'take › takes  ·  wake › wakes   (เติม s ธรรมดา)'], ex: [['She brushes her teeth.', 'เธอแปรงฟัน'], ['He takes a bath.', 'เขาอาบน้ำ']] },
    { k: 'pair', t: 'ฟันของใคร my · his · her', en: 'my · his · her', say: 'บอกว่าเป็นของใคร I ใช้ my he ใช้ his และ she ใช้ her เช่น her teeth คือฟันของเธอ',
      groups: [{ subs: ['I'], to: 'my', ex: 'I brush my teeth.' }, { subs: ['he'], to: 'his', ex: 'He brushes his teeth.' }, { subs: ['she'], to: 'her', ex: 'She brushes her teeth.' }] }
  ],
  '3-2': [
    { k: 'pair', t: 'ถามด้วย Do หรือ Does', en: 'Do you · Does she', say: 'คำถามว่าชอบไหม ขึ้นต้นด้วย Do สำหรับ I you we they และขึ้นต้นด้วย Does สำหรับ he she it',
      before: true, groups: [{ subs: ['I', 'you', 'we', 'they'], to: 'Do', ex: 'Do you like milk?' }, { subs: ['he', 'she', 'it'], to: 'Does', ex: 'Does she like cats?' }] },
    { k: 'change', t: 'เปลี่ยนประโยคเป็นคำถาม', en: 'She likes › Does she like', say: 'เมื่อใช้ Does ขึ้นต้นคำถามแล้ว likes ต้องกลับเป็น like เพราะ Does รับหน้าที่เติม s ไปแล้ว',
      rows: [['You like milk.', 'Do you like milk?'], ['She likes cats.', 'Does she like cats?'], ['He likes fish.', 'Does he like fish?']], note: 'Does + ประธาน + กริยาไม่เติม s + ?' },
    { k: 'qa', t: 'ตอบสั้น ๆ', en: 'Yes, I do. · No, he does not.', say: 'ตอบว่าใช่ด้วย Yes ตามด้วยประธานและ do หรือ does ตอบว่าไม่ใช่ด้วย No และ do not หรือ does not',
      rows: [['Do you like milk?', 'Yes, I do.'], ['Does he like fish?', 'No, he does not.'], ['Do they like rice?', 'No, they do not.']] }
  ],
  '3-3': [
    { k: 'change', t: 'สลับ am is are ไปไว้ข้างหน้า', en: 'You are › Are you', say: 'อยากเปลี่ยนประโยคเป็นคำถาม ให้ย้าย am is are มาไว้หน้าประธาน แล้วจบด้วยเครื่องหมายคำถาม',
      rows: [['You are happy.', 'Are you happy?'], ['It is a cat.', 'Is it a cat?'], ['He is a teacher.', 'Is he a teacher?']], note: 'am is are + ประธาน + … ?' },
    { k: 'qa', t: 'ตอบด้วย Yes หรือ No', en: 'Yes, it is. · No, she is not.', say: 'ตอบว่าใช่ใช้ Yes ตามด้วยประธานและ am is are ตอบว่าไม่ใช่ใช้ No และเติม not',
      rows: [['Are you happy?', 'Yes, I am.'], ['Is she sad?', 'No, she is not.'], ['Are they friends?', 'Yes, they are.']] },
    { k: 'tip', t: 'ถามว่า you ตอบว่า I', en: 'Are you …? › Yes, I am.', say: 'เมื่อมีคนถามเราว่า Are you เราต้องตอบด้วย I am เพราะเรากำลังพูดถึงตัวเอง',
      lines: ['ถาม Are you …?  ตอบ Yes, I am.', 'ถาม Are we …?  ตอบ Yes, we are.'], ex: [['Are you happy?', 'เธอมีความสุขไหม'], ['Yes, I am.', 'ใช่ ฉันมีความสุข']] }
  ],
  '3-4': [
    { k: 'change', t: 'ใส่ not หลัง am is are', en: 'I am › I am not', say: 'ประโยคปฏิเสธที่มี am is are ให้ใส่ not ต่อท้ายคำนั้นได้เลย',
      rows: [['I am sad.', 'I am not sad.'], ['It is a dog.', 'It is not a dog.'], ['We are tired.', 'We are not tired.']], note: 'am / is / are + not' },
    { k: 'pair', t: 'do not หรือ does not', en: 'I do not · She does not', say: 'ปฏิเสธการกระทำใช้ do not กับ I you we they และใช้ does not กับ he she it',
      groups: [{ subs: ['I', 'you', 'we', 'they'], to: 'do not', ex: 'They do not like rain.' }, { subs: ['he', 'she', 'it'], to: 'does not', ex: 'She does not like fish.' }] },
    { k: 'change', t: 'ปฏิเสธการกระทำ', en: 'She likes › She does not like', say: 'เมื่อใส่ does not แล้ว likes ต้องกลับเป็น like เพราะ does รับหน้าที่เติม s ไปแล้ว',
      rows: [['I like milk.', 'I do not like milk.'], ['She likes fish.', 'She does not like fish.']], note: 'does not + กริยาไม่เติม s' }
  ],
  '3-5': [
    { k: 'qa', t: 'Where แปลว่า ที่ไหน', en: 'Where are you?', say: 'Where ใช้ถามสถานที่ ตอบด้วยประธาน am is are แล้วบอกว่าอยู่ที่ไหน',
      rows: [['Where are you?', 'I am at school.'], ['Where is she?', 'She is at home.'], ['Where are they?', 'They are in the park.']] },
    { k: 'qa', t: 'What แปลว่า อะไร', en: 'What is it?', say: 'What ใช้ถามสิ่งของหรือสิ่งที่ชอบ ตอบด้วยชื่อสิ่งนั้น',
      rows: [['What is it?', 'It is a book.'], ['What do you like?', 'I like cake.']] },
    { k: 'tip', t: 'at กับ in', en: 'at home · in the park', say: 'บอกว่าอยู่ที่ไหนใช้ at กับสถานที่ทั่วไป เช่น at home at school และใช้ in เมื่ออยู่ข้างในพื้นที่ เช่น in the park',
      lines: ['at home · at school · at the zoo', 'in the park   (อยู่ข้างในสวน)'], ex: [['He is at the zoo.', 'เขาอยู่ที่สวนสัตว์'], ['They are in the park.', 'พวกเขาอยู่ในสวนสาธารณะ']] }
  ]
};
// ประโยคตัวอย่างทั้งหมดของหน้าหนึ่ง (ใช้ทดสอบไวยากรณ์และเสียงอ่าน)
const ruleSents = s => (s.groups || []).map(g => g.ex).concat((s.ex || []).map(e => e[0]), (s.rows || []).flat(), (s.items || []).map(it => it[0])).filter(t => /[.?!]$/.test(t));

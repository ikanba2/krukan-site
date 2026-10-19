/* ส่งออกรายงานของครูเป็น PDF (หน้า A4 พร้อมหัวรายงาน) และ Excel (.xlsx จัดรูปแบบแล้ว)
   - ใส่ปุ่ม 📄 PDF · 📊 Excel ให้ทุกกล่องรายงานที่มีตารางในหน้าครูเองโดยอัตโนมัติ
   - อ่านข้อมูลจากตารางที่แสดงบนจอ จึงได้ตามที่ครูกรอง/เรียง/เลือกบทไว้
   - หน้าคะแนนมีปุ่ม "ส่งออกทุกตาราง" (PDF หลายหน้า / Excel แยกชีต)
   - เขียนไฟล์ .xlsx เอง (zip แบบไม่บีบอัด) ไม่ต้องโหลดไลบรารีจากภายนอก */
(function () {
  'use strict';
  const COURSE = 'วิชา' + window.DT_CFG.full;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const xesc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const settings = () => { try { return (window.DTApp && window.DTApp.db && window.DTApp.db.settings) || {}; } catch (e) { return {}; } };
  const metaLine = () => { const s = settings(); return [COURSE, s.classroom ? 'ห้อง ' + s.classroom : '', s.year ? 'ปีการศึกษา ' + s.year : ''].filter(Boolean).join(' · '); };
  const nowTh = () => { const d = new Date(); try { return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) + ' เวลา ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'; } catch (e) { return d.toISOString(); } };
  const stamp = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear() + 543}${p(d.getMonth() + 1)}${p(d.getDate())}`; };
  const clean = s => String(s || '').replace(/\s+/g, ' ').replace(/\s*\/\s*(?=\d)/g, '/').replace(/\s*›\s*$/, '').trim();

  /* ---------- อ่านกล่องรายงานจากหน้าจอ ---------- */
  const SKIP_HEAD = /^(เลือก|จัดการ|ทำรายการ|)$/;
  function cellText(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll('input,select,textarea,.rx-bar,[data-rx-skip],.sr-only,svg').forEach(x => x.remove());
    c.querySelectorAll('br').forEach(b => b.replaceWith(' '));
    c.querySelectorAll('*').forEach(x => { x.insertAdjacentText('beforebegin', ' '); });
    return clean(c.textContent).replace(/^(-?\d+(?:\.\d+)?) (\d+%)$/, '$1 ($2)');
  }
  function readTable(t) {
    const trs = [...t.rows], heads = [];
    let skip = new Set();
    const first = trs.find(r => r.parentElement.tagName === 'THEAD') || (trs[0] && [...trs[0].cells].every(c => c.tagName === 'TH') ? trs[0] : null);
    if (first) { let ci = 0; [...first.cells].forEach(c => { const sp = c.colSpan || 1; if (sp === 1 && SKIP_HEAD.test(cellText(c)) && ci > 0) skip.add(ci); ci += sp; }); }
    const rows = trs.map(tr => {
      let ci = 0; const cells = [];
      [...tr.cells].forEach(c => { const sp = c.colSpan || 1; if (!skip.has(ci)) cells.push({ v: cellText(c), span: sp, th: c.tagName === 'TH' }); ci += sp; });
      const head = tr.parentElement.tagName === 'THEAD' || tr === first;
      const txt0 = cells[0] ? cells[0].v : '';
      const total = !head && (/avg|total|sum/.test(tr.className) || /^(เฉลี่ย|ค่าเฉลี่ย|รวม|รวมทั้งห้อง)/.test(txt0));
      return { cells, head, total };
    }).filter(r => r.cells.length && r.cells.some(c => c.v !== ''));
    rows.forEach(r => { if (r.head) heads.push(r); });
    return rows;
  }
  function readExtras(sec) {
    const kv = [];
    sec.querySelectorAll('.sc-kpi > div, .stats .stat').forEach(d => { const k = d.querySelector('small'), v = d.querySelector('b,strong'); if (k && v) { const vv = v.cloneNode(true); vv.querySelectorAll('small').forEach(s => s.insertAdjacentText('beforebegin', '')); kv.push([clean(k.textContent), clean(vv.textContent)]); } });
    const notes = [];
    sec.querySelectorAll('.db-missing').forEach(m => { const h = m.querySelector('b'); notes.push({ title: h ? clean(h.textContent) : 'หมายเหตุ', items: [...m.querySelectorAll('li')].map(li => clean(li.textContent)) }); });
    return { kv, notes };
  }
  function titleOf(sec) {
    const h = sec.querySelector('h2') || sec.querySelector('.flex-between h3, h3:not(.sc-h)'), eb = sec.querySelector('.eyebrow'), sub = sec.querySelector('h3.sc-h');
    let t = h ? clean(h.textContent) : 'รายงาน';
    if (sec.id === 'db-rep') t = 'รายงานรายคน · ' + t;
    else if (eb && !h) t = clean(eb.textContent);
    if (sub) t += ' · ' + clean(sub.textContent);
    const tab = sec.closest('[data-tab-panel]'); void tab;
    return t.replace(/^[^\p{L}\p{N}]+/u, '').trim() || 'รายงาน';
  }
  function readSection(sec) {
    const tables = [...sec.querySelectorAll('table')].filter(t => !t.closest('.rx-none') && !t.classList.contains('teacher-roster-preview') && t.rows.length > 1);
    return { title: titleOf(sec), tables: tables.map(readTable).filter(r => r.length > 1), extras: readExtras(sec) };
  }
  const isNum = v => /^-?\d+(?:\.\d+)?$/.test(v);
  const isEmpty = v => v === '' || v === '–' || v === '-' || /^ยังไม่/.test(v);

  /* ---------- PDF: เปิดหน้า A4 แล้วสั่งพิมพ์ (เลือก "บันทึกเป็น PDF") ---------- */
  function pdf(reports, name) {
    const cols = Math.max(1, ...reports.flatMap(r => r.tables.map(t => Math.max(...t.map(row => row.cells.reduce((a, c) => a + c.span, 0))))));
    const land = cols > 7;
    const tableHtml = rows => {
      let zebra = 0;
      const thead = rows.filter(r => r.head), body = rows.filter(r => !r.head);
      const tr = (r, tag) => `<tr class="${r.total ? 'tot' : (!r.head && (zebra++ % 2) ? 'z' : '')}">${r.cells.map((c, i) => { const t = tag || (c.th && i === 0 ? 'th' : 'td'); const cls = [/^-?\d+(\.\d+)?(\/\d+)?( \(\d+%\))?$/.test(c.v) || /^\d+(\.\d+)? › \d/.test(c.v) ? 'n' : '', isEmpty(c.v) && !r.head ? 'e' : '', i === 0 ? 'f' : ''].filter(Boolean).join(' '); return `<${t}${c.span > 1 ? ` colspan="${c.span}"` : ''}${cls ? ` class="${cls}"` : ''}>${esc(c.v || (r.head ? '' : '–'))}</${t}>`; }).join('')}</tr>`;
      return `<table><thead>${thead.map(r => tr(r, 'th')).join('')}</thead><tbody>${body.map(r => tr(r)).join('')}</tbody></table>`;
    };
    const block = (r, i) => `<section class="rep${i ? ' brk' : ''}">
      <header class="hd"><div class="badge">TECHNO<br>FRONTIER</div><div class="ht"><h1>${esc(r.title)}</h1><p>${esc(metaLine())}</p></div><div class="dt">ข้อมูล ณ วันที่<br><b>${esc(nowTh())}</b></div></header>
      ${r.extras.kv.length ? `<div class="kpi">${r.extras.kv.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>` : ''}
      ${r.tables.map(tableHtml).join('<div class="gap"></div>')}
      ${r.extras.notes.map(n => `<div class="note"><b>${esc(n.title)}</b><ul>${n.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}
      <div class="sign"><div>ลงชื่อ .................................... ครูผู้สอน<br>( .................................... )</div><div>ลงชื่อ .................................... หัวหน้ากลุ่มสาระฯ<br>( .................................... )</div></div>
    </section>`;
    const css = `@page{size:A4 ${land ? 'landscape' : 'portrait'};margin:12mm 11mm 14mm;@bottom-left{content:"${esc(COURSE)} · KruKan.in.th";font:10px Sarabun,Tahoma,sans-serif;color:#667}@bottom-right{content:"หน้า " counter(page) " / " counter(pages);font:10px Sarabun,Tahoma,sans-serif;color:#667}}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font:13px/1.4 Sarabun,'TH Sarabun New',Tahoma,sans-serif;color:#1b2140}
.brk{break-before:page}
.hd{display:flex;align-items:center;gap:12px;padding:0 0 9px;margin-bottom:10px;border-bottom:3px solid #1b2140}
.badge{flex:none;padding:6px 9px;border:2px solid #1b2140;border-radius:8px;background:#ffd54a;font:800 10px/1.05 Kanit,Sarabun,sans-serif;letter-spacing:.5px;text-align:center}
.ht{flex:1}.ht h1{margin:0;font:700 20px/1.25 Kanit,Sarabun,sans-serif}.ht p{margin:2px 0 0;color:#4a5677;font-size:13px}
.dt{text-align:right;font-size:11px;color:#4a5677}.dt b{color:#1b2140;font-size:12px}
.kpi{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 10px}.kpi div{flex:1 1 120px;padding:6px 10px;border:1.5px solid #c9d2e6;border-radius:8px;background:#f5f8ff}.kpi small{display:block;color:#4a5677;font-size:11px}.kpi b{font:700 17px Kanit,Sarabun,sans-serif}
table{width:100%;border-collapse:collapse;font-size:${cols > 11 ? 11 : cols > 8 ? 12 : 13}px}
thead{display:table-header-group}tr{break-inside:avoid}
th,td{border:1px solid #b9c3da;padding:4px 6px;vertical-align:middle}
thead th{background:#1b2140;color:#fff;font-weight:700;text-align:center;line-height:1.25}
td.n,th.n{text-align:center;font-variant-numeric:tabular-nums}
tbody td{white-space:nowrap}td.f,th.f{text-align:left;font-weight:600;white-space:normal;min-width:7em}
tr.z td,tr.z th{background:#f3f6fc}
tr.tot td,tr.tot th{background:#fff3c4;font-weight:700;border-top:2px solid #1b2140}
td.e{color:#a0a7b8}
.gap{height:10px}
.note{margin-top:10px;padding:8px 12px;border:1.5px solid #f0b8b8;border-radius:8px;background:#fff6f6}.note ul{margin:4px 0 0;padding-left:20px}
.sign{display:flex;justify-content:space-around;gap:20px;margin-top:26px;text-align:center;font-size:13px;line-height:2;break-inside:avoid}`;
    const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><title>${esc(name)}</title><link href="https://fonts.googleapis.com/css2?family=Kanit:wght@600;700;800&family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body>${reports.map(block).join('')}</body></html>`;
    let fr = document.getElementById('rx-print'); if (fr) fr.remove();
    fr = document.createElement('iframe'); fr.id = 'rx-print'; fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(fr);
    const w = fr.contentWindow, d = w.document; d.open(); d.write(html); d.close();
    let done = false; const go = () => { if (done) return; done = true; try { w.focus(); w.print(); } catch (e) { /* พิมพ์ไม่ได้ */ } };
    try { (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 150)); } catch (e) { /* ใช้ตัวสำรอง */ }
    setTimeout(go, 1800);
  }

  /* ---------- Excel (.xlsx) ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
    const d = new Date(), time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(([name, text]) => {
      const nb = enc.encode(name), db = enc.encode(text), crc = crc32(db);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, time, true); h.setUint16(12, date, true);
      h.setUint32(14, crc, true); h.setUint32(18, db.length, true); h.setUint32(22, db.length, true); h.setUint16(26, nb.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), nb, db);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, time, true); c.setUint16(14, date, true);
      c.setUint32(16, crc, true); c.setUint32(20, db.length, true); c.setUint32(24, db.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
      cen.push(new Uint8Array(c.buffer), nb);
      off += 30 + nb.length + db.length;
    });
    const cs = cen.reduce((a, b) => a + b.length, 0), e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
    return new Blob([...parts, ...cen, new Uint8Array(e.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  const colName = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  const ref = (r, c) => colName(c) + (r + 1);
  /* สไตล์: 1 หัวเรื่อง 2 บรรทัดรอง 3 หัวตาราง 4 ข้อความ 5 ตัวเลข 6/7 สลับสี 8/9 คอลัมน์แรก 10/11 แถวรวม 12/13 ช่องว่าง 14 ป้ายสรุป 15 ค่าสรุป */
  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="7"><font><sz val="11"/><name val="Tahoma"/></font><font><b/><sz val="15"/><color rgb="FF1B2140"/><name val="Tahoma"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Tahoma"/></font><font><sz val="10"/><color rgb="FF4A5677"/><name val="Tahoma"/></font><font><b/><sz val="11"/><color rgb="FF1B2140"/><name val="Tahoma"/></font><font><sz val="11"/><color rgb="FFA0A7B8"/><name val="Tahoma"/></font><font><b/><sz val="12"/><color rgb="FF1B2140"/><name val="Tahoma"/></font></fonts>
<fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1B2140"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3F6FC"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF3C4"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF5F8FF"/></patternFill></fill></fills>
<borders count="2"><border/><border><left style="thin"><color rgb="FFB9C3DA"/></left><right style="thin"><color rgb="FFB9C3DA"/></right><top style="thin"><color rgb="FFB9C3DA"/></top><bottom style="thin"><color rgb="FFB9C3DA"/></bottom></border></borders>
<cellStyleXfs count="1"><xf/></cellStyleXfs>
<cellXfs count="16">
<xf/>
<xf fontId="1" applyFont="1"/>
<xf fontId="3" applyFont="1"/>
<xf fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf borderId="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf borderId="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf fillId="3" borderId="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf fillId="3" borderId="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf fontId="4" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf fontId="5" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf fontId="5" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>
<xf fontId="6" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
  /* ความกว้างโดยประมาณ: ไม่นับสระบน/ล่างและวรรณยุกต์ของภาษาไทย */
  const vlen = s => String(s).replace(/[ัิ-ฺ็-๎]/g, '').length;
  function sheetXml(rep, sheetIdx) {
    const rows = [], merges = [], widths = []; let r = 0, headEnd = -1, ncol = 1;
    const put = (cells, row) => { rows.push({ r: row, cells }); };
    rep.tables.forEach(t => t.forEach(x => { ncol = Math.max(ncol, x.cells.reduce((a, c) => a + c.span, 0)); }));
    ncol = Math.max(ncol, rep.extras.kv.length ? 2 : 1);
    const last = ncol - 1;
    put([{ c: 0, v: rep.title, s: 1 }], r); if (last > 0) merges.push(`A1:${ref(0, last)}`); r++;
    put([{ c: 0, v: metaLine(), s: 2 }], r); if (last > 0) merges.push(`A2:${ref(1, last)}`); r++;
    put([{ c: 0, v: 'ข้อมูล ณ วันที่ ' + nowTh(), s: 2 }], r); if (last > 0) merges.push(`A3:${ref(2, last)}`); r += 2;
    if (rep.extras.kv.length) { rep.extras.kv.forEach(([k, v]) => { put([{ c: 0, v: k, s: 14 }, { c: 1, v, s: 15, num: isNum(v) }], r); r++; }); r++; }
    let filter = '';
    rep.tables.forEach((t, ti) => {
      let zebra = 0, lastData = -1; const top = r;
      t.forEach(row => {
        const cells = []; let c = 0;
        row.cells.forEach((cell, i) => {
          const num = !row.head && isNum(cell.v), empty = !row.head && isEmpty(cell.v), z = !row.head && !row.total && zebra % 2;
          const s = row.head ? 3 : row.total ? (num ? 11 : 10) : empty ? (z ? 13 : 12) : i === 0 ? (z ? 9 : 8) : num ? (z ? 7 : 5) : (z ? 6 : 4);
          cells.push({ c, v: cell.v || (row.head ? '' : '–'), s, num });
          for (let k = 1; k < cell.span; k++) cells.push({ c: c + k, v: '', s });
          if (cell.span > 1) merges.push(`${ref(r, c)}:${ref(r, c + cell.span - 1)}`);
          if (!row.head) widths[c] = Math.max(widths[c] || 0, Math.min(46, vlen(cell.v) + 2)); else widths[c] = Math.max(widths[c] || 0, Math.min(18, vlen(cell.v) / (cell.span || 1) + 2));
          c += cell.span;
        });
        if (!row.head) zebra++;
        if (!row.head && !row.total) lastData = r;
        put(cells, r);
        if (row.head && ti === 0) headEnd = r;
        r++;
      });
      if (ti === 0 && headEnd >= top && t.filter(x => x.head).length === 1 && !t.some(x => x.head && x.cells.some(c => c.span > 1))) filter = `${ref(headEnd, 0)}:${ref(Math.max(lastData, headEnd), last)}`;
      r++;
    });
    rep.extras.notes.forEach(n => { put([{ c: 0, v: n.title, s: 4 + 4 }], r); r++; n.items.forEach(it => { put([{ c: 0, v: '• ' + it, s: 0 }], r); r++; }); r++; });
    const cols = Array.from({ length: ncol }, (_, i) => `<col min="${i + 1}" max="${i + 1}" width="${Math.max(i === 0 ? 14 : 8, Math.round((widths[i] || 8) * 1.15))}" customWidth="1"/>`).join('');
    const data = rows.map(({ r: rr, cells }) => `<row r="${rr + 1}"${rr === 0 ? ' ht="24" customHeight="1"' : ''}>${cells.map(x => x.num ? `<c r="${ref(rr, x.c)}" s="${x.s}"><v>${x.v}</v></c>` : `<c r="${ref(rr, x.c)}" s="${x.s}" t="inlineStr"><is><t xml:space="preserve">${xesc(x.v)}</t></is></c>`).join('')}</row>`).join('');
    const land = ncol > 7;
    const pane = headEnd >= 0 ? `<pane xSplit="1" ySplit="${headEnd + 1}" topLeftCell="${ref(headEnd + 1, 1)}" activePane="bottomRight" state="frozen"/><selection pane="bottomRight"/>` : '';
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:${ref(Math.max(0, r - 1), last)}"/><sheetViews><sheetView workbookViewId="0" showGridLines="0">${pane}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols>${cols}</cols><sheetData>${data}</sheetData>${filter ? `<autoFilter ref="${filter}"/>` : ''}${merges.length ? `<mergeCells count="${merges.length}">${merges.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : ''}<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.6" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="${land ? 'landscape' : 'portrait'}" fitToWidth="1" fitToHeight="0"/><headerFooter><oddFooter>${xesc('&L&8' + COURSE + '&R&8หน้า &P / &N')}</oddFooter></headerFooter></worksheet>`;
    return { xml, printRows: headEnd >= 0 ? `$${headEnd + 1}:$${headEnd + 1}` : '', sheetIdx };
  }
  function sheetName(t, used) {
    let n = t.replace(/[\[\]:*?\/\\]/g, ' ').replace(/^รายงานรายคน · /, '').replace(/\s+/g, ' ').trim().slice(0, 28) || 'รายงาน', b = n, k = 2;
    while (used.has(n)) n = b.slice(0, 25) + ' (' + k++ + ')'; used.add(n); return n;
  }
  function xlsx(reports, name) {
    const used = new Set(), sheets = reports.map((rep, i) => Object.assign(sheetXml(rep, i), { name: sheetName(rep.title, used) }));
    const files = [
      ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
      ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xesc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>${sheets.some(s => s.printRows) ? `<definedNames>${sheets.map((s, i) => s.printRows ? `<definedName name="_xlnm.Print_Titles" localSheetId="${i}">'${xesc(s.name.replace(/'/g, "''"))}'!${s.printRows}</definedName>` : '').join('')}</definedNames>` : ''}</workbook>`],
      ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml', STYLES],
      ...sheets.map((s, i) => [`xl/worksheets/sheet${i + 1}.xml`, s.xml]),
    ];
    const blob = zip(files), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name + '.xlsx'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /* ---------- ปุ่มบนหน้าครู ---------- */
  const fileName = t => (window.DT_CFG.code + '_' + t.replace(/[\\/:*?"<>|·]+/g, ' ').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') + '_' + stamp()).slice(0, 90);
  const EXCLUDE = '#review-form,.db-set,.fs-tool,.queue-actions,.auto-ai,.ai-progress';
  const exportable = root => [...root.querySelectorAll('section.paper')].filter(s => !s.matches(EXCLUDE) && [...s.querySelectorAll('table')].some(t => !t.classList.contains('teacher-roster-preview') && t.rows.length > 1));
  const BAR = '<div class="rx-bar" data-rx-skip><span>ส่งออก</span><button type="button" class="rx-btn pdf" data-rx="pdf" title="เปิดหน้าพิมพ์ แล้วเลือก บันทึกเป็น PDF">📄 PDF</button><button type="button" class="rx-btn xls" data-rx="xlsx" title="ดาวน์โหลดไฟล์ Excel (.xlsx)">📊 Excel</button></div>';
  function decorate() {
    const shell = document.querySelector('.teacher-shell'); if (!shell) return;
    exportable(shell).forEach(sec => {
      if (sec.querySelector(':scope .rx-bar')) return;
      const tf = sec.querySelector('.flex-between .tools-flex'), h = sec.querySelector('.db-h') || sec.querySelector('h2') || sec.querySelector('h3');
      if (tf) tf.insertAdjacentHTML('beforeend', BAR);
      else if (!h) sec.insertAdjacentHTML('afterbegin', BAR);
      else if (h.classList.contains('db-h')) h.insertAdjacentHTML('beforeend', BAR); else h.insertAdjacentHTML('afterend', BAR);
    });
    const page = (location.hash.match(/^#teacher\/(\w+)/) || [])[1];
    if (page === 'scores' && !shell.querySelector('.rx-all') && exportable(shell).length > 1) {
      const t = shell.querySelector('.teacher-title');
      if (t) t.insertAdjacentHTML('afterend', '<div class="rx-all" data-rx-skip><b>📦 ส่งออกทุกตารางในหน้านี้</b><small>PDF รวมทุกตาราง หน้าละ 1 ตาราง · Excel แยกเป็นชีตละ 1 ตาราง</small><span><button type="button" class="rx-btn pdf" data-rx-all="pdf">📄 PDF ทั้งหมด</button><button type="button" class="rx-btn xls" data-rx-all="xlsx">📊 Excel ทั้งหมด</button></span></div>');
    }
  }
  function run(kind, secs, label) {
    const reps = secs.map(readSection).filter(r => r.tables.length);
    if (!reps.length) { alert('ยังไม่มีข้อมูลในตารางให้ส่งออก'); return; }
    const name = fileName(label || reps[0].title);
    try { kind === 'pdf' ? pdf(reps, name) : xlsx(reps, name); } catch (e) { alert('ส่งออกไม่สำเร็จ: ' + (e && e.message || e)); }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-rx],[data-rx-all]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.dataset.rxAll) { const shell = document.querySelector('.teacher-shell'); run(b.dataset.rxAll, exportable(shell), 'รายงานคะแนนทั้งหมด'); return; }
    const sec = b.closest('section.paper'); if (sec) run(b.dataset.rx, [sec]);
  }, true);
  let tick = 0;
  new MutationObserver(() => { if (tick) return; tick = requestAnimationFrame(() => { tick = 0; decorate(); }); }).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(decorate, 1500);
  window.DTReport = { pdf, xlsx, readSection, exportSection: (sec, kind) => run(kind, [sec]) };
})();

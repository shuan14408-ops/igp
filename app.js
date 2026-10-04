/* ============================================================
   線上 IGP 生成工具 —— 全部在瀏覽器本機執行，不連網、不上傳。
   資料：window.LINGANG_DB（領綱）、window.IGP_TPL（王小明 IGP 清除個資後的範本）
   ============================================================ */
'use strict';
const DB = window.LINGANG_DB;
const SUBJ = { '情':'情意發展','領':'領導才能','創':'創造力','獨':'獨立研究','專':'專長領域' };
const SUBJ_ORDER = ['情','領','創','獨','專'];
const HAS_LINGANG = new Set(['情','領','創','獨']);   // 專長為校訂、無領綱條目
const ROMAN = {2:'Ⅱ',3:'Ⅲ',4:'Ⅳ',5:'Ⅴ'};
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function gradeToStage(g){ g=+g; if(g<=2)return 1; if(g<=4)return 2; if(g<=6)return 3; if(g<=9)return 4; return 5; }
function stageText(st){ const m={1:'第一學習階段（一、二年級）',2:'第二學習階段（三、四年級）',3:'第三學習階段（五、六年級）',4:'第四學習階段（國中）',5:'第五學習階段（高中）'}; return m[st]||''; }

/* ---------- Tabs ---------- */
$$('.tab').forEach(t=>t.onclick=()=>{
  $$('.tab').forEach(x=>x.classList.remove('active'));
  $$('.panel').forEach(x=>x.classList.remove('active'));
  t.classList.add('active'); $('#panel-'+t.dataset.tab).classList.add('active');
});

/* ---------- Subject chips ---------- */
const selSubj = new Set(['創']);
function renderChips(){
  const box=$('#subjChips'); box.innerHTML='';
  SUBJ_ORDER.forEach(s=>{
    const c=document.createElement('div');
    c.className='chip'+(selSubj.has(s)?' on':''); c.textContent=SUBJ[s]+(HAS_LINGANG.has(s)?'':'（校訂·無領綱）');
    c.onclick=()=>{ selSubj.has(s)?selSubj.delete(s):selSubj.add(s); renderChips(); };
    box.appendChild(c);
  });
}
renderChips();
function refreshStage(){ $('#stageBadge').textContent=stageText(gradeToStage($('#gradeSel').value)); }
$('#gradeSel').onchange=refreshStage; refreshStage();

/* ============================================================
   離線比對器
   ============================================================ */
function cjkOnly(s){ return (s||'').replace(/[^一-鿿]/g,''); }
function ngrams(s,n){ s=cjkOnly(s); const set=new Set(); for(let i=0;i+n<=s.length;i++) set.add(s.slice(i,i+n)); return set; }
function grams(s){ const g=new Set(); ngrams(s,2).forEach(x=>g.add(x)); ngrams(s,3).forEach(x=>g.add('3'+x)); return g; }
function scoreItem(qg,text){ const ig=grams(text); let s=0; ig.forEach(x=>{ if(qg.has(x)) s += x[0]==='3'?2.2:1; }); return s/Math.sqrt(Math.max(6,cjkOnly(text).length)); }
function pool(kind){ const st=gradeToStage($('#gradeSel').value); const arr=kind==='perf'?DB.performance:DB.content; return arr.filter(x=>selSubj.has(x.subj_char)&&x.stage===st); }

let SEL={perf:new Set(),cont:new Set()};
function runMatch(){
  const lg=[...selSubj].filter(s=>HAS_LINGANG.has(s));
  if(lg.length===0){ alert('請至少選擇一個有領綱的領域（情意／領導／創造力／獨立研究）'); return; }
  const q=$('#courseText').value+' '+$('#courseName').value; const qg=grams(q);
  SEL={perf:new Set(),cont:new Set()};
  ['perf','cont'].forEach(kind=>{
    const items=pool(kind).map(it=>({it,sc:qg.size?scoreItem(qg,it.text):0}));
    const sugg=items.filter(o=>o.sc>0).sort((a,b)=>b.sc-a.sc);
    const topN=kind==='perf'?10:8;
    sugg.slice(0,topN).forEach(o=>{ if(o.sc>=(sugg[0]?.sc||0)*0.35) SEL[kind].add(o.it.code); });
    renderList(kind,items);
  });
  $('#resultCard').style.display='block'; buildOutput();
  $('#resultCard').scrollIntoView({behavior:'smooth',block:'start'});
}
let showAll={perf:false,cont:false};
function renderList(kind,scored){
  const box=kind==='perf'?$('#perfList'):$('#contList');
  const title=kind==='perf'?'學習表現':'學習內容';
  const scoreMap=new Map(scored.map(o=>[o.it.code,o.sc]));
  const items=scored.map(o=>o.it);
  box.innerHTML=`<div class="listhead">${title}（共 ${items.length} 條，已建議勾選 ${SEL[kind].size} 條）</div>`;
  const suggItems=items.filter(it=>SEL[kind].has(it.code)).sort((a,b)=>(scoreMap.get(b.code)||0)-(scoreMap.get(a.code)||0));
  const rest=items.filter(it=>!SEL[kind].has(it.code)).sort((a,b)=>a.code.localeCompare(b.code,'zh'));
  if(suggItems.length){ box.appendChild(grpEl('★ 系統建議')); suggItems.forEach(it=>box.appendChild(itemEl(kind,it,scoreMap.get(it.code),true))); }
  box.appendChild(grpEl('其他候選（可自行勾選）'));
  rest.forEach(it=>box.appendChild(itemEl(kind,it,scoreMap.get(it.code),false)));
}
function grpEl(t){ const d=document.createElement('div'); d.className='grp'; d.textContent=t; return d; }
function itemEl(kind,it,sc,sug){
  const d=document.createElement('label'); d.className='item'+(sug?' sug':'');
  const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=SEL[kind].has(it.code);
  cb.onchange=()=>{ cb.checked?SEL[kind].add(it.code):SEL[kind].delete(it.code); buildOutput(); };
  const sp=document.createElement('div'); sp.innerHTML=`<span class="code">${it.code}</span> ${it.text}`;
  d.appendChild(cb); d.appendChild(sp);
  if(sc>0){ const s=document.createElement('span'); s.className='score'; s.textContent='●'.repeat(Math.min(3,Math.ceil(sc))); d.appendChild(s); }
  return d;
}
function nameDim(s,d){ return DB.names.dim[s+d]||''; }
function nameSub(s,d,su){ return DB.names.sub[s+d+su]||''; }
function nameTheme(s,t){ return DB.names.theme[s+t]||''; }
function buildOutput(){
  const perf=DB.performance.filter(x=>SEL.perf.has(x.code)), cont=DB.content.filter(x=>SEL.cont.has(x.code));
  let out='【學習表現】\n';
  SUBJ_ORDER.filter(s=>selSubj.has(s)).forEach(s=>{
    const sp=perf.filter(x=>x.subj_char===s); if(!sp.length)return;
    [...new Set(sp.map(x=>x.dim))].sort().forEach(d=>{
      out+=`(${s})${nameDim(s,d)}\n`;
      [...new Set(sp.filter(x=>x.dim===d).map(x=>x.sub))].sort().forEach(su=>{
        const rows=sp.filter(x=>x.dim===d&&x.sub===su).sort((a,b)=>a.serial-b.serial);
        out+=`　${su}.${nameSub(s,d,su)} `+rows.map(r=>`${r.code}${r.text}`).join(' ')+'\n';
      });
    });
  });
  out+='\n【學習內容】\n';
  SUBJ_ORDER.filter(s=>selSubj.has(s)).forEach(s=>{
    const sc=cont.filter(x=>x.subj_char===s); if(!sc.length)return;
    [...new Set(sc.map(x=>x.theme))].sort().forEach(t=>{
      const rows=sc.filter(x=>x.theme===t).sort((a,b)=>a.serial-b.serial);
      out+=`特${s}${t}.${nameTheme(s,t)} `+rows.map(r=>`${r.code}${r.text}`).join(' ')+'\n';
    });
  });
  $('#outBox').textContent=out.trim()||'（尚未勾選任何條目）'; $('#outCard').style.display='block';
}
$('#btnMatch').onclick=runMatch;
$('#btnAll').onclick=()=>{ showAll.perf=showAll.cont=true; rerender(); };
$('#btnClear').onclick=()=>{ SEL={perf:new Set(),cont:new Set()}; rerender(); buildOutput(); };
function rerender(){ ['perf','cont'].forEach(kind=>{ const q=grams($('#courseText').value+' '+$('#courseName').value); renderList(kind,pool(kind).map(it=>({it,sc:q.size?scoreItem(q,it.text):0}))); }); }
$('#btnCopy').onclick=()=>{ navigator.clipboard.writeText($('#outBox').textContent).then(()=>{ $('#btnCopy').textContent='✓ 已複製'; setTimeout(()=>$('#btnCopy').textContent='📋 複製',1500); }); };

/* ============================================================
   TAB 3：領綱瀏覽
   ============================================================ */
(function(){
  const bs=$('#b_subj'); ['情','領','創','獨'].forEach(s=>bs.add(new Option(SUBJ[s],s)));
  const st=$('#b_stage'); [2,3,4,5].forEach(x=>st.add(new Option(ROMAN[x]+'　'+stageText(x),x))); st.value='3';
  function draw(){
    const s=bs.value,stg=+st.value,kw=cjkOnly($('#b_kw').value); let o='';
    const P=DB.performance.filter(x=>x.subj_char===s&&x.stage===stg&&(!kw||x.text.includes(kw)));
    const C=DB.content.filter(x=>x.subj_char===s&&x.stage===stg&&(!kw||x.text.includes(kw)));
    o+=`◆ ${SUBJ[s]}　${ROMAN[stg]}（${stageText(stg)}）\n\n【學習表現】共 ${P.length} 條\n`;
    [...new Set(P.map(x=>x.dim))].sort().forEach(d=>{ o+=`\n(${s})${nameDim(s,d)}\n`;
      [...new Set(P.filter(x=>x.dim===d).map(x=>x.sub))].sort().forEach(su=>{ o+=`　${su}.${nameSub(s,d,su)}\n`;
        P.filter(x=>x.dim===d&&x.sub===su).sort((a,b)=>a.serial-b.serial).forEach(r=>o+=`　　${r.code} ${r.text}\n`); }); });
    o+=`\n【學習內容】共 ${C.length} 條\n`;
    [...new Set(C.map(x=>x.theme))].sort().forEach(t=>{ o+=`\n特${s}${t}.${nameTheme(s,t)}\n`;
      C.filter(x=>x.theme===t).sort((a,b)=>a.serial-b.serial).forEach(r=>o+=`　　${r.code} ${r.text}\n`); });
    $('#browseOut').textContent=o;
  }
  bs.onchange=st.onchange=draw; $('#b_kw').oninput=draw; draw();
})();

/* ============================================================
   TAB 2：IGP —— 資料物件、Excel 匯入、範本填空 Word
   ============================================================ */
const IGPDATA={};   // token 值來源（表單 + Excel 匯入）

/* 課程區塊 */
let courseBlocks=[];
function addCourseBlock(pre){ courseBlocks.push(pre||{area:'',name:'',teacher:'',goals:'',perfRows:''}); renderBlocks(); }
function renderBlocks(){
  const wrap=$('#courseBlocks'); wrap.innerHTML='';
  courseBlocks.forEach((b,i)=>{
    const d=document.createElement('div'); d.className='coursecard';
    d.innerHTML=`<div class="row">
        <div><label>學習領域</label><input type="text" data-k="area"></div>
        <div><label>課程名稱</label><input type="text" data-k="name"></div>
        <div><label>授課教師</label><input type="text" data-k="teacher"></div></div>
      <label>學年／學期目標（每行一條）</label><textarea data-k="goals" style="min-height:70px"></textarea>
      <label>學習表現（每行一條，將列入評量表）</label><textarea data-k="perfRows" style="min-height:80px"></textarea>
      <div style="margin-top:8px"><span class="del">刪除此區塊</span></div>`;
    d.querySelectorAll('[data-k]').forEach(el=>{ el.value=b[el.dataset.k]||''; el.oninput=()=>b[el.dataset.k]=el.value; });
    d.querySelector('.del').onclick=()=>{ courseBlocks.splice(i,1); renderBlocks(); };
    wrap.appendChild(d);
  });
  if(!courseBlocks.length) wrap.innerHTML='<div class="small">尚無課程區塊，請點「＋ 新增課程區塊」，或於分頁①比對後帶入。</div>';
}
$('#btnAddCourse').onclick=()=>addCourseBlock(); renderBlocks();

function bringToIGP(){
  const perf=DB.performance.filter(x=>SEL.perf.has(x.code));
  if(!perf.length){ alert('請先於分頁①勾選學習表現'); return; }
  addCourseBlock({area:[...selSubj].filter(s=>HAS_LINGANG.has(s)).map(s=>SUBJ[s]).join('、'),name:$('#courseName').value,teacher:'',goals:'',perfRows:perf.map(r=>r.text).join('\n')});
  $$('.tab').forEach(x=>x.classList.remove('active')); $$('.panel').forEach(x=>x.classList.remove('active'));
  document.querySelector('.tab[data-tab="igp"]').classList.add('active'); $('#panel-igp').classList.add('active'); window.scrollTo(0,0);
}
(function(){ const btn=document.createElement('button'); btn.className='ghost'; btn.textContent='➜ 帶入 IGP 課程區塊'; btn.style.marginLeft='8px'; btn.onclick=bringToIGP; $('#btnCopy').after(btn); })();

/* ---------------- Excel 匯入（純瀏覽器，DecompressionStream） ---------------- */
const td=new TextDecoder(), dv=b=>new DataView(b.buffer,b.byteOffset,b.byteLength);
async function inflateRaw(bytes){ const ds=new DecompressionStream('deflate-raw'); const s=new Blob([bytes]).stream().pipeThrough(ds); return new Uint8Array(await new Response(s).arrayBuffer()); }
async function unzip(u8){
  // 找 EOCD
  let p=u8.length-22;
  while(p>=0 && !(u8[p]===0x50&&u8[p+1]===0x4b&&u8[p+2]===0x05&&u8[p+3]===0x06)) p--;
  if(p<0) throw new Error('不是有效的 zip/xlsx');
  const d=dv(u8); const n=d.getUint16(p+10,true), cdOff=d.getUint32(p+16,true);
  const files={}; let q=cdOff;
  for(let i=0;i<n;i++){
    const method=d.getUint16(q+10,true), compSize=d.getUint32(q+20,true);
    const fnLen=d.getUint16(q+28,true), exLen=d.getUint16(q+30,true), cmLen=d.getUint16(q+32,true);
    const lo=d.getUint32(q+42,true);
    const name=td.decode(u8.subarray(q+46,q+46+fnLen));
    const lfn=d.getUint16(lo+26,true), lex=d.getUint16(lo+28,true);
    const start=lo+30+lfn+lex; const comp=u8.subarray(start,start+compSize);
    files[name]=method===0?comp:await inflateRaw(comp);
    q+=46+fnLen+exLen+cmLen;
  }
  return files;
}
function colToIdx(ref){ const m=ref.match(/^([A-Z]+)/); let n=0; for(const ch of m[1]) n=n*26+(ch.charCodeAt(0)-64); return n-1; }
function parseSharedStrings(xml){
  if(!xml) return []; const s=td.decode(xml); const out=[];
  s.replace(/<si\b[^>]*>([\s\S]*?)<\/si>/g,(_,inner)=>{ let t=''; inner.replace(/<t\b[^>]*>([\s\S]*?)<\/t>/g,(__,x)=>{t+=x;return'';}); out.push(unesc(t)); return ''; });
  return out;
}
function unesc(s){ return s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&'); }
function parseSheet(xml,sst){
  const s=td.decode(xml); const rows=[];
  s.replace(/<row\b[^>]*>([\s\S]*?)<\/row>/g,(_,inner)=>{
    const row=[];
    inner.replace(/<c\b([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*)\/>/g,(m,a1,body,a2)=>{
      const attr=a1||a2||''; const ref=(attr.match(/r="([^"]+)"/)||[])[1]; const t=(attr.match(/t="([^"]+)"/)||[])[1];
      let val='';
      if(body){ const vm=body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/); const im=body.match(/<t\b[^>]*>([\s\S]*?)<\/t>/);
        if(t==='s'&&vm) val=sst[+vm[1]]||''; else if(im) val=unesc(im[1]); else if(vm) val=unesc(vm[1]); }
      if(ref!=null) row[colToIdx(ref)]=val;
      return '';
    });
    rows.push(row); return '';
  });
  return rows;
}
let XLSX_ROWS=null, XLSX_HDR=null;
async function onXlsx(file){
  try{
    const buf=new Uint8Array(await file.arrayBuffer());
    const files=await unzip(buf);
    const sst=parseSharedStrings(files['xl/sharedStrings.xml']);
    // 找第一張工作表
    let sheetName=Object.keys(files).find(n=>/^xl\/worksheets\/sheet1\.xml$/.test(n))||Object.keys(files).find(n=>/^xl\/worksheets\/.*\.xml$/.test(n));
    const rows=parseSheet(files[sheetName],sst);
    XLSX_HDR=rows[0]||[]; XLSX_ROWS=rows.slice(1).filter(r=>r.some(c=>c&&c.trim&&c.trim()));
    const sel=$('#xlsxStudent'); sel.innerHTML='';
    const nameIdx=findCol('學生姓名');
    XLSX_ROWS.forEach((r,i)=>sel.add(new Option((r[nameIdx]||('第'+(i+1)+'筆'))+'（'+(r[findCol('學生生日')]||'')+'）',i)));
    $('#xlsxInfo').innerHTML='✅ 已讀取 <b>'+XLSX_ROWS.length+'</b> 筆資料，共 '+XLSX_HDR.length+' 欄。請選擇學生後按「帶入資料」。';
  }catch(e){ $('#xlsxInfo').innerHTML='<span style="color:#c0392b">讀取失敗：'+e.message+'（請確認為 .xlsx，且用 Chrome/Edge 開啟）</span>'; }
}
function findCol(name){ return XLSX_HDR?XLSX_HDR.findIndex(h=>(h||'').trim()===name):-1; }
function col(r,name){ const i=findCol(name); return i>=0?(r[i]||'').trim():''; }
function mark(val,opts){ // 產生 ■/□ 字串
  return opts.map(o=>((val&&(val.includes(o)||o.includes(val)))?'■':'□')+o).join('　');
}
function fillFromXlsx(){
  if(!XLSX_ROWS){ alert('請先選擇 Excel 檔'); return; }
  const i=+$('#xlsxStudent').value||0; const r=XLSX_ROWS[i]; if(!r){ return; }
  IGPDATA.name=col(r,'學生姓名');
  IGPDATA.birth=col(r,'學生生日');
  IGPDATA.gender=mark(col(r,'學生性別'),['男','女','暫不回答']);
  IGPDATA.address=col(r,'住址');
  IGPDATA.guardian=col(r,'法定代理人姓名');
  IGPDATA.guardian_phone=col(r,'法定代理人聯絡電話');
  IGPDATA.economy=mark(col(r,'家庭經濟狀況'),['富裕','小康','清寒'])+'　□其他__________';
  IGPDATA.parenting=mark(col(r,'實際照顧者管教態度'),['民主式','權威式','放任式'])+'　□其他__________';
  IGPDATA.interaction=mark(col(r,'與家人互動情形'),['良好','普通'])+'　□其他__________';
  IGPDATA.caretaker=mark(col(r,'實際照顧者'),['父親','母親'])+'　□其他__________';
  IGPDATA.expectation=col(r,'家長(主要照顧者)對學生的期望');
  IGPDATA.sci_interest=col(r,'科學興趣偏好');
  IGPDATA.art_interest=col(r,'人文與藝術興趣偏好');
  IGPDATA.other_interest=col(r,'其他偏好');
  // 家庭成員：主表第一位 + 「稱謂 2..」重複組
  const fam=[];
  const push=(rel,nm,dept,major,phone,org)=>{ if(rel||nm) fam.push({rel,nm,dept,major,phone,org}); };
  push(col(r,'稱謂'),col(r,'姓名'),col(r,'畢業科系'),col(r,'專長'),col(r,'聯絡電話'),col(r,'服務機關/就讀學校'));
  for(let k=2;k<=10;k++) push(col(r,'稱謂 '+k),col(r,'姓名 '+k),col(r,'畢業科系 '+k),col(r,'專長 '+k),col(r,'聯絡電話 '+k),col(r,'服務機關/就讀學校 '+k));
  for(let n=1;n<=5;n++){ const f=fam[n-1]||{}; IGPDATA['fm'+n+'_rel']=f.rel||''; IGPDATA['fm'+n+'_name']=f.nm||''; IGPDATA['fm'+n+'_dept']=f.dept||''; IGPDATA['fm'+n+'_major']=f.major||''; IGPDATA['fm'+n+'_phone']=f.phone||''; IGPDATA['fm'+n+'_org']=f.org||''; }
  captureGz(r); autoSuggestGz();
  // 反映到表單
  if($('#f_name')) $('#f_name').value=IGPDATA.name||'';
  $('#xlsxInfo').innerHTML='✅ 已帶入「<b>'+(IGPDATA.name||'')+'</b>」的基本資料與家庭背景（含 '+fam.length+' 位家庭成員），並依評定自動建議優弱勢代號。可再手動補學校/班級/教師後下載。';
}
$('#xlsxFile').onchange=e=>{ if(e.target.files[0]) onXlsx(e.target.files[0]); };
$('#btnFill').onclick=fillFromXlsx;

/* ---------------- 純 JS store-only zip ---------------- */
const enc=new TextEncoder();
function crc32(buf){ let c,crc=0xFFFFFFFF; if(!crc32.t){ crc32.t=[]; for(let n=0;n<256;n++){ c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; crc32.t[n]=c>>>0; } } for(let i=0;i<buf.length;i++) crc=(crc>>>8)^crc32.t[(crc^buf[i])&0xFF]; return (crc^0xFFFFFFFF)>>>0; }
function u32(n){ return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]; }
function u16(n){ return [n&255,(n>>>8)&255]; }
function zipStore(files){
  let parts=[],central=[],offset=0;
  files.forEach(f=>{ const nameB=enc.encode(f.name),crc=crc32(f.data),sz=f.data.length;
    const lh=[].concat(u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(sz),u32(sz),u16(nameB.length),u16(0));
    const lhB=new Uint8Array(lh); parts.push(lhB,nameB,f.data);
    const ch=[].concat(u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(sz),u32(sz),u16(nameB.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset));
    central.push(new Uint8Array(ch),nameB); offset+=lhB.length+nameB.length+sz; });
  const cstart=offset; let clen=0; central.forEach(p=>clen+=p.length);
  const end=new Uint8Array([].concat(u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(clen),u32(cstart),u16(0)));
  return new Blob(parts.concat(central,[end]),{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
function b64ToU8(b64){ const bin=atob(b64); const u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u; }
function xmlEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---------------- 範本填空 Word 產生 ---------------- */
function collectFormData(){
  const g=id=>($('#'+id)?$('#'+id).value.trim():'');
  IGPDATA.name = g('f_name')||IGPDATA.name||'';
  IGPDATA.edu_stage = '■'+g('f_stageedu');
  IGPDATA.gift_type = '■'+g('f_gift');
  IGPDATA.placement = '■'+g('f_place');
  IGPDATA.year = g('f_year');
  IGPDATA.school = g('f_school');
  IGPDATA.class = g('f_class');
  IGPDATA.teacher = g('f_teacher');
  IGPDATA.mgr = g('f_mgr');
  // checkbox 預設（未匯入時保留空白選項）
  const def={gender:'□男　□女　□暫不回答',caretaker:'□父親　□母親　□其他__________',economy:'□富裕　□小康　□清寒　□其他__________',parenting:'□民主式　□權威式　□放任式　□其他__________',interaction:'□良好　□普通　□其他__________'};
  Object.keys(def).forEach(k=>{ if(!IGPDATA[k]) IGPDATA[k]=def[k]; });
}
function genDocx(){
  if(!window.IGP_TPL){ alert('找不到範本 template_docx.js'); return; }
  collectFormData();
  // 取出範本 document.xml，替換 token
  let xml=td.decode(b64ToU8(IGP_TPL.documentXmlB64));
  xml=xml.replace(/\{\{([a-z0-9_]+)\}\}/g,(m,k)=> xmlEsc(IGPDATA[k]!=null?IGPDATA[k]:''));
  xml=injectMoreCourses(xml);   // 課程2+ 注入
  xml=xml.replace(/[⟨⟩]/g,'');  // 移除微調標記（底線由老師在 Word 手動）
  const files=IGP_TPL.parts.map(p=>({name:p.name,data:b64ToU8(p.b64)}));
  files.push({name:'word/document.xml',data:enc.encode(xml)});
  const blob=zipStore(files);
  const a=document.createElement('a'); const nm=IGPDATA.name||'學生';
  a.href=URL.createObjectURL(blob); a.download=`${IGPDATA.year||''}_${IGPDATA.class||''}_${nm}_IGP.docx`;
  document.body.appendChild(a); a.click(); a.remove();
}
$('#btnDocx').onclick=genDocx;

/* ============================================================
   優弱勢能力評析（代號自動建議 + 質性描述提示詞）
   ============================================================ */
const ABILITIES=[
 [1,'觀察能力'],[2,'記憶能力'],[3,'理解能力'],[4,'推理能力'],[5,'分析能力'],[6,'應用能力'],
 [7,'評鑑能力'],[8,'創造能力'],[9,'批判能力'],[10,'問題解決'],[11,'後設能力'],[12,'其他'],
 [13,'專注能力'],[14,'成就動機'],[15,'要求完美'],[16,'溝通協調'],[17,'情緒控制'],[18,'挫折容忍'],
 [19,'正向思考'],[20,'領導能力'],[21,'合作能力'],[22,'自信心'],[23,'同理心'],[24,'復原力'],[25,'其他'],
 [26,'數學'],[27,'物理'],[28,'生物'],[29,'化學'],[30,'地科'],[31,'國文'],[32,'英文'],
 [33,'歷史'],[34,'地理'],[35,'公民'],[36,'資訊'],[37,'生科'],[38,'其他']
];
const ABILITY_NAME=Object.fromEntries(ABILITIES.map(a=>[a[0],a[1]]));
const EXCEL_ABILITY_MAP={
 '認知特質 [觀察能力]':1,'認知特質 [記憶能力]':2,'認知特質 [理解能力]':3,'認知特質 [推理能力]':4,
 '認知特質 [分析能力]':5,'認知特質 [應用能力]':6,'認知特質 [評鑑能力]':7,'認知特質 [創造能力]':8,
 '認知特質 [批判能力]':9,'認知特質 [問題解決]':10,'認知特質 [後設能力]':11,
 '情意特質 [專注能力]':13,'情意特質 [成就動機]':14,'情意特質 [要求完美]':15,'情意特質 [溝通協調]':16,
 '情意特質 [情緒控制]':17,'情意特質 [挫折容忍]':18,'情意特質 [正向思考]':19,'情意特質 [領導能力]':20,
 '情意特質 [合作能力]':21,'情意特質 [自信心]':22,'情意特質 [同理心]':23,'情意特質 [復原力]':24,
 '學科能力 [數學]':26,'學科能力 [自然─物理]':27,'學科能力 [自然─生物]':28,'學科能力 [自然─化學]':29,
 '學科能力 [自然─地科]':30,'學科能力 [語文─國文]':31,'學科能力 [語文─英文]':32,'學科能力 [社會─歷史]':33,
 '學科能力 [社會─地理]':34,'學科能力 [社會─公民]':35,'學科能力 [資訊]':36
};
let GZ={};          // code(number) -> 'S'|'W'|''
let GZ_RATINGS={};  // code -> 數值評定
let GZ_CREATIVITY=[];
function captureGz(r){
  GZ_RATINGS={}; GZ_CREATIVITY=[];
  Object.keys(EXCEL_ABILITY_MAP).forEach(h=>{ const v=col(r,h); if(v!==''){ const n=parseFloat(v); if(!isNaN(n)) GZ_RATINGS[EXCEL_ABILITY_MAP[h]]=n; } });
  (XLSX_HDR||[]).forEach((h,i)=>{ if(/^學生創造力特質/.test(h||'')){ const v=(r[i]||'').trim(); if(v) GZ_CREATIVITY.push({trait:(h||'').replace(/^學生創造力特質\s*\[|\]$/g,''),val:v}); } });
}
function autoSuggestGz(){
  GZ={}; Object.keys(GZ_RATINGS).forEach(code=>{ const v=GZ_RATINGS[code]; if(v>=5) GZ[code]='S'; else if(v<=2) GZ[code]='W'; });
  renderGz();
}
function renderGz(){
  const box=$('#gzGrid'); if(!box) return;
  const groups=[['認知特質',1,12],['情意特質',13,25],['學科能力',26,38]];
  let h='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">';
  groups.forEach(function(gp){
    const gn=gp[0],a=gp[1],b=gp[2];
    h+='<div><div class="grp" style="background:#eef2fa">'+gn+'</div>';
    ABILITIES.filter(x=>x[0]>=a&&x[0]<=b).forEach(function(it){
      const n=it[0],nm=it[1];
      const rr=(GZ_RATINGS[n]!=null)?('<span class="small" style="color:#888">('+GZ_RATINGS[n]+')</span>'):'';
      h+='<div class="item" style="padding:3px 6px">'
        +'<span style="width:118px;font-size:12.5px">'+n+'.'+nm+' '+rr+'</span>'
        +'<label style="font-size:12px;margin:0 3px"><input type="radio" name="gz'+n+'" data-n="'+n+'" value="S"'+(GZ[n]==='S'?' checked':'')+'>優</label>'
        +'<label style="font-size:12px;margin:0 3px"><input type="radio" name="gz'+n+'" data-n="'+n+'" value="W"'+(GZ[n]==='W'?' checked':'')+'>弱</label>'
        +'<label style="font-size:12px"><input type="radio" name="gz'+n+'" data-n="'+n+'" value=""'+(!GZ[n]?' checked':'')+'>—</label>'
        +'</div>';
    });
    h+='</div>';
  });
  h+='</div>';
  box.innerHTML=h;
  box.querySelectorAll('input[type=radio]').forEach(el=>el.onchange=()=>{ GZ[+el.dataset.n]=el.value; });
}
function gzCodes(kind){ return ABILITIES.filter(a=>GZ[a[0]]===kind).map(a=>a[0]).join('、'); }
function gzPrompt(){
  const S=ABILITIES.filter(a=>GZ[a[0]]==='S').map(a=>a[0]+'.'+a[1]);
  const W=ABILITIES.filter(a=>GZ[a[0]]==='W').map(a=>a[0]+'.'+a[1]);
  const cre=GZ_CREATIVITY.map(c=>'　- '+c.trait+'：'+c.val).join('\n');
  return [
'你在協助資優教育老師撰寫 IGP 的「優弱勢能力綜合評析（質性描述）」。',
'請根據以下資訊，撰寫 4～6 點質性描述（繁體中文），文句精簡、專業、正向，並融合具體的教學/輔導建議。',
'',
'【優勢能力】'+(S.join('、')||'（無）'),
'【弱勢能力】'+(W.join('、')||'（無）'),
'【家長觀察之創造力特質】',
cre||'　（無）',
'',
'【教師觀察 / 會議記錄 / 晤談紀錄】（請在此貼上你的觀察重點）',
'　＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿',
'',
'撰寫風格參考（擇一）：',
'A. 條列 1～5 點，每點融合特質＋輔導建議。',
'B. 分「1.優勢能力：(1)…(2)… 2.弱勢能力：(1)…(2)…」兩段。',
'',
'請直接輸出質性描述內容（不要重述以上資訊）。'
  ].join('\n');
}
if($('#btnGzPrompt')) $('#btnGzPrompt').onclick=()=>{
  navigator.clipboard.writeText(gzPrompt()).then(()=>{ $('#gzPromptInfo').textContent=' ✓ 已複製，貼到你的 AI 生成後貼回上方欄位。'; });
};
renderGz();

/* ============================================================
   課程查表（依年級帶入課程計畫）
   ============================================================ */
const CAT=window.COURSE_CATALOG||[];
function renderCatList(){
  const g=+$('#catGrade').value; const box=$('#catList');
  const list=CAT.filter(c=>c.grades.includes(g));
  if(!list.length){ box.innerHTML='<div class="small">此年級無課程</div>'; return; }
  box.innerHTML=list.map(function(c){
    const gi=CAT.indexOf(c);
    return '<label class="item"><input type="checkbox" data-ci="'+gi+'">'
      +'<span><b>'+c.area+'</b>─'+c.name+(c.semester?('（'+c.semester+'學期）'):'')
      +' <span class="small">領綱表現 '+c.perf.length+'／內容 '+c.cont.length+'</span></span></label>';
  }).join('');
}
function codeText(code){ const x=DB.performance.concat(DB.content).find(y=>y.code===code); return x?(x.code+' '+x.text):code; }
function fillFromCatalog(){
  const boxes=$('#catList').querySelectorAll('input[type=checkbox]:checked');
  if(!boxes.length){ alert('請先勾選課程'); return; }
  boxes.forEach(function(cb){
    const c=CAT[+cb.dataset.ci];
    const goals=(c.goals||'').split('\n').map(s=>s.trim()).filter(Boolean).join('\n');
    // 學習表現＝代碼＋領綱原文（直接複製貼上為底，老師再依學生特質微調並手動底線）
    const perfRows=c.perf.map(code=>codeText(code)).join('\n');
    addCourseBlock({area:c.area.replace(/領域$/,''),name:c.name,teacher:'',goals:goals,perfRows:perfRows});
  });
  window.scrollTo(0,document.body.scrollHeight);
}
if($('#catGrade')){ $('#catGrade').onchange=renderCatList; renderCatList(); }
if($('#btnCatFill')) $('#btnCatFill').onclick=fillFromCatalog;

/* ---- 讓 Word 產生時帶入優弱勢 ---- */
const _origCollect=collectFormData;
collectFormData=function(){
  _origCollect();
  IGPDATA.gz_grade=($('#gz_grade')&&$('#gz_grade').value.trim())||'';
  IGPDATA.gz_date=($('#gz_date')&&$('#gz_date').value.trim())||'';
  IGPDATA.gz_writer=($('#gz_writer')&&$('#gz_writer').value.trim())||'';
  IGPDATA.gz_strength=gzCodes('S');
  IGPDATA.gz_weak=gzCodes('W');
  IGPDATA.gz_desc=($('#gz_desc')&&$('#gz_desc').value.trim())||'';
  // 課程1（其餘課程於 injectMoreCourses 處理）
  const c0=courseBlocks[0]||{};
  IGPDATA.c1_area=c0.area||''; IGPDATA.c1_name=c0.name||''; IGPDATA.c1_teacher=c0.teacher||'';
  IGPDATA.c1_goals=numberGoals(c0.goals||'');
  const p0=(c0.perfRows||'').split('\n').filter(x=>x.trim());
  for(let i=1;i<=12;i++) IGPDATA['c1_p'+i]=stripNum(p0[i-1]||'');
};

/* ---- 課程頁 helper：多課注入 + ⟨⟩底線 ---- */
function numberGoals(s){ const a=(s||'').split('\n').map(x=>x.trim()).filter(Boolean).map(x=>x.replace(/^\d+[\.\、]?\s*/,'')); return a.map((x,i)=>(i+1)+'.'+x).join('\n'); }
function stripNum(s){ return (s||'').replace(/^\d+[\.\、]?\s*/,''); }
function injectMoreCourses(xml){
  let more='';
  for(let ci=1; ci<courseBlocks.length; ci++){
    const c=courseBlocks[ci]||{};
    let blk=td.decode(b64ToU8(IGP_TPL.courseBlockXmlB64));
    blk=blk.replace(/\{\{c_area\}\}/g,xmlEsc(c.area||''))
           .replace(/\{\{c_name\}\}/g,xmlEsc(c.name||''))
           .replace(/\{\{c_teacher\}\}/g,xmlEsc(c.teacher||''))
           .replace(/\{\{c_goals\}\}/g,xmlEsc(numberGoals(c.goals||'')));
    const pr=(c.perfRows||'').split('\n').filter(x=>x.trim());
    for(let i=1;i<=12;i++) blk=blk.replace(new RegExp('\\{\\{c_p'+i+'\\}\\}','g'), xmlEsc(stripNum(pr[i-1]||'')));
    more+=blk;
  }
  // 用 課程2+ 取代 {{MORE_COURSES}} 所在的整個段落（無更多課則移除該段落）
  return xml.replace(/<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?\{\{MORE_COURSES\}\}(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/, more);
}
function underlineMarkers(xml){
  return xml.replace(/<w:r\b([^>]*)>(<w:rPr>[\s\S]*?<\/w:rPr>)?(<w:t[^>]*>)([^<]*)(<\/w:t>)<\/w:r>/g,
    function(m,rattr,rpr,topen,text,tclose){
      if(text.indexOf('⟨')<0 && text.indexOf('⟩')<0) return m;
      rpr=rpr||'';
      const parts=[]; let re=/⟨([^⟨⟩]*)⟩/g, last=0, mm;
      while((mm=re.exec(text))){ if(mm.index>last) parts.push([text.slice(last,mm.index),false]); parts.push([mm[1],true]); last=mm.index+mm[0].length; }
      if(last<text.length) parts.push([text.slice(last),false]);
      return parts.filter(p=>p[0]!=='').map(function(p){
        const t=p[0], u=p[1]; let rp=rpr;
        if(u){ rp = rp ? rp.replace('</w:rPr>','<w:u w:val="single"/></w:rPr>') : '<w:rPr><w:u w:val="single"/></w:rPr>'; }
        return '<w:r'+rattr+'>'+rp+'<w:t xml:space="preserve">'+t+'</w:t></w:r>';
      }).join('');
    });
}

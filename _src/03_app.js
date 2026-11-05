<script>
/* ============================================================
   Congruences to drill. Position i of the first name corresponds
   to position i of the second — that is the whole idea.
   ============================================================ */
/* t = the level at which a statement starts appearing.
   1: letters do not overlap — the gentle start
   2: the two triangles share vertices (the realistic case)
   3: polygons, where there are more positions to keep track of */
const SETS=[
  {a:'ABC',b:'XYZ',t:1}, {a:'PQR',b:'STU',t:1}, {a:'ABC',b:'PRQ',t:1}, {a:'DEF',b:'QRP',t:1},

  {a:'ABC',b:'DAB',t:2}, {a:'ABC',b:'DCB',t:2}, {a:'ABC',b:'ADE',t:2},
  {a:'ABD',b:'CDB',t:2}, {a:'ABD',b:'ACD',t:2}, {a:'PQR',b:'SRQ',t:2},
  {a:'ABC',b:'AED',t:2}, {a:'ABE',b:'CBF',t:2}, {a:'ADE',b:'CDG',t:2},
  {a:'DEF',b:'DGF',t:2}, {a:'BEG',b:'BFG',t:2},

  {a:'ABCD',b:'PQRS',t:3}, {a:'ABCD',b:'PSRQ',t:3}, {a:'ABCDE',b:'QPTSR',t:3}
];
const ORD=['1st','2nd','3rd','4th','5th','6th'];
/* full name of the angle at vertex i: prev, vertex, next — vertex in the middle */
const angleName=(name,i)=>{const n=name.length;return name[(i+n-1)%n]+name[i]+name[(i+1)%n];};
const GOAL=20;   /* correct answers needed to finish the challenge */
/* difficulty ladder — the only scaffold is the highlight in the statement */
const LEVELS=[
  {id:1,name:'Guided',  hl:true,  hint:true,  timed:false},   // no shared vertices
  {id:2,name:'Standard',hl:false, hint:true,  timed:false},   // shared vertices appear
  {id:3,name:'Timed',   hl:false, hint:false, timed:true}     // + polygons, no hint
];
const LV=()=>LEVELS.find(l=>l.id===S.lvl)||LEVELS[0];

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const tri=n=>n===3?'△':'';
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

/* ---- question pool ---- */
function poolFor(mode,lvl){
  const max=lvl||S.lvl||1;
  const out=[];
  SETS.filter(s=>s.t<=max).forEach(({a,b})=>{
    const n=a.length;
    ['point','side','angle'].forEach(kind=>{
      if(mode!=='mixed'&&mode!==kind+'s')return;
      for(let i=0;i<n;i++){
        out.push({a,b,kind,i,dir:'f'});
        out.push({a,b,kind,i,dir:'b'});
      }
    });
  });
  return out;
}

/* ---- one question, resolved ---- */
function partsOf(q){
  const n=q.a.length, j=(q.i+1)%n;
  const from=q.dir==='f'?q.a:q.b;
  const to  =q.dir==='f'?q.b:q.a;
  if(q.kind==='side')return {fromName:from,toName:to,idx:[q.i,j],ans:[to[q.i],to[j]]};
  return {fromName:from,toName:to,idx:[q.i],ans:[to[q.i]]};
}
function answerText(q){
  if(q.kind==='side'){const p=partsOf(q);return p.ans.join('');}
  if(q.kind==='angle')return angleName(q.dir==='f'?q.b:q.a,q.i);
  return q.dir==='f'?q.b[q.i]:q.a[q.i];
}
function questionText(q){
  const p=partsOf(q), n=q.a.length;
  const from=p.fromName, to=p.toName;
  const label=q.kind==='point'?'point':q.kind==='side'?'side':'angle';
  const what=q.kind==='side'
    ? p.idx.map(i=>from[i]).join('')
    : q.kind==='angle' ? '∠'+angleName(from,q.i) : from[q.i];
  return `Which ${label} of ${tri(n)}${to} corresponds to <span class="m">${what}</span>?`;
}
function reasonText(q){
  const p=partsOf(q), n=q.a.length, A=q.a, B=q.b;
  if(q.kind==='side'){
    const j=(q.i+1)%n;
    const f=q.dir==='f';
    const [f1,f2]=f?[A[q.i],A[j]]:[B[q.i],B[j]];
    const [t1,t2]=f?[B[q.i],B[j]]:[A[q.i],A[j]];
    return `<b>${f1}↔${t1}</b> and <b>${f2}↔${t2}</b>, so <b>${f1}${f2}</b> corresponds to <b>${t1}${t2}</b>.`;
  }
  const f=q.dir==='f';
  const fv=f?A[q.i]:B[q.i], tv=f?B[q.i]:A[q.i];
  const pos=ORD[q.i];
  if(q.kind==='angle'){
    const fromN=q.dir==='f'?A:B, toN=q.dir==='f'?B:A;
    return `The angle at <b>${fv}</b> pairs with the angle at <b>${tv}</b>, so <b>∠${angleName(fromN,q.i)}</b> corresponds to <b>∠${angleName(toN,q.i)}</b>.`;
  }
  return `<b>${fv}</b> is the ${pos} letter of the first name, so it pairs with <b>${tv}</b>, the ${pos} letter of the second.`;
}

/* ---- statement with highlights ---- */
function nameHTML(name,mark,ans){
  return [...name].map((c,i)=>{
    const cls=mark.includes(i)?'L mark':(ans.includes(i)?'L ans':'L');
    return `<span class="${cls}">${c}</span>`;
  }).join('');
}
function statementHTML(q,reveal){
  const n=q.a.length, j=(q.i+1)%n;
  const idx=q.kind==='side'?[q.i,j]:[q.i];
  const show=LV().hl||reveal;
  const markA=(show&&q.dir==='f')?idx:[], markB=(show&&q.dir==='b')?idx:[];
  const ansA=reveal&&q.dir==='b'?idx:[], ansB=reveal&&q.dir==='f'?idx:[];
  return `<div class="statement">
    <span class="tri">${tri(n)}</span>${nameHTML(q.a,markA,ansA)}
    <span class="sym">≅</span>
    <span class="tri">${tri(n)}</span>${nameHTML(q.b,markB,ansB)}
  </div>`;
}

/* ============================================================
   State
   ============================================================ */
let S={mode:'mixed',lvl:1,q:[],goal:GOAL,ok:0,ans:0,streak:0,best:0,state:'ask',
        hint:false,tried:false,t0:0,times:[],endless:false};

function start(mode,lvl,endless){
  const L=(lvl||S.lvl||1);
  S={mode,lvl:L,q:shuffle(poolFor(mode,L)),goal:GOAL,ok:0,ans:0,streak:0,best:S.best,
     state:'ask',hint:false,tried:false,t0:performance.now(),times:[],endless:!!endless};
  render();
}
function cur(){return S.q[0];}

/* ============================================================
   Render
   ============================================================ */
function render(){
  $('#levels').innerHTML=LEVELS.map(l=>
    `<button class="${S.lvl===l.id?'on':''}" data-l="${l.id}" title="${l.name}">L${l.id} · ${l.name}</button>`).join('');
  $$('#levels button').forEach(b=>{b.onclick=()=>start(S.mode,+b.dataset.l);});
  $('#modes').innerHTML=[['points','Points'],['sides','Sides'],['angles','Angles'],['mixed','Mixed']]
    .map(([k,l])=>`<button class="${S.mode===k?'on':''}" data-m="${k}">${l}</button>`).join('');
  $$('#modes button').forEach(b=>{b.onclick=()=>start(b.dataset.m,S.lvl);});
  $('#score').innerHTML=`<b>${S.ok}</b> correct`;

  if(S.state==='done'){return renderDone();}

  const q=cur(), reveal=S.state!=='ask';
  $('#card').innerHTML=`
    <div class="kicker">${S.endless?`Endless · ${S.ok} correct`:`Correct ${S.ok} of ${S.goal}`}</div>
    ${statementHTML(q,reveal)}
    <p class="ask">${questionText(q)}</p>
    <div class="answer-row">
      ${q.kind==='angle'?'<span class="pfx">∠</span>':''}
      <input id="ans" autocomplete="off" autocapitalize="characters" spellcheck="false"
             aria-label="your answer" ${reveal?'disabled':''}>
      <button id="check" ${reveal?'disabled':''}>Check</button>
    </div>
    <div class="fb" id="fb"></div>
    ${S.hint?`<div class="hintbox">Line the two names up <b>position by position</b>: the 1st letter with the 1st, the 2nd with the 2nd, the 3rd with the 3rd. A side joins two positions — so its partner joins the same two positions.</div>`:''}
    ${S.endless?'':`<div class="bar"><i style="width:${Math.min(100,S.ok/S.goal*100).toFixed(1)}%"></i></div>`}
    <div class="count"><span>${S.ans} answered</span><span>${S.endless?`${S.ok} correct`:`${S.ok} / ${S.goal}`} · streak ${S.streak}</span></div>
    ${S.state==='ask'&&(LV().hint||S.endless)?`<div class="tools">
      ${LV().hint?`<button id="hintBtn">${S.hint?'Hide hint':'Hint'}</button>`:''}
      ${S.endless?`<button id="finishBtn">Finish</button>`:''}
    </div>`:''}
    ${!LV().hl&&S.state==='ask'?`<div class="lvl-note">No highlight at this level — find the part in the statement yourself.</div>`:''}`;

  const inp=$('#ans');
  if(S.state==='ask'){
    if(!S.t0)S.t0=performance.now();
    inp.focus();
    inp.onkeydown=e=>{if(e.key==='Enter')check();};
    inp.oninput=()=>inp.classList.remove('ok','no');
    $('#check').onclick=check;
    const hb=$('#hintBtn'); if(hb)hb.onclick=()=>{S.hint=!S.hint;render();};
    const fb2=$('#finishBtn'); if(fb2)fb2.onclick=()=>{S.state='done';render();};
  }else{
    showFeedback();
  }
}

function renderDone(){
  const acc=S.ans?Math.round(S.ok/S.ans*100):0;
  const avg=(LV().timed&&S.times.length)?` · average ${(S.times.reduce((a,b)=>a+b,0)/S.times.length).toFixed(1)} s`:'';
  $('#card').innerHTML=`<div class="done">
    <div class="seal"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6.5"/></svg></div>
    <h2>${S.ok} correct</h2>
    <p>You answered <b>${S.ans}</b> question${S.ans===1?'':'s'} — ${acc}% of them right. Best streak: ${S.best}${avg}.</p>
    <button class="btn" id="again">New challenge</button>
    <button class="btn ghost" id="endless" style="margin-left:8px">Endless mode</button>
  </div>`;
  $('#again').onclick=()=>start(S.mode,S.lvl,false);
  $('#endless').onclick=()=>start(S.mode,S.lvl,true);
}

/* ============================================================
   Check
   ============================================================ */
function normalise(v,q){
  let s=v.toUpperCase().replace(/[^A-Z]/g,'');
  if(q.kind==='side'&&s.length===2)s=[...s].sort().join('');
  return s;
}
function check(){
  if(S.state!=='ask')return;
  const q=cur(), inp=$('#ans');
  const raw=inp.value.trim();
  if(!raw)return;
  const secs=(performance.now()-S.t0)/1000;
  const got=normalise(raw,q);
  const want=answerText(q);
  let ok;
  if(q.kind==='side')ok=[...got].sort().join('')===[...want].sort().join('');
  else if(q.kind==='angle')ok=got.length===3&&got[1]===want[1]&&[...got[0]+got[2]].sort().join('')===[...want[0]+want[2]].sort().join('');
  else ok=got===want;

  S.times.push(secs); S.ans++;
  if(ok){
    inp.classList.add('ok');
    S.state='ok'; S.ok++; S.streak++; S.best=Math.max(S.best,S.streak);
    $('#score').innerHTML=`<b>${S.ok}</b> correct`;
    showFeedback();
    if(!S.endless&&S.ok>=S.goal){ adv=setTimeout(()=>{S.state='done';render();},950); }
    else { adv=setTimeout(advance,1100); }
  }else{
    inp.classList.add('no');
    S.state='no'; S.streak=0; S.tried=true;
    showFeedback();
  }
}
let adv=null;
function advance(){
  if(S.state==='ask'||S.state==='done')return;
  clearTimeout(adv); adv=null;
  S.q.shift();
  if(!S.q.length)S.q=shuffle(poolFor(S.mode,S.lvl));
  S.state='ask'; S.tried=false; S.t0=performance.now(); render();
}
function showFeedback(){
  const q=cur(), fb=$('#fb');
  const tt=LV().timed&&S.times.length?`<div class="lvl-note">${S.times[S.times.length-1].toFixed(1)} s</div>`:'';
  if(S.state==='ok'){
    fb.innerHTML=`<div class="ok-t">Correct</div><div class="why">${reasonText(q)}</div>${tt}`;
  }else if(S.state==='no'){
    fb.innerHTML=`<div class="no-t">Not quite — it is <b style="font-family:var(--mono)">${answerText(q)}</b>.</div>
      <div class="why">${reasonText(q)}</div>${tt}
      <button class="nx" id="nx">Next →</button>`;
    const nx=$('#nx'); if(nx)nx.onclick=advance;
    const inp=$('#ans'); if(inp){inp.focus();inp.select();}
  }
}

/* ============================================================
   Wiring
   ============================================================ */
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&S.state!=='ask'){e.preventDefault();advance();}
});
start('mixed');
</script>
</body>
</html>

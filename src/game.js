(() => {
  const DEFAULT_QUESTIONS = [
    {id:1,left:{n:3,d:8},right:{n:10,d:12}},{id:2,left:{n:4,d:6},right:{n:4,d:10}},{id:3,left:{n:9,d:14},right:{n:1,d:4}},{id:4,left:{n:11,d:18},right:{n:7,d:16}},{id:5,left:{n:17,d:20},right:{n:12,d:30}},{id:6,left:{n:15,d:20},right:{n:3,d:8}},{id:7,left:{n:4,d:8},right:{n:10,d:26}},{id:8,left:{n:17,d:28},right:{n:1,d:5}},{id:9,left:{n:6,d:15},right:{n:15,d:22}},{id:10,left:{n:6,d:10},right:{n:7,d:16}},{id:11,left:{n:5,d:12},right:{n:15,d:24}},{id:12,left:{n:3,d:8},right:{n:11,d:10}},{id:13,left:{n:5,d:8},right:{n:7,d:14}},{id:14,left:{n:5,d:6},right:{n:3,d:10}}
  ];

  const state = {questions:[],index:0,score:0,stars:0,attempts:0,usedHint:false,locked:false,correctCount:0,stream:null,hands:null,running:false,pinching:false,grabbed:null,ghost:null,lastPinch:false,lastProcess:0};
  const $ = id => document.getElementById(id);
  const fractionText = f => `${f.n}/${f.d}`;
  const compare = (a,b) => { const l=a.n*b.d,r=b.n*a.d; return l<r?"<":l>r?">":"="; };
  const compareToHalf = f => 2*f.n<f.d?"< 1/2":2*f.n>f.d?"> 1/2":"= 1/2";

  function setText(id,value){ const el=$(id); if(el) el.textContent=value; }
  function toast(msg){ const el=$('toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),900); }
  function updateScore(){ setText('star-text',`${state.stars} ★`); setText('score-text',state.score); }

  function renderQuestion(){
    const q=state.questions[state.index]; state.attempts=0; state.usedHint=false; state.locked=false;
    setText('progress-text',`${state.index+1} / ${state.questions.length}`); setText('left-fraction',fractionText(q.left)); setText('right-fraction',fractionText(q.right));
    setText('drop-symbol','?'); setText('status-text','ยกมือขึ้นหน้ากล้อง แล้วจีบนิ้วโป้งกับนิ้วชี้เพื่อหยิบสัญลักษณ์');
    $('hint-panel').hidden=true; $('drop-zone').classList.remove('hot'); updateScore();
    document.querySelectorAll('.symbol-card').forEach(el=>el.classList.remove('grabbed','hovered'));
  }

  function showHint(){
    if(state.locked) return; const q=state.questions[state.index]; state.usedHint=true; $('hint-panel').hidden=false;
    setText('left-hint-label',fractionText(q.left)); setText('right-hint-label',fractionText(q.right)); setText('left-half',compareToHalf(q.left)); setText('right-half',compareToHalf(q.right));
    $('left-fill').style.width=`${Math.min(100,(q.left.n/q.left.d)*100)}%`; $('right-fill').style.width=`${Math.min(100,(q.right.n/q.right.d)*100)}%`;
  }

  function playTone(kind){
    const Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx)return; const ctx=new Ctx(),now=ctx.currentTime,notes=kind==='correct'?[660,880]:kind==='finish'?[523,659,784]:[220,180];
    notes.forEach((frequency,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=frequency;gain.gain.setValueAtTime(.0001,now+i*.1);gain.gain.exponentialRampToValueAtTime(.1,now+i*.1+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.1+.10);osc.connect(gain).connect(ctx.destination);osc.start(now+i*.1);osc.stop(now+i*.1+.11);});
  }

  function submit(symbol){
    if(state.locked) return; const q=state.questions[state.index]; state.attempts++;
    if(symbol===compare(q.left,q.right)){
      state.locked=true; state.correctCount++; const earned=state.usedHint?1:state.attempts===1?3:state.attempts===2?2:1; state.stars+=earned; state.score+=100+Math.max(0,40-(state.attempts-1)*20); updateScore();
      setText('drop-symbol',symbol); setText('status-text',`ถูกต้อง! +${earned} ดาว`); $('question-card').classList.add('celebrate'); playTone('correct'); toast('เก่งมาก! 🎉');
      setTimeout(()=>$('question-card').classList.remove('celebrate'),550); setTimeout(()=>{state.index++; if(state.index>=state.questions.length) finishGame(); else renderQuestion();},1100);
    } else {
      setText('drop-symbol',symbol); setText('status-text','ยังไม่ถูก ลองเทียบแต่ละเศษส่วนกับ 1/2'); playTone('wrong'); toast('ลองอีกครั้ง 💡'); setTimeout(()=>setText('drop-symbol','?'),650);
    }
  }

  function finishGame(){
    state.locked=true; const accuracy=Math.round(state.correctCount/state.questions.length*100); setText('progress-text','ครบทุกข้อ'); setText('left-fraction','★'); setText('right-fraction','★'); setText('drop-symbol','✓');
    setText('status-text',`ภารกิจสำเร็จ • Accuracy ${accuracy}% • ${state.stars} ดาว • ${state.score} คะแนน`); $('hint-panel').hidden=true; playTone('finish');
  }

  function pointInRect(x,y,rect,pad=0){ return x>=rect.left-pad&&x<=rect.right+pad&&y>=rect.top-pad&&y<=rect.bottom+pad; }
  function setHover(x,y){
    let hit=null; document.querySelectorAll('.symbol-card').forEach(btn=>{const inside=pointInRect(x,y,btn.getBoundingClientRect(),12); btn.classList.toggle('hovered',inside&&!state.grabbed); if(inside) hit=btn;}); return hit;
  }

  function startGrab(button,x,y){
    if(!button||state.locked) return; state.grabbed=button; button.classList.add('grabbed');
    const ghost=document.createElement('div'); ghost.className='drag-ghost'; ghost.textContent=button.dataset.answer; document.body.appendChild(ghost); state.ghost=ghost; moveGhost(x,y); toast(`หยิบ ${button.dataset.answer} แล้ว`);
  }
  function moveGhost(x,y){ if(state.ghost){state.ghost.style.left=`${x}px`;state.ghost.style.top=`${y}px`;} const hot=pointInRect(x,y,$('drop-zone').getBoundingClientRect(),24); $('drop-zone').classList.toggle('hot',hot); }
  function releaseGrab(x,y){
    if(!state.grabbed)return; const symbol=state.grabbed.dataset.answer,valid=pointInRect(x,y,$('drop-zone').getBoundingClientRect(),32); state.grabbed.classList.remove('grabbed'); state.grabbed=null; if(state.ghost){state.ghost.remove();state.ghost=null;} $('drop-zone').classList.remove('hot'); if(valid)submit(symbol); else toast('ปล่อยสัญลักษณ์ตรงช่องกลางนะ');
  }

  function drawHand(landmarks){
    const canvas=$('hand-canvas'),ctx=canvas.getContext('2d'),w=canvas.width=innerWidth*devicePixelRatio,h=canvas.height=innerHeight*devicePixelRatio; ctx.clearRect(0,0,w,h); ctx.lineWidth=4*devicePixelRatio; ctx.strokeStyle='rgba(118,242,212,.78)'; ctx.fillStyle='#fff';
    const pairs=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
    const p=i=>({x:(1-landmarks[i].x)*w,y:landmarks[i].y*h}); ctx.beginPath(); pairs.forEach(([a,b])=>{const A=p(a),B=p(b);ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y)});ctx.stroke(); [4,8].forEach(i=>{const P=p(i);ctx.beginPath();ctx.arc(P.x,P.y,6*devicePixelRatio,0,Math.PI*2);ctx.fill()});
  }

  function onHandResults(results){
    const lm=results.multiHandLandmarks&&results.multiHandLandmarks[0],cursor=$('hand-cursor');
    if(!lm){cursor.classList.remove('visible','pinching'); $('hand-canvas').getContext('2d').clearRect(0,0,$('hand-canvas').width,$('hand-canvas').height); if(state.grabbed) releaseGrab(-999,-999); state.lastPinch=false; return;}
    drawHand(lm); const thumb=lm[4],index=lm[8]; const x=(1-index.x)*innerWidth,y=index.y*innerHeight; const dist=Math.hypot(thumb.x-index.x,thumb.y-index.y); const pinching=dist<0.055;
    cursor.classList.add('visible'); cursor.classList.toggle('pinching',pinching); cursor.style.left=`${x}px`;cursor.style.top=`${y}px`;
    const hover=setHover(x,y); if(pinching&&!state.lastPinch&&!state.grabbed) startGrab(hover,x,y); if(state.grabbed) moveGhost(x,y); if(!pinching&&state.lastPinch&&state.grabbed) releaseGrab(x,y); state.lastPinch=pinching;
  }

  async function initHands(){
    if(!window.Hands) throw new Error('ไม่สามารถโหลดระบบตรวจจับมือได้');
    const hands=new Hands({locateFile:file=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`}); hands.setOptions({maxNumHands:1,modelComplexity:0,minDetectionConfidence:.6,minTrackingConfidence:.55}); hands.onResults(onHandResults); state.hands=hands;
    const video=$('camera'); const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false}); state.stream=stream; video.srcObject=stream; await video.play(); state.running=true;
    const loop=async t=>{if(!state.running)return;if(t-state.lastProcess>34&&video.readyState>=2){state.lastProcess=t;await hands.send({image:video});}requestAnimationFrame(loop)}; requestAnimationFrame(loop);
  }

  async function loadQuestions(){ try{const r=await fetch('./data/questions.json',{cache:'no-store'});if(!r.ok)throw new Error();const data=await r.json();return Array.isArray(data)&&data.length?data:DEFAULT_QUESTIONS;}catch{return DEFAULT_QUESTIONS;} }

  function bindFallback(){
    document.querySelectorAll('.symbol-card').forEach(btn=>{btn.addEventListener('click',()=>submit(btn.dataset.answer));}); $('hint-button').addEventListener('click',showHint);
    $('start-button').addEventListener('click',async()=>{const err=$('camera-error');err.hidden=true;$('start-button').disabled=true;$('start-button').textContent='กำลังเปิดกล้อง…';try{await initHands();$('start-screen').classList.add('hidden');}catch(e){err.hidden=false;err.textContent=`เปิดกล้องไม่ได้: ${e.message||'กรุณาตรวจสอบสิทธิ์กล้องและใช้ HTTPS'}`;$('start-button').disabled=false;$('start-button').textContent='📷 ลองเปิดกล้องอีกครั้ง';}});
  }

  window.addEventListener('beforeunload',()=>state.stream?.getTracks().forEach(t=>t.stop()));
  window.addEventListener('DOMContentLoaded',async()=>{state.questions=await loadQuestions();bindFallback();renderQuestion();});
})();

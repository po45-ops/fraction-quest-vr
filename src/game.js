(() => {
  const DEFAULT_QUESTIONS = [
    {id:1,left:{n:3,d:8},right:{n:10,d:12}},
    {id:2,left:{n:4,d:6},right:{n:4,d:10}},
    {id:3,left:{n:9,d:14},right:{n:1,d:4}},
    {id:4,left:{n:11,d:18},right:{n:7,d:16}},
    {id:5,left:{n:17,d:20},right:{n:12,d:30}},
    {id:6,left:{n:15,d:20},right:{n:3,d:8}},
    {id:7,left:{n:4,d:8},right:{n:10,d:26}},
    {id:8,left:{n:17,d:28},right:{n:1,d:5}},
    {id:9,left:{n:6,d:15},right:{n:15,d:22}},
    {id:10,left:{n:6,d:10},right:{n:7,d:16}},
    {id:11,left:{n:5,d:12},right:{n:15,d:24}},
    {id:12,left:{n:3,d:8},right:{n:11,d:10}},
    {id:13,left:{n:5,d:8},right:{n:7,d:14}},
    {id:14,left:{n:5,d:6},right:{n:3,d:10}}
  ];

  const state = {
    questions:[],
    index:0,
    score:0,
    stars:0,
    attempts:0,
    totalAttempts:0,
    usedHint:false,
    locked:false,
    stream:null,
    hands:null,
    running:false,
    grabbed:null,
    ghost:null,
    lastPinch:false,
    lastProcess:0,
    nextTimer:null,
    feedbackTimer:null
  };

  const $ = id => document.getElementById(id);
  const fractionText = fraction => `${fraction.n}/${fraction.d}`;
  const compare = (left, right) => {
    const leftValue = left.n * right.d;
    const rightValue = right.n * left.d;
    return leftValue < rightValue ? '<' : leftValue > rightValue ? '>' : '=';
  };
  const compareToHalf = fraction => 2 * fraction.n < fraction.d ? '< 1/2' : 2 * fraction.n > fraction.d ? '> 1/2' : '= 1/2';

  let audioContext = null;

  function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value;
  }

  function setFraction(side, fraction) {
    setText(`${side}-numerator`, fraction.n);
    setText(`${side}-denominator`, fraction.d);
    const element = $(`${side}-fraction`);
    if (element) element.setAttribute('aria-label', `${fraction.n} ส่วน ${fraction.d}`);
  }

  function toast(message, duration = 1150) {
    const element = $('toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => element.classList.remove('show'), duration);
  }

  function updateScore() {
    const starText = $('star-text');
    if (starText) starText.innerHTML = `${state.stars} <span aria-hidden="true">★</span>`;
    setText('score-text', state.score.toLocaleString('th-TH'));
  }

  function resetAnswerDisplay() {
    const feedback = $('answer-feedback');
    const explanation = $('hint-panel');
    const dropZone = $('drop-zone');
    const dock = $('result-dock');
    if (feedback) {
      feedback.hidden = true;
      feedback.classList.remove('correct', 'wrong');
    }
    if (explanation) explanation.hidden = true;
    dropZone?.classList.remove('hot', 'correct', 'wrong');
    dock?.classList.remove('correct', 'wrong');
    setText('drop-symbol', '?');
    setText('result-dock-text', 'ผลลัพธ์จะแสดงที่นี่');
  }

  function renderQuestion() {
    clearTimeout(state.nextTimer);
    clearTimeout(state.feedbackTimer);
    const question = state.questions[state.index];
    if (!question) return;
    state.attempts = 0;
    state.usedHint = false;
    state.locked = false;
    setText('progress-text', `${state.index + 1} / ${state.questions.length}`);
    setFraction('left', question.left);
    setFraction('right', question.right);
    setText('status-text', 'จีบนิ้วเพื่อหยิบเครื่องหมาย แล้วปล่อยลงในช่องกลาง');
    resetAnswerDisplay();
    updateScore();
    $('hint-button')?.classList.remove('hinted');
    document.querySelectorAll('.symbol-card').forEach(element => element.classList.remove('grabbed', 'hovered', 'is-pressed'));
  }

  function revealExplanation(question) {
    const panel = $('hint-panel');
    setText('left-hint-label', fractionText(question.left));
    setText('right-hint-label', fractionText(question.right));
    setText('left-half', compareToHalf(question.left));
    setText('right-half', compareToHalf(question.right));
    $('left-fill').style.width = `${Math.min(100, (question.left.n / question.left.d) * 100)}%`;
    $('right-fill').style.width = `${Math.min(100, (question.right.n / question.right.d) * 100)}%`;
    if (panel) panel.hidden = false;
  }

  function showHint() {
    if (state.locked) return;
    state.usedHint = true;
    $('hint-button')?.classList.add('hinted');
    setText('status-text', 'คำใบ้: คิดว่าแต่ละเศษส่วนมากกว่า น้อยกว่า หรือเท่ากับ 1/2');
    setText('result-dock-text', 'ลองเทียบแต่ละจำนวนกับ 1/2 ก่อน');
    toast('คำใบ้มาแล้ว 💡');
  }

  function playTone(kind) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext ||= new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      const notes = kind === 'correct' ? [659, 784, 988] : kind === 'finish' ? [523, 659, 784, 1047] : [245, 196];
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start = now + index * (kind === 'wrong' ? .13 : .09);
        oscillator.type = kind === 'wrong' ? 'triangle' : 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.0001, start);
        gain.gain.exponentialRampToValueAtTime(.09, start + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, start + .16);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(start);
        oscillator.stop(start + .17);
      });
    } catch (_) {}
  }

  function setFeedback(kind, title, detail) {
    const feedback = $('answer-feedback');
    const dropZone = $('drop-zone');
    const dock = $('result-dock');
    if (!feedback) return;
    feedback.hidden = false;
    feedback.classList.remove('correct', 'wrong');
    feedback.classList.add(kind);
    dropZone?.classList.remove('correct', 'wrong');
    dropZone?.classList.add(kind);
    dock?.classList.remove('correct', 'wrong');
    dock?.classList.add(kind);
    setText('feedback-icon', kind === 'correct' ? '✓' : '✕');
    setText('feedback-title', title);
    setText('feedback-detail', detail);
  }

  function launchCelebration() {
    const layer = $('celebration-layer');
    if (!layer) return;
    const symbols = ['★', '✦', '◆', '●'];
    for (let index = 0; index < 20; index += 1) {
      const star = document.createElement('span');
      const angle = (Math.PI * 2 * index) / 20 + Math.random() * .2;
      const distance = 130 + Math.random() * 280;
      star.className = 'celebration-star';
      star.textContent = symbols[index % symbols.length];
      star.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      star.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
      star.style.setProperty('--r', `${Math.round(Math.random() * 500 - 250)}deg`);
      star.style.animationDelay = `${Math.random() * .12}s`;
      layer.appendChild(star);
      window.setTimeout(() => star.remove(), 1200);
    }
  }

  function submit(symbol) {
    if (state.locked) return;
    const question = state.questions[state.index];
    if (!question) return;
    state.locked = true;
    state.attempts += 1;
    state.totalAttempts += 1;
    setText('drop-symbol', symbol);
    revealExplanation(question);

    if (symbol === compare(question.left, question.right)) {
      const earned = state.usedHint ? 1 : state.attempts === 1 ? 3 : state.attempts === 2 ? 2 : 1;
      state.stars += earned;
      state.score += 100 + Math.max(0, 40 - (state.attempts - 1) * 20);
      updateScore();
      setFeedback('correct', 'ถูก', `เก่งมาก! +${earned} ดาว`);
      setText('status-text', 'ดูภาพเฉลยด้านล่าง แล้วเตรียมไปข้อต่อไป');
      setText('result-dock-text', `ถูกต้อง • +${earned} ดาว`);
      $('question-card')?.classList.add('celebrate');
      playTone('correct');
      launchCelebration();
      toast('ยอดเยี่ยม! ตอบถูกแล้ว 🎉', 1500);
      window.setTimeout(() => $('question-card')?.classList.remove('celebrate'), 620);
      state.nextTimer = window.setTimeout(() => {
        state.index += 1;
        if (state.index >= state.questions.length) finishGame();
        else renderQuestion();
      }, 2300);
      return;
    }

    setFeedback('wrong', 'ผิด', 'ดูเฉลยแล้วลองใหม่อีกครั้ง');
    setText('status-text', 'สังเกตตำแหน่ง 1/2 ในภาพเฉลย แล้วลองเลือกใหม่');
    setText('result-dock-text', 'ผิด • ดูเฉลยแล้วลองใหม่');
    playTone('wrong');
    toast('ยังไม่ถูก ลองอีกครั้งนะ 💡', 1500);
    state.feedbackTimer = window.setTimeout(() => {
      resetAnswerDisplay();
      setText('status-text', 'ลองเลือกเครื่องหมายใหม่อีกครั้ง');
      setText('result-dock-text', 'ลองอีกครั้ง คุณทำได้!');
      state.locked = false;
    }, 2100);
  }

  function finishGame() {
    state.locked = true;
    const accuracy = Math.round((state.questions.length / Math.max(state.questions.length, state.totalAttempts)) * 100);
    setText('progress-text', `${state.questions.length} / ${state.questions.length}`);
    setText('finish-accuracy', `${accuracy}%`);
    setText('finish-stars', `${state.stars} ★`);
    setText('finish-score', state.score.toLocaleString('th-TH'));
    const finish = $('finish-screen');
    if (finish) {
      finish.classList.remove('hidden');
      finish.removeAttribute('aria-hidden');
    }
    playTone('finish');
    launchCelebration();
  }

  function restartGame() {
    state.index = 0;
    state.score = 0;
    state.stars = 0;
    state.attempts = 0;
    state.totalAttempts = 0;
    state.usedHint = false;
    state.locked = false;
    const finish = $('finish-screen');
    finish?.classList.add('hidden');
    finish?.setAttribute('aria-hidden', 'true');
    renderQuestion();
  }

  function pointInRect(x, y, rectangle, padding = 0) {
    return x >= rectangle.left - padding && x <= rectangle.right + padding && y >= rectangle.top - padding && y <= rectangle.bottom + padding;
  }

  function setHover(x, y) {
    let hit = null;
    document.querySelectorAll('.symbol-card').forEach(button => {
      const inside = pointInRect(x, y, button.getBoundingClientRect(), 12);
      button.classList.toggle('hovered', inside && !state.grabbed && !state.locked);
      if (inside) hit = button;
    });
    return hit;
  }

  function startGrab(button, x, y) {
    if (!button || state.locked) return;
    state.grabbed = button;
    button.classList.add('grabbed');
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.textContent = button.dataset.answer;
    document.body.appendChild(ghost);
    state.ghost = ghost;
    moveGhost(x, y);
    toast(`หยิบ ${button.dataset.answer} แล้ว`);
  }

  function moveGhost(x, y) {
    if (state.ghost) {
      state.ghost.style.left = `${x}px`;
      state.ghost.style.top = `${y}px`;
    }
    const dropZone = $('drop-zone');
    if (!dropZone) return;
    const isHot = pointInRect(x, y, dropZone.getBoundingClientRect(), 28);
    dropZone.classList.toggle('hot', isHot);
  }

  function releaseGrab(x, y) {
    if (!state.grabbed) return;
    const symbol = state.grabbed.dataset.answer;
    const dropZone = $('drop-zone');
    const valid = dropZone && pointInRect(x, y, dropZone.getBoundingClientRect(), 36);
    state.grabbed.classList.remove('grabbed');
    state.grabbed = null;
    state.ghost?.remove();
    state.ghost = null;
    dropZone?.classList.remove('hot');
    if (valid) submit(symbol);
    else toast('ปล่อยเครื่องหมายลงในช่องกลางนะ');
  }

  function drawHand(landmarks) {
    const canvas = $('hand-canvas');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.width = innerWidth * ratio;
    const height = canvas.height = innerHeight * ratio;
    context.clearRect(0, 0, width, height);
    context.lineWidth = 4 * ratio;
    context.lineCap = 'round';
    context.strokeStyle = 'rgba(255,245,139,.88)';
    context.fillStyle = '#fff';
    context.shadowColor = 'rgba(255,220,60,.9)';
    context.shadowBlur = 8 * ratio;
    const pairs = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
    const point = index => ({x:(1 - landmarks[index].x) * width, y:landmarks[index].y * height});
    context.beginPath();
    pairs.forEach(([from, to]) => {
      const a = point(from);
      const b = point(to);
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
    });
    context.stroke();
    [4, 8].forEach(index => {
      const value = point(index);
      context.beginPath();
      context.arc(value.x, value.y, 7 * ratio, 0, Math.PI * 2);
      context.fill();
    });
  }

  function clearHandCanvas() {
    const canvas = $('hand-canvas');
    const context = canvas?.getContext('2d');
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function onHandResults(results) {
    const landmarks = results.multiHandLandmarks?.[0];
    const cursor = $('hand-cursor');
    if (!landmarks) {
      cursor?.classList.remove('visible', 'pinching');
      clearHandCanvas();
      if (state.grabbed) releaseGrab(-999, -999);
      state.lastPinch = false;
      return;
    }

    drawHand(landmarks);
    const thumb = landmarks[4];
    const index = landmarks[8];
    const x = (1 - index.x) * innerWidth;
    const y = index.y * innerHeight;
    const distance = Math.hypot(thumb.x - index.x, thumb.y - index.y);
    const pinching = distance < .055;
    if (cursor) {
      cursor.classList.add('visible');
      cursor.classList.toggle('pinching', pinching);
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
    }
    const hovered = setHover(x, y);
    if (pinching && !state.lastPinch && !state.grabbed) startGrab(hovered, x, y);
    if (state.grabbed) moveGhost(x, y);
    if (!pinching && state.lastPinch && state.grabbed) releaseGrab(x, y);
    state.lastPinch = pinching;
  }

  async function initHands() {
    if (!window.Hands) throw new Error('ไม่สามารถโหลดระบบตรวจจับมือได้');
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('เบราว์เซอร์นี้ไม่รองรับการเปิดกล้อง');
    const hands = new window.Hands({locateFile:file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
    hands.setOptions({maxNumHands:1, modelComplexity:0, minDetectionConfidence:.6, minTrackingConfidence:.55});
    hands.onResults(onHandResults);
    state.hands = hands;
    const video = $('camera');
    const stream = await navigator.mediaDevices.getUserMedia({
      video:{facingMode:'user', width:{ideal:1280}, height:{ideal:720}},
      audio:false
    });
    state.stream = stream;
    video.srcObject = stream;
    await video.play();
    document.body.classList.add('camera-mode');
    state.running = true;
    const loop = async timestamp => {
      if (!state.running) return;
      if (timestamp - state.lastProcess > 40 && video.readyState >= 2) {
        state.lastProcess = timestamp;
        try { await hands.send({image:video}); } catch (_) {}
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  async function loadQuestions() {
    try {
      const response = await fetch('./data/questions.json', {cache:'no-store'});
      if (!response.ok) throw new Error('question request failed');
      const data = await response.json();
      const valid = data.filter(question => question?.left?.d > 0 && question?.right?.d > 0);
      return valid.length ? valid : DEFAULT_QUESTIONS;
    } catch (_) {
      return DEFAULT_QUESTIONS;
    }
  }

  function hideStartScreen() {
    const screen = $('start-screen');
    screen?.classList.add('hidden');
    screen?.setAttribute('aria-hidden', 'true');
  }

  function bindControls() {
    document.querySelectorAll('.symbol-card').forEach(button => {
      button.addEventListener('click', () => {
        if (state.locked) return;
        button.classList.add('is-pressed');
        window.setTimeout(() => button.classList.remove('is-pressed'), 170);
        submit(button.dataset.answer);
      });
    });

    $('hint-button')?.addEventListener('click', showHint);
    $('start-button')?.addEventListener('click', async () => {
      const error = $('camera-error');
      error.hidden = true;
      $('start-button').disabled = true;
      $('start-button').textContent = 'กำลังเปิดกล้อง…';
      try {
        await initHands();
        hideStartScreen();
      } catch (caught) {
        error.hidden = false;
        error.textContent = `เปิดกล้องไม่ได้: ${caught.message || 'กรุณาตรวจสอบสิทธิ์กล้องและใช้ HTTPS'}`;
        $('start-button').disabled = false;
        $('start-button').textContent = '📷 ลองเปิดกล้องอีกครั้ง';
      }
    });

    $('pointer-mode-button')?.addEventListener('click', () => {
      document.body.classList.add('pointer-mode');
      hideStartScreen();
      setText('status-text', 'แตะหรือคลิกเครื่องหมายคำตอบที่ต้องการ');
      setText('result-dock-text', 'โหมดเมาส์ / หน้าจอสัมผัส');
      toast('เริ่มเล่นด้วยการแตะหรือคลิกได้เลย ✨');
    });

    $('replay-button')?.addEventListener('click', restartGame);
    $('return-home-button')?.addEventListener('click', () => window.location.reload());
  }

  window.addEventListener('beforeunload', () => {
    state.running = false;
    state.stream?.getTracks().forEach(track => track.stop());
    state.hands?.close?.();
  });

  window.addEventListener('DOMContentLoaded', async () => {
    state.questions = await loadQuestions();
    bindControls();
    renderQuestion();
  });
})();

(() => {
  const $ = id => document.getElementById(id);
  let dialogTrigger = null;
  let busy = false;

  function playUiPop(frequency = 540) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const context = new AudioCtx();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.45, now + .07);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.055, now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .09);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + .1);
      oscillator.addEventListener('ended', () => context.close(), {once:true});
    } catch (_) {}
  }

  function press(button, callback, frequency = 540) {
    if (!button || busy) return;
    busy = true;
    button.classList.add('is-pressed');
    playUiPop(frequency);
    if (navigator.vibrate) navigator.vibrate(18);
    window.setTimeout(() => {
      button.classList.remove('is-pressed');
      busy = false;
      callback();
    }, 190);
  }

  function openDialog(title, html, showFullscreen = false, trigger = null) {
    const dialog = $('home-dialog');
    if (!dialog) return;
    dialogTrigger = trigger;
    $('home-dialog-title').textContent = title;
    $('home-dialog-body').innerHTML = html;
    $('home-fullscreen').hidden = !showFullscreen;
    dialog.hidden = false;
    $('home-close').focus({preventScroll:true});
  }

  function closeDialog() {
    const dialog = $('home-dialog');
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    dialogTrigger?.focus({preventScroll:true});
  }

  function startFromHome() {
    const home = $('home-screen');
    const starter = $('start-screen');
    const video = $('home-video');
    home?.classList.add('leaving');
    window.setTimeout(() => {
      home?.classList.add('hidden');
      video?.pause();
      document.body.classList.add('game-active');
      if (starter) {
        starter.classList.remove('hidden');
        starter.removeAttribute('aria-hidden');
      }
      const cameraButton = $('start-button');
      if (cameraButton && !cameraButton.disabled) cameraButton.click();
    }, 250);
  }

  function toggleHomeSound(button) {
    const video = $('home-video');
    if (!video) return;
    const turnOn = video.muted;
    video.muted = !turnOn;
    video.volume = .58;
    button.classList.toggle('is-on', turnOn);
    button.setAttribute('aria-pressed', String(turnOn));
    button.setAttribute('aria-label', turnOn ? 'ปิดเสียงหน้าแรก' : 'เปิดเสียงหน้าแรก');
    playUiPop(turnOn ? 660 : 360);
    if (turnOn) video.play().catch(() => {
      video.muted = true;
      button.classList.remove('is-on');
      button.setAttribute('aria-pressed', 'false');
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    const video = $('home-video');
    const loading = $('home-loading');
    const start = $('home-start');
    const how = $('home-how');
    const settings = $('home-settings');
    const sound = $('home-sound');

    const markReady = () => loading?.classList.add('ready');
    if (video) {
      video.addEventListener('canplay', markReady, {once:true});
      video.addEventListener('playing', markReady, {once:true});
      video.addEventListener('error', () => {
        if (loading) loading.innerHTML = '<span aria-hidden="true">★</span> ใช้ภาพนิ่งแทนภาพเคลื่อนไหว';
      }, {once:true});
      video.play().catch(() => markReady());
    }

    start?.addEventListener('click', () => press(start, startFromHome, 620));
    how?.addEventListener('click', () => press(how, () => openDialog('วิธีเล่น', `
      <ol>
        <li>กด <strong>เริ่มเกม</strong> แล้วอนุญาตให้เบราว์เซอร์ใช้กล้อง</li>
        <li>ยกมือขึ้นหน้ากล้อง ให้เห็นมือชัดและมีแสงเพียงพอ</li>
        <li>นำปลายนิ้วไปเหนือเครื่องหมาย <strong>&lt; = &gt;</strong></li>
        <li><strong>จีบนิ้วโป้งกับนิ้วชี้</strong> เพื่อหยิบ แล้วลากไปยังช่องกลาง</li>
        <li>คลายนิ้วเพื่อวางคำตอบ หรือกดปุ่มด้วยเมาส์/หน้าจอสัมผัส</li>
        <li>เมื่อตอบแล้ว เกมจะแสดงคำว่า <strong>ถูก</strong> หรือ <strong>ผิด</strong> พร้อมภาพเฉลยเทียบกับ 1/2</li>
      </ol>
    `, false, how), 500));

    settings?.addEventListener('click', () => press(settings, () => openDialog('ตั้งค่าการเล่น', `
      <p>แนะนำให้เล่นในแนวนอน วางกล้องให้อยู่ระดับเดียวกับมือ และให้พื้นหลังไม่รกเกินไป</p>
      <p>หากไม่สะดวกเปิดกล้อง สามารถเลือก <strong>เล่นด้วยเมาส์ / หน้าจอสัมผัส</strong> ได้ในหน้าถัดไป</p>
    `, true, settings), 440));

    sound?.addEventListener('click', () => toggleHomeSound(sound));
    $('home-close')?.addEventListener('click', closeDialog);
    $('home-dialog')?.addEventListener('click', event => {
      if (event.target === $('home-dialog')) closeDialog();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeDialog();
    });

    $('home-fullscreen')?.addEventListener('click', async () => {
      try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
        else await document.exitFullscreen();
      } catch (_) {}
    });
  });
})();

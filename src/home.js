(() => {
  const $ = id => document.getElementById(id);

  function openDialog(title, html, mode='info') {
    const dialog = $('home-dialog');
    $('home-dialog-title').textContent = title;
    $('home-dialog-body').innerHTML = html;
    const fullscreen = $('home-fullscreen');
    fullscreen.hidden = mode !== 'settings';
    dialog.hidden = false;
  }

  function closeDialog() {
    $('home-dialog').hidden = true;
  }

  window.addEventListener('DOMContentLoaded', () => {
    const home = $('home-screen');

    $('home-start').addEventListener('click', () => {
      home.classList.add('hidden');
      const cameraStart = $('start-button');
      if (cameraStart) cameraStart.click();
    });

    $('home-how').addEventListener('click', () => {
      openDialog('วิธีเล่น', `
        <ol>
          <li>กด <strong>เริ่มเกม</strong> แล้วอนุญาตให้เบราว์เซอร์ใช้กล้อง</li>
          <li>ยกมือขึ้นหน้ากล้อง ให้ระบบมองเห็นมือชัดเจน</li>
          <li>นำมือไปที่สัญลักษณ์ <strong>&lt; = &gt;</strong></li>
          <li><strong>จีบนิ้วโป้งกับนิ้วชี้</strong> เพื่อหยิบสัญลักษณ์</li>
          <li>ลากไปวางในช่องตรงกลางระหว่างเศษส่วน แล้วคลายนิ้ว</li>
          <li>ถ้าไม่แน่ใจ กด Hint เพื่อเทียบเศษส่วนกับ <strong>1/2</strong></li>
        </ol>
      `);
    });

    $('home-settings').addEventListener('click', () => {
      openDialog('ตั้งค่า', `
        <p>เพื่อให้การตรวจจับมือทำงานได้ดี แนะนำให้เล่นในแนวนอนและให้มีแสงสว่างพอสมควร</p>
        <p>สามารถเปิดโหมดเต็มหน้าจอเพื่อให้พื้นที่เล่นกว้างขึ้นได้</p>
      `, 'settings');
    });

    $('home-close').addEventListener('click', closeDialog);
    $('home-dialog').addEventListener('click', e => {
      if (e.target === $('home-dialog')) closeDialog();
    });

    $('home-fullscreen').addEventListener('click', async () => {
      try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
        else await document.exitFullscreen();
      } catch (_) {}
    });
  });
})();

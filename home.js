(() => {
  const $ = id => document.getElementById(id);

  function openDialog(title, html, showFullscreen=false){
    const dlg=$('home-dialog');
    $('home-dialog-title').textContent=title;
    $('home-dialog-body').innerHTML=html;
    $('home-fullscreen').hidden=!showFullscreen;
    dlg.hidden=false;
  }

  function closeDialog(){ $('home-dialog').hidden=true; }

  function startFromHome(){
    const home=$('home-screen');
    const starter=$('start-screen');
    if(home) home.classList.add('hidden');
    if(starter){ starter.classList.remove('hidden'); starter.removeAttribute('aria-hidden'); }
  }

  window.addEventListener('DOMContentLoaded',()=>{
    $('home-start')?.addEventListener('click',startFromHome);
    $('home-how')?.addEventListener('click',()=>openDialog('วิธีเล่น',`<ol><li>กด <strong>เริ่มเกม</strong> แล้วอนุญาตการใช้กล้อง</li><li>ยกมือขึ้นหน้ากล้อง</li><li>จีบนิ้วโป้งกับนิ้วชี้เหนือสัญลักษณ์ &lt; = &gt;</li><li>ลากไปวางตรงช่องกลางระหว่างเศษส่วนแล้วปล่อยนิ้ว</li><li>ถ้ายังไม่แน่ใจ กด Hint เพื่อเทียบกับ 1/2</li></ol>`));
    $('home-settings')?.addEventListener('click',()=>openDialog('ตั้งค่า',`<p>ใช้โหมดแนวนอนเพื่อเห็นหน้าเกมเต็มที่สุด และตรวจสอบว่าเบราว์เซอร์อนุญาตสิทธิ์กล้องแล้ว</p>`,true));
    $('home-close')?.addEventListener('click',closeDialog);
    $('home-fullscreen')?.addEventListener('click',async()=>{
      try{ if(!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); }catch(e){}
    });
    $('home-dialog')?.addEventListener('click',e=>{ if(e.target===$('home-dialog')) closeDialog(); });
  });
})();

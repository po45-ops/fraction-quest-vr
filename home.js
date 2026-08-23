(() => {
  const $ = id => document.getElementById(id);

  async function loadHomeArtwork(){
    const image=document.querySelector('.home-art');
    if(!image) return;
    try{
      const parts=await Promise.all(
        Array.from({length:7},(_,i)=>
          fetch(`./assets/home/home-image.b64.${i+1}?v=20260824`,{cache:'force-cache'}).then(response=>{
            if(!response.ok) throw new Error(`home artwork part ${i+1} failed`);
            return response.text();
          })
        )
      );
      image.src=`data:image/webp;base64,${parts.map(part=>part.trim()).join('')}`;
    }catch(error){
      console.warn('Using fallback home artwork.',error);
    }
  }

  function openDialog(title, html, showFullscreen=false){
    const dlg=$('home-dialog');
    if(!dlg) return;
    $('home-dialog-title').textContent=title;
    $('home-dialog-body').innerHTML=html;
    $('home-fullscreen').hidden=!showFullscreen;
    dlg.hidden=false;
  }

  function closeDialog(){ const dlg=$('home-dialog'); if(dlg) dlg.hidden=true; }

  function startFromHome(){
    const home=$('home-screen');
    const starter=$('start-screen');
    if(home) home.classList.add('hidden');
    if(starter){
      starter.classList.remove('hidden');
      starter.removeAttribute('aria-hidden');
    }
    const cameraButton=$('start-button');
    if(cameraButton && !cameraButton.disabled) cameraButton.click();
  }

  window.addEventListener('DOMContentLoaded',()=>{
    loadHomeArtwork();
    $('home-start')?.addEventListener('click',startFromHome);
    $('home-how')?.addEventListener('click',()=>openDialog('วิธีเล่น',`<ol><li>กด <strong>เริ่มเกม</strong> แล้วอนุญาตการใช้กล้อง</li><li>ยกมือขึ้นหน้ากล้อง</li><li>จีบนิ้วโป้งกับนิ้วชี้เหนือสัญลักษณ์ &lt; = &gt;</li><li>ลากไปวางตรงช่องกลางระหว่างเศษส่วนแล้วปล่อยนิ้ว</li><li>ถ้ายังไม่แน่ใจ กด Hint เพื่อเทียบกับ 1/2</li></ol>`));
    $('home-settings')?.addEventListener('click',()=>openDialog('ตั้งค่า',`<p>แนะนำให้ใช้งานในแนวนอน และตรวจสอบว่าเบราว์เซอร์อนุญาตสิทธิ์กล้องแล้ว</p>`,true));
    $('home-close')?.addEventListener('click',closeDialog);
    $('home-fullscreen')?.addEventListener('click',async()=>{
      try{ if(!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); }catch(e){}
    });
    $('home-dialog')?.addEventListener('click',e=>{ if(e.target===$('home-dialog')) closeDialog(); });
  });
})();

# Fraction Quest VR 🐰🥕

เกม WebXR สำหรับฝึก **การเปรียบเทียบเศษส่วนโดยใช้ 1/2 เป็นเกณฑ์** จากแนวโจทย์ในใบงานระดับประถมศึกษา

> เล่นได้ทั้งคอมพิวเตอร์/มือถือ และเข้าโหมด VR ผ่านเบราว์เซอร์ที่รองรับ WebXR เช่น Meta Quest Browser

## แนวคิดเกม

ผู้เล่นช่วยกระต่ายนักสำรวจผ่านด่าน “Half Bridge” โดยพิจารณาเศษส่วนสองจำนวน แล้วเลือกเครื่องหมาย `<`, `=` หรือ `>` ให้ถูกต้อง เมื่อจำเป็นสามารถกด **HINT: Compare to 1/2** เพื่อดูว่าแต่ละเศษส่วนอยู่ต่ำกว่า เท่ากับ หรือสูงกว่า 1/2 พร้อมแถบภาพ 3D

ระบบ MVP นี้มี:

- โจทย์ 14 ข้อจากใบงานต้นแบบ
- ปุ่มตอบ `<`, `=`, `>` แบบ 3D
- รองรับเมาส์/สายตา/VR laser controller
- Hint โดยใช้ `1/2` เป็น benchmark
- Fraction bar 3D พร้อมเส้นกึ่งกลาง 1/2
- คะแนน, progress, accuracy และระบบดาว
- เสียง feedback ที่สร้างจาก Web Audio โดยไม่ต้องใช้ไฟล์เสียงภายนอก
- กระต่าย 3D แบบ low-poly เป็น mascot
- โหลดโจทย์จาก `data/questions.json` และมี fallback ในโค้ด

## เล่นบนเครื่อง

เนื่องจากเกมโหลด JSON จึงควรเปิดผ่าน local web server:

```bash
python3 -m http.server 8080
```

จากนั้นเปิด `http://localhost:8080`

## เล่นบน Meta Quest

1. Deploy โฟลเดอร์นี้ขึ้น GitHub Pages หรือ static HTTPS host
2. เปิด URL ใน Meta Quest Browser
3. กดปุ่ม **Enter VR** ที่มุมขวาล่างของ A-Frame
4. ใช้ trigger ของ controller ยิง laser เลือกคำตอบ

> WebXR immersive mode ต้องใช้ HTTPS (ยกเว้น localhost)

## GitHub Pages

มี workflow ที่ `.github/workflows/pages.yml` สำหรับ deploy static site อัตโนมัติเมื่อ push ไปที่ `main` หาก Repository เปิดใช้ GitHub Pages แบบ **GitHub Actions**

## โครงสร้าง

```text
fraction-quest-vr/
├── .github/workflows/pages.yml
├── data/questions.json
├── docs/GAME_DESIGN.md
├── src/game.js
├── index.html
├── styles.css
└── README.md
```

## เป้าหมายการเรียนรู้

- เปรียบเทียบเศษส่วนที่มีตัวส่วนต่างกัน
- ใช้ 1/2 เป็นค่ามาตรฐานช่วยตัดสินใจ
- เชื่อมโยงสัญลักษณ์ `<`, `=`, `>` กับปริมาณจริง
- เรียนรู้จาก visual feedback แทนการจำคำตอบ

## เทคโนโลยี

- A-Frame / WebXR
- Vanilla JavaScript
- HTML/CSS
- GitHub Pages

## Roadmap

- [ ] Grab-and-drop เครื่องหมายด้วย VR hand/controller
- [ ] ด่าน Fraction Kitchen และ Fraction Castle
- [ ] Teacher mode สำหรับเพิ่มโจทย์จากหน้าเว็บ
- [ ] บันทึกผลรายบุคคลและ export CSV
- [ ] Thai voice feedback
- [ ] Hand tracking บน Meta Quest
- [ ] Adaptive difficulty ตามผลการตอบ

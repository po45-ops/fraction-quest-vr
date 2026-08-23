# Fraction Quest AR 🐰📷

เกม AR ผ่านกล้องสำหรับฝึก **การเปรียบเทียบเศษส่วนโดยใช้ 1/2 เป็นเกณฑ์** โดยผู้เล่นใช้มือจริงหน้ากล้องเพื่อหยิบสัญลักษณ์ `<`, `=` หรือ `>` แล้วลากไปวางระหว่างเศษส่วน

> Repository ยังใช้ชื่อ `fraction-quest-vr` เดิมตามที่สร้างไว้ แต่ตัวเกมถูกเปลี่ยนจาก VR เป็น **Camera AR + Hand Tracking** แล้ว

## วิธีเล่น

1. เปิดเกมผ่าน HTTPS หรือ GitHub Pages
2. กด **เปิดกล้องและเริ่มเกม**
3. อนุญาตสิทธิ์กล้อง
4. ยกมือขึ้นหน้ากล้อง
5. จีบนิ้วโป้งกับนิ้วชี้เพื่อหยิบ `<`, `=` หรือ `>`
6. ขยับมือไปยังช่องกลางโจทย์
7. คลายนิ้วเพื่อวางคำตอบ

สามารถคลิกปุ่มด้วยเมาส์/แตะหน้าจอเป็น fallback ได้

## ระบบใน MVP

- Camera AR แบบเต็มหน้าจอ
- MediaPipe Hands ตรวจจับมือ 1 ข้าง
- Pinch gesture สำหรับ grab-and-drop
- Hand cursor และ skeleton overlay
- โจทย์ 14 ข้อจากใบงานต้นแบบ
- Hint เทียบเศษส่วนกับ `1/2`
- Fraction bars
- คะแนน ดาว และ feedback เสียง
- Responsive UI สำหรับมือถือ แท็บเล็ต และคอมพิวเตอร์
- GitHub Pages workflow

## การประมวลผลกล้อง

วิดีโอถูกใช้สำหรับตรวจจับตำแหน่งมือภายในหน้าเว็บ ไม่ได้มีระบบอัปโหลดหรือบันทึกวิดีโอในโค้ดเกมนี้

## เล่นบนเครื่อง

```bash
python3 -m http.server 8080
```

จากนั้นเปิด `http://localhost:8080`

> บนมือถือและ deployment จริง ควรใช้ HTTPS เพื่อให้ browser อนุญาต `getUserMedia()`

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

## Technology

- HTML / CSS / JavaScript
- MediaPipe Hands
- Browser Camera API (`getUserMedia`)
- GitHub Pages

## Roadmap

- [ ] ปรับ hand tracking ให้รองรับ 2 มือ
- [ ] เพิ่ม gesture animation และ particle effects
- [ ] เพิ่มด่าน Fraction Kitchen / Half Bridge / Fraction Castle
- [ ] รองรับ Thai voice feedback
- [ ] Teacher mode และ export ผลการเรียน
- [ ] Adaptive difficulty
- [ ] PWA สำหรับติดตั้งบนมือถือ

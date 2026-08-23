# Fraction Quest VR — Game Design

## Player fantasy
ผู้เล่นคือ “นักสำรวจเศษส่วน” ที่ช่วยกระต่ายสร้างสะพานกลับปราสาท โดยเลือก `<`, `=` หรือ `>` ให้ถูกต้อง

## Core loop
1. เห็นเศษส่วน 2 จำนวน
2. เทียบแต่ละจำนวนกับ `1/2`
3. เลือกเครื่องหมาย
4. รับ feedback ทันที
5. ใช้ Hint เพื่อดู Fraction Bar 3D
6. เก็บดาวและดูผลสรุป

## Learning design
สำหรับเศษส่วน `a/b`:
- `2a < b` ⇒ น้อยกว่า 1/2
- `2a = b` ⇒ เท่ากับ 1/2
- `2a > b` ⇒ มากกว่า 1/2

## Scoring
- ถูกครั้งแรก: 3 ดาว
- ถูกครั้งที่สอง: 2 ดาว
- ใช้ Hint หรือพลาดหลายครั้ง: 1 ดาว

## VR interaction
MVP รองรับ desktop cursor และ VR laser controller ผ่าน WebXR ส่วน roadmap คือ grab-and-drop, haptics และ hand tracking

## Visual direction
3D cartoon educational adventure, ฉากฟ้า/เขียวอ่อน, ปุ่มใหญ่ contrast สูง และกระต่าย low-poly เป็น mascot

## Roadmap scenes
- Rabbit Training
- Half Bridge (MVP)
- Fraction Kitchen
- Fraction Castle

## Teacher mode roadmap
เพิ่ม/ลบโจทย์, เลือก skill, ดู accuracy รายข้อ, export CSV และสร้าง session สำหรับนักเรียน

# 🔧 คำแนะนำ Setup Environment Variables

## 📝 สำหรับ Local Development

คุณต้องสร้างไฟล์ `.env.local` เพื่อใช้งาน Upstash Redis ใน local:

### **ขั้นตอน:**

1. **สร้างไฟล์ `.env.local`** ในโฟลเดอร์ `landing-page/`

2. **คัดลอกข้อมูลนี้ใส่ในไฟล์:**

```env
KV_REST_API_URL="https://classic-falcon-20399.upstash.io"
KV_REST_API_TOKEN="AU-vAAIncDJiNDFmMzhlYTIwN2U0N2ZkYTQyNzNhY2FhODk3MDIxNHAyMjAzOTk"
KV_REST_API_READ_ONLY_TOKEN="Ak-vAAIgcDJxGMdUL9665bfq7lriFJafMOEMczedN1cB6qoGUD_DMQ"
```

3. **บันทึกไฟล์**

4. **รันคำสั่ง:**

```bash
cd landing-page
npm install
npm run seed
npm run dev
```

---

## ✅ สำหรับ Vercel (ทำเสร็จแล้ว!)

คุณได้เพิ่ม environment variables ใน Vercel แล้ว:
- ✅ KV_REST_API_URL
- ✅ KV_REST_API_TOKEN  
- ✅ KV_REST_API_READ_ONLY_TOKEN

**ไม่ต้องทำอะไรเพิ่มเติม!** แค่ push code แล้ว deploy ได้เลย 🚀

---

## 🔒 ความปลอดภัย

⚠️ **อย่า commit ไฟล์ `.env.local` ลง git!**

ไฟล์นี้จะถูก ignore อัตโนมัติ (อยู่ใน `.gitignore`)

---

## 📍 ตำแหน่งไฟล์

```
landing-page/
├── .env.local          ← สร้างไฟล์นี้ (สำหรับ local เท่านั้น)
├── src/
├── package.json
└── ...
```

---

## ✨ ทดสอบว่าใช้งานได้

หลังรัน `npm run dev` ควรเห็นใน console:

```
🔴 Using Upstash Redis: https://classic-falcon-20399.upstash.io
```

แล้วเปิด http://localhost:3000 ควรเห็นรายการ websites

---

เสร็จแล้ว! 🎉



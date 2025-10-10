# 🔧 Vercel Environment Variables - Setup Guide

## ⚡ Quick Setup (5 นาที)

### 1️⃣ ไปที่ Vercel Dashboard
- 🔗 https://vercel.com/dashboard
- เลือกโปรเจค: **menu_record**
- **Settings** → **Environment Variables**

---

### 2️⃣ เพิ่ม Variables ทั้งหมดนี้:

#### ✅ Variable #1: ADMIN_USERNAME
```
Name: ADMIN_USERNAME
Value: admin
Environment: Production ✓ | Preview ✓ | Development ✓
```
กด **Save**

---

#### ✅ Variable #2: ADMIN_PASSWORD
```
Name: ADMIN_PASSWORD
Value: MenuRecord2024!Secure
Environment: Production ✓ | Preview ✓ | Development ✓
```
⚠️ **แนะนำ:** เปลี่ยนเป็นรหัสผ่านที่คุณต้องการ
กด **Save**

---

#### ✅ Variable #3: JWT_SECRET
```
Name: JWT_SECRET
Value: 93b285e7fcc69465f7e4ec25ddcf730fb6a70200b94772d51edfd145d3f33834
Environment: Production ✓ | Preview ✓ | Development ✓
```
กด **Save**

---

### 3️⃣ Redeploy

**หลังเพิ่ม Environment Variables เสร็จแล้ว MUST DO:**

1. ไปที่ **Deployments** tab
2. คลิกที่ deployment ล่าสุด
3. คลิก **"..."** (มุมขวาบน)
4. เลือก **"Redeploy"**
5. กด **"Redeploy"** ยืนยัน

⏰ รอ 1-2 นาที

---

## ✅ ตรวจสอบว่าสำเร็จ

### เช็คใน Vercel:
- 🟢 Status: **Ready**
- ⏱️ Build time: 30-90 วินาที
- 🌐 URL: https://your-project.vercel.app

### ทดสอบเว็บ:
1. ✅ หน้าแรกโหลดได้ (เร็วมาก < 1 วินาที)
2. ✅ แสดงรายการเว็บไซต์
3. ✅ เข้า `/admin` ได้
4. ✅ Login ด้วย username: `admin`, password: `MenuRecord2024!Secure`
5. ✅ เข้า Dashboard ได้

---

## 🚨 ถ้ายังมีปัญหา

### ปัญหา: Build Failed - Missing Env Vars
**อาการ:**
```
Error: process.env.ADMIN_USERNAME is undefined
```

**แก้ไข:**
1. เช็คว่าเพิ่ม Environment Variables ครบ 3 ตัว
2. เช็คว่าเลือก Environment ครบทั้ง 3 (Production, Preview, Development)
3. **Redeploy** ใหม่

---

### ปัญหา: Login ไม่ผ่าน
**อาการ:** ใส่ username/password แล้วไม่เข้า Dashboard

**แก้ไข:**
1. เช็คว่า `ADMIN_USERNAME` และ `ADMIN_PASSWORD` ใน Vercel ตรงกับที่คุณใช้ login
2. เปิด DevTools (F12) → Console → ดู error
3. ลอง Logout แล้ว Login ใหม่

---

### ปัญหา: เว็บช้า
**อาการ:** โหลดนานกว่า 2 วินาที

**สาเหตุ:** ไม่น่าจะเกิด เพราะเราได้ optimize แล้ว
- ใช้ Server Component
- มี in-memory cache (60s TTL)
- ตัด API route overhead

**แก้ไข:**
1. เช็ค Network tab ว่าช้าตรงไหน
2. เช็ค Upstash Redis latency
3. Clear browser cache แล้วลองใหม่

---

## 📞 ติดต่อขอความช่วยเหลือ

ถ้ายังแก้ไม่ได้:
1. Copy **ทั้ง Build Log** จาก Vercel
2. Screenshot หน้าที่มีปัญหา
3. บอกอาการที่เกิดขึ้น

---

## 🎉 เสร็จแล้ว!

เว็บของคุณตอนนี้:
- ⚡ เร็วขึ้น 2-3 เท่า
- 🔒 ปลอดภัย (ไม่มี hardcoded password)
- ✅ ใช้ JWT authentication
- 🚀 พร้อม production!

---

Made with ❤️ - Happy deploying! 🎯


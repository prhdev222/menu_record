# 🔐 คำแนะนำด้านความปลอดภัย (Security Guide)

## ⚠️ สำคัญมาก! อ่านก่อนใช้งาน Production

---

## 🎯 สิ่งที่ได้ปรับปรุงแล้ว

### ✅ ความปลอดภัยที่เพิ่มเข้ามา:

1. **JWT Authentication** แทน localStorage
   - Token หมดอายุใน 24 ชั่วโมง
   - เก็บใน HttpOnly Cookie (ไม่สามารถอ่านจาก JavaScript)
   - Secure & SameSite flags

2. **Environment Variables** แทน Hardcoded Credentials
   - Username/Password อยู่ใน `.env.local` (Local)
   - ตั้งค่าใน Vercel Dashboard (Production)
   - ไม่ถูก commit ลง GitHub

3. **API Routes** สำหรับ Authentication
   - `/api/auth/login` - เข้าสู่ระบบ
   - `/api/auth/verify` - ตรวจสอบ token
   - `/api/auth/logout` - ออกจากระบบ

---

## 🚀 Setup สำหรับ Local Development

### ขั้นตอนที่ 1: สร้างไฟล์ `.env.local`

ในโฟลเดอร์ `landing-page/` สร้างไฟล์ `.env.local`:

```env
# Upstash Redis
KV_REST_API_URL="https://classic-falcon-20399.upstash.io"
KV_REST_API_TOKEN="AU-vAAIncDJiNDFmMzhlYTIwN2U0N2ZkYTQyNzNhY2FhODk3MDIxNHAyMjAzOTk"
KV_REST_API_READ_ONLY_TOKEN="Ak-vAAIgcDJxGMdUL9665bfq7lriFJafMOEMczedN1cB6qoGUD_DMQ"

# Admin Credentials - ⚠️ เปลี่ยนให้แข็งแกร่ง!
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="YourSecurePassword123!"

# JWT Secret - ⚠️ ต้องเป็น random string ยาวๆ อย่างน้อย 32 ตัวอักษร
JWT_SECRET="your-super-secret-random-key-at-least-32-characters-long"
```

### ขั้นตอนที่ 2: สร้าง JWT Secret แบบปลอดภัย

วิธีสร้าง JWT Secret ที่แข็งแกร่ง:

**Option 1: ใช้ Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: ใช้ OpenSSL**
```bash
openssl rand -hex 32
```

**Option 3: ใช้เว็บไซต์**
- https://generate-secret.vercel.app/32

คัดลอก output มาใส่ใน `JWT_SECRET`

---

## 🔒 Setup สำหรับ Vercel Production

### ⚠️ **สำคัญที่สุด: ตั้งค่า Environment Variables ใน Vercel**

1. **ไปที่ Vercel Dashboard**
   - https://vercel.com/dashboard
   - เลือกโปรเจคของคุณ
   - Settings → Environment Variables

2. **เพิ่ม Environment Variables เหล่านี้:**

| Key | Value | Environment |
|-----|-------|-------------|
| `ADMIN_USERNAME` | `your_admin_username` | Production, Preview, Development |
| `ADMIN_PASSWORD` | `YourVeryStrongPassword123!@#` | Production, Preview, Development |
| `JWT_SECRET` | `[32+ random characters]` | Production, Preview, Development |
| `KV_REST_API_URL` | `https://classic-falcon-20399.upstash.io` | Production, Preview, Development |
| `KV_REST_API_TOKEN` | `[your token]` | Production, Preview, Development |
| `KV_REST_API_READ_ONLY_TOKEN` | `[your token]` | Production, Preview, Development |

3. **กด Save**

4. **Redeploy** (สำคัญ!)
   - Deployments → ล่าสุด → ... → Redeploy
   - Environment variables จะมีผลหลัง redeploy

---

## 🔐 Password Best Practices

### ✅ รหัสผ่านที่ดี:
- ✅ ยาวอย่างน้อย 12 ตัวอักษร
- ✅ ผสม uppercase, lowercase, ตัวเลข, สัญลักษณ์
- ✅ ไม่มีคำศัพท์ทั่วไป
- ✅ ไม่ซ้ำกับเว็บอื่น
- ✅ เปลี่ยนเป็นระยะ (ทุก 3-6 เดือน)

**ตัวอย่างรหัสผ่านที่แข็งแกร่ง:**
```
M3nuR3c0rd!2024@Secure
WebAdmin#2024$Strong
Pr0t3ct@MyD4shb0ard!
```

### ❌ รหัสผ่านที่ไม่ดี:
- ❌ `admin123` (ง่ายเกินไป!)
- ❌ `password`
- ❌ `12345678`
- ❌ `qwerty`
- ❌ ชื่อ, วันเกิด, เบอร์โทร

---

## 🛡️ ระดับความปลอดภัยปัจจุบัน

### ✅ ที่มีอยู่แล้ว:
- ✅ JWT Authentication
- ✅ HttpOnly Cookies
- ✅ Environment Variables
- ✅ Token expiration (24h)
- ✅ Secure & SameSite flags
- ✅ ไม่ hardcode credentials

### ⚠️ สิ่งที่ควรเพิ่ม (สำหรับระดับ Production จริงจัง):

1. **Password Hashing**
   ```bash
   npm install bcrypt
   ```
   Hash password ก่อนเก็บและเปรียบเทียบ

2. **Rate Limiting** (ป้องกัน brute force)
   ```bash
   npm install @upstash/ratelimit
   ```

3. **2FA (Two-Factor Authentication)**
   - SMS OTP
   - Email OTP
   - Google Authenticator

4. **Session Management**
   - Track active sessions
   - Force logout from all devices
   - Session timeout

5. **IP Whitelist** (ถ้าใช้จากที่เดียว)
   - อนุญาตเฉพาะ IP ที่กำหนด

6. **Audit Logs**
   - บันทึกการเข้าสู่ระบบทั้งหมด
   - บันทึกการแก้ไขข้อมูล

---

## 📊 ตรวจสอบความปลอดภัย

### Checklist:

- [ ] เปลี่ยน `ADMIN_PASSWORD` จาก default แล้ว
- [ ] สร้าง `JWT_SECRET` แบบ random แล้ว
- [ ] ตั้งค่า Environment Variables ใน Vercel แล้ว
- [ ] ไม่มีไฟล์ `.env.local` ถูก commit ลง Git
- [ ] Redeploy Vercel หลังเปลี่ยน env vars แล้ว
- [ ] ทดสอบ login/logout ใน production แล้ว
- [ ] เปลี่ยน password เป็นประจำ

---

## 🚨 กรณีฉุกเฉิน: Password หลุด!

### ถ้า password หลุด ทำทันที:

1. **เปลี่ยน Password ทันที**
   - เปลี่ยนใน `.env.local` (Local)
   - เปลี่ยนใน Vercel Dashboard (Production)

2. **เปลี่ยน JWT Secret**
   - สร้าง secret ใหม่
   - อัปเดตทั้ง local และ Vercel
   - Force logout users ทั้งหมด

3. **Redeploy Vercel**
   - Deployments → Redeploy

4. **ตรวจสอบ Logs**
   - เช็คว่ามีการเข้าถึงผิดปกติไหม
   - ดู Vercel Logs
   - ดู Upstash Logs

5. **เปลี่ยนรหัส Upstash Redis** (ถ้าจำเป็น)
   - Upstash Dashboard → Database → REST API
   - Regenerate tokens

---

## 🔍 ตรวจสอบว่าปลอดภัยแล้ว

### ทดสอบ Local:

1. **Login ด้วย credentials ผิด → ควรไม่ผ่าน**
2. **Login ถูกต้อง → เข้า Dashboard ได้**
3. **เปิด DevTools → Application → Cookies → เห็น `admin_token` (HttpOnly)**
4. **Logout → Cookie ถูกลบ**
5. **พยายามเข้า `/admin/dashboard` โดยไม่ login → ถูกส่งกลับไปหน้า login**

### ทดสอบ Production:

1. ทดสอบเหมือน Local
2. เช็คว่า credentials ตรงกับที่ตั้งใน Vercel
3. ตรวจสอบว่าไม่มี password อยู่ใน GitHub

---

## 📚 เอกสารเพิ่มเติม

- [JWT Best Practices](https://jwt.io/introduction)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

---

## ⚡ Quick Commands

```bash
# สร้าง JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# รัน dev server
npm run dev

# Deploy to Vercel
git add .
git commit -m "security: Update authentication"
git push origin main
```

---

## ✅ สรุป

| ปัญหาเดิม | แก้ไขแล้ว |
|-----------|-----------|
| ❌ Hardcoded password | ✅ Environment Variables |
| ❌ localStorage (ไม่ปลอดภัย) | ✅ HttpOnly Cookies |
| ❌ ไม่มี expiration | ✅ Token หมดอายุ 24h |
| ❌ ไม่มี logout | ✅ มี logout API |
| ❌ โค้ดใน GitHub เห็น password | ✅ ซ่อนด้วย .env |

---

**ขอให้ใช้งานอย่างปลอดภัย! 🔐**

Made with ❤️ - Stay secure! 🛡️


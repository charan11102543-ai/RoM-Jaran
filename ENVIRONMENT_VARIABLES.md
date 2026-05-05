# Environment Variables Required

Copy ค่าเหล่านี้ไปไฟล์ `.env` (สร้างเองใน root โปรเจค)

---

## 🔴 Required (ต้องมี)

```bash
# Database - ใส่ค่าจริงจาก PostgreSQL
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"

# OpenAI API Key - ได้จาก https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"

# NextAuth Secret - สร้างด้วยคำสั่ง: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"

# NextAuth URL - URL ของเว็บ
NEXTAUTH_URL="http://localhost:3000"
```

---

## 👤 Admin Account (สำหรับ login dashboard)

```bash
# อีเมลและรหัสผ่านสำหรับ admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

---

## ⚪ Optional (มีค่า default อยู่แล้ว)

```bash
# OpenAI Model (default: gpt-4o-mini)
OPENAI_MODEL="gpt-4o-mini"

# Webhook URL สำหรับส่ง events (optional)
WEBHOOK_URL="https://your-webhook-endpoint.com/webhook"

# Lead Qualification (default: 1000 THB)
QUALIFICATION_BUDGET_THRESHOLD="1000"

# Booking Settings
BOOKING_SLOT_MINUTES="60"
BOOKING_WINDOW_DAYS="14"

# Business Hours (default: 09:00-18:00)
BUSINESS_HOURS_START="09:00"
BUSINESS_HOURS_END="18:00"
BUSINESS_TIMEZONE="Asia/Bangkok"
BUSINESS_DAYS="1,2,3,4,5"  # 1=Mon, 5=Fri (Mon-Fri)
```

---

## 📝 ตัวอย่างค่าจริง (สำหรับ development)

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/aiautomation"
OPENAI_API_KEY="sk-abc123def456ghi789"
NEXTAUTH_SECRET="my-super-secret-key-for-nextauth"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@aiautomation.com"
ADMIN_PASSWORD="Admin123!"
```

---

## 🚀 ขั้นตอนหลังสร้าง .env

```bash
# 1. สร้าง Prisma Client
pnpm prisma:generate

# 2. สร้าง admin user
pnpm db:seed

# 3. รัน development server
pnpm dev
```

---

## ⚠️ คำเตือน

**อย่า commit ไฟล์ `.env` ขึ้น git!** 
- ไฟล์ `.env` มีใน `.gitignore` แล้ว
- เก็บ OpenAI API Key และ Database URL เป็นความลับ

---

## 📋 รายการตัวแปรทั้งหมดที่ใช้ในโค้ด

| ตัวแปร | ใช้ที่ไหน | จำเป็น? |
|--------|----------|---------|
| `DATABASE_URL` | `lib/prisma.ts`, `prisma/seed.ts` | ✅ จำเป็น |
| `OPENAI_API_KEY` | `app/api/chat/route.ts` | ✅ จำเป็น |
| `OPENAI_MODEL` | `app/api/chat/route.ts` | ❌ มี default |
| `NEXTAUTH_SECRET` | `app/api/auth/options.ts` | ✅ จำเป็น |
| `NEXTAUTH_URL` | `app/api/auth/options.ts` | ✅ จำเป็น |
| `ADMIN_EMAIL` | `prisma/seed.ts` | ✅ จำเป็น (seed) |
| `ADMIN_PASSWORD` | `prisma/seed.ts` | ✅ จำเป็น (seed) |
| `WEBHOOK_URL` | `lib/webhook.ts` | ❌ Optional |
| `QUALIFICATION_BUDGET_THRESHOLD` | `lib/qualification.ts` | ❌ มี default (1000) |
| `BOOKING_SLOT_MINUTES` | `lib/booking.ts` | ❌ มี default (60) |
| `BOOKING_WINDOW_DAYS` | `lib/booking.ts` | ❌ มี default (14) |
| `BUSINESS_HOURS_START` | `lib/booking.ts` | ❌ มี default (09:00) |
| `BUSINESS_HOURS_END` | `lib/booking.ts` | ❌ มี default (18:00) |
| `BUSINESS_TIMEZONE` | `lib/booking.ts` | ❌ มี default (Asia/Bangkok) |
| `BUSINESS_DAYS` | `lib/booking.ts` | ❌ มี default (1,2,3,4,5) |

# Client Deployment Runbook

คู่มือ deploy ระบบให้ลูกค้า 1 ราย ภายใน 1 วันทำการ

## Pre-flight

- ได้รับ payment สำหรับ Setup (15,000 บาท) แล้ว
- ได้ข้อมูลลูกค้า: ชื่อคลินิก, business hours, timezone, ช่องทาง lead, ผู้ดูแลระบบ (email)
- มี GitHub repo access + Vercel/Railway account ของ agency

## Step 1 — เตรียม branch

```bash
git checkout -b client/<clinic-slug>
git push -u origin client/<clinic-slug>
```

ทุกการแก้เฉพาะลูกค้า (เช่น branding) commit ลง branch นี้ — ห้าม merge กลับ `main`

## Step 2 — Provision PostgreSQL

ทางเลือก (ราคา/ง่าย):

1. **Supabase** (แนะนำ free tier ก่อน) — สร้าง project ใหม่ → copy `DATABASE_URL` (ใช้ pooled connection สำหรับ serverless)
2. **Railway** — `railway add postgresql` → copy `DATABASE_URL`
3. **Neon** — สร้าง branch ใหม่ → copy connection string

## Step 3 — ตั้ง Environment Variables

อ้างอิง [.env.example](../.env.example) — สิ่งที่ต้องตั้งให้ลูกค้า:

**Required:**
- `DATABASE_URL` (จาก step 2)
- `OPENAI_API_KEY` (agency key หรือคีย์ของลูกค้า)
- `NEXTAUTH_SECRET` — generate: `openssl rand -base64 32`
- `NEXTAUTH_URL` — production domain (เช่น `https://<clinic>.ourplatform.com`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials สำหรับลูกค้า (ส่งให้ลูกค้าผ่านช่องทางปลอดภัย)

**Business config:**
- `BUSINESS_NAME` — ชื่อคลินิก
- `BUSINESS_TIMEZONE` — `Asia/Bangkok`
- `BUSINESS_HOURS_START` / `BUSINESS_HOURS_END` — เวลาเปิด-ปิด
- `BUSINESS_DAYS` — วันเปิด (e.g. `1,2,3,4,5,6` สำหรับจันทร์-เสาร์)
- `BOOKING_SLOT_MINUTES` — ความยาว slot (เช่น `30` หรือ `60`)
- `QUALIFICATION_BUDGET_THRESHOLD` — งบขั้นต่ำที่ถือว่า qualified (เช่น `5000`)

**Optional — เปิดได้เมื่อพร้อม:**
- `WEBHOOK_URL` — n8n webhook สำหรับ lead.created
- `ADMIN_NOTIFY_WEBHOOK_URL` — Slack/Discord สำหรับแจ้งทีมขาย
- `BUSINESS_LINE_OA_URL` — link LINE OA ของคลินิก
- `BUSINESS_CONTACT_EMAIL` — email contact แสดงบน footer

## Step 4 — Migrate + Seed

```bash
pnpm install
pnpm prisma:generate
pnpm exec prisma migrate deploy
pnpm db:seed
```

หลัง seed: admin user, 5 agents, 3 spaces, 8 demo tasks จะถูกสร้าง — **ลบ demo tasks** ก่อนส่งมอบ:

```sql
DELETE FROM "AgentTask";
```

(หรือเก็บไว้ให้ลูกค้าเห็นวิธีใช้งาน Kanban — แล้วแต่)

## Step 5 — Deploy

### Vercel (แนะนำสำหรับ MVP)

```bash
vercel link
vercel env pull .env.production
# ใส่ env vars ใน Vercel dashboard
vercel --prod
```

### Railway / Render

- Connect GitHub repo branch `client/<slug>`
- Set env vars ใน dashboard
- Build command: `pnpm install && pnpm exec prisma migrate deploy && pnpm build`
- Start command: `pnpm start`

## Step 6 — Smoke Test (ทำก่อนส่งมอบ)

ทดสอบทุกข้อก่อนส่ง credentials:

- [ ] `GET /` → หน้า landing โหลด แสดง `BUSINESS_NAME` ถูกต้อง
- [ ] `GET /pricing` → 3 cards แสดงครบ
- [ ] `GET /intake` → form โหลด
- [ ] `POST /api/intake` ด้วย test data → ได้ 201 + lead เข้า DB
- [ ] `GET /login` → login ด้วย `ADMIN_EMAIL` ได้
- [ ] `/dashboard` → เห็น lead ที่เพิ่ง test
- [ ] `/dashboard/command-center` → Kanban โหลด
- [ ] `/chat` → ทักได้ + AI ตอบ (ต้องใช้ `OPENAI_API_KEY` จริง)
- [ ] `/api/slots` → คืน slot ตาม `BUSINESS_HOURS_*` ที่ตั้ง
- [ ] ถ้าตั้ง `ADMIN_NOTIFY_WEBHOOK_URL` → ตรวจว่า notification ถูกส่งไป Slack จริง

## Step 7 — ส่งมอบ

ส่งให้ลูกค้า:

- URL: `https://<clinic>.ourplatform.com`
- Admin login: `ADMIN_EMAIL` + `ADMIN_PASSWORD` (ผ่าน 1Password / LINE secret note)
- ลิงก์ดู KPI: `/dashboard`
- คู่มือใช้งาน (Notion link หรือ Loom video)
- ช่องทางติดต่อ support (LINE OA agency / email)

## Step 8 — Day-1 Monitoring

ดูภายใน 24 ชม. แรก:
- Error log จาก Vercel/Railway
- จำนวน lead จริงที่เข้า — ตรวจว่า AI ตอบถูกบริบทคลินิก
- เวลา response — ต้อง < 5 วินาที ตลอด
- ถ้ามี n8n webhook → ตรวจ workflow run ฝั่ง n8n

## Common Issues

| ปัญหา | สาเหตุ | แก้ |
|------|--------|-----|
| `MODULE_NOT_FOUND @prisma/debug` | pnpm install ไม่สมบูรณ์ | ลบ `node_modules` แล้ว `pnpm install` ใหม่ |
| Login fail | `NEXTAUTH_SECRET` ต่างจากตอน seed | ตั้งให้ตรงกัน, restart |
| Lead ไม่เข้า DB | `DATABASE_URL` ผิด / connection limit | ตรวจ Supabase pooler / Railway logs |
| Webhook ไม่ trigger | URL ตั้งผิด / SSL ไม่ valid | curl URL จากเครื่อง deploy ตรวจ |
| OpenAI ตอบไม่ตรง | model ไม่ใช่ gpt-4o-mini หรือ prompt ผิด | ตรวจ `OPENAI_MODEL` + `lib/ai.ts` |

## Renewal / Retainer

- Retainer ตัด Stripe Subscription รายเดือน (เริ่มหลัง go-live 14 วัน)
- รายงาน KPI ส่ง email ทุกวันจันทร์ (ทำผ่าน n8n cron)
- Monthly review meeting (สำหรับ Scale package) ตั้ง calendar ก่อนทุกต้นเดือน

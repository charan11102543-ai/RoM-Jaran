# AI Automation Hustle — Phase 1 to Buildable System Blueprint

## 0) Scope และ Product ที่จะขายจริง

**Core Offer (ขายได้ทันที):**
- Appointment Booking + Follow-up Automation สำหรับ Clinic / Dental / Med Spa
- ราคาแนะนำ: Setup 15,000 THB + Retainer 6,000 THB/เดือน

**Primary Systems (ที่ build ในเอกสารนี้):**
1. Lead Qualification Agent (LINE/Chat)
2. Content Automation System
3. Email Automation System
4. Backend Automation Orchestrator (n8n)
5. CRM / Lead Storage (Supabase)

---

## 1) Lead Qualification Agent (LINE / Chat)

### 1.1 System Concept
ระบบรับ lead จาก LINE OA, web chat, และฟอร์ม แล้วคัดกรองอัตโนมัติก่อนส่งเข้าทีมขาย ด้วย scoring + routing + auto follow-up

**Business Outcome:**
- ลดเวลาทีมขายคุยกับ lead ที่ไม่พร้อมซื้อ
- เพิ่มอัตรา booked call จาก lead ที่ qualified

### 1.2 Architecture (Block + Flow)
```
[LINE OA Webhook]   [Website Chat Widget]   [Tally Form]
         \                |                  /
          \               |                 /
                 [FastAPI Ingestion API]
                           |
                    [n8n Workflow]
          -----------------|-----------------
          |                |                |
   [AI Intent Parse] [Rule-based Score] [Deduplicate]
          |                |                |
          ---------------[Decision]---------
                           |
               +-----------+-----------+
               |                       |
      [Qualified Path]         [Nurture Path]
               |                       |
 [Supabase CRM: leads/status]   [Brevo Email Sequence]
               |
        [Slack/LINE Notify Sales]
               |
         [Cal.com Booking Link]
```

### 1.3 Tools ที่ใช้
- **LINE Messaging API**: รับ/ส่งข้อความ LINE OA
- **FastAPI**: endpoint `/webhooks/line`, `/webhooks/chat`, `/webhooks/form`
- **n8n**: orchestration logic
- **Supabase (Postgres)**: CRM lead storage
- **OpenAI API**: intent classification + summary
- **Brevo**: nurture email
- **Slack**: แจ้งเตือนทีมขาย
- **Cal.com**: booking

### 1.4 Database Schema
```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  source text not null, -- line|chat|form|email
  full_name text,
  phone text,
  email text,
  business_type text,
  budget_thb int,
  urgency text, -- low|mid|high
  pain_points text,
  ai_summary text,
  ai_score int default 0,
  status text not null default 'new', -- new|qualified|nurture|booked|won|lost
  owner text,
  line_user_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table lead_events (
  id bigserial primary key,
  lead_id uuid references leads(id) on delete cascade,
  event_type text not null, -- msg_received|scored|notified|booked
  event_payload jsonb,
  created_at timestamptz default now()
);

create table conversations (
  id bigserial primary key,
  lead_id uuid references leads(id) on delete cascade,
  role text not null, -- user|assistant|system
  channel text not null, -- line|chat
  content text not null,
  created_at timestamptz default now()
);

create index idx_leads_status on leads(status);
create index idx_leads_source on leads(source);
create index idx_events_lead_id on lead_events(lead_id);
```

### 1.5 Step-by-step วิธีสร้าง
1. สร้าง Supabase project และรัน SQL schema ด้านบน
2. สร้าง FastAPI service
   - `/webhooks/line` verify signature
   - normalize payload เป็น schema กลาง
3. ตั้งค่า n8n webhook node รับ data จาก FastAPI
4. เพิ่ม OpenAI node ทำ intent + extraction (budget/urgency)
5. เพิ่ม Function node ทำ scoring
   - +40 ถ้ามี budget >= 15,000
   - +30 ถ้า urgency = high
   - +20 ถ้า industry = clinic/dental
   - +10 ถ้าตอบครบ email/phone
6. IF node: score >= 70 => qualified
7. Qualified path:
   - upsert leads.status=qualified
   - ส่ง Slack alert + ส่ง LINE message พร้อม Cal.com link
8. Nurture path:
   - set status=nurture
   - add to Brevo list “nurture_clinic”
9. บันทึก event ทุกขั้นใน lead_events
10. dashboard เบื้องต้นใช้ Supabase SQL + Metabase (optional)

### 1.6 ตัวอย่าง Workflow (n8n logic)
- Trigger: Webhook `/lead-ingest`
- Node 1: Set (normalize fields)
- Node 2: OpenAI Chat (extract structured JSON)
- Node 3: Function (lead score)
- Node 4: Supabase Upsert `leads`
- Node 5: IF `{{$json.ai_score >= 70}}`
  - True: Slack → LINE Reply → Supabase event
  - False: Brevo Add Contact → Send nurture #1 → Supabase event

### 1.7 Copy-paste Prompt สำหรับ AI Agent
```txt
You are a Lead Qualification Assistant for a Thai clinic automation agency.

Task:
1) Read incoming chat/form text.
2) Extract fields to JSON: full_name, business_type, budget_thb, urgency(low|mid|high), pain_points, contact_ready(true/false).
3) Summarize in Thai (max 60 words).
4) Give score 0-100 using rules:
   - budget_thb >=15000: +40
   - urgency high: +30, mid: +15
   - business_type in [clinic,dental,med spa]: +20
   - contact_ready true: +10
Return ONLY valid JSON.
```

### 1.8 ตัวอย่าง API Integration
```python
# FastAPI -> n8n webhook relay
from fastapi import FastAPI, Request
import httpx, os

app = FastAPI()
N8N_WEBHOOK = os.getenv("N8N_WEBHOOK_URL")

@app.post("/webhooks/line")
async def line_webhook(req: Request):
    payload = await req.json()
    normalized = {
        "source": "line",
        "line_user_id": payload.get("events", [{}])[0].get("source", {}).get("userId"),
        "message": payload.get("events", [{}])[0].get("message", {}).get("text", "")
    }
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(N8N_WEBHOOK, json=normalized)
    return {"ok": True}
```

### 1.9 วิธีทดสอบระบบ
- Unit test scoring function (edge cases)
- Integration test webhook -> n8n -> Supabase insert
- UAT scenario:
  1) lead budgetสูง ต้องไป qualified และมี Slack alert
  2) lead budgetต่ำ ต้องเข้า nurture และได้ email ลำดับแรก
- KPI test (7 วัน):
  - Lead response time < 1 นาที
  - Qualified rate > 25%

### 1.10 วิธี Deploy ใช้งานจริง
- FastAPI: Docker + Render/Fly.io
- n8n: self-host (Docker VPS) หรือ n8n cloud
- Supabase: managed
- ตั้ง env + secrets ผ่าน platform
- ตั้ง domain และ webhook URL production
- เปิด monitoring: Uptime Kuma + n8n execution logs

---

## 2) Content Automation System

### 2.1 System Concept
แปลงไอเดียเดียวให้เป็นหลาย format อัตโนมัติ (LinkedIn post, email snippet, short thread) พร้อม human approval ก่อน publish

### 2.2 Architecture (Block + Flow)
```
[Notion Content Ideas DB]
           |
      (Scheduled Trigger)
           |
         [n8n]
   --------|----------------------
   |       |          |          |
[OpenAI] [Brand QA] [Supabase] [Telegram Notify]
   |       |          |          |
[LinkedIn Draft API] [Brevo Draft] [Archive]
```

### 2.3 Tools
- Notion (idea source)
- n8n (pipeline)
- OpenAI (generation)
- Supabase (content logs)
- LinkedIn API (draft/post)
- Brevo (email draft)
- Telegram (approval)

### 2.4 Database Schema (content)
```sql
create table content_items (
  id uuid primary key default gen_random_uuid(),
  idea_title text not null,
  audience text,
  hook text,
  linkedin_post text,
  email_snippet text,
  x_thread text,
  status text default 'draft', -- draft|approved|published|rejected
  source_ref text,
  created_at timestamptz default now(),
  published_at timestamptz
);
```

### 2.5 Step-by-step
1. สร้าง Notion DB: title, angle, CTA, status=queued
2. n8n cron จับทุกวัน 08:00
3. ดึง items ที่ status=queued
4. เรียก OpenAI สร้าง 3 format
5. QA node เช็คคำต้องห้าม/ความยาว
6. save ลง Supabase content_items
7. ส่ง Telegram ให้แอดมินกด approve/reject
8. ถ้า approve -> post LinkedIn + create Brevo draft
9. update Notion/Supabase status

### 2.6 n8n Logic ตัวอย่าง
- Cron -> Notion Search -> Split in Batches -> OpenAI -> Function QA -> IF pass
- True: Supabase Insert -> Telegram
- Callback approve: LinkedIn Post + Brevo Draft + Supabase update

### 2.7 Prompt ตัวอย่าง
```txt
You are a Thai B2B content strategist for clinic automation services.
Input idea: {{idea_title}}
Output JSON with keys:
- linkedin_post (120-180 words, punchy hook)
- email_snippet (80-120 words, educational)
- x_thread (5 posts, concise)
Tone: practical, ROI-driven, non-hype.
Include CTA: "พิมพ์ว่า DEMO เพื่อรับตัวอย่างระบบ".
```

### 2.8 API Integration ตัวอย่าง
- LinkedIn UGC post endpoint (OAuth2)
- Brevo create email campaign draft endpoint

### 2.9 Testing
- ตรวจ JSON parse ได้ 100%
- test ความยาวข้อความแต่ละ platform
- dry-run mode 5 วันก่อน post จริง

### 2.10 Deploy
- n8n worker แยกจาก production lead flow
- ตั้ง queue mode (Redis) สำหรับ scale
- backup content logs ทุกวัน

---

## 3) Email Automation System

### 3.1 System Concept
ระบบ email lifecycle: welcome, nurture, re-engagement, booked-call reminder

### 3.2 Architecture
```
[Lead Status Change in Supabase]
            |
          [n8n]
   ---------|-----------------------------
   |        |             |              |
[Brevo Contact] [Sequence Router] [OpenAI Personalize] [Event Log]
   |        |             |              |
[Send Emails + Track Opens/Clicks] -> [Supabase metrics]
```

### 3.3 Tools
- Brevo
- n8n
- Supabase
- OpenAI (personalized opener)

### 3.4 Schema (email)
```sql
create table email_events (
  id bigserial primary key,
  lead_id uuid references leads(id),
  campaign text,
  action text, -- sent|open|click|reply|bounce
  metadata jsonb,
  created_at timestamptz default now()
);
```

### 3.5 Step-by-step
1. map lead status กับ sequence
   - qualified -> sequence Q1-Q3
   - nurture -> N1-N5
   - no_open_14d -> re-engage R1
2. n8n trigger จาก Supabase changes/webhook
3. create/update contact Brevo
4. send ตาม schedule (wait node)
5. ingest webhook จาก Brevo กลับ Supabase

### 3.6 n8n Logic
- Webhook status_changed -> Switch(status)
- Branch nurture: send day0/day2/day5/day9/day14
- IF open=false in 14d -> send re-engage

### 3.7 Prompt ตัวอย่าง
```txt
Write a Thai follow-up email for clinic owner.
Goal: book a 20-min demo.
Constraints: <=140 words, practical ROI, soft CTA.
Context: {{pain_points}}, {{ai_summary}}
```

### 3.8 API Integration ตัวอย่าง
```bash
curl -X POST https://api.brevo.com/v3/contacts \
  -H "api-key: $BREVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@clinic.com","attributes":{"FNAME":"Dr A"},"listIds":[12],"updateEnabled":true}'
```

### 3.9 Testing
- ทดสอบ bounce/invalid email path
- seed leads 20 ราย -> verify cadence ถูกต้อง
- check unsubscribe compliance

### 3.10 Deploy
- ใช้ dedicated sending domain
- ตั้ง SPF/DKIM/DMARC ก่อนส่ง production
- เริ่ม warmup ปริมาณต่ำแล้วค่อย ramp

---

## 4) Backend Automation (n8n Orchestrator)

### 4.1 System Concept
n8n เป็น workflow backbone เชื่อมทุก channel + enforce business rules

### 4.2 Architecture
```
[Inbound Webhooks] [Cron Jobs] [DB Triggers]
          \            |            /
                 [n8n Core]
      --------------|-----------------------
      |             |           |           |
 [Lead Flow]  [Content Flow] [Email Flow] [Ops Alerts]
      |             |           |           |
                 [Supabase + External APIs]
```

### 4.3 Tools
- n8n (main)
- Redis (queue mode)
- Postgres (n8n internal DB)
- S3 compatible backup (optional)

### 4.4 Step-by-step
1. deploy n8n with Docker Compose
2. เปิด queue mode + worker 2 ตัว
3. สร้าง credentials แยก prod/staging
4. import workflow templates
5. enable error workflow global
6. ตั้ง retry policy สำหรับ API failures

### 4.5 n8n Automation Logic (ต้องมีขายได้)
- SLA Alert: ถ้า lead ใหม่ไม่ถูก contact ใน 10 นาที -> แจ้ง sales manager
- Revenue Alert: ถ้า booked ต่ำกว่า threshold รายสัปดาห์ -> แจ้ง owner
- Cost Guardrail: ถ้า OpenAI usage เกิน budget/day -> switch model tier

### 4.6 Testing
- chaos test: ปิด Brevo ชั่วคราวดู fallback
- re-run failed executions ได้

### 4.7 Deploy
- VPS 2 vCPU/4GB RAM เริ่มได้
- reverse proxy + HTTPS
- daily backup workflow JSON + DB

---

## 5) CRM / Lead Storage

### 5.1 System Concept
Supabase เป็น single source of truth สำหรับ lead, conversation, email, booking

### 5.2 Architecture
```
[LINE/Chat/Form] -> [FastAPI/n8n] -> [Supabase CRM]
                                         |
                             [Views + KPI Dashboard]
                                         |
                                   [Sales Actions]
```

### 5.3 Tools
- Supabase Postgres
- Supabase Auth (ทีมงาน)
- Supabase Storage (ไฟล์ case study)
- Metabase/Retool (dashboard)

### 5.4 Schema เสริม
```sql
create table appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  start_time timestamptz,
  end_time timestamptz,
  booking_source text,
  status text default 'scheduled',
  created_at timestamptz default now()
);

create view kpi_daily as
select date(created_at) as day,
       count(*) as leads,
       count(*) filter (where status='qualified') as qualified,
       count(*) filter (where status='booked') as booked
from leads
group by 1
order by 1 desc;
```

### 5.5 Step-by-step
1. สร้าง table + RLS policy
2. role:
   - admin: read/write ทั้งหมด
   - sales: read lead + update status/owner
3. สร้าง view KPI สำหรับ dashboard
4. เชื่อม n8n Supabase node ทุก workflow

### 5.6 Testing
- SQL constraints, FK correctness
- RLS policy test ตาม role

### 5.7 Deploy
- ใช้ Supabase managed
- point-in-time backup เปิดใช้งาน
- audit log เปิดสำหรับ compliance

---

## 6) End-to-End Workflow Diagram (Text)

```
(1) Prospect ทัก LINE/กรอกฟอร์ม
    -> (2) FastAPI normalize event
    -> (3) n8n เรียก AI extraction + scoring
    -> (4A) Qualified: แจ้ง sales + ส่ง Cal.com + บันทึก CRM
    -> (4B) Not qualified: เข้า email nurture อัตโนมัติ
    -> (5) ถ้ามีการจอง: sync appointment เข้า CRM
    -> (6) หลัง call: sales อัปเดต won/lost
    -> (7) n8n trigger follow-up หรือ onboarding sequence
    -> (8) Dashboard แสดง KPI รายวัน/สัปดาห์
```

---

## 7) Automation Packages (ขายลูกค้าได้)

### Package A: Starter (6,000 THB/mo)
- Lead capture + qualification
- 1 channel (LINE หรือ form)
- weekly report

### Package B: Growth (9,500 THB/mo)
- A + email automation 5-step
- content pipeline 3 ชิ้น/สัปดาห์
- SLA alerts

### Package C: Scale (15,000 THB/mo)
- B + multi-channel (LINE+Chat+Email)
- advanced scoring + reactivation campaigns
- dashboard + monthly optimization

---

## 8) Implementation Plan (30 วัน)

- Day 1–3: Landing + Cal.com + intake form + core copy
- Day 4–7: Supabase schema + FastAPI + n8n base
- Day 8–14: Lead qualification flow live + Slack alerts
- Day 15–20: Email sequences + CRM dashboard
- Day 21–25: Content automation + approval loop
- Day 26–30: hardening, KPI tracking, demo for prospects

---

## 9) Definition of Done (Production Ready)

- Lead from LINE/form ถูกบันทึก DB ภายใน <10 วินาที
- scoring + routing ทำงาน 99%+ (จาก test 100 cases)
- email sequence ยิงได้ตาม schedule และ track ได้
- content pipeline ทำ draft อัตโนมัติอย่างน้อยวันละ 1 ชิ้น
- มี dashboard KPI: lead, qualified, booked, win-rate
- มี backup + error alert + runbook


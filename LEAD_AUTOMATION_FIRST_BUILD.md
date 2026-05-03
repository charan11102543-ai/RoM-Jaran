# Lead Automation System v1 — ลงมือทำระบบแรก (MVP ที่ขายได้)

เอกสารนี้แปลง blueprint ให้เป็น **งานที่ทำได้ทันทีใน 7 วัน** สำหรับระบบแรก:

**LINE/Web Form → FastAPI Webhook → AI Qualification → Supabase CRM → n8n Follow-up**

---

## 1) MVP Scope (สิ่งที่ต้องมีเท่านั้น)

### In Scope
- รับ lead จาก webhook 1 ช่องทาง (เริ่มจาก LINE หรือ Form)
- normalize payload กลาง
- ประเมิน lead score ด้วยกฎง่าย ๆ
- บันทึกลง Supabase (`leads`, `lead_events`)
- route 2 ทาง: `qualified` / `nurture`
- ส่ง webhook ไป n8n สำหรับ follow-up

### Out of Scope (ทำทีหลัง)
- multi-channel เต็มรูปแบบ
- dashboard ขั้นสูง
- campaign personalization ลึก

---

## 2) Repo Structure ที่แนะนำ

```txt
app/
  main.py
  schemas.py
  scoring.py
  services/
    supabase_client.py
    n8n_client.py
    ai_extractor.py
  routers/
    webhooks.py
tests/
  test_scoring.py
.env.example
requirements.txt
```

---

## 3) Environment Variables

```env
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_URL=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
```

---

## 4) Core Data Contract (Normalized Payload)

```json
{
  "source": "line",
  "line_user_id": "Uxxxx",
  "message": "สนใจระบบจองคิวค่ะ",
  "timestamp": "2026-05-03T00:00:00Z"
}
```

---

## 5) Scoring Rules v1

- budget_thb >= 15000 → +40
- urgency = high → +30, mid → +15
- business_type เป็น clinic/dental/med spa → +20
- มีช่องทางติดต่อพร้อม (`contact_ready=true`) → +10

**Threshold:**
- `score >= 70` = `qualified`
- `score < 70` = `nurture`

---

## 6) API Endpoints (MVP)

- `POST /health`
- `POST /webhooks/line` (หรือ `/webhooks/form` ถ้าจะเริ่มจาก form)
- `POST /internal/replay` (optional สำหรับทดสอบ event ซ้ำ)

---

## 7) 7-Day Build Plan

### Day 1
- สร้าง FastAPI skeleton
- เพิ่ม `/health`
- ตั้งค่า `.env` + config loading

### Day 2
- ทำ webhook receiver + payload normalizer
- เพิ่ม logging และ request id

### Day 3
- ทำ `ai_extractor` ให้คืน JSON fields มาตรฐาน
- fallback เป็น rule-based ถ้า AI ล่ม

### Day 4
- เขียน `scoring.py` + unit tests
- ทดสอบ edge cases ให้ครบ

### Day 5
- integrate Supabase insert/upsert
- บันทึก `lead_events`

### Day 6
- ส่งต่อ n8n webhook ตาม path (`qualified`/`nurture`)
- เพิ่ม retry เบื้องต้นสำหรับ API timeout

### Day 7
- end-to-end test + runbook deploy
- เตรียม demo script สำหรับลูกค้า

---

## 8) Test Checklist

- unit test: scoring rules
- integration test: webhook → normalized → score → DB insert
- failure test: OpenAI timeout ต้อง fallback และไม่ทำระบบล่ม
- data test: lead ที่ไม่มี budget ต้องยังถูกบันทึกได้

---

## 9) Sales Demo Script (สั้น)

1. ส่งข้อความ lead จำลองเข้า webhook
2. แสดงผล score + status (`qualified`/`nurture`)
3. เปิด Supabase row ที่ถูกสร้าง
4. เปิด n8n execution ว่ามี follow-up เกิดขึ้น

---

## 10) Definition of Done (MVP)

- รับ lead และบันทึกลง DB สำเร็จภายใน 10 วินาที
- ระบบไม่ล่มเมื่อ AI call ไม่สำเร็จ
- มีการ route ครบ 2 path
- มี unit test scoring ผ่านทั้งหมด
- พร้อม demo ให้ลูกค้าเห็น flow จบใน 3 นาที

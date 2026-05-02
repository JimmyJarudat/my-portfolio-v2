-- ============================================================
-- INSERT NOTES + NOTE_SECTIONS
-- เรียงลำดับตาม "น่าอ่านมากที่สุด" — specific > generic
-- ทำความสะอาด: เอาเฉพาะ note ที่มีประสบการณ์จริง
-- ============================================================

-- ลบของเก่าออกก่อน (ถ้ามี) เพื่อ idempotent
TRUNCATE TABLE note_sections CASCADE;
TRUNCATE TABLE notes CASCADE;

-- ============================================================
-- NOTE 1 — Crystal Reports crash กับ Thai combining character
-- หายาก, specific, คนทั่วไปไม่รู้จัก bug นี้
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  1,
  'crystal-reports-thai-mai-tai-khu',
  'Crystal Reports crash กับ ์ (mai tai khu) ท้ายข้อความ',
  'รายงาน C# พัง Access Violation 0xc0000005 — ไม่ใช่ null ไม่ใช่ data ผิด แต่เป็น Unicode combining character',
  ARRAY['Crystal Reports', 'C#', 'SQL Server', 'Thai'],
  '2025',
  '4 min',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
  'Crystal Reports crash กับ dept ที่ลงท้ายด้วย ์ — เช่น โลจิสติกส์'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (1, 1, 'อาการ', 'รายงาน Crystal Reports (.rpt) ทำงานปกติกับลูกค้าส่วนใหญ่ แต่ crash ทันทีกับ BPFL-25 ด้วย Access Violation 0xc0000005

ลองหลายอย่างก่อน: null check, data structure mismatch, string length — ไม่ใช่สักอัน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (1, 2, 'สาเหตุที่แท้จริง', 'Crystal Report engine มี bug กับ Thai Unicode combining character "์" (mai tai khu U+0E4C) ที่อยู่ท้ายสุดของ string

เช่น dept = "โลจิสติกส์" → crash
ตัด "ส์" ออกเหลือ "โลจิสติก" → ทำงานได้

เพิ่ม "ส์" กลับ → crash อีกครั้ง
ยืนยันว่าปัญหาคือ combining character ท้าย string โดยตรง', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (1, 3, 'วิธีแก้: CASE statement ใน SQL', 'แก้ที่ query ก่อนส่งให้ Crystal Reports:

SELECT
  CASE
    WHEN dept LIKE N''%์''
    THEN dept + '' ''
    ELSE dept
  END AS dept
FROM ...

เติม space ท้ายถ้าจบด้วย ์ — Crystal Reports รับได้ ข้อมูลที่แสดงก็ยังถูกต้อง', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (1, 4, 'Key Learning', 'Crystal Reports มี known issue กับ Thai combining characters ท้าย string

ถ้า report crash แบบไม่มีสาเหตุชัดเจน และข้อมูลมีภาษาไทย → ให้นึกถึง ์ ็ ่ ้ ๊ ๋ ที่อาจอยู่ท้าย field ก่อนเลย

แก้ที่ SQL ด้วย CASE + trailing space ดีกว่าแก้ที่ Crystal เพราะ Crystal ไม่มี config ให้จัดการ', true);

-- ============================================================
-- NOTE 2 — Debezium cascade crash loop ทุกเช้า
-- มี chain reaction, หา root cause ข้าม service
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  2,
  'debezium-cascade-crash-morning',
  'แอปตายทุกเช้าเพราะ Debezium crash loop',
  'Nova API ให้ 502 ตั้งแต่ตื่นมา — ต้นเหตุไม่ใช่ API แต่เป็น Debezium CDC ที่ restart วนอยู่',
  ARRAY['Debezium', 'CDC', 'Docker', 'Node.js'],
  '2026',
  '4 min',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'Cascade failure ใน Docker Swarm — service หนึ่งพังดึงอีก service ลงด้วย'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (2, 1, 'อาการ', 'ทุกเช้าประมาณ 06:00 Nova API ส่ง 502 Bad Gateway ต้อง restart stack ด้วยมือทุกวัน

ดู log คิดว่า nova_api_web พัง — แต่จริงๆ แล้ว nova_api restart เพราะ unhandled promise rejection แล้วเริ่ม return 502 ให้ Debezium', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (2, 2, 'Root Cause: Cascade Failure', 'Pattern ที่เกิดจริง:

1. nova_api restart (unhandled promise rejection)
2. ช่วง restart → return 502 ให้ Debezium connector
3. Debezium ไม่มี error tolerance → exhaust retry แล้ว crash (exit code 1)
4. Debezium เข้า restart loop ทุก ~1:49 นาที
5. nova_api กลับมา online แล้ว แต่ Debezium ยังวน loop อยู่

ดู log แค่ nova_api จึงหา root cause ไม่เจอ', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (2, 3, 'Fix 1: Debezium error tolerance', 'เพิ่ม config ใน connector:

errors.tolerance=all
errors.retry.delay.max.ms=60000
errors.retry.timeout=-1

-1 = retry ไม่มีสิ้นสุด — Debezium จะรอ API กลับมาเองแทนที่จะ crash', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (2, 4, 'Fix 2: แก้ unhandled rejection ใน index.ts', 'เจอ initializeApp() ถูก call 2 ครั้งใน index.ts — ทำให้ startup race condition

และ unhandledRejection handler เดิมทำ process.exit() ทุกครั้ง:

// เดิม — อันตราย
process.on(''unhandledRejection'', () => process.exit(1))

// แก้ — log แทน
process.on(''unhandledRejection'', (reason) => {
  logger.error(''Unhandled rejection:'', reason)
})', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (2, 5, 'Key Learning', 'ถ้า service A พัง → อาจทำให้ service B ที่ depend on A เข้า crash loop ด้วย

ตอน debug ต้องดู log ทุก service พร้อมกัน ไม่ใช่แค่ service ที่คิดว่าพัง

Debezium ไม่ควรรัน default config ใน production — error.tolerance และ retry ต้องตั้งทุกครั้ง', true);

-- ============================================================
-- NOTE 3 — CDC disable หลัง restore + DDL Trigger ขัด
-- ซับซ้อน หลายชั้น หายาก
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  3,
  'debezium-cdc-disabled-after-restore-ddl-trigger',
  'CDC ถูก disable อัตโนมัติหลัง restore — และ DDL Trigger บล็อก enable',
  'Restore → CDC หาย → enable ใหม่ → DDL Trigger ยิง error — ต้อง disable trigger ก่อนชั่วคราว',
  ARRAY['Debezium', 'SQL Server', 'CDC', 'DBA'],
  '2025',
  '5 min',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'Debezium CDC บน SQL Server — ต้องเปิด CDC ใหม่ทุกครั้งหลัง restore'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (3, 1, 'CDC ถูก disable หลัง restore — ทุกครั้ง', 'SQL Server CDC เก็บ state ใน system tables ภายใน database
เมื่อ restore จาก backup → CDC state จาก backup กลับมา
ถ้า backup ทำตอน CDC disabled → restore แล้วก็ disabled

นอกจากนี้ CDC jobs (SQL Agent) ไม่ได้อยู่ใน backup → หายทุกครั้ง

Checklist หลัง restore:
1. EXEC sys.sp_cdc_enable_db
2. EXEC sys.sp_cdc_enable_table สำหรับแต่ละ table
3. Verify jobs: EXEC sys.sp_cdc_help_jobs (ต้องมี 2 jobs: capture + cleanup)
4. Restart Debezium connector', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (3, 2, 'DDL Trigger ขัดกับ CDC enable', 'CartonSystem มี DDL Trigger (TR_DDLTrigger) คอย log ทุก DDL statement ลง TRIGGERLOG

เมื่อรัน sp_cdc_enable_table → SQL Server execute DDL ภายใน → trigger ยิง
→ trigger พยายาม INSERT ลง TRIGGERLOG
→ ถ้า schema ไม่ตรงหรือไม่มีสิทธิ์ → error → CDC enable ล้มเหลว

Error มักเป็น: "Cannot insert the value NULL into column ''is_retrieve_while_cancel''"', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (3, 3, 'Fix: Disable DDL Trigger ชั่วคราว', '-- Disable trigger ก่อน enable CDC
DISABLE TRIGGER TR_DDLTrigger ON DATABASE

-- Enable CDC
EXEC sys.sp_cdc_enable_db
EXEC sys.sp_cdc_enable_table
  @source_schema = ''dbo'',
  @source_name = ''text_file'',
  @role_name = NULL

-- Enable trigger กลับ
ENABLE TRIGGER TR_DDLTrigger ON DATABASE

ทำแบบนี้ทุกครั้งที่ต้อง modify CDC configuration', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (3, 4, 'LSN position reset หลัง restore', 'Debezium track position ด้วย LSN (Log Sequence Number)
หลัง restore → LSN ใน transaction log เปลี่ยน
ถ้า Debezium ยังจำ LSN เก่า → เริ่ม streaming จาก position ที่ไม่มีอยู่ → error

Fix: ลบ offsets ของ Debezium แล้วให้ snapshot ใหม่:
# ลบ topic offsets ใน Kafka
# หรือเปลี่ยน connector name (สร้าง connector ใหม่)
# หรือตั้ง snapshot.mode=initial ใหม่', true);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (3, 5, 'Key Learning', 'Restore SQL Server database ที่มี CDC = ต้องทำ 4 ขั้นตอนเสมอ

ถ้า DDL Trigger ยิง error ระหว่าง CDC enable → disable trigger ชั่วคราว
ถ้า Debezium error หลัง restore → ลบ offset แล้ว snapshot ใหม่

สร้าง post-restore script ให้ครบ ทำแค่รันไฟล์เดียวจบ', true);

-- ============================================================
-- NOTE 4 — Multi-tab token refresh race condition
-- ซับซ้อน มี mutex + BroadcastChannel
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  4,
  'multi-tab-token-refresh-race',
  'Multi-tab token refresh: race condition ทำให้ logout กะทันหัน',
  'เปิด 10 แท็บ แต่ละแท็บ call refresh พร้อมกัน — token เก่าหมดอายุก่อน token ใหม่มา',
  ARRAY['React', 'TypeScript', 'Auth', 'Nova'],
  '2025',
  '4 min',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'Nova Platform — session management ข้าม browser tab ด้วย BroadcastChannel'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (4, 1, 'ปัญหา', 'Nova Platform เปิดใช้งานหลาย tab พร้อมกัน — เมื่อ access token หมดอายุ ทุก tab พยายาม call /refresh พร้อมกัน

Tab แรก refresh สำเร็จ ได้ token ใหม่
Tab 2-10 ยังใช้ refresh token เดิมที่ใช้ไปแล้ว → ถูก revoke → logout กะทันหัน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (4, 2, 'วิธีแก้: TokenManager + mutex lock', 'สร้าง TokenManager class ที่มี lock mechanism:

class TokenManager {
  private isRefreshing = false
  private queue: Function[] = []

  async getToken() {
    if (this.isRefreshing) {
      // รอ tab อื่น refresh เสร็จก่อน
      return new Promise(resolve => this.queue.push(resolve))
    }
    this.isRefreshing = true
    // ... refresh ...
    this.queue.forEach(fn => fn(newToken))
    this.isRefreshing = false
  }
}

มีแค่ 1 request ที่ refresh จริง ที่เหลือรอใน queue', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (4, 3, 'BroadcastChannel ซิงค์ข้าม tab', 'ใช้ BroadcastChannel ส่ง token ใหม่ไปยังทุก tab:

const channel = new BroadcastChannel(''auth_token'')

// Tab ที่ refresh สำเร็จ
channel.postMessage({ type: ''TOKEN_REFRESHED'', token: newToken })

// Tab อื่นๆ
channel.onmessage = (e) => {
  if (e.data.type === ''TOKEN_REFRESHED'') setToken(e.data.token)
}

Access token เก็บใน memory (useState) ไม่ใช่ localStorage — ปลอดภัยจาก XSS', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (4, 4, 'Key Learning', 'Multi-tab app ต้องคิดเรื่อง token refresh coordination เสมอ

Pattern: mutex lock ใน tab เดียวกัน + BroadcastChannel ข้าม tab
Access token → memory เท่านั้น
Refresh token → httpOnly cookie
ไม่มีอะไร sensitive ใน localStorage', true);

-- ============================================================
-- NOTE 5 — SQL Server Orphaned User + explicit SID
-- DBA topic ที่ทำผิดบ่อยมาก
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  5,
  'sql-server-orphaned-user-explicit-sid',
  'SQL Server Orphaned User หลัง Restore — แก้ที่ต้นเหตุด้วย explicit SID',
  'ALTER USER แก้ได้ชั่วคราว แต่ถ้าต้องการถาวรต้อง CREATE LOGIN ด้วย SID เดียวกับ backup',
  ARRAY['SQL Server', 'CartonSystem', 'DBA', 'Security'],
  '2025',
  '4 min',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  'SID (Security Identifier) — ตัวระบุ identity ของ SQL Server login ที่ต้องตรงกันทั้ง 2 ฝั่ง'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (5, 1, 'ทำไม orphaned user เกิดซ้ำทุกครั้งที่ restore', 'ทุกครั้งที่ restore CartonSystem.bak → user ''cartonrw'' ใน database กลับมาพร้อม SID จาก backup server

แต่ login ''cartonrw'' บน server ปัจจุบันมี SID ต่างออกไป (สร้างใหม่ทีหลัง)

SQL Server จับคู่ DB user กับ login ด้วย SID ไม่ใช่ชื่อ → SID ไม่ตรง = orphaned user

ALTER USER [cartonrw] WITH LOGIN = [cartonrw] แก้ได้แค่ชั่วคราว restore ใหม่ก็กลับมา', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (5, 2, 'แก้ที่ต้นเหตุ: ดู SID จาก backup แล้ว CREATE LOGIN ให้ตรง', '-- Step 1: ดู SID ของ user ใน backup (หลัง restore แล้ว)
USE CartonSystem
SELECT name, sid FROM sys.database_principals WHERE name = ''cartonrw''
-- ได้: 0x34FFF44E1982C34691B3E9EC6D150C59

-- Step 2: ลบ login เดิมแล้วสร้างใหม่ด้วย SID ที่ได้
USE master
DROP LOGIN [cartonrw]

CREATE LOGIN [cartonrw]
  WITH PASSWORD = ''YOUR_PASSWORD'',
  SID = 0x34FFF44E1982C34691B3E9EC6D150C59,
  CHECK_POLICY = OFF

หลังจากนี้ restore กี่ครั้งก็ไม่ต้องแก้ orphaned user อีก', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (5, 3, 'CartonSystem cross-database permissions', 'cartonrw ต้องเข้าถึงหลาย database:
- CartonSystem → db_owner (restore บ่อย)
- COMMON → db_owner (ไม่ restore)
- CartonLog → db_owner (ไม่ restore)
- TRIGGERLOG → INSERT, SELECT, UPDATE บน schema TRG_CartonSystem
- yii2_file_system → db_owner

Database ที่ไม่ restore → setup user ครั้งเดียวแล้วไม่ต้องแตะอีก
Database ที่ restore บ่อย → ใช้ explicit SID ให้ match', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (5, 4, 'Key Learning', 'SQL Server Login SID = fingerprint ของ login
DB user เก็บ SID ไว้เพื่อ map กลับไปหา login

Backup → Restore ข้าม server = SID ไม่ตรงเสมอ

วิธีแก้ถาวร:
1. ดู SID จาก backup
2. DROP + CREATE LOGIN ด้วย SID เดียวกัน
3. หรือใช้ Contained Database (user ไม่ขึ้นกับ server login)', true);

-- ============================================================
-- NOTE 6 — Nginx WebSocket headers break login
-- Debug ยากมาก เพราะ local ปกติ แต่พังผ่าน proxy
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  6,
  'nginx-websocket-headers-break-login',
  'Nginx ส่ง WebSocket headers ไปทุก request ทำให้ login คืน HTML',
  'login POST ได้รับ "Route not found" แทน JSON — เพราะ middleware แปลงเป็น WS method',
  ARRAY['Nginx', 'Node.js', 'WebSocket', 'Debugging'],
  '2025',
  '4 min',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'Nginx reverse proxy — upgrade headers ที่ส่งมาโดยไม่ตั้งใจ'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (6, 1, 'อาการ', 'API /api/auth/login ใน production คืน HTML ("Route not found") แทน JSON

Local dev ทำงานปกติ — ปัญหาเกิดเฉพาะเมื่อผ่าน Nginx reverse proxy', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (6, 2, 'Root Cause: Nginx forward upgrade headers ทุก request', 'Nginx config มี:
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

นี่ทำให้ทุก HTTP request รวมถึง POST /api/auth/login ส่ง header:
upgrade: websocket
connection: upgrade

Backend middleware ตรวจเจอ header พวกนี้ → เปลี่ยน method จาก POST เป็น WS
→ หา route "WS /api/auth/login" ไม่เจอ → คืน 404 HTML', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (6, 3, 'Fix: conditional upgrade ใน Nginx', 'ใช้ map directive แทนการ force upgrade ทุก request:

map $http_upgrade $connection_upgrade {
  default keep-alive;
  websocket upgrade;
}

server {
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection $connection_upgrade;
}

แบบนี้จะ forward upgrade header เฉพาะเมื่อ client ส่งมาจริงๆ', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (6, 4, 'Fix ฝั่ง backend ด้วย', 'เพิ่ม whitelist ใน isWebSocketRequest():

function isWebSocketRequest(req) {
  const isWsHeaders = req.headers.upgrade === ''websocket''
  const isWsPath = WS_PATHS.includes(req.path)
  const hasJsonBody = req.headers[''content-type'']?.includes(''application/json'')
  
  // request ที่มี JSON body ไม่ใช่ WebSocket แน่นอน
  return isWsHeaders && isWsPath && !hasJsonBody
}', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (6, 5, 'Key Learning', 'Nginx config ที่ copy มาจาก tutorial WebSocket มักมี upgrade headers แบบ global
ซึ่งทำให้ทุก request ดูเหมือน WebSocket upgrade

Debug rule: ถ้าใช้งานได้ local แต่พังผ่าน proxy → ดู request headers ที่ proxy เพิ่มเข้ามาก่อนเลย', true);

-- ============================================================
-- NOTE 7 — Debezium SQL Server deadlock retry queue
-- Production architecture จริง
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  7,
  'debezium-deadlock-retry-queue',
  'Debezium SQL Server deadlock — ต้องมี retry queue ไม่ใช่แค่ log แล้วทิ้ง',
  'CDC sync fail เพราะ deadlock — event หาย ข้อมูล 2 database ไม่ตรงกัน',
  ARRAY['Debezium', 'CDC', 'SQL Server', 'TypeScript'],
  '2025',
  '3 min',
  'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80',
  'Failed Events Queue — CDC events ที่ fail ต้องมีที่เก็บและ retry อัตโนมัติ'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (7, 1, 'ปัญหา', 'Debezium sync ข้อมูลระหว่าง database หลายตัว (Main, Dev, MariaDB)

บางครั้ง SQL Server deadlock ทำให้ event ใส่ database ไม่ได้
ระบบ log error แล้วผ่านไป — ข้อมูลทั้ง 2 ฝั่งไม่ตรงกัน (data drift) โดยไม่รู้ตัว', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (7, 2, 'วิธีแก้: Failed Events Queue', 'สร้าง queue table สำหรับเก็บ event ที่ fail:

- event_id, payload, attempt_count, last_error, status
- Service retry ทุก 1 นาที (max 50 attempts)
- Exponential backoff: delay เพิ่มตาม attempt
- หลังครบ 50 ครั้ง → alert admin ผ่าน Telegram', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (7, 3, 'Exponential backoff', 'const delay = Math.min(1000 * 2 ** attempt, 60000)
// attempt 1 → 2s, attempt 2 → 4s, ... สูงสุด 60s

ป้องกัน retry storm ในกรณีที่ database กลับมาช้า
ถ้า retry ทุก 1s พร้อมกัน 50 event → ยิ่ง deadlock หนักขึ้น', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (7, 4, 'Key Learning', 'Deadlock เป็น transient error — ส่วนใหญ่ retry แล้วหาย
แต่ถ้าไม่มี retry mechanism → event หาย ข้อมูลไม่ consistent

ทุก CDC pipeline ที่ critical ต้องมี:
1. Failed event storage
2. Automatic retry with backoff
3. Alert เมื่อ retry หมด
4. Dashboard monitor retry queue', true);

-- ============================================================
-- NOTE 8 — Thai Encoding Detection Scoring System
-- Algorithm ที่สร้างเอง ไม่ใช่แค่ใช้ library
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  8,
  'thai-encoding-detection-scoring-system',
  'Thai Encoding Detection ด้วย Scoring System — ไม่เดา แต่ให้คะแนน',
  'ลอง decode หลาย encoding แล้วให้คะแนนตามความเป็นไทย — encoding ที่ได้คะแนนสูงสุดชนะ',
  ARRAY['Encoding', 'Thai', 'Node.js', 'Nova'],
  '2025',
  '4 min',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
  'Scoring-based encoding detection — decode หลายแบบแล้วเลือกที่ให้ผลดีที่สุด'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (8, 1, 'ทำไมไม่ใช้ chardet / encoding-japanese ตรงๆ', 'Auto-detection library มักผิดพลาดกับไฟล์ไทยรุ่นเก่า
เพราะ TIS-620 กับ Windows-874 มี byte range ทับซ้อนกับ Latin encodings

Browser-side TextDecoder ก็ไม่รองรับ TIS-620 โดย native
ต้องใช้ iconv-lite บน Node.js backend เท่านั้น', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (8, 2, 'Scoring System', 'function scoreText(text: string): number {
  let score = 0
  
  // Thai Unicode range: \u0E00-\u0E7F
  const thaiChars = text.match(/[\u0E00-\u0E7F]/g) || []
  score += thaiChars.length * 2
  
  // คำไทยทั่วไปที่ควรเจอในเอกสาร
  const COMMON_THAI = [''เอกสาร'', ''สัญญา'', ''ยืม'', ''คืน'', ''แผนก'']
  for (const word of COMMON_THAI) {
    if (text.includes(word)) score += 5
  }
  
  // Penalty: replacement character
  const replacements = text.match(/\uFFFD/g) || []
  score -= replacements.length * 10
  
  return score
}', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (8, 3, 'UTF-8 First Strategy', '// ลอง UTF-8 ก่อนเสมอ — ถ้าดีพอก็ไม่ต้องลองอื่น
const utf8 = decode(buffer, ''utf-8'')
if (scoreText(utf8) > 10) return utf8

// ถ้า UTF-8 ไม่ดี → ลองต่อ
const encodings = [''windows-874'', ''tis620'', ''iso-8859-11'']
let best = { text: utf8, score: scoreText(utf8) }

for (const enc of encodings) {
  const decoded = iconv.decode(buffer, enc)
  const score = scoreText(decoded)
  if (score > best.score) best = { text: decoded, score }
}

return best.text', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (8, 4, 'Key Learning', 'อย่าเชื่อ encoding detection library 100% สำหรับภาษาไทย
โดยเฉพาะไฟล์จาก legacy system ที่อาจ mix encoding

Scoring approach:
- Transparent: รู้ว่าทำไมเลือก encoding นั้น
- Tunable: เพิ่ม/ลด weight ได้ตามลักษณะไฟล์
- Fallback-safe: ถ้าทุกอย่างได้คะแนนต่ำ → UTF-8 เป็น default', true);

-- ============================================================
-- NOTE 9 — Security Middleware 7 ชั้น
-- Architecture จริง มี depth
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  9,
  'security-middleware-7-layers',
  'Security Middleware 7 ชั้นใน Elysia — ออกแบบให้ครอบคลุมจริง',
  'Rate limit, IP block, CSRF, SQL injection, XSS, path traversal, timing attack — ทำได้ใน middleware ตัวเดียว',
  ARRAY['Elysia.js', 'Security', 'Node.js', 'Nova'],
  '2025',
  '5 min',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
  'Defense in depth — 7 ชั้นกรองที่ request ต้องผ่านก่อนถึง handler'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (9, 1, 'Architecture: ลำดับของ 7 ชั้น', 'ลำดับสำคัญมาก — ตรวจ cheapest check ก่อนเสมอ:

1. Runtime Flag → ถ้า security disabled ข้ามทุกอย่าง (dev mode)
2. Admin Bypass → header x-jimmy-handsome ผ่านได้ทุกอย่าง
3. IP Blocking → ตรวจ Redis blacklist ก่อน (microseconds)
4. Rate Limiting → จำกัด req/min ต่อ IP (Redis / RAM fallback)
5. CSRF Protection → ตรวจ Origin/Referer สำหรับ POST/PUT/DELETE/PATCH
6. Input Validation → scan query params + body หา attack patterns
7. Timing Protection → padding เวลา response สำหรับ /api/auth/*', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (9, 2, 'Input Validation Patterns ที่ใช้จริง', 'const INJECTION_PATTERNS = [
  // SQL Injection
  /UNION\s+SELECT/i, /INSERT\s+INTO/i, /DROP\s+TABLE/i,
  // XSS
  /<script/i, /javascript:/i, /on\w+\s*=/i,
  // Path Traversal
  /\.\.\//, /\/etc\/passwd/,
  // Command Injection
  /cmd\.exe/i, /powershell\.exe/i,
  // Template Injection
  /\$\{.*\}/,
]

ถ้า pattern ใดๆ match → return 400 ทันที บันทึก IP ใน Redis counter', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (9, 3, 'Timing Attack Protection', '// เฉพาะ auth routes — ให้ response เร็วเกินไปก็อันตราย
// attacker วัดเวลาเดาได้ว่า username ถูกหรือไม่

const MIN_RESPONSE_MS = 200

const start = Date.now()
// ... actual auth logic ...
const elapsed = Date.now() - start

if (elapsed < MIN_RESPONSE_MS) {
  await new Promise(r => setTimeout(r, MIN_RESPONSE_MS - elapsed))
}

ทุก auth response ใช้เวลาอย่างน้อย 200ms เสมอ — attacker วัดเวลาไม่ได้', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (9, 4, 'Redis fallback เป็น RAM', 'Rate limiter ใช้ Redis เป็น primary store
แต่ถ้า Redis down → fallback เป็น in-memory Map

ทำให้ service ยังทำงานได้แม้ Redis ล่ม
ข้อเสีย: rate limit ไม่ sync ระหว่าง node แต่ยังดีกว่าหยุดทำงาน

Design principle: security feature ที่ทำให้ service down เองก็คือ vulnerability', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (9, 5, 'Upload Path Exception', 'บาง route ต้องได้รับ binary/base64 ขนาดใหญ่:
/api/system/popup/upload-image
/api/upload
/api/file/upload

Route พวกนี้ exempt จาก input validation length check
แต่ยังผ่าน rate limit และ CSRF ตามปกติ

Exception ต้อง explicit list — อย่า "ผ่อนปรน" แบบ wildcard', true);

-- ============================================================
-- NOTE 10 — Debezium IDENTITY_INSERT CDC sync
-- ======================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  10,
  'debezium-identity-insert-cdc-sync',
  'Debezium sync ข้ามฝั่ง: IDENTITY column update ไม่ได้ ต้องใช้ IDENTITY_INSERT',
  'Cannot update identity column ''id'' — Prisma update ธรรมดาใช้ไม่ได้ ต้องใช้ raw SQL + IDENTITY_INSERT ON',
  ARRAY['Debezium', 'SQL Server', 'Prisma', 'CDC'],
  '2025',
  '3 min',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
  'SQL Server IDENTITY column — insert ได้แต่ update ไม่ได้ ต้องเปิด IDENTITY_INSERT ก่อน'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (10, 1, 'ปัญหา', 'Debezium CDC sync text_file จาก MariaDB → SQL Server
เมื่อ source INSERT record ใหม่ → ปลายทางต้องเก็บ id เดิมไว้ด้วย

แต่ SQL Server ไม่ยอมให้ insert ค่า id เองถ้า column เป็น IDENTITY
Prisma create() ก็ไม่รองรับ — ต้อง raw SQL เท่านั้น', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (10, 2, 'Fix: Raw SQL + IDENTITY_INSERT', 'async function insertTextFileWithIdentity(data: any) {
  await prisma.$executeRawUnsafe(
    ''SET IDENTITY_INSERT [dbo].[text_file] ON''
  )
  
  try {
    await prisma.$executeRawUnsafe(
      ''INSERT INTO [dbo].[text_file] (id, ...) VALUES (@p0, ...)'',
      data.id,
    )
  } finally {
    // ต้อง OFF เสมอ ไม่งั้น session ค้าง
    await prisma.$executeRawUnsafe(
      ''SET IDENTITY_INSERT [dbo].[text_file] OFF''
    )
  }
}', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (10, 3, 'Idempotent: ตรวจก่อน insert', '// Debezium อาจส่ง event ซ้ำ (network retry)
// ต้องตรวจก่อนเสมอ

const existing = await prisma.text_file.findUnique({ where: { id: data.id } })

if (existing) {
  // มีแล้ว → update แทน (ไม่ต้อง IDENTITY_INSERT)
  const { id, ...updateData } = data
  await prisma.text_file.update({ where: { id }, data: updateData })
} else {
  // ยังไม่มี → insert พร้อม IDENTITY_INSERT
  await insertTextFileWithIdentity(data)
}', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (10, 4, 'Key Learning', 'IDENTITY_INSERT ใน SQL Server:
- ต้อง SET ON ก่อน INSERT
- ต้อง SET OFF หลัง INSERT เสมอ (ใน finally block)
- Prisma ไม่รองรับ — ต้องใช้ $executeRawUnsafe
- ใช้ได้แค่ table เดียวต่อ session ในเวลาเดียวกัน

CDC sync ที่ดีต้องเป็น idempotent — รับ event เดิม 2 ครั้งต้องได้ผลเหมือนกัน', true);

-- ============================================================
-- NOTE 11 — SQL Server = vs LIKE trailing space
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  11,
  'sql-server-dept-trailing-space',
  'SQL Server: = กับ LIKE ได้ผลไม่เท่ากัน',
  'กรอง dept = ''RA'' ได้ 31 แถว แต่ LIKE ''RA%'' ได้ 43 แถว — หายไปไหน 12 แถว?',
  ARRAY['SQL Server', 'CartonSystem', 'Debugging'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  'Hidden character ใน SQL Server — ตาเปล่ามองไม่เห็น แต่ทำให้ query พัง'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (11, 1, 'ปัญหาที่เจอ', 'ลูกค้า PER0001-26 มีกล่อง 43 ใบที่ dept ขึ้นต้นด้วย "RA" แต่พอ query ด้วย dept = ''RA'' ได้แค่ 31 แถว — หาย 12 แถวไม่รู้ไปไหน

ตอนแรกคิดว่า record พวกนั้นหาย แต่ LIKE ''RA%'' ยังเจออยู่ครบ', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (11, 2, 'วิธีตรวจสอบ', 'รัน query นี้เพื่อดู hidden character:

SELECT dept, LEN(dept) AS len, DATALENGTH(dept) AS byte_len, COUNT(*) AS cnt
FROM [CartonSystem].[dbo].[carton]
WHERE custcode = ''PER0001-26''
GROUP BY dept, LEN(dept), DATALENGTH(dept)

ถ้า LEN กับ DATALENGTH ไม่เท่ากัน → มี hidden character แน่นอน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (11, 3, 'สาเหตุ', '12 แถวที่หายเก็บ dept เป็น ''RA '' (มี trailing space) หรือ '' RA'' (leading space)

ข้อควรรู้เรื่อง SQL Server:
- = ใช้ collation comparison — trailing space ถูก pad ให้อัตโนมัติ (RA = RA✓)
- แต่ถ้าเป็น leading space หรือ non-breaking space → = ไม่จับ
- LIKE ทำงานต่างออกไป จึงจับได้มากกว่า', true);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (11, 4, 'Key Learning', 'อย่า assume ว่า = กับ LIKE ได้ผลเหมือนกันเสมอ โดยเฉพาะข้อมูลที่ manual key เข้ามา มักมี space แปลกๆ ซ่อนอยู่

ถ้าผลไม่เท่ากัน → ใช้ DATALENGTH เช็คก่อนเสมอ', true);

-- ============================================================
-- NOTE 12 — Debezium Composite PK mismatch phantom records
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  12,
  'debezium-composite-pk-mismatch-phantom-records',
  'Debezium sync สร้าง phantom records เพราะ composite PK ต่างกัน 2 ฝั่ง',
  'noreturn_main มี record มากกว่า noreturn — เพราะ rack field เป็น PK ฝั่งปลายทาง แต่ไม่ใช่ต้นทาง',
  ARRAY['Debezium', 'CDC', 'MariaDB', 'SQL Server'],
  '2025',
  '3 min',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'Composite Primary Key mismatch — ต้นทางและปลายทาง key ต่างกัน ทำให้ record ซ้ำซ้อน'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (12, 1, 'ปัญหา', 'DBSyncer sync noreturn → noreturn_main

noreturn (MariaDB): 126,978 records
noreturn_main (MariaDB): 132,429 records

noreturn_main มีมากกว่า ซึ่งไม่ควรเกิด — เพราะ noreturn_main เป็นปลายทาง', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (12, 2, 'Root Cause: PK ต่างกัน', 'noreturn PK: [PFCarton, id, carton]  — 3 fields
noreturn_main PK: [PFCarton, id, carton, rack]  — 4 fields

เมื่อ sync record เดิมที่ rack เปลี่ยนค่า:
- noreturn_main ไม่ upsert เพราะ PK (รวม rack) ต่างกัน
- สร้าง record ใหม่แทน

ผลคือ record เดิมยังอยู่ + record ใหม่ที่ rack ต่างกัน = phantom records', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (12, 3, 'วิธีตรวจสอบ', '# ดู log แบบ real-time
docker logs -f <container_id> 2>&1 | \
  grep -E "noreturn|duplicates|error"

# ดู duplicate count
docker logs <container_id> 2>&1 | \
  grep "duplicates" | tail -20

ถ้า "duplicates: 5" ขึ้นซ้ำๆ — Prisma เจอ PK conflict แต่ไม่ crash เพราะมี error handler', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (12, 4, 'Key Learning', 'ก่อน build CDC pipeline ต้องตรวจสอบ Primary Key ของทุก table ทั้ง 2 ฝั่ง

ถ้า PK ต่างกัน → upsert จะสร้าง record ใหม่แทน update ของเดิม

ตรวจสอบด้วย: SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
ดู constraint type = PRIMARY KEY ของแต่ละ table ทั้ง source และ destination', true);

-- ============================================================
-- NOTE 13 — Debezium TIME → milliseconds serialization
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  13,
  'dbsyncer-datetime-time-type-mismatch',
  'SQL Server TIME field → MariaDB ได้ integer milliseconds แทน string',
  'Debezium แปลง TIME เป็น milliseconds since midnight — MariaDB รับไม่ได้ต้อง convert เอง',
  ARRAY['Debezium', 'SQL Server', 'MariaDB', 'TypeScript'],
  '2025',
  '3 min',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
  'Time field sync — Debezium serialize TIME เป็น int64 milliseconds ไม่ใช่ string'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (13, 1, 'ปัญหา', 'DBSyncer sync fax_main, fr_main จาก SQL Server → MariaDB
ได้ error: "Invalid value provided. Expected DateTime, provided Int"

Field ที่พัง: issue_time ใน fax_main, fax_tmp, fr_main, fr_tmp, ret_tmp', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (13, 2, 'สาเหตุ: Debezium serialize TIME เป็น milliseconds', 'SQL Server TIME field → Debezium ส่งเป็น int64 (milliseconds since midnight)

เช่น 09:30:00 → 34,200,000 ms

MariaDB Prisma schema รอรับ DateTime object หรือ string "HH:MM:SS"
พอได้ integer มา → type error', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (13, 3, 'Fix: แปลง milliseconds → time string', 'function convertMsToTimeString(ms: number | null): string | null {
  if (ms === null || ms === undefined) return null
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2,''0'')}:${String(m).padStart(2,''0'')}:${String(s).padStart(2,''0'')}`
}

// ใช้ก่อน upsert ใน MariaDB
const TIME_FIELDS = [''issue_time'', ''rettime'']
for (const field of TIME_FIELDS) {
  if (typeof data[field] === ''number'') {
    data[field] = convertMsToTimeString(data[field])
  }
}', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (13, 4, 'Key Learning', 'Debezium serialize temporal types แตกต่างกันตาม source database:
- DATE → days since epoch (integer)
- TIME → milliseconds since midnight (integer)
- DATETIME/TIMESTAMP → milliseconds since Unix epoch (integer)

ต้องเขียน converter สำหรับ time fields ทุกตัวเสมอ เมื่อ sink ไป database ที่ expect string/DateTime', true);

-- ============================================================
-- NOTE 14 — Payment Webhook Signature + Regex parsing
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  14,
  'payment-webhook-signature-and-regex-parsing',
  'Webhook ชำระเงิน: Signature Verification + Regex Reference Parsing',
  'ตรวจ HMAC signature ก่อน parse reference — regex แบบ fixed digits ทำให้ error เมื่อ format เปลี่ยน',
  ARRAY['NestJS', 'TypeScript', 'Webhook', 'Security'],
  '2025',
  '4 min',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'Payment webhook pipeline — verify signature → parse reference → process business logic'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (14, 1, 'Flow ของ Webhook ที่ถูกต้อง', '1. รับ webhook payload
2. Verify HMAC signature ก่อนทุกอย่าง
3. บันทึกลง webhook log (ทุก request แม้ duplicate)
4. เช็ค duplicate ด้วย EventId
5. Parse reference strings
6. Execute business logic (renew/register)', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (14, 2, 'Signature Verification', '// ต้อง verify ก่อน parse payload
const computedSig = crypto
  .createHmac(''sha256'', process.env.WEBHOOK_SECRET)
  .update(rawBody)  // ต้องใช้ raw body ไม่ใช่ parsed JSON
  .digest(''hex'')

if (computedSig !== receivedSig) {
  throw new UnauthorizedException(''Invalid signature'')
}

สำคัญ: ต้องใช้ rawBody (Buffer) ไม่ใช่ JSON.stringify(parsedBody)
การ serialize กลับอาจเปลี่ยน key order → signature ไม่ตรง', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (14, 3, 'Regex ที่ยืดหยุ่น แทน fixed digits', '// Reference format: C{customerID}P{period}U{uid}
// customerID อาจ 9 หรือ 10 หลัก — ห้าม hardcode

// ผิด: จำนวนหลักแน่นอน
const r1 = /^C\d{10}P\d+U/  // พัง ถ้า ID 9 หลัก

// ถูก: ยืดหยุ่น
const r1 = /^(C\d+)P(\d+)U/

// Reference 2: RN/RE + YYMMDD + quantity + U + uid
const r2 = /^(RE|RN)(\d{6})(\d*)U/
const [, type, dateStr, qty] = ref2.match(r2)', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (14, 4, 'Key Learning', 'Webhook ที่ดีต้องมีทุกอย่างนี้:
1. HMAC signature verification (rawBody เท่านั้น)
2. Idempotency ด้วย EventId (ป้องกัน duplicate processing)
3. Log ทุก request ก่อน process
4. Regex ที่ยืดหยุ่น — payment gateway มักเปลี่ยน format โดยไม่แจ้ง
5. Separate parse logic ออกจาก business logic', true);

-- ============================================================
-- NOTE 15 — Duplicate Webhook detection logic bug
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  15,
  'webhook-duplicate-detection-wrong-comparison',
  'Duplicate Webhook Detection ที่ตรวจผิด — ทุก request ถูก flag ว่า duplicate',
  'เปรียบ ReceivedAt กับ Timestamp — สองอย่างไม่เคยเท่ากัน ทำให้ logic พัง 100%',
  ARRAY['NestJS', 'TypeScript', 'Webhook', 'Debugging'],
  '2025',
  '2 min',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
  'Logic bug ที่ subtle — เงื่อนไขที่ดูสมเหตุสมผลแต่ไม่เคยเป็นจริง'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (15, 1, 'โค้ดที่ผิด', '// ดูเหมือนสมเหตุสมผล แต่ logic ผิดทั้งหมด
const isDuplicate = savedWebhook.ReceivedAt.getTime()
                 !== savedWebhook.Timestamp.getTime()

// ReceivedAt = เวลาที่ server ได้รับ webhook (ตอนนี้)
// Timestamp = เวลาที่ payment gateway สร้าง event
// ทั้งสองจะไม่เท่ากันเลย ทุก request
// → isDuplicate = true เสมอ → ทุก request ถูก reject', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (15, 2, 'Fix: เช็ค EventId แทน', '// EventId คือ unique identifier ของ event นั้นจาก payment gateway

async function isDuplicateWebhook(eventId: string): Promise<boolean> {
  const existing = await prisma.webhook.findUnique({
    where: { event_id: eventId }
  })
  return !!existing
}

if (await isDuplicateWebhook(payload.event_id)) {
  return { status: ''duplicate'', message: ''Already processed'' }
}', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (15, 3, 'Key Learning', 'Duplicate detection ต้องใช้ identifier ที่ payment gateway กำหนด
ไม่ใช่ timestamp ที่ server สร้างเอง

หลักการ: Idempotency Key มาจาก caller ไม่ใช่ receiver

Bug แบบนี้หาเจอยาก เพราะ:
- ไม่มี error — แค่ return status ผิด
- test แบบ unit อาจผ่าน
- เจอได้ตอน integration test เท่านั้น', true);

-- ============================================================
-- NOTE 16 — SQL Server DMV + BigInt serialization
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  16,
  'nova-admin-dashboard-bigint-dmv',
  'SQL Server DMV + BigInt Serialization ใน Node.js',
  'ดึง DMV metrics ได้ถูกต้อง แต่ส่ง JSON ไป frontend แล้ว error — เพราะ BigInt ไม่ serialize ได้',
  ARRAY['SQL Server', 'Node.js', 'TypeScript', 'Nova'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
  'SQL Server DMV (Dynamic Management Views) — ข้อมูล performance realtime ที่ DBA ใช้'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (16, 1, 'Context', 'Nova Admin Dashboard ดึง SQL Server performance metrics จาก DMVs:
- sys.dm_os_sys_memory (memory usage)
- sys.dm_exec_requests (active queries)
- sys.dm_os_wait_stats (wait statistics)
- sys.dm_io_virtual_file_stats (disk I/O)', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (16, 2, 'ปัญหา: BigInt ไม่ serialize เป็น JSON', 'DMV columns เช่น pages_kb, io_stall มักเป็น BIGINT
Prisma $queryRaw คืนค่าเป็น JavaScript BigInt

พอทำ JSON.stringify() → error:
TypeError: Do not know how to serialize a BigInt

เพราะ JSON spec ไม่รองรับ BigInt — มีแค่ Number ที่มี precision จำกัด', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (16, 3, 'Fix: แปลง BigInt ก่อน return', 'function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === ''bigint'') return Number(obj)
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === ''object'') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)])
    )
  }
  return obj
}

// ใช้หลัง $queryRaw ทุกครั้ง
const raw = await prisma.$queryRaw`SELECT ...`
return serializeBigInt(raw)', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (16, 4, 'Context switch bug ซ้อนอีกชั้น', 'DMV query บางตัวดึงข้อมูลจากหลาย database พร้อมกัน
ใส่ USE [CartonSystem] ไว้ใน query → connection context เปลี่ยน
→ session table ใน nova_platform ถูก query ในบริบท CartonSystem
→ "Invalid object name ''sessions''"

Fix: ใช้ database prefix แทน USE ทุกตัว
FROM [CartonSystem].sys.tables แทน USE [CartonSystem]; FROM sys.tables', true);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (16, 5, 'Key Learning', 'Prisma $queryRaw คืน BigInt สำหรับ BIGINT columns เสมอ
ต้องมี serialization layer ก่อนส่ง HTTP response ทุกครั้ง

DMV queries มักดึงข้อมูลจากหลาย database → ห้ามใช้ USE statement
ใช้ 3-part naming: [database].[schema].[table] ตลอด', true);

-- ============================================================
-- NOTE 17 — SMC GS10P backup ผ่าน TFTP CRLF
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  17,
  'smc-tftp-line-ending',
  'SMC GS10P backup ผ่าน TFTP — ต้องส่ง \r\n ไม่ใช่แค่ \n',
  'SSH เข้าสวิตช์ได้ สั่ง Config Save ได้ แต่ไม่มีไฟล์มาใน TFTP — เพราะ line ending ผิด',
  ARRAY['SMC', 'TFTP', 'Python', 'Networking'],
  '2026',
  '4 min',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'SMC GS10P-Smart — สวิตช์ที่ Oxidized ไม่มี model รองรับ ต้องเขียน script เอง'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (17, 1, 'Context', 'ระบบ network config backup ครอบคลุม 5 อุปกรณ์ — Cisco ทั้งสองตัวใช้ Oxidized ได้ปกติ

แต่ SMC GS10P-Smart (192.168.2.42) ไม่มี model ใน Oxidized → ต้องเขียน Python script เอง

SMC ไม่มี show running-config — ใช้วิธี SSH สั่ง "Config Save <ip> <filename>" แทน ซึ่ง push ไฟล์มาผ่าน TFTP', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (17, 2, 'ปัญหาที่เจอ', 'SSH เข้าได้ login ได้ สั่ง Config Save ได้ แต่ TFTP server ไม่ได้รับไฟล์เลย

ตรวจสอบ log พบว่า command ถูกส่งไปแต่ switch ไม่ตอบสนอง เพราะ SSH terminal ของ SMC รุ่นเก่าต้องการ CRLF (\r\n) ทุกบรรทัด ไม่ใช่แค่ LF (\n) ที่ paramiko ส่งให้ default', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (17, 3, 'Fix: บังคับ \r\n ผ่าน paramiko', 'channel = ssh.invoke_shell()
channel.send("Config Save 192.168.2.254 smc-backup.cfg\r\n")
time.sleep(3)
output = channel.recv(4096).decode()

สำคัญ: ต้องใช้ \r\n ทุกคำสั่ง ไม่ใช่แค่ \n
ไม่งั้น switch รับ command แต่ไม่ execute', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (17, 4, 'ปัญหา TFTP ซ้อน: Python TFTP server vs tftpd-hpa', 'Python TFTP server ที่เขียนเองมี race condition — บางครั้งยังไม่ ready ก่อน switch push มา

Fix: ใช้ tftpd-hpa ที่รันตลอดเวลาแทน แล้วให้ script อ่านไฟล์จาก /srv/tftp/ หลัง switch push มา

apt install tftpd-hpa
ทำครั้งเดียว รันตลอด ไม่มีปัญหา race condition', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (17, 5, 'Key Learning', 'Network device รุ่นเก่าหลายตัวต้องการ CRLF (\r\n) ใน SSH session
paramiko ส่งแค่ LF (\n) default — ต้องบังคับเอง

ถ้า command ส่งไปแต่ device ไม่ตอบสนอง → suspect line ending ก่อนอย่างอื่น', true);

-- ============================================================
-- NOTE 18 — TP-Link ER7206 SSH legacy algorithms
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  18,
  'tplink-er7206-ssh-legacy-algorithms',
  'TP-Link ER7206: SSH ล้มเหลวเพราะ modern client ไม่ support legacy kex',
  'paramiko connect ไม่ได้ — ต้อง force ใช้ curve25519-sha256@libssh.org และ aes128-ctr',
  ARRAY['TP-Link', 'SSH', 'Python', 'Networking'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
  'TP-Link ER7206 — router ที่ใช้ SSH algorithms ที่ต่างจากอุปกรณ์อื่นในเครือข่าย'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (18, 1, 'ปัญหา', 'Script Python ใช้ paramiko SSH เข้า TP-Link ER7206 (192.168.1.1) ได้ error:
No matching key exchange method found

อุปกรณ์อื่น (Cisco, SMC, MikroTik) ใช้ default paramiko settings ได้ปกติ', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (18, 2, 'ตรวจสอบ kex ของ device', 'ssh -vvv user@192.168.1.1 แล้วดู:

debug2: KEX algorithms: curve25519-sha256@libssh.org, diffie-hellman-group14-sha1
debug2: ciphers ctos: aes128-ctr, aes256-ctr

ER7206 ใช้ curve25519 + aes-ctr ซึ่งต่างจาก SMC ที่ใช้ diffie-hellman-group1 + aes-cbc', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (18, 3, 'Fix: ระบุ algorithms ให้ paramiko ตรงกับ device', 'transport = paramiko.Transport((host, 22))
transport.get_security_options().kex = [
    ''curve25519-sha256@libssh.org'',
    ''diffie-hellman-group14-sha1''
]
transport.get_security_options().ciphers = [
    ''aes128-ctr'',
    ''aes256-ctr''
]
transport.connect(username=user, password=pwd)

แต่ละ device อาจต้องการ algorithms ต่างกัน — ต้อง debug ทีละตัว', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (18, 4, 'ปัญหาซ้อน: ^M ใน script', 'เปิดไฟล์ .py ด้วย vim แล้วเห็น ^M ท้ายทุกบรรทัด — เพราะสร้างไฟล์บน Windows แล้ว upload มา Linux

แก้ด้วย:
sed -i ''s/\r//'' script.py

ถ้าไม่แก้ → Python อ่าน command ผิด \r ติดท้าย string ทำให้ command ไม่ทำงาน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (18, 5, 'Key Learning', 'ไม่มี SSH client ตัวเดียวที่ใช้ได้กับทุก device — ต้อง probe algorithms ด้วย ssh -vvv ก่อนเสมอ

สร้าง script บน Windows แล้ว upload Linux → เช็ค line ending ก่อนรันทุกครั้ง
sed -i ''s/\r//'' ใช้งานได้เร็ว', true);

-- ============================================================
-- NOTE 19 — Oxidized Docker Swarm port mode:host
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  19,
  'oxidized-docker-swarm-port',
  'Oxidized ใน Docker Swarm: port 8888 เข้าไม่ได้',
  'Swarm ingress routing ทำให้ port binding ไม่ทำงานตามที่คาด — ต้องใช้ mode: host',
  ARRAY['Docker', 'Swarm', 'Oxidized', 'LibreNMS'],
  '2026',
  '4 min',
  'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
  'Oxidized รัน network config backup ผ่าน Docker Swarm บน ubuntu254'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (19, 1, 'ปัญหา', 'Oxidized รันใน Docker Swarm แต่เข้า web UI port 8888 ไม่ได้ ทั้งที่ deploy ด้วย ports: - "8888:8888"

LibreNMS integration ผ่าน Oxidized API ก็ใช้ไม่ได้', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (19, 2, 'สาเหตุ: Swarm ingress routing', 'Docker Swarm ใช้ ingress load balancer โดย default — port binding ทำงานแบบ NAT ผ่าน routing mesh ทำให้บาง service เช่น Oxidized ที่ bind localhost ไม่ถูก forward มาอย่างถูกต้อง', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (19, 3, 'วิธีแก้ที่ 1: mode: host', 'เปลี่ยน port binding ใน stack file:

ports:
  - target: 8888
    published: 8888
    protocol: tcp
    mode: host

แบบนี้ container bind port ตรงกับ host โดยไม่ผ่าน ingress — เข้าได้ทันที', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (19, 4, 'วิธีแก้ที่ 2: Nginx proxy ไปยัง container IP', 'ถ้าไม่อยาก redeploy ทำ workaround ด้วย Nginx:

CONTAINER=$(docker ps -q -f name=oxidized)
CONTAINER_IP=$(docker inspect $CONTAINER --format ''{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'')

แล้ว proxy_pass ไปยัง $CONTAINER_IP:8888 โดยตรง

ข้อเสีย: ต้องรัน script ใหม่ทุกครั้งที่ container ถูก recreate (IP เปลี่ยน)', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (19, 5, 'Key Learning', 'Docker Swarm ingress เหมาะกับ stateless HTTP service ที่ต้องการ load balancing

แต่ service ที่ bind localhost หรือต้องการ direct port access (เช่น Oxidized, database) ควรใช้ mode: host

ถ้า container IP เปลี่ยนทุกครั้งที่ restart → ห้ามอ้างอิง IP ตรงๆ ใน production', true);

-- ============================================================
-- NOTE 20 — USE [database] context ค้างใน connection pool
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  20,
  'sqlserver-use-db-context-bug',
  'USE [database] ใน query ทำให้ auth error ในครั้งถัดไป',
  'Nova Platform API รัน USE [CartonSystem] แล้ว connection context ค้างอยู่กับ DB นั้นตลอด',
  ARRAY['SQL Server', 'Prisma', 'Node.js', 'Debugging'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
  'Multi-database API — connection context เปลี่ยนตลอด ถ้า USE ค้างอยู่จะพัง'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (20, 1, 'ปัญหา', 'Nova Platform monitor หลาย database พร้อมกัน (nova_platform, files_system, CartonSystem)

ในบาง query ใส่ USE [CartonSystem] ไว้ต้น query — ทำงานถูกต้อง

แต่ request ถัดไปที่ควร query nova_platform กลับ error "Invalid object name ''sessions''" เพราะ connection ยังอยู่ที่ CartonSystem', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (20, 2, 'สาเหตุ', 'Connection pooling ใน Prisma/SQL Server ใช้ connection เดิมซ้ำ

พอรัน USE [CartonSystem] ใน query หนึ่ง → connection นั้นเปลี่ยน context ไปอยู่ที่ CartonSystem

ถ้า pool นำ connection นั้นกลับมาใช้ใน request ถัดไป → query ไปโดน CartonSystem แทน nova_platform', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (20, 3, 'Fix: ใช้ database prefix แทน USE', 'เปลี่ยนจาก:
USE [CartonSystem]
SELECT * FROM sys.tables

เป็น:
SELECT * FROM [CartonSystem].sys.tables

ไม่ต้อง USE เลย — ระบุ database ตรงๆ ใน FROM clause ทุกครั้ง connection context ไม่เปลี่ยน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (20, 4, 'Key Learning', 'ห้ามใช้ USE [database] ใน query ที่รันผ่าน connection pool

ใน multi-database scenario ให้ระบุ database prefix ใน query โดยตรงเสมอ:
[DatabaseName].[schema].[table]

ถ้าต้องรัน USE จริงๆ → เปิด connection ใหม่แยก ปิดทันทีหลังใช้งาน', true);

-- ============================================================
-- NOTE 21 — SQL Server error 8152 Thai NVARCHAR
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  21,
  'sql-server-8152-thai-column-size',
  'SQL Server error 8152: String or binary data would be truncated',
  'Sync ข้อมูลภาษาไทย MariaDB → SQL Server แล้ว error — เพราะ column 70 chars รับ UTF-8 Thai ไม่ไหว',
  ARRAY['SQL Server', 'MariaDB', 'Thai', 'Debezium'],
  '2025',
  '3 min',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'Thai character encoding — 1 ตัวอักษรไทยอาจใช้ 3 bytes ใน UTF-8'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (21, 1, 'ปัญหา', 'Debezium sync ข้อมูลจาก MariaDB (UTF-8) ไป SQL Server แล้วได้ error:
String or binary data would be truncated (error 8152)

Field ที่พัง: bussi_name, dept — column size 70 chars
ใน MariaDB ข้อมูลอยู่ในขนาด 70 chars ปกติ แต่ SQL Server reject', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (21, 2, 'สาเหตุ', 'VARCHAR(70) ใน MariaDB นับ 70 ตัวอักษร
VARCHAR(70) ใน SQL Server นับ 70 bytes

ภาษาไทยใน UTF-8: 1 ตัวอักษร = 3 bytes
ชื่อบริษัท 25 ตัวอักษรไทย = 75 bytes → เกิน 70 ทันที

ข้อมูลที่ดูเหมือน "พอดี" ใน MariaDB จึง truncate ใน SQL Server', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (21, 3, 'Fix', 'เพิ่ม column size ใน SQL Server:
ALTER TABLE history ALTER COLUMN bussi_name NVARCHAR(200)
ALTER TABLE history ALTER COLUMN dept NVARCHAR(200)

ใช้ NVARCHAR แทน VARCHAR — NVARCHAR นับ characters ไม่ใช่ bytes
เหมาะกับ Unicode/Thai มากกว่า

200 เป็น buffer ปลอดภัย แทนที่จะคำนวณ bytes ให้แม่นยำ', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (21, 4, 'Key Learning', 'VARCHAR ใน SQL Server นับ bytes
NVARCHAR ใน SQL Server นับ characters (2 bytes ต่อ char)
VARCHAR ใน MySQL/MariaDB นับ characters

ถ้า column เก็บภาษาไทยใน SQL Server → ใช้ NVARCHAR เสมอ
และ size ควรใหญ่กว่าที่คิด อย่างน้อย 2-3x จาก source system', true);

-- ============================================================
-- NOTE 22 — Prisma || vs ?? falsy value trap
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  22,
  'prisma-logical-or-zero-value-null',
  'Prisma: copy: line.copy || undefined ทำให้ 0 กลายเป็น NULL',
  '|| ใน JavaScript แปลง falsy value (รวมถึง 0) เป็น undefined — Prisma บันทึกเป็น NULL',
  ARRAY['Prisma', 'TypeScript', 'Node.js', 'Debugging'],
  '2025',
  '2 min',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
  'Falsy value trap ใน JavaScript — 0, '''', false ล้วน falsy ทั้งนั้น'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (22, 1, 'ปัญหา', 'Field copy ใน table history เป็น NULL ทุก record ทั้งที่ CSV ต้นทางมีค่า 0 อยู่

แต่ใน table text_line field เดียวกันมีค่า 0 ถูกต้อง — แสดงว่า CSV อ่านได้ถูก แต่หายตอน insert history', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (22, 2, 'สาเหตุ: || กับ falsy value', 'ใน code มีบรรทัด:
copy: line.copy || undefined

JavaScript ถือว่า 0 เป็น falsy
ดังนั้น 0 || undefined === undefined
Prisma รับ undefined → บันทึกเป็น NULL', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (22, 3, 'Fix: ใช้ ?? แทน ||', 'เปลี่ยนจาก:
copy: line.copy || undefined

เป็น:
copy: line.copy ?? 0

?? (nullish coalescing) ตรวจเฉพาะ null หรือ undefined เท่านั้น
0, '''', false — ผ่านได้หมด ไม่ถูก replace', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (22, 4, 'Key Learning', '|| กับ ?? ต่างกันมาก:

|| → falsy: 0, '''', false, null, undefined ล้วน trigger
?? → nullish only: เฉพาะ null และ undefined เท่านั้น

ถ้า field อาจเป็น 0 หรือ false ที่ถูกต้อง → ใช้ ?? เสมอ
|| ใช้เฉพาะตอนต้องการ default ที่ไม่สนใจ falsy values', true);

-- ============================================================
-- NOTE 23 — Prisma groupBy misuse inflated count
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  23,
  'prisma-groupby-misuse-inflated-count',
  'Prisma groupBy ใช้ใน where clause ทำให้ count ออกมาเกินจริง',
  'นับ job เจอ 3,642 แต่จริงๆ มีแค่หลักร้อย — เพราะ groupBy อยู่ผิดที่',
  ARRAY['Prisma', 'TypeScript', 'Node.js', 'Debugging'],
  '2025',
  '2 min',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
  'Prisma groupBy — ต้องเป็น top-level method ไม่ใช่ใน where clause'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (23, 1, 'ปัญหา', 'Dashboard นับจำนวน job group ในระบบ Nova
Query คืนค่า 3,642 แต่ทีม verify แล้วมีจริงแค่หลักร้อย

อยากได้: นับ unique combinations ของ or_no + bussi_name + sender + ACTION', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (23, 2, 'โค้ดที่ผิด', 'const count = await prisma.history.count({
  where: {
    // ผิด: groupBy ไม่ใช่ option ของ where
    groupBy: [''or_no'', ''bussi_name'', ''sender'', ''ACTION'']
  }
})

Prisma ไม่ error — แต่ ignore groupBy และ count ทุก record แทน
ผลลัพธ์คือ 3,642 (จำนวน row ทั้งหมด)', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (23, 3, 'Fix', 'const groups = await prisma.history.groupBy({
  by: [''or_no'', ''bussi_name'', ''sender'', ''ACTION''],
  where: { new: 0 }
})

const count = groups.length

groupBy เป็น top-level method — ไม่ใช่ parameter ของ count() หรือ findMany()', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (23, 4, 'Key Learning', 'Prisma ไม่ throw error เมื่อใส่ key ที่ไม่รู้จักใน where — มัน silently ignore
ทำให้ bug แบบนี้หาเจอยากมากเพราะไม่มี error

ถ้า count ผิดปกติ → ตรวจสอบว่า query structure ถูก type ไหม
ใช้ TypeScript strict mode ช่วยจับ misuse ได้', true);

-- ============================================================
-- NOTE 24 — find -mtime vs -mmin cron backup
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  24,
  'snipeit-cron-backup-mtime',
  'find -mtime ทำงานไม่ตรงตามที่คิด',
  'ตั้ง DAYS=3 แต่ไฟล์อายุ 3 วันไม่ถูกจับ — เพราะ -mtime นับแบบ integer block',
  ARRAY['Linux', 'Bash', 'Cron', 'Snipe-IT'],
  '2026',
  '4 min',
  'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80',
  'Script สำรองข้อมูล Snipe-IT จาก sv51 ไปยัง NAS83 อัตโนมัติทุกสัปดาห์'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (24, 1, 'Context', 'สร้าง snipeit-backup-archive.sh เพื่อย้ายไฟล์ backup เก่าจาก /var/www/snipeit/storage/app/backups ไปเก็บที่ NAS83

ใช้ DAYS=3 เป็น threshold แต่พอทดสอบ — ไม่มีไฟล์ถูกจับเลย ทั้งที่มีไฟล์อายุ 3 วันอยู่ชัดๆ', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (24, 2, 'สาเหตุ: -mtime ใช้ integer 24h block', 'find -mtime +3 หมายถึง "เก่ากว่า 4 × 24 ชั่วโมง" ไม่ใช่ "เก่ากว่า 3 วัน"

ไฟล์อายุ 3 วัน 23 ชั่วโมง → ยังไม่ถึง 4 block → ไม่ถูกจับ
ต้องรอจนครบ 96 ชั่วโมงเต็มๆ ถึงจะเจอ', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (24, 3, 'วิธีแก้: ใช้ -mmin แทน', 'เปลี่ยนจาก:
find ... -mtime +$DAYS

เป็น:
find ... -mmin +$(( DAYS * 24 * 60 ))

-mmin ทำงานระดับนาที ได้ผลตรงกว่ามาก ไม่มีเรื่อง integer block', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (24, 4, 'ปัญหาที่สองใน script เดียวกัน', 'artisan backup ให้ error "proc_open(): posix_spawn() failed: Permission denied" เพราะ script รัน artisan จากผิด working directory

แก้จาก:
sudo -u snipeit php artisan snipeit:backup

เป็น:
su -s /bin/bash snipeit -c "cd /var/www/snipeit && php artisan snipeit:backup"

artisan ต้องการ working directory ถูกต้องเสมอ', true);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (24, 5, 'Key Learning', 'find -mtime เหมาะกับ rough filter เท่านั้น ถ้าต้องการ precision ให้ใช้ -mmin หรือ -newer

และ artisan command ทุกตัวต้องรันจาก project root (/var/www/snipeit) เสมอ — ไม่งั้น config ไม่โหลด', true);

-- ============================================================
-- NOTE 25 — 502 Bad Gateway backend unreachable
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  25,
  'nginx-502-network-unreachable',
  '502 Bad Gateway — ไม่ใช่ Nginx พัง แต่ backend หายไปจาก network',
  'debug ผิดที่ config นาน 30 นาที สุดท้าย ping ไป server ไม่ถึงเลย',
  ARRAY['Nginx', 'Docker', 'Networking', 'Snipe-IT'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'Snipe-IT reverse proxy ผ่าน Nginx — 502 ที่เกิดจาก backend ล่ม ไม่ใช่ config ผิด'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (25, 1, 'สถานการณ์', 'Snipe-IT รัน proxy ผ่าน Nginx ที่ /snipeit/ ชี้ไปยัง https://192.168.2.251

เข้าเว็บแล้วได้ 502 Bad Gateway — เริ่ม debug ที่ Nginx config ก่อนเลย แก้ SSL directive, rewrite rule อยู่นาน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (25, 2, 'วิธี debug ที่ถูก', 'ทดสอบเป็นลำดับ:

1. curl -k https://192.168.2.251 → timeout
2. curl http://192.168.2.251 → timeout
3. ping 192.168.2.251 → "Destination host unreachable" from gateway 172.16.10.1

ขั้นที่ 3 บอกชัดเจนว่า: server ไม่อยู่บน network เลย — ไม่ใช่เรื่อง Nginx', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (25, 3, 'Key Learning', '502 Bad Gateway มีสาเหตุได้หลายอย่าง อย่า assume ว่าเป็น Nginx config ผิดเสมอ

ก่อน debug config ให้ verify ก่อนว่า backend เข้าถึงได้จริงด้วย ping/curl ตรงๆ ประหยัดเวลาได้มาก

ถ้า ping ไม่ถึง → ปัญหาอยู่ที่ network หรือ server — ไม่ใช่ config', true);

-- ============================================================
-- NOTE 26 — VITE_ env vars build-time vs runtime
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  26,
  'vite-env-vars-build-time',
  'VITE_ environment variables ต้อง inject ตอน build ไม่ใช่ runtime',
  'ใส่ env ใน docker-compose แล้วทำไม API URL ยังเป็น undefined — เพราะ Vite embed ค่าตอน build เสร็จแล้ว',
  ARRAY['Vite', 'Docker', 'React', 'DevOps'],
  '2025',
  '3 min',
  'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80',
  'Vite build process — env vars ถูก embed ลง static files ตอน build ไม่ใช่ runtime'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (26, 1, 'ปัญหา', 'Deploy Nova web app บน Docker Swarm ใส่ VITE_API_BASE_URL ใน environment ของ stack file

แต่หลัง deploy — browser console แสดง API URL เป็น undefined หรือค่าเก่า ทั้งที่ container มี env var ถูกต้อง', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (26, 2, 'เหตุผล: Vite คือ build-time tool', 'Vite แทนที่ import.meta.env.VITE_* ทุกตัวด้วยค่าจริงตอน npm run build

ผลลัพธ์คือ static JS ที่มีค่า hard-coded อยู่แล้ว:

// ก่อน build
const url = import.meta.env.VITE_API_BASE_URL

// หลัง build (ใน dist/)
const url = "https://api.profile.co.th"

Runtime environment ของ container ไม่มีผลเลย เพราะค่าถูก embed ไปแล้ว', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (26, 3, 'Fix: ส่ง env เป็น --build-arg', 'ต้องส่งค่าตอน build:

docker build \
  --build-arg VITE_API_BASE_URL="https://api.profile.co.th" \
  -t myapp:latest .

และใน Dockerfile:
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

ถ้าใช้ GitHub Actions: ส่งเป็น secrets แล้วใส่ใน build-args step', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (26, 4, 'Key Learning', 'VITE_* env vars ≠ runtime env vars
มันถูกอ่านและ embed ตอน build เท่านั้น

ถ้าค่าเปลี่ยน → ต้อง rebuild image ใหม่ทุกครั้ง
ไม่มีทางเปลี่ยน VITE_ vars ใน container ที่ build แล้ว', true);

-- ============================================================
-- NOTE 27 — NPM Custom Locations vs Advanced tab
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  27,
  'npm-custom-location-vs-advanced',
  'Nginx Proxy Manager: Custom Locations ทำให้ระบบ offline',
  'ย้าย Nginx config ไป NPM แล้วใส่ /snipeit/ ใน Custom Locations tab — ทุกอย่างดับ',
  ARRAY['Nginx', 'Docker', 'Snipe-IT', 'DevOps'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
  'Nginx Proxy Manager — Custom Locations กับ Advanced tab ทำงานต่างกันมาก'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (27, 1, 'สถานการณ์', 'ย้าย Nginx config ดั้งเดิมไปใช้ Nginx Proxy Manager (NPM) ใน Docker Swarm

ต้องการ proxy /snipeit/ ชี้ไปยัง https://192.168.2.251 มี custom rewrite rule

ใส่ใน Custom Locations tab → ระบบ offline ทันที ทุก site เข้าไม่ได้เลย', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (27, 2, 'สาเหตุ', 'Custom Locations tab ใน NPM generate Nginx config ในลักษณะที่ conflict กับ main server block ได้ง่ายมาก

โดยเฉพาะถ้ามี rewrite rule หรือ proxy_pass ที่ซับซ้อน NPM จัดการ syntax ให้ไม่ถูกต้อง → Nginx reload fail → ทุก proxy host ดับพร้อมกัน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (27, 3, 'Fix: ใช้ Advanced tab แทน', 'ใส่ location block ใน Advanced tab แทน:

location /snipeit/ {
    rewrite ^/snipeit/(.*) /$1 break;
    proxy_pass https://192.168.2.251;
    proxy_ssl_verify off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

Advanced tab inject config โดยตรงใน server block — ไม่ผ่าน UI parser', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (27, 4, 'Key Learning', 'NPM Custom Locations tab เหมาะกับ location block ง่ายๆ เท่านั้น

ถ้ามี rewrite rule, proxy_ssl directives, หรือ header manipulation → ใช้ Advanced tab เสมอ

ก่อน save config ที่ซับซ้อนใน NPM → ควรเตรียม emergency SSH access ไว้ก่อนทุกครั้ง', true);

-- ============================================================
-- NOTE 28 — SQL Server Collation rebuild
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  28,
  'sqlserver-collation-rebuild',
  'เปลี่ยน Collation SQL Server Thai_CS_AS → Thai_CI_AS',
  'ต้อง rebuild system database — ไม่ใช่แค่ ALTER DATABASE — และต้องวางแผนดีก่อนทำ',
  ARRAY['SQL Server', 'Collation', 'DBA'],
  '2026',
  '4 min',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  'SQL Server Collation change — operation ที่ทำแล้วย้อนยากมาก'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (28, 1, 'ทำไมถึงต้องเปลี่ยน', 'Server collation เป็น Thai_CS_AS (Case Sensitive) ทำให้ query ที่ใช้ตัวพิมพ์เล็ก/ใหญ่ต่างกันไม่ match

เช่น WHERE username = ''Admin'' ≠ WHERE username = ''admin''

ต้องการเปลี่ยนเป็น Thai_CI_AS (Case Insensitive) เพื่อให้ query ยืดหยุ่นกว่า', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (28, 2, 'สิ่งที่คนมักเข้าใจผิด', 'ALTER DATABASE [mydb] COLLATE Thai_CI_AS

ใช้ได้กับ database-level collation แต่ไม่เปลี่ยน server-level collation

การเปลี่ยน server collation ต้อง rebuild system databases (master, msdb, model) ด้วย Setup.exe:

Setup.exe /QUIET /ACTION=REBUILDDATABASE
  /INSTANCENAME=MSSQLSERVER
  /SQLCOLLATION=Thai_CI_AS

การ rebuild นี้ลบ logins, jobs, linked servers ทั้งหมด ต้อง script ออกก่อน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (28, 3, 'สิ่งที่ต้องทำก่อน', '1. Backup ทุก database ครบ
2. Script ออก: logins, SQL Agent jobs, linked servers, sp/function ที่สำคัญ
3. หลัง rebuild → restore databases และ re-run scripts ทั้งหมด
4. เปลี่ยน column collation ทีละ column ด้วย ALTER COLUMN (index ต้อง drop ก่อน rebuild)', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (28, 4, 'Key Learning', 'Server collation กับ database collation คือคนละ level กัน

ถ้าต้องการเปลี่ยนแค่ database → ALTER DATABASE ได้เลย
ถ้าต้องการเปลี่ยน server level → rebuild system DB — ใช้เวลานาน มีความเสี่ยงสูง ต้องวางแผนดี

พิจารณาเปลี่ยน collation ระดับ column เฉพาะที่จำเป็นแทนการเปลี่ยน server ทั้งหมด', true);

-- ============================================================
-- NOTE 29 — PowerShell migrate DB FK order
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  29,
  'powershell-migration-fk-order',
  'PowerShell migrate DB: TRUNCATE ล้มเหลวแม้ disable FK แล้ว',
  'pfindex_test → pfindex migration — แก้ FK, DELETE/INSERT order, และ array reversal bug',
  ARRAY['SQL Server', 'PowerShell', 'Migration'],
  '2026',
  '4 min',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
  'Script Sync-PfindexFromTest.ps1 — sync 26 tables จาก test สู่ production'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (29, 1, 'Context', 'ต้องการ sync ข้อมูลจาก pfindex_test → pfindex (production) ด้วย PowerShell script

มีความซับซ้อนเพิ่ม: OriginalHistory อยู่ใน dbo schema ที่ test แต่อยู่ใน pfmaster schema ที่ production', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (29, 2, 'Bug 1: TRUNCATE ล้มเหลวแม้ NOCHECK แล้ว', 'TRUNCATE TABLE ไม่สามารถใช้กับ table ที่มี FK reference แม้จะ ALTER TABLE NOCHECK CONSTRAINT ALL ไว้แล้ว

SQL Server ไม่ยอม TRUNCATE ถ้ามี FK อ้างอิงอยู่เลย ไม่ว่า constraint จะ enable อยู่หรือเปล่า

Fix: เปลี่ยนจาก TRUNCATE เป็น DELETE FROM และแยกเป็น 2 phase:
- Phase 1: DELETE ทุก table เรียงจาก child → parent
- Phase 2: INSERT เรียงจาก parent → child', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (29, 3, 'Bug 2: PowerShell array reversal', 'ต้องการ reverse array เพื่อ DELETE ในลำดับกลับกัน เขียนว่า:

[System.Linq.Enumerable]::Reverse($DboTables)

แต่ PowerShell array ไม่ implement IEnumerable แบบที่ Linq คาดหวัง

Fix ใช้ slice syntax แทน:
$DboTables[-1..-($DboTables.Count)]', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (29, 4, 'Bug 3: SSL + Execution Policy', 'รัน script ครั้งแรกเจอ 2 error พร้อมกัน:

1. Execution policy block: ใช้ Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
2. SSL cert error: เพิ่ม TrustServerCertificate = $true ใน Invoke-Sqlcmd params', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (29, 5, 'Key Learning', 'TRUNCATE กับ DELETE ไม่เหมือนกัน — TRUNCATE ติด FK เสมอ ไม่ว่า constraint จะ enabled หรือไม่

ถ้า migrate หลาย table ที่มี FK ระหว่างกัน ต้อง map dependency graph ก่อน แล้ว DELETE/INSERT ตามลำดับที่ถูกต้อง', true);

-- ============================================================
-- NOTE 30 — Cisco SG350 Netmiko ciscosb model
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  30,
  'cisco-sg350-netmiko-ciscosb-model',
  'Backup Cisco SG350/SG300 ด้วย Python: ต้องใช้ model ciscosb ไม่ใช่ cisco_ios',
  'Netmiko มี driver แยกสำหรับ Small Business series — cisco_ios ไม่ work กับ SG350',
  ARRAY['Cisco', 'Python', 'Networking', 'Oxidized'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'Cisco SG350-28 และ SG300-28 — Small Business switch ที่ใช้ IOS แตกต่างจาก Enterprise'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (30, 1, 'ปัญหาเริ่มต้น', 'ต้องการ backup config ของ Cisco SG350-28 และ SG300-28

ใช้ Netmiko device_type: cisco_ios → SSH connect ได้แต่ command ไม่ work
เพราะ SG350/SG300 เป็น Small Business series — CLI ต่างจาก Enterprise IOS', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (30, 2, 'Fix: ใช้ ciscosb model', 'from netmiko import ConnectHandler

device = {
    ''device_type'': ''cisco_s300'',  # ← ถูกต้อง ไม่ใช่ cisco_ios
    ''host'': ''192.168.2.44'',
    ''username'': ''spaprofile'',
    ''password'': ''YOUR_PASSWORD'',
}

conn = ConnectHandler(**device)
output = conn.send_command(''show running-config'')
conn.disconnect()

Oxidized ใช้ model ''ciscosb'' — ตัวเดียวกัน แค่ชื่อต่างกัน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (30, 3, 'Per-device credential', 'Cisco SG350/SG300 อาจใช้ credential ต่างจาก device อื่นในระบบ
Oxidized รองรับ per-device credential ใน router.db:

192.168.2.44:ciscosb:username:password

หรือใน config:
source:
  default: csv
  csv:
    file: /opt/oxidized/data/router.db
    delimiter: '':''
    map:
      name: 0
      model: 1
      username: 2
      password: 3', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (30, 4, 'Key Learning', 'Cisco มีหลาย product line ที่ใช้ CLI ต่างกัน:
- IOS (Enterprise): cisco_ios, cisco_xe
- Small Business (SG series): ciscosb, cisco_s300
- NX-OS: cisco_nxos

ถ้า SSH ได้แต่ command ไม่ work → ตรวจสอบ device_type/model ก่อน', true);

-- ============================================================
-- NOTE 31 — React print footer overflow
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  31,
  'react-print-footer-last-page-overflow',
  'React print: footer หายบนหน้าสุดท้าย',
  'Content เต็ม 6 แถว + summary → overflow ดัน footer ออกนอก printable area',
  ARRAY['React', 'TypeScript', 'Print', 'Nova'],
  '2025',
  '3 min',
  'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80',
  'Print pagination — ควบคุมจำนวน row ต่อหน้าให้มี room สำหรับ footer'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (31, 1, 'ปัญหา', 'Report template: 6 rows ต่อหน้า + footer (วันที่พิมพ์, เลขหน้า)

หน้าสุดท้ายที่มีพอดี 6 แถว + summary row → content overflow → footer ถูกดันออกหน้า

หน้าอื่นทำงานปกติ เพราะมี rows น้อยกว่า 6', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (31, 2, 'วิธีแก้: limit หน้าสุดท้ายให้มีแค่ 5 rows', 'เปลี่ยน pagination logic:

// เดิม: ทุกหน้ามี 6 rows
const ROWS_PER_PAGE = 6

// ใหม่: หน้าสุดท้ายมีได้แค่ 5
function calculateTotalPages(total) {
  const full = Math.floor(total / ROWS_PER_PAGE)
  const remainder = total % ROWS_PER_PAGE
  if (remainder === 0) return full + 1
  if (remainder >= 5) return full + 2
  return full + 1
}', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (31, 3, 'ปัญหาย่อย: ทุกหน้า reserve space สำหรับ summary', 'เจอ bug ซ้อน: CSS ใช้ flex: 1 reserve space สำหรับ summary section ทุกหน้า
ทั้งที่ summary แสดงแค่หน้าสุดท้าย

Fix: เปลี่ยนจาก flex layout เป็น fixed height
และใส่ summary HTML เฉพาะหน้าสุดท้ายเท่านั้น ไม่ reserve space ไว้', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (31, 4, 'Key Learning', 'Print layout ต้องทดสอบกับ edge cases: N rows พอดี, N+1 rows, หน้าเดียว, หลายร้อยหน้า

ถ้า footer หาย → มักเกิดจาก content overflow
ตรวจสอบ: ทุกหน้า reserve space อะไรบ้างที่ไม่จำเป็นต้องมีในทุกหน้า', true);

-- ============================================================
-- NOTE 32 — Task Scheduler network drive mapping
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  32,
  'task-scheduler-network-drive',
  'Batch script ทำงานใน Task Scheduler แต่ไม่ได้ผล',
  'รัน manual ได้ปกติ แต่ Task Scheduler fail — เพราะ network drive ไม่ได้ mount',
  ARRAY['Windows', 'Batch', 'Task Scheduler', 'Networking'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80',
  'Task Scheduler ทำงาน context ต่างจาก interactive session — drive mapping ไม่ติด'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (32, 1, 'ปัญหา', 'Script backup MySQL ที่อ่านไฟล์จาก A:\ drive ทำงานปกติตอนรัน manual

แต่พอตั้ง Task Scheduler ให้รันอัตโนมัติ — ไม่เจอไฟล์เลย ไม่มี error แค่ไม่ทำงาน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (32, 2, 'สาเหตุ', 'Task Scheduler รัน task ใน non-interactive session ของ Windows

Network drive ที่ map ไว้ใน Windows Explorer (A:\ → \\10.20.1.83\Backup2026) เป็น user-session mapping — ไม่ available ใน service/task session

Script เข้าถึง A:\ ได้ตอน manual เพราะ user login อยู่ ตอน Task Scheduler ไม่มี user session → A:\ ไม่มี', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (32, 3, 'Fix: map drive ใน script เอง', 'เพิ่มต้น script:

net use A: /delete /y 2>nul
net use A: "\\10.20.1.83\Backup2026" /persistent:no
if %ERRORLEVEL% neq 0 (
    echo ERROR: Cannot map network drive >> %LOGFILE%
    exit /b 1
)

/persistent:no สำคัญมาก — ไม่ให้ Windows พยายาม remember mapping ข้าม session', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (32, 4, 'Key Learning', 'Task Scheduler ไม่ inherit network drive จาก user session เลย

ทุก script ที่ต้องเข้า network path ใน Task Scheduler ต้อง map drive เองในช่วงต้น script และ unmap ก่อนจบ

ใช้ UNC path (\\server\share) แทน drive letter ได้เลย ถ้าไม่จำเป็นต้องใช้ letter', true);

-- ============================================================
-- NOTE 33 — GitHub token exposed revoke SSH key
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  33,
  'github-token-exposed-in-chat-logs',
  'GitHub token หลุดในแชทและ logs หลายครั้ง — revoke ทันทีทุกครั้ง',
  'paste config แล้วลืมว่ามี token อยู่ใน URL — ต้อง revoke ภายในนาทีก่อน GitHub bot เก็บได้',
  ARRAY['GitHub', 'Security', 'Oxidized', 'DevOps'],
  '2026',
  '2 min',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
  'Personal Access Token ที่หลุด — GitHub scan bot เจอเองภายในไม่กี่นาที'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (33, 1, 'สถานการณ์', 'ระหว่าง setup Oxidized Git remote URL ใส่ token ใน URL:
https://ghp_xxxx@github.com/patipark/profile-network-configs.git

แล้ว paste config ลงในแชท หรือ log ออกมาใน terminal ที่ share อยู่ — token โผล่ทันที

เกิดขึ้นหลายครั้งระหว่าง setup เพราะ debug แล้ว print config ออกมา', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (33, 2, 'วิธีตอบสนองทันที', '1. ไป https://github.com/settings/tokens
2. หา token ที่หลุด → Revoke ทันที
3. สร้าง token ใหม่
4. แก้ไข remote URL ใน Oxidized config

GitHub มี secret scanning bot — ถ้า token ถูก push ขึ้น public repo จะถูก revoke อัตโนมัติ แต่ถ้าหลุดในที่อื่นต้อง manual revoke', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (33, 3, 'วิธีป้องกัน: ใช้ SSH key แทน token ใน URL', 'แทนที่จะใส่ token ใน remote URL:
https://ghp_xxx@github.com/user/repo.git

ใช้ SSH:
git@github.com:user/repo.git

ตั้งค่า SSH key ใน GitHub → ไม่มี credential โผล่ใน config หรือ log เลย', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (33, 4, 'Key Learning', 'Token ใน URL โผล่ใน:
- git log, git remote -v
- docker config ที่ print ออกมา
- log ของ application
- แชทสนับสนุนเมื่อ paste config เพื่อ debug

งาน git operation ที่ต้องการ auth → ใช้ SSH key เสมอ ไม่ใช่ token ใน URL', true);

-- ============================================================
-- NOTE 34 — นับกล่องใน warehouse: status NULL
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  34,
  'iscarton-in-storage-logic',
  'นับกล่องใน warehouse: status NULL ไม่ได้แปลว่า "ไม่อยู่"',
  'COUNT(*) WHERE status = 2 ได้ตัวเลขผิด — กล่อง 112,000+ ใบมี status NULL แต่ยังอยู่ใน storage จริง',
  ARRAY['SQL Server', 'CartonSystem', 'Warehouse'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'กล่อง 770,444 ใบในระบบ — นับยังไงให้ตรงกับความเป็นจริง'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (34, 1, 'ปัญหา', 'Dashboard warehouse แสดงตัวเลขกล่องในคลังไม่ตรงกับของจริง

ใช้ WHERE status = 2 (in storage) → ได้ตัวเลขต่ำกว่าจริงมาก

สาเหตุ: กล่องจำนวนมากที่ยังอยู่ในคลังมี status = NULL ไม่ใช่ status = 2', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (34, 2, 'isCartonInStorage Logic', 'ระบบ CartonSystem ใช้ logic:

- status = 2 → อยู่ใน storage ชัดเจน
- status = NULL → ดูจาก lastin กับ lastout
  - ถ้า lastin >= lastout (หรือ lastout เป็น NULL) → กล่องอยู่ใน storage
  - ถ้า lastout > lastin → กล่องอยู่กับลูกค้า', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (34, 3, 'Query ที่ถูกต้อง', 'WHERE (
  status = 2
  OR (
    status IS NULL
    AND (
      lastout IS NULL
      OR lastin >= lastout
    )
  )
)

ผล: ได้ 597,379 กล่องที่มี location จริง จากทั้งหมด 770,444 ใบในระบบ', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (34, 4, 'Key Learning', 'อย่า assume ว่า status field เป็น source of truth เสมอ ในระบบเก่าๆ มักมี legacy logic ที่ track ด้วย timestamp แทน

ก่อนทำ dashboard ต้องถามหรือ verify กับ domain expert ก่อนว่า "record นี้ถือว่า active ยังไง"', true);

-- ============================================================
-- NOTE 35 — SSD Ctrl+X recovery network share
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  35,
  'ssd-ctrl-x-recovery',
  'กู้ไฟล์จาก SSD หลัง Ctrl+X แล้ว delete ปลายทาง',
  'SSD + TRIM = โอกาสกู้คืนน้อยมาก — แต่ต้องรู้ว่าโฟกัสที่ไหนก่อน',
  ARRAY['SSD', 'Recovery', 'Windows', 'Networking'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'ไฟล์หายจาก Network Share — ต้องตรวจ Shadow Copy ของ server ก่อน'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (35, 1, 'สถานการณ์', 'ตัด (Ctrl+X) ไฟล์จาก SSD ต้นทาง → วางที่ Network Share ปลายทาง → ลบทิ้งบน Share

ต้นทาง SSD ไม่มีไฟล์แล้ว (ย้ายออกสมบูรณ์) → ไม่ต้องไปงมที่ SSD', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (35, 2, 'ทำไม SSD กู้ยาก', 'SSD มี TRIM — เมื่อลบไฟล์ Windows สั่ง TRIM ให้ SSD ลบข้อมูลจริงทันที ต่างจาก HDD ที่แค่ mark ว่า "ว่าง"

โปรแกรมกู้ไฟล์ทั่วไปจะเจอแค่ไฟล์เปล่า หรือ corrupt', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (35, 3, 'ลำดับที่ต้องทำก่อน', 'กรณีนี้ไฟล์อยู่ที่ Network Share → โฟกัสที่ server:

1. เช็ค Recycle Bin บน server
   \\server\share\$RECYCLE.BIN

2. Shadow Copy / Previous Versions (โอกาสสูงสุด)
   คลิกขวาโฟลเดอร์ → Restore previous versions

3. ถาม IT admin ว่า VSS เปิดอยู่ไหม มี backup ล่าสุดไหม

4. ถ้า Server เป็น Windows Server → ถาม admin เรื่อง Backup Exec / Veeam', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (35, 4, 'Key Learning', 'ก่อน debug — ระบุก่อนว่าไฟล์อยู่ที่ไหนตอนนี้ (SSD หรือ Server) แล้วค่อยเลือกวิธี

ถ้าหายจาก Network Share → server admin คือคนที่ช่วยได้ ไม่ใช่ software กู้ไฟล์บน PC', true);

-- ============================================================
-- NOTE 36 — LibreNMS Storage HOST-RESOURCES-MIB
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  36,
  'librenms-storage-host-resources-mib',
  'LibreNMS ไม่แสดง Storage — ต้องเช็ค HOST-RESOURCES-MIB ก่อน',
  'ข้อมูล CPU, Interface, Memory มาครบ แต่ Storage ว่างเปล่า — SNMP OID คนละ MIB',
  ARRAY['LibreNMS', 'SNMP', 'Networking', 'Monitoring'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'LibreNMS บน ubuntu254 — monitor 5 อุปกรณ์ในเครือข่าย Pro-File'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (36, 1, 'ปัญหา', 'Device ใน LibreNMS แสดงข้อมูล CPU, Interface traffic, Memory ครบ
แต่ Tab Storage ว่างเปล่า ไม่มีข้อมูลเลย

SNMP ทำงานปกติ ไม่มี connection error — แค่ Storage ไม่ขึ้น', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (36, 2, 'สาเหตุ: คนละ MIB', 'Storage ใช้ HOST-RESOURCES-MIB (hrStorageDescr, hrStorageSize)
แยกจาก standard interface/CPU MIBs ที่ใช้ทั่วไป

อุปกรณ์บางรุ่น (เช่น network device ที่ไม่ใช่ server) ไม่ implement HOST-RESOURCES-MIB
จึงไม่มีข้อมูล storage แม้ SNMP ทำงานปกติ', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (36, 3, 'วิธีตรวจสอบ', 'ทดสอบจาก NMS server:
snmpwalk -v2c -c public <DEVICE_IP> 1.3.6.1.2.1.25.2.3.1.3

ถ้าไม่มีผลลัพธ์ → device ไม่รองรับ storage MIB
ถ้ามีผลลัพธ์ → force discovery:

cd /opt/librenms
./discovery.php -h <DEVICE_IP> -m storage -v
./poller.php -h <DEVICE_IP> -m storage -d', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (36, 4, 'Key Learning', '"ข้อมูลอื่นมาหมด แต่ Storage ไม่ขึ้น" = HOST-RESOURCES-MIB ไม่รองรับ

ตรวจด้วย snmpwalk OID 1.3.6.1.2.1.25.2.3.1.3 ก่อนเสมอ
ไม่มีผล → device จะไม่มี Storage tab ใน LibreNMS ไม่ว่าจะ config ยังไงก็ตาม', true);

-- ============================================================
-- NOTE 37 — Hard-code database name ใน raw SQL
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  37,
  'prisma-hardcoded-db-name-raw-sql',
  'Hard-code ชื่อ database ใน raw SQL ทำให้ dev กับ prod ใช้ query เดียวกันไม่ได้',
  'FROM [files_system].[dbo].[history] ใช้ได้แค่ production — dev database ชื่อ files_system_dev',
  ARRAY['SQL Server', 'Prisma', 'Node.js', 'Debugging'],
  '2025',
  '2 min',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
  'Raw SQL ใน Prisma — database prefix ที่ hard-code มักพัง environment อื่น'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (37, 1, 'ปัญหา', 'API /history ทำงานปกติใน production
แต่ dev environment หา record ไม่เจอเลย ทั้งที่ข้อมูลมีอยู่

Confirm ด้วยการรัน query ตรงใน SSMS บน files_system_dev — เจอข้อมูล
แต่ผ่าน API ไม่เจอ', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (37, 2, 'สาเหตุ', 'ใน raw SQL query มีบรรทัด:
FROM [files_system].[dbo].[history]

DATABASE_URL ของ dev ชี้ไปที่ files_system_dev
แต่ query force อ่านจาก files_system (production) อยู่เสมอ

Prisma ส่ง raw SQL ตรงๆ ไม่ได้ replace database name ให้', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (37, 3, 'Fix: ตัดชื่อ database ออก', 'เปลี่ยนจาก:
FROM [files_system].[dbo].[history]

เป็น:
FROM [dbo].[history]

SQL Server จะใช้ database จาก connection string อัตโนมัติ ทั้ง dev และ prod ใช้ query เดียวกันได้', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (37, 4, 'Key Learning', 'ห้าม hard-code database name ใน raw SQL queries
ใช้เฉพาะ schema.table ไม่ต้องมี database prefix

ยกเว้น cross-database query จริงๆ ที่ต้องอ้างถึง database อื่นโดยตั้งใจ
ในกรณีนั้นให้ inject ชื่อ database จาก environment variable แทน', true);

-- ============================================================
-- NOTE 38 — GitHub Actions ARM64 build time
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  38,
  'github-actions-arm64-build-time',
  'ตัด ARM64 ออกจาก Docker build ประหยัดเวลาได้ 5-7 นาที',
  'Multi-platform build (amd64 + arm64) ใช้เวลา 8-12 นาที ตัด arm64 เหลือ 3-5 นาที',
  ARRAY['Docker', 'GitHub Actions', 'DevOps', 'CI/CD'],
  '2025',
  '2 min',
  'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80',
  'GitHub Actions workflow: auto merge dev → main แล้ว build Docker image'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (38, 1, 'Context', 'GitHub Actions workflow push code ไปยัง Docker Hub เมื่อ commit message มีคำว่า ''push to main''

Workflow: merge dev → main → build Docker image → Telegram notification

ปัญหาคือ build ใช้เวลานานมาก กว่า notification จะมา 12+ นาที', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (38, 2, 'ต้นเหตุ: QEMU emulation สำหรับ ARM64', 'platforms: linux/amd64,linux/arm64

การ build arm64 บน amd64 machine ต้องผ่าน QEMU emulation — ช้ากว่า native มาก

Server ทั้งหมดใน infrastructure เป็น x86_64/amd64 ทั้งนั้น — ไม่มีเหตุผลต้อง build arm64', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (38, 3, 'Fix', 'เปลี่ยนแค่บรรทัดเดียว:

# เดิม
platforms: linux/amd64,linux/arm64

# แก้
platforms: linux/amd64

ผล: build time ลดจาก ~12 นาที เหลือ ~4 นาที', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (38, 4, 'Key Learning', 'ถ้าไม่มี ARM device ในใช้งานจริง (Apple Silicon, Raspberry Pi, AWS Graviton) — ไม่มีเหตุผลต้อง build arm64

หลาย project เพิ่ม multi-platform โดย copy config มา โดยไม่ได้คิดว่าต้องการจริงหรือเปล่า
ตรวจ production servers ก่อนว่า architecture อะไร แล้วค่อย build เฉพาะที่จำเป็น', true);

-- ============================================================
-- NOTE 39 — Excel printer settings upload 502
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  39,
  'excel-printer-settings-upload-fail',
  'Excel upload 502 เพราะไฟล์มี printer settings และ Thai filename',
  'ไฟล์เหมือนกันทุกอย่าง แต่ตัวหนึ่ง upload ได้ อีกตัวได้ 502 — ต่างแค่ชื่อไฟล์และ printer settings',
  ARRAY['Excel', 'Upload', 'Encoding', 'Node.js'],
  '2025',
  '3 min',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
  'Excel file structure — printer settings ซ่อนอยู่ใน xl/printerSettings/ ภายใน ZIP'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (39, 1, 'ปัญหา', 'ไฟล์ 2 ไฟล์ข้อมูลเหมือนกัน 137 rows 6 columns:
- ADD__PROFILE_12_25.xlsx → upload สำเร็จ
- ต_นADD__PROFILE_12_25.xlsx → 502 Bad Gateway

ต่างกันแค่ชื่อไฟล์มีภาษาไทย และขนาดต่างกัน (15KB vs 22KB)', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (39, 2, 'สาเหตุ 2 อย่างซ้อนกัน', '1. Thai character ใน filename: "ต_น" → web server หลายตัวไม่รองรับ UTF-8 filename ใน multipart upload header

2. Printer settings: ไฟล์ที่ใหญ่กว่ามี xl/printerSettings1.bin อยู่ใน ZIP structure — Excel บันทึก printer config ไว้ด้วย บาง parser อ่านแล้ว error', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (39, 3, 'Fix: ทำไฟล์ clean ด้วย Python', 'import zipfile, shutil, os

# Excel คือ ZIP — แตกแล้วลบ printer settings
with zipfile.ZipFile(''input.xlsx'', ''r'') as z:
    z.extractall(''tmp_excel'')

# ลบ printer settings
printer_dir = ''tmp_excel/xl/printerSettings''
if os.path.exists(printer_dir):
    shutil.rmtree(printer_dir)

# Repack
with zipfile.ZipFile(''clean.xlsx'', ''w'') as z:
    for f in ...: z.write(f)

ผล: ไฟล์เล็กลงจาก 22KB → 9.56KB และ upload ได้', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (39, 4, 'Key Learning', 'Excel file เป็น ZIP — ถ้า upload fail ให้แตกดูโครงสร้างข้างใน

Thai/Unicode ในชื่อไฟล์ → ใช้ชื่อ ASCII สำหรับ file upload เสมอ

Printer settings ใน Excel ทำให้ไฟล์ใหญ่ขึ้นและบาง parser พัง → ลบออกได้ปลอดภัย', true);

-- ============================================================
-- NOTE 40 — Unix timestamp UTC เสมอ
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  40,
  'unix-timestamp-always-utc',
  'Unix timestamp เก็บเป็น UTC เสมอ — ไม่ว่า server จะอยู่ timezone ไหน',
  'Date.now() บน server ไทย ให้ผลเหมือน Date.now() บน server UK — เพราะ epoch คือ UTC',
  ARRAY['Node.js', 'TypeScript', 'Timezone', 'Nova'],
  '2025',
  '2 min',
  'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80',
  'Unix timestamp — ตัวเลขเดียว ไม่มี timezone แปลแล้วค่อย offset'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (40, 1, 'คำถามที่เกิดขึ้นจริง', 'Code ใน IPTV system ใช้:
const ts = Math.floor(Date.now() / 1000)

คำถาม: timestamp นี้ถูกเก็บเป็น Thai time หรือ UTC?', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (40, 2, 'คำตอบ: UTC เสมอ', 'Unix timestamp = วินาทีที่ผ่านมาตั้งแต่ 1 มกราคม 1970 00:00:00 UTC

Date.now() คืน milliseconds ตาม UTC เสมอ — ไม่ว่า process จะรันบน server ที่ timezone ไหน

User ใน Thailand กับ User ใน UK รัน Date.now() พร้อมกัน → ได้เลขเดียวกัน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (40, 3, 'แปลงเป็น Thai time สำหรับ display', '// เก็บ timestamp เป็น UTC เสมอ (ถูกต้อง)
const stored = Math.floor(Date.now() / 1000)

// แปลงเป็น Thai time ตอนแสดงผล
const thaiTime = new Date(stored * 1000).toLocaleString(''th-TH'', {
  timeZone: ''Asia/Bangkok''
})

// หรือใช้ dayjs
const display = dayjs.unix(stored).tz(''Asia/Bangkok'').format(''DD/MM/YYYY HH:mm:ss'')', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (40, 4, 'Key Learning', 'กฎ: เก็บ timestamp เป็น UTC เสมอ แปลงเป็น local time เฉพาะตอน display

ถ้าเก็บเป็น local time → พอเปลี่ยน server timezone หรือ user อยู่ timezone อื่น ข้อมูลผิดหมด

Date.now() ปลอดภัยใช้ได้เลย — มันเป็น UTC เสมอโดย spec', true);

-- ============================================================
-- NOTE 41 — SQL Workflow SELECT before UPDATE CartonSystem
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  41,
  'carton-sql-workflow',
  'Workflow SQL สำหรับแก้ข้อมูล CartonSystem',
  'SELECT ก่อน ยืนยัน แล้วค่อย UPDATE — pattern ที่ทำซ้ำทุกวัน',
  ARRAY['SQL Server', 'CartonSystem', 'Workflow'],
  '2026',
  '2 min',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  'CartonSystem — ระบบจัดการกล่องเอกสาร ข้อมูลต้องแม่นยำ 100%'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (41, 1, 'Pattern ที่ใช้ซ้ำทุกครั้ง', '1. SELECT * ก่อนเสมอ เพื่อยืนยันว่าจับ record ถูกต้อง
2. ตรวจนับว่า row count ตรงกับที่คาด
3. ถ้าถูกแล้วค่อยเปลี่ยนเป็น UPDATE

ไม่เคย UPDATE ตรงโดยไม่ SELECT ดูก่อน', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (41, 2, 'Pitfall: cartno ไม่มี quotes', 'ปัญหาที่เจอบ่อยที่สุด — copy cartno list มาจาก Excel แล้ว SQL ไม่มี quotes:

ผิด:
cartno IN (TKECAP002325 TKETCS000390)

ถูก:
cartno IN (''TKECAP002325'', ''TKETCS000390'')

SQL Server จะ parse ตัวที่ไม่มี quotes เป็น column name แล้ว error ทันที', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (41, 3, 'Pitfall: ลืมใส่ filter code → UPDATE ข้าม record', 'เคยเจอกรณีที่ UPDATE ถูกต้อง แต่ลืมใส่ filter code → UPDATE ทุก record ที่มี cartno นั้น ข้ามลูกค้าหลายราย

WHERE ต้องมีทั้ง code AND cartno IN (...) เสมอ ขาดอันใดอันหนึ่งไม่ได้', true);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (41, 4, 'Key Learning', 'SELECT ก่อน UPDATE เสมอ — ไม่มีข้อยกเว้น
ใส่ WHERE ทั้ง code และ cartno ครบทุกครั้ง
ถ้า row count ไม่ตรง → หยุด ตรวจสอบ อย่า proceed', true);

-- ============================================================
-- NOTE 42 — Windows Server slmgr rearm
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  42,
  'windows-server-evaluation-slmgr-rearm',
  'ยืด Windows Server Evaluation ด้วย slmgr /rearm',
  'Trial หมดอายุ กลัว server ดับ — rearm ต่อเวลาได้สูงสุด 3 ครั้ง รวม 180 วัน',
  ARRAY['Windows Server', 'License', 'SV70'],
  '2025',
  '2 min',
  'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80',
  'Windows Server Evaluation — ใช้สำหรับ test/dev ก่อน license จริงพร้อม'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (42, 1, 'Context', 'Windows Server Evaluation edition มีอายุ 180 วัน (6 เดือน)
ถ้าหมดอายุโดยไม่ activate → server reboot ทุก 1 ชั่วโมง และสุดท้ายบังคับปิดเครื่อง', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (42, 2, 'slmgr /rearm คืออะไร', 'เป็นคำสั่ง reset grace period ของ Windows activation

ทำได้สูงสุด 3 ครั้ง (รวม initial = 4 × 30 วัน = 180 วัน)

# ตรวจสอบสถานะก่อน
slmgr /dlv

# ดู rearm count ที่เหลือ
slmgr /xpr

# Rearm (ต้อง run as Administrator)
cscript %windir%\system32\slmgr.vbs /rearm

หลังรันต้อง restart เครื่อง', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (42, 3, 'PowerShell version', '# ดูสถานะ
Get-WmiObject -query ''select * from SoftwareLicensingProduct'' |
  Where-Object {$_.PartialProductKey} |
  Select-Object Name, LicenseStatus, GracePeriodRemaining

# Rearm ผ่าน WMI
$sls = Get-WmiObject SoftwareLicensingService
$sls.ReArmWindows()', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (42, 4, 'Key Learning', 'slmgr /rearm ไม่ใช่การ activate — แค่ต่ออายุ grace period
ทำได้สูงสุด 3 ครั้ง หลังจากนั้นต้อง activate จริงหรือ reinstall

ถ้าใช้ใน production → ต้องหา license จริง evaluation ไม่ suitable สำหรับ production workload', true);

-- ============================================================
-- NOTE 43 — Shared Printer Error 0x00000709 PrintNightmare
-- ============================================================
INSERT INTO notes (id, slug, title, subtitle, tags, note_year, read_time, hero_image, hero_caption)
VALUES (
  43,
  'printer-shared-error-0x00000709-printnight',
  'Shared Printer Error 0x00000709 บน Windows 11 — PrintNightmare legacy',
  'Windows Update หลัง PrintNightmare patch บล็อก shared printer install — ต้องแก้ Registry หรือลง driver local ก่อน',
  ARRAY['Windows', 'Printer', 'Networking'],
  '2026',
  '3 min',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
  'HP LaserJet Pro M12a shared จาก CENTER-SAWITREEK — Windows 11 block install หลัง patch'
);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (43, 1, 'ปัญหา', 'Windows 11 ติดตั้ง shared printer จาก server CENTER-SAWITREEK ไม่ได้
Error 0x00000709: "Cannot complete the install of the printer"

Share path ถูกต้อง เห็น printer จาก network แต่ double-click แล้ว error', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (43, 2, 'สาเหตุ: PrintNightmare Security Patch', 'Microsoft ออก patch หลัง PrintNightmare vulnerability (CVE-2021-34527)

Patch บังคับให้ admin privileges เพื่อ install printer driver จาก network
Windows 11 strict กว่า Windows 10 มาก — Block shared printer installation บาง configuration โดย default', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (43, 3, 'วิธีแก้ที่ทำงานได้', '# วิธีที่ 1: แก้ Registry
HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Print
RpcAuthnLevelPrivacyEnabled = 0

# วิธีที่ 2: ลง driver local ก่อน (แนะนำ)
1. Download HP M12a PCL 6 Driver จาก hp.com
2. ติดตั้งแบบ "Add a local printer or network printer with manual settings"
3. หลังลง driver แล้ว → add shared printer จะผ่าน

# วิธีที่ 3: ตรวจสอบ Print Spooler ฝั่ง server
Get-Service -Name Spooler | Select Status
# ถ้า Stopped → Start-Service Spooler', false);
INSERT INTO note_sections (note_id, section_order, heading, body, is_callout) VALUES (43, 4, 'Key Learning', 'Error 0x00000709 บน Windows 11 มักเกิดจาก PrintNightmare patch ไม่ใช่ network issue

ถ้า ping server ได้ เห็น share ได้ แต่ install ไม่ได้ → ปัญหาอยู่ที่ security policy

วิธีที่ปลอดภัยที่สุด: ลง driver local ก่อน ไม่ต้องแก้ Registry', true);

-- ============================================================
-- Reset sequences
-- ============================================================
SELECT setval('notes_id_seq', (SELECT MAX(id) FROM notes));
SELECT setval('note_sections_id_seq', (SELECT MAX(id) FROM note_sections));
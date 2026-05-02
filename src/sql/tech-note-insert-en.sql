-- ============================================================
-- ENGLISH TRANSLATIONS FOR NOTES + NOTE_SECTIONS
-- Run AFTER tech-note-insert.sql
-- ============================================================

-- Add _en columns (safe to run even if already exist)
ALTER TABLE notes ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS subtitle_en TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS hero_caption_en TEXT;
ALTER TABLE note_sections ADD COLUMN IF NOT EXISTS heading_en TEXT;
ALTER TABLE note_sections ADD COLUMN IF NOT EXISTS body_en TEXT;

-- ============================================================
-- NOTE 1 — Crystal Reports crash on Thai combining character
-- ============================================================
UPDATE notes SET
  title_en = 'Crystal Reports Crashes on Thai ์ (mai tai khu) at End of String',
  subtitle_en = 'C# report throws Access Violation 0xc0000005 — not null, not bad data, but a Unicode combining character',
  hero_caption_en = 'Crystal Reports crashes with dept ending in ์ — e.g., โลจิสติกส์'
WHERE id = 1;

UPDATE note_sections SET heading_en = 'Symptoms', body_en = 'Crystal Reports (.rpt) worked fine with most clients but crashed immediately with BPFL-25 with Access Violation 0xc0000005. Tried null checks, data structure mismatch, string length — none of them were the cause.' WHERE note_id = 1 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Root Cause', body_en = 'Crystal Report engine has a bug with the Thai Unicode combining character "์" (mai tai khu U+0E4C) when it appears at the very end of a string.

e.g., dept = "โลจิสติกส์" → crash
Remove "ส์" leaving "โลจิสติก" → works
Add "ส์" back → crashes again

Confirmed that a combining character at the end of a string is the direct cause.' WHERE note_id = 1 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: CASE Statement in SQL', body_en = 'Fix at the query level before passing to Crystal Reports:

SELECT
  CASE
    WHEN dept LIKE N''%์''
    THEN dept + '' ''
    ELSE dept
  END AS dept
FROM ...

Append a trailing space when the value ends with ์ — Crystal Reports accepts it and the displayed data remains correct.' WHERE note_id = 1 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Crystal Reports has a known issue with Thai combining characters at the end of strings.

If a report crashes for no obvious reason and the data contains Thai — check for ์ ็ ่ ้ ๊ ๋ at the end of fields first.

Fix at the SQL level with CASE + trailing space is better than trying to fix Crystal, since Crystal has no configuration to handle this.' WHERE note_id = 1 AND section_order = 4;

-- ============================================================
-- NOTE 2 — Debezium cascade crash every morning
-- ============================================================
UPDATE notes SET
  title_en = 'App Dies Every Morning Due to Debezium Crash Loop',
  subtitle_en = 'Nova API serving 502 since morning — root cause isn''t the API but Debezium CDC stuck in restart loop',
  hero_caption_en = 'Cascade failure in Docker Swarm — one crashing service pulls another down with it'
WHERE id = 2;

UPDATE note_sections SET heading_en = 'Symptoms', body_en = 'Every morning around 06:00, Nova API returned 502 Bad Gateway. Had to manually restart the stack every day. Logs suggested nova_api_web was down — but in reality nova_api restarted due to an unhandled promise rejection and started returning 502 to Debezium.' WHERE note_id = 2 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Root Cause: Cascade Failure', body_en = 'What actually happened:

1. nova_api restarts (unhandled promise rejection)
2. During restart → returns 502 to Debezium connector
3. Debezium has no error tolerance → exhausts retries and crashes (exit code 1)
4. Debezium enters restart loop every ~1:49 minutes
5. nova_api comes back online, but Debezium is still looping

Looking only at nova_api logs means never finding the real root cause.' WHERE note_id = 2 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix 1: Debezium Error Tolerance', body_en = 'Add config to connector:

errors.tolerance=all
errors.retry.delay.max.ms=60000
errors.retry.timeout=-1

-1 = retry indefinitely — Debezium will wait for API to come back instead of crashing.' WHERE note_id = 2 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Fix 2: Fix Unhandled Rejection in index.ts', body_en = 'Found initializeApp() was called twice in index.ts — causing a startup race condition.

The old unhandledRejection handler called process.exit() every time:

// old — dangerous
process.on(''unhandledRejection'', () => process.exit(1))

// fixed — log instead
process.on(''unhandledRejection'', (reason) => {
  logger.error(''Unhandled rejection:'', reason)
})' WHERE note_id = 2 AND section_order = 4;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'If service A crashes → it may cause dependent service B to enter a crash loop too.

When debugging, check logs from ALL services simultaneously — not just the one you think is broken.

Debezium should never run with default config in production — errors.tolerance and retry must always be configured.' WHERE note_id = 2 AND section_order = 5;

-- ============================================================
-- NOTE 3 — CDC disabled after restore + DDL Trigger conflict
-- ============================================================
UPDATE notes SET
  title_en = 'CDC Auto-Disabled After Restore — DDL Trigger Blocks Re-enable',
  subtitle_en = 'Restore → CDC gone → re-enable → DDL Trigger fires error — must temporarily disable trigger first',
  hero_caption_en = 'Debezium CDC on SQL Server — must re-enable CDC after every restore'
WHERE id = 3;

UPDATE note_sections SET heading_en = 'CDC Gets Disabled After Restore — Every Time', body_en = 'SQL Server CDC stores state in system tables within the database. When restored from backup → CDC state from the backup is restored. If backup was taken while CDC was disabled → restore leaves it disabled too.

Additionally, CDC jobs (SQL Agent) are not included in the backup → they disappear every time.

Post-restore checklist:
1. EXEC sys.sp_cdc_enable_db
2. EXEC sys.sp_cdc_enable_table for each table
3. Verify jobs: EXEC sys.sp_cdc_help_jobs (must have 2 jobs: capture + cleanup)
4. Restart Debezium connector' WHERE note_id = 3 AND section_order = 1;
UPDATE note_sections SET heading_en = 'DDL Trigger Conflicts with CDC Enable', body_en = 'CartonSystem has a DDL Trigger (TR_DDLTrigger) that logs every DDL statement to TRIGGERLOG.

When sp_cdc_enable_table runs → SQL Server executes internal DDL → trigger fires → trigger tries to INSERT into TRIGGERLOG → if schema mismatch or insufficient permissions → error → CDC enable fails.

Error is usually: "Cannot insert the value NULL into column ''is_retrieve_while_cancel''"' WHERE note_id = 3 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Temporarily Disable DDL Trigger', body_en = '-- Disable trigger before enabling CDC
DISABLE TRIGGER TR_DDLTrigger ON DATABASE

-- Enable CDC
EXEC sys.sp_cdc_enable_db
EXEC sys.sp_cdc_enable_table
  @source_schema = ''dbo'',
  @source_name = ''text_file'',
  @role_name = NULL

-- Re-enable trigger
ENABLE TRIGGER TR_DDLTrigger ON DATABASE

Do this every time CDC configuration needs to be modified.' WHERE note_id = 3 AND section_order = 3;
UPDATE note_sections SET heading_en = 'LSN Position Reset After Restore', body_en = 'Debezium tracks position using LSN (Log Sequence Number). After restore → LSN in the transaction log changes. If Debezium still holds the old LSN → tries to stream from a non-existent position → error.

Fix: delete Debezium offsets and let it snapshot again:
# Delete topic offsets in Kafka
# Or rename the connector (creates a new one)
# Or set snapshot.mode=initial again' WHERE note_id = 3 AND section_order = 4;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Restoring a SQL Server database that has CDC = must always follow 4 steps.

If DDL Trigger fires error during CDC enable → temporarily disable trigger.
If Debezium errors after restore → delete offsets and re-snapshot.

Create a post-restore script that covers everything — run one file and you''re done.' WHERE note_id = 3 AND section_order = 5;

-- ============================================================
-- NOTE 4 — Multi-tab token refresh race condition
-- ============================================================
UPDATE notes SET
  title_en = 'Multi-Tab Token Refresh: Race Condition Causes Sudden Logout',
  subtitle_en = '10 tabs open, each calling refresh simultaneously — old token expires before new one arrives',
  hero_caption_en = 'Nova Platform — cross-tab session management using BroadcastChannel'
WHERE id = 4;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Nova Platform used across multiple tabs simultaneously. When access token expired, all tabs tried to call /refresh at the same time.

First tab refreshed successfully and got a new token.
Tabs 2–10 used the already-consumed refresh token → revoked → sudden logout.' WHERE note_id = 4 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Fix: TokenManager + Mutex Lock', body_en = 'Create a TokenManager class with a lock mechanism:

class TokenManager {
  private isRefreshing = false
  private queue: Function[] = []

  async getToken() {
    if (this.isRefreshing) {
      // Wait for another tab to finish refreshing
      return new Promise(resolve => this.queue.push(resolve))
    }
    this.isRefreshing = true
    // ... refresh ...
    this.queue.forEach(fn => fn(newToken))
    this.isRefreshing = false
  }
}

Only 1 request actually refreshes — the rest wait in the queue.' WHERE note_id = 4 AND section_order = 2;
UPDATE note_sections SET heading_en = 'BroadcastChannel Syncs Across Tabs', body_en = 'Use BroadcastChannel to send the new token to all tabs:

const channel = new BroadcastChannel(''auth_token'')

// Tab that refreshed successfully
channel.postMessage({ type: ''TOKEN_REFRESHED'', token: newToken })

// Other tabs
channel.onmessage = (e) => {
  if (e.data.type === ''TOKEN_REFRESHED'') setToken(e.data.token)
}

Access token stored in memory (useState) — not localStorage, safe from XSS.' WHERE note_id = 4 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Multi-tab apps must always consider token refresh coordination.

Pattern: mutex lock within the same tab + BroadcastChannel across tabs.
Access token → memory only.
Refresh token → httpOnly cookie.
Nothing sensitive in localStorage.' WHERE note_id = 4 AND section_order = 4;

-- ============================================================
-- NOTE 5 — SQL Server Orphaned User + explicit SID
-- ============================================================
UPDATE notes SET
  title_en = 'SQL Server Orphaned User After Restore — Fix at the Root with Explicit SID',
  subtitle_en = 'ALTER USER fixes it temporarily, but permanent fix requires CREATE LOGIN with matching SID from backup',
  hero_caption_en = 'SID (Security Identifier) — the login identity that must match on both sides'
WHERE id = 5;

UPDATE note_sections SET heading_en = 'Why Orphaned Users Recur After Every Restore', body_en = 'Every time CartonSystem.bak is restored → ''cartonrw'' user in the database comes back with the SID from the backup server.

But the ''cartonrw'' login on the current server has a different SID (created later).

SQL Server matches DB users to logins by SID, not by name → SID mismatch = orphaned user.

ALTER USER [cartonrw] WITH LOGIN = [cartonrw] only fixes it temporarily — restoring again brings the problem back.' WHERE note_id = 5 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Fix at Root: Read SID from Backup and CREATE LOGIN to Match', body_en = '-- Step 1: Get SID from backup (after restoring)
USE CartonSystem
SELECT name, sid FROM sys.database_principals WHERE name = ''cartonrw''
-- Returns: 0x34FFF44E1982C34691B3E9EC6D150C59

-- Step 2: Drop old login and recreate with the exact SID
USE master
DROP LOGIN [cartonrw]

CREATE LOGIN [cartonrw]
  WITH PASSWORD = ''YOUR_PASSWORD'',
  SID = 0x34FFF44E1982C34691B3E9EC6D150C59,
  CHECK_POLICY = OFF

After this, no matter how many times you restore, orphaned user never recurs.' WHERE note_id = 5 AND section_order = 2;
UPDATE note_sections SET heading_en = 'CartonSystem Cross-Database Permissions', body_en = 'cartonrw needs access to multiple databases:
- CartonSystem → db_owner (restored frequently)
- COMMON → db_owner (not restored)
- CartonLog → db_owner (not restored)
- TRIGGERLOG → INSERT, SELECT, UPDATE on TRG_CartonSystem schema
- yii2_file_system → db_owner

Databases that aren''t restored → set up user once and leave it.
Databases restored frequently → use explicit SID to match.' WHERE note_id = 5 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'SQL Server Login SID = fingerprint of a login.
DB user stores SID to map back to login.

Backup → Restore across servers = SID always mismatches.

Permanent fix:
1. Get SID from backup
2. DROP + CREATE LOGIN with same SID
3. Or use Contained Database (user independent of server login)' WHERE note_id = 5 AND section_order = 4;

-- ============================================================
-- NOTE 6 — Nginx WebSocket headers break login
-- ============================================================
UPDATE notes SET
  title_en = 'Nginx Forwards WebSocket Headers to Every Request, Breaking Login',
  subtitle_en = 'POST /login returns "Route not found" HTML instead of JSON — middleware converted it to a WS method',
  hero_caption_en = 'Nginx reverse proxy — upgrade headers being forwarded unintentionally'
WHERE id = 6;

UPDATE note_sections SET heading_en = 'Symptoms', body_en = 'API /api/auth/login in production returned HTML ("Route not found") instead of JSON.

Local dev worked fine — problem only occurred when going through the Nginx reverse proxy.' WHERE note_id = 6 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Root Cause: Nginx Forwards Upgrade Headers to All Requests', body_en = 'Nginx config had:
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

This caused every HTTP request — including POST /api/auth/login — to carry headers:
upgrade: websocket
connection: upgrade

Backend middleware detected these headers → changed method from POST to WS
→ couldn''t find route "WS /api/auth/login" → returned 404 HTML.' WHERE note_id = 6 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Conditional Upgrade in Nginx', body_en = 'Use the map directive instead of forcing upgrade on every request:

map $http_upgrade $connection_upgrade {
  default keep-alive;
  websocket upgrade;
}

server {
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection $connection_upgrade;
}

This way the upgrade header is only forwarded when the client actually sends it.' WHERE note_id = 6 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Backend Fix Too', body_en = 'Add a whitelist in isWebSocketRequest():

function isWebSocketRequest(req) {
  const isWsHeaders = req.headers.upgrade === ''websocket''
  const isWsPath = WS_PATHS.includes(req.path)
  const hasJsonBody = req.headers[''content-type'']?.includes(''application/json'')

  // A request with a JSON body is definitely not WebSocket
  return isWsHeaders && isWsPath && !hasJsonBody
}' WHERE note_id = 6 AND section_order = 4;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Nginx configs copied from WebSocket tutorials often have global upgrade headers, making every request look like a WebSocket upgrade.

Debug rule: if it works locally but breaks through a proxy → check what headers the proxy is adding first.' WHERE note_id = 6 AND section_order = 5;

-- ============================================================
-- NOTE 7 — Debezium SQL Server deadlock retry queue
-- ============================================================
UPDATE notes SET
  title_en = 'Debezium SQL Server Deadlock — Must Have a Retry Queue, Not Just Log and Drop',
  subtitle_en = 'CDC sync fails due to deadlock — event lost, two databases out of sync',
  hero_caption_en = 'Failed Events Queue — CDC events that fail need storage and automatic retry'
WHERE id = 7;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Debezium syncs data between multiple databases (Main, Dev, MariaDB).

Sometimes SQL Server deadlocks prevent inserting events into the database.
System logs the error and moves on — data on both sides becomes inconsistent (data drift) without anyone noticing.' WHERE note_id = 7 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Fix: Failed Events Queue', body_en = 'Create a queue table to store failed events:

- event_id, payload, attempt_count, last_error, status
- Service retries every 1 minute (max 50 attempts)
- Exponential backoff: delay increases per attempt
- After 50 attempts → alert admin via Telegram' WHERE note_id = 7 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Exponential Backoff', body_en = 'const delay = Math.min(1000 * 2 ** attempt, 60000)
// attempt 1 → 2s, attempt 2 → 4s, ... max 60s

Prevents retry storm when database is slow to recover.
If retrying every 1s with 50 simultaneous events → deadlock gets worse.' WHERE note_id = 7 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Deadlock is a transient error — it usually resolves with retry.
But without a retry mechanism → event is lost and data becomes inconsistent.

Every critical CDC pipeline must have:
1. Failed event storage
2. Automatic retry with backoff
3. Alert when retries are exhausted
4. Dashboard to monitor the retry queue' WHERE note_id = 7 AND section_order = 4;

-- ============================================================
-- NOTE 8 — Thai Encoding Detection Scoring System
-- ============================================================
UPDATE notes SET
  title_en = 'Thai Encoding Detection with a Scoring System — Score It, Don''t Guess',
  subtitle_en = 'Decode with multiple encodings and score by Thai-ness — the highest-scoring encoding wins',
  hero_caption_en = 'Scoring-based encoding detection — decode multiple ways and pick the best result'
WHERE id = 8;

UPDATE note_sections SET heading_en = 'Why Not Just Use chardet / encoding-japanese Directly', body_en = 'Auto-detection libraries often fail with old Thai files because TIS-620 and Windows-874 have byte ranges overlapping with Latin encodings.

Browser-side TextDecoder doesn''t natively support TIS-620.
Must use iconv-lite on Node.js backend only.' WHERE note_id = 8 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Scoring System', body_en = 'function scoreText(text: string): number {
  let score = 0

  // Thai Unicode range: ฀-๿
  const thaiChars = text.match(/[฀-๿]/g) || []
  score += thaiChars.length * 2

  // Common Thai words expected in documents
  const COMMON_THAI = [''เอกสาร'', ''สัญญา'', ''ยืม'', ''คืน'', ''แผนก'']
  for (const word of COMMON_THAI) {
    if (text.includes(word)) score += 5
  }

  // Penalty: replacement character
  const replacements = text.match(/�/g) || []
  score -= replacements.length * 10

  return score
}' WHERE note_id = 8 AND section_order = 2;
UPDATE note_sections SET heading_en = 'UTF-8 First Strategy', body_en = '// Always try UTF-8 first — if good enough, no need to try others
const utf8 = decode(buffer, ''utf-8'')
if (scoreText(utf8) > 10) return utf8

// If UTF-8 isn''t good enough → try the rest
const encodings = [''windows-874'', ''tis620'', ''iso-8859-11'']
let best = { text: utf8, score: scoreText(utf8) }

for (const enc of encodings) {
  const decoded = iconv.decode(buffer, enc)
  const score = scoreText(decoded)
  if (score > best.score) best = { text: decoded, score }
}

return best.text' WHERE note_id = 8 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Don''t trust encoding detection libraries 100% for Thai — especially files from legacy systems that may have mixed encodings.

Scoring approach:
- Transparent: you know why that encoding was chosen
- Tunable: adjust weights based on file type
- Fallback-safe: if everything scores low → UTF-8 as default' WHERE note_id = 8 AND section_order = 4;

-- ============================================================
-- NOTE 9 — Security Middleware 7 layers
-- ============================================================
UPDATE notes SET
  title_en = '7-Layer Security Middleware in Elysia — Built to Be Comprehensive',
  subtitle_en = 'Rate limit, IP block, CSRF, SQL injection, XSS, path traversal, timing attack — all in one middleware',
  hero_caption_en = 'Defense in depth — 7 filter layers every request must pass before reaching a handler'
WHERE id = 9;

UPDATE note_sections SET heading_en = 'Architecture: Order of the 7 Layers', body_en = 'Order matters — always check the cheapest first:

1. Runtime Flag → if security disabled, skip everything (dev mode)
2. Admin Bypass → x-jimmy-handsome header bypasses all checks
3. IP Blocking → check Redis blacklist first (microseconds)
4. Rate Limiting → limit req/min per IP (Redis / RAM fallback)
5. CSRF Protection → check Origin/Referer for POST/PUT/DELETE/PATCH
6. Input Validation → scan query params + body for attack patterns
7. Timing Protection → pad response time for /api/auth/* routes' WHERE note_id = 9 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Input Validation Patterns Actually Used', body_en = 'const INJECTION_PATTERNS = [
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

If any pattern matches → return 400 immediately and log IP in Redis counter.' WHERE note_id = 9 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Timing Attack Protection', body_en = '// Only for auth routes — responding too fast is also dangerous
// Attacker can measure time to guess if a username is valid or not

const MIN_RESPONSE_MS = 200

const start = Date.now()
// ... actual auth logic ...
const elapsed = Date.now() - start

if (elapsed < MIN_RESPONSE_MS) {
  await new Promise(r => setTimeout(r, MIN_RESPONSE_MS - elapsed))
}

Every auth response takes at least 200ms — attacker can''t time it.' WHERE note_id = 9 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Redis Fallback to RAM', body_en = 'Rate limiter uses Redis as primary store.
But if Redis goes down → fallback to in-memory Map.

Service keeps working even when Redis is down.
Downside: rate limit not synced across nodes — but better than a service outage.

Design principle: a security feature that causes the service itself to go down is also a vulnerability.' WHERE note_id = 9 AND section_order = 4;
UPDATE note_sections SET heading_en = 'Upload Path Exception', body_en = 'Some routes need to receive large binary/base64 payloads:
/api/system/popup/upload-image
/api/upload
/api/file/upload

These routes are exempt from input validation length checks.
But still pass rate limiting and CSRF as normal.

Exceptions must be an explicit list — never "relax" with a wildcard.' WHERE note_id = 9 AND section_order = 5;

-- ============================================================
-- NOTE 10 — Debezium IDENTITY_INSERT CDC sync
-- ============================================================
UPDATE notes SET
  title_en = 'Debezium Cross-DB Sync: IDENTITY Column Can''t Be Updated — Must Use IDENTITY_INSERT',
  subtitle_en = 'Cannot update identity column ''id'' — plain Prisma update doesn''t work, must use raw SQL + IDENTITY_INSERT ON',
  hero_caption_en = 'SQL Server IDENTITY column — can insert but can''t update, must enable IDENTITY_INSERT first'
WHERE id = 10;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Debezium CDC syncs text_file from MariaDB → SQL Server.
When source inserts a new record → destination must preserve the original id.

But SQL Server won''t let you insert an id value manually if the column is IDENTITY.
Prisma create() doesn''t support it either — must use raw SQL.' WHERE note_id = 10 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Fix: Raw SQL + IDENTITY_INSERT', body_en = 'async function insertTextFileWithIdentity(data: any) {
  await prisma.$executeRawUnsafe(
    ''SET IDENTITY_INSERT [dbo].[text_file] ON''
  )

  try {
    await prisma.$executeRawUnsafe(
      ''INSERT INTO [dbo].[text_file] (id, ...) VALUES (@p0, ...)'',
      data.id,
    )
  } finally {
    // Must turn OFF — otherwise session gets stuck
    await prisma.$executeRawUnsafe(
      ''SET IDENTITY_INSERT [dbo].[text_file] OFF''
    )
  }
}' WHERE note_id = 10 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Idempotent: Check Before Inserting', body_en = '// Debezium may send duplicate events (network retry)
// Always check first

const existing = await prisma.text_file.findUnique({ where: { id: data.id } })

if (existing) {
  // Already exists → update instead (no IDENTITY_INSERT needed)
  const { id, ...updateData } = data
  await prisma.text_file.update({ where: { id }, data: updateData })
} else {
  // Doesn''t exist yet → insert with IDENTITY_INSERT
  await insertTextFileWithIdentity(data)
}' WHERE note_id = 10 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'IDENTITY_INSERT in SQL Server:
- Must SET ON before INSERT
- Must SET OFF after INSERT — always in a finally block
- Prisma doesn''t support it — must use $executeRawUnsafe
- Only works on one table per session at a time

Good CDC sync must be idempotent — receiving the same event twice must produce the same result.' WHERE note_id = 10 AND section_order = 4;

-- ============================================================
-- NOTE 11 — SQL Server = vs LIKE trailing space
-- ============================================================
UPDATE notes SET
  title_en = 'SQL Server: = and LIKE Give Different Results',
  subtitle_en = 'Filter dept = ''RA'' returns 31 rows but LIKE ''RA%'' returns 43 — where did 12 rows go?',
  hero_caption_en = 'Hidden character in SQL Server — invisible to the naked eye but breaks queries'
WHERE id = 11;

UPDATE note_sections SET heading_en = 'The Problem', body_en = 'Customer PER0001-26 had 43 boxes with dept starting with "RA", but querying with dept = ''RA'' returned only 31 rows — 12 rows unaccounted for.

Initially suspected the records were gone, but LIKE ''RA%'' still found all of them.' WHERE note_id = 11 AND section_order = 1;
UPDATE note_sections SET heading_en = 'How to Check', body_en = 'Run this query to reveal hidden characters:

SELECT dept, LEN(dept) AS len, DATALENGTH(dept) AS byte_len, COUNT(*) AS cnt
FROM [CartonSystem].[dbo].[carton]
WHERE custcode = ''PER0001-26''
GROUP BY dept, LEN(dept), DATALENGTH(dept)

If LEN and DATALENGTH differ → there are hidden characters.' WHERE note_id = 11 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Cause', body_en = 'The 12 missing rows stored dept as ''RA '' (trailing space) or '' RA'' (leading space).

Key SQL Server behavior:
- = uses collation comparison — trailing spaces are auto-padded (RA = RA✓)
- But leading spaces or non-breaking spaces → = doesn''t catch them
- LIKE behaves differently, so it catches more' WHERE note_id = 11 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Never assume = and LIKE always return the same results — especially with data entered manually, which often contains hidden spaces.

If results differ → use DATALENGTH to inspect first.' WHERE note_id = 11 AND section_order = 4;

-- ============================================================
-- NOTE 12 — Debezium Composite PK mismatch phantom records
-- ============================================================
UPDATE notes SET
  title_en = 'Debezium Creates Phantom Records Due to Composite PK Mismatch Between Sides',
  subtitle_en = 'noreturn_main has more records than noreturn — because rack field is a PK on destination but not on source',
  hero_caption_en = 'Composite Primary Key mismatch — source and destination keys differ, causing duplicate records'
WHERE id = 12;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'DBSyncer syncs noreturn → noreturn_main

noreturn (MariaDB): 126,978 records
noreturn_main (MariaDB): 132,429 records

noreturn_main has more records — which shouldn''t happen since it''s the destination.' WHERE note_id = 12 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Root Cause: Different PKs', body_en = 'noreturn PK: [PFCarton, id, carton]  — 3 fields
noreturn_main PK: [PFCarton, id, carton, rack]  — 4 fields

When syncing a record where rack changes:
- noreturn_main doesn''t upsert because PK (including rack) is different
- Creates a new record instead

Result: old record remains + new record with different rack = phantom records.' WHERE note_id = 12 AND section_order = 2;
UPDATE note_sections SET heading_en = 'How to Check', body_en = '# View logs in real-time
docker logs -f <container_id> 2>&1 | \
  grep -E "noreturn|duplicates|error"

# View duplicate count
docker logs <container_id> 2>&1 | \
  grep "duplicates" | tail -20

If "duplicates: 5" keeps repeating — Prisma is hitting PK conflicts but not crashing because there''s an error handler.' WHERE note_id = 12 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Before building a CDC pipeline, verify the Primary Key of every table on both sides.

If PKs differ → upsert will create new records instead of updating existing ones.

Check with: SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
Look at constraint_type = PRIMARY KEY for each table on both source and destination.' WHERE note_id = 12 AND section_order = 4;

-- ============================================================
-- NOTE 13 — Debezium TIME → milliseconds serialization
-- ============================================================
UPDATE notes SET
  title_en = 'SQL Server TIME Field → MariaDB Receives Integer Milliseconds Instead of a String',
  subtitle_en = 'Debezium converts TIME to milliseconds since midnight — MariaDB can''t accept it, must convert manually',
  hero_caption_en = 'Time field sync — Debezium serializes TIME as int64 milliseconds, not a string'
WHERE id = 13;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'DBSyncer syncs fax_main, fr_main from SQL Server → MariaDB.
Got error: "Invalid value provided. Expected DateTime, provided Int"

Affected fields: issue_time in fax_main, fax_tmp, fr_main, fr_tmp, ret_tmp' WHERE note_id = 13 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause: Debezium Serializes TIME as Milliseconds', body_en = 'SQL Server TIME field → Debezium sends as int64 (milliseconds since midnight)

e.g., 09:30:00 → 34,200,000 ms

MariaDB Prisma schema expects a DateTime object or string "HH:MM:SS".
When it receives an integer → type error.' WHERE note_id = 13 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Convert Milliseconds → Time String', body_en = 'function convertMsToTimeString(ms: number | null): string | null {
  if (ms === null || ms === undefined) return null
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2,''0'')}:${String(m).padStart(2,''0'')}:${String(s).padStart(2,''0'')}`
}

// Use before upserting into MariaDB
const TIME_FIELDS = [''issue_time'', ''rettime'']
for (const field of TIME_FIELDS) {
  if (typeof data[field] === ''number'') {
    data[field] = convertMsToTimeString(data[field])
  }
}' WHERE note_id = 13 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Debezium serializes temporal types differently by source database:
- DATE → days since epoch (integer)
- TIME → milliseconds since midnight (integer)
- DATETIME/TIMESTAMP → milliseconds since Unix epoch (integer)

Must write a converter for every time field when sinking to a database that expects a string/DateTime.' WHERE note_id = 13 AND section_order = 4;

-- ============================================================
-- NOTE 14 — Payment Webhook Signature + Regex parsing
-- ============================================================
UPDATE notes SET
  title_en = 'Payment Webhook: Signature Verification + Regex Reference Parsing',
  subtitle_en = 'Verify HMAC signature before parsing reference — fixed-digit regex breaks when format changes',
  hero_caption_en = 'Payment webhook pipeline — verify signature → parse reference → process business logic'
WHERE id = 14;

UPDATE note_sections SET heading_en = 'Correct Webhook Flow', body_en = '1. Receive webhook payload
2. Verify HMAC signature before everything else
3. Log to webhook log (every request, even duplicates)
4. Check for duplicate using EventId
5. Parse reference strings
6. Execute business logic (renew/register)' WHERE note_id = 14 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Signature Verification', body_en = '// Must verify before parsing payload
const computedSig = crypto
  .createHmac(''sha256'', process.env.WEBHOOK_SECRET)
  .update(rawBody)  // must use raw body, NOT parsed JSON
  .digest(''hex'')

if (computedSig !== receivedSig) {
  throw new UnauthorizedException(''Invalid signature'')
}

Important: must use rawBody (Buffer) not JSON.stringify(parsedBody).
Re-serializing may change key order → signature won''t match.' WHERE note_id = 14 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Flexible Regex Instead of Fixed Digits', body_en = '// Reference format: C{customerID}P{period}U{uid}
// customerID may be 9 or 10 digits — never hardcode

// Wrong: fixed digit count
const r1 = /^C\d{10}P\d+U/  // breaks if ID is 9 digits

// Correct: flexible
const r1 = /^(C\d+)P(\d+)U/

// Reference 2: RN/RE + YYMMDD + quantity + U + uid
const r2 = /^(RE|RN)(\d{6})(\d*)U/
const [, type, dateStr, qty] = ref2.match(r2)' WHERE note_id = 14 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'A good webhook must have all of these:
1. HMAC signature verification (rawBody only)
2. Idempotency via EventId (prevent duplicate processing)
3. Log every request before processing
4. Flexible regex — payment gateways often change format without notice
5. Parse logic separated from business logic' WHERE note_id = 14 AND section_order = 4;

-- ============================================================
-- NOTE 15 — Duplicate Webhook detection logic bug
-- ============================================================
UPDATE notes SET
  title_en = 'Broken Duplicate Webhook Detection — Every Request Flagged as Duplicate',
  subtitle_en = 'Comparing ReceivedAt with Timestamp — the two never match, so the logic is broken 100% of the time',
  hero_caption_en = 'Subtle logic bug — a condition that looks reasonable but is never true'
WHERE id = 15;

UPDATE note_sections SET heading_en = 'The Broken Code', body_en = '// Looks reasonable but the logic is entirely wrong
const isDuplicate = savedWebhook.ReceivedAt.getTime()
                 !== savedWebhook.Timestamp.getTime()

// ReceivedAt = time server received the webhook (now)
// Timestamp = time payment gateway created the event
// These two will NEVER be equal
// → isDuplicate = true always → every request gets rejected' WHERE note_id = 15 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Fix: Check EventId Instead', body_en = '// EventId is the unique identifier of the event from the payment gateway

async function isDuplicateWebhook(eventId: string): Promise<boolean> {
  const existing = await prisma.webhook.findUnique({
    where: { event_id: eventId }
  })
  return !!existing
}

if (await isDuplicateWebhook(payload.event_id)) {
  return { status: ''duplicate'', message: ''Already processed'' }
}' WHERE note_id = 15 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Duplicate detection must use an identifier assigned by the payment gateway — not a timestamp created by the server.

Principle: Idempotency Key comes from the caller, not the receiver.

This bug is hard to find because:
- No error is thrown — it just returns the wrong status
- Unit tests may pass
- Only discoverable in integration tests' WHERE note_id = 15 AND section_order = 3;

-- ============================================================
-- NOTE 16 — SQL Server DMV + BigInt serialization
-- ============================================================
UPDATE notes SET
  title_en = 'SQL Server DMV + BigInt Serialization in Node.js',
  subtitle_en = 'DMV metrics fetched correctly but JSON response to frontend errors — because BigInt can''t be serialized',
  hero_caption_en = 'SQL Server DMV (Dynamic Management Views) — real-time performance data used by DBAs'
WHERE id = 16;

UPDATE note_sections SET heading_en = 'Context', body_en = 'Nova Admin Dashboard pulls SQL Server performance metrics from DMVs:
- sys.dm_os_sys_memory (memory usage)
- sys.dm_exec_requests (active queries)
- sys.dm_os_wait_stats (wait statistics)
- sys.dm_io_virtual_file_stats (disk I/O)' WHERE note_id = 16 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Problem: BigInt Can''t Be Serialized to JSON', body_en = 'DMV columns like pages_kb, io_stall are often BIGINT.
Prisma $queryRaw returns them as JavaScript BigInt.

When you call JSON.stringify() → error:
TypeError: Do not know how to serialize a BigInt

Because the JSON spec only supports Number, which has limited precision.' WHERE note_id = 16 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Convert BigInt Before Returning', body_en = 'function serializeBigInt(obj: any): any {
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

// Use after every $queryRaw call
const raw = await prisma.$queryRaw`SELECT ...`
return serializeBigInt(raw)' WHERE note_id = 16 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Nested Context-Switch Bug', body_en = 'Some DMV queries pull data from multiple databases at once.
Adding USE [CartonSystem] inside the query → connection context changes
→ session table in nova_platform gets queried in the CartonSystem context
→ "Invalid object name ''sessions''"

Fix: use database prefix instead of USE in every query.
FROM [CartonSystem].sys.tables instead of USE [CartonSystem]; FROM sys.tables' WHERE note_id = 16 AND section_order = 4;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Prisma $queryRaw always returns BigInt for BIGINT columns.
Must have a serialization layer before every HTTP response.

DMV queries often span multiple databases → never use USE statement.
Use 3-part naming: [database].[schema].[table] throughout.' WHERE note_id = 16 AND section_order = 5;

-- ============================================================
-- NOTE 17 — SMC GS10P backup via TFTP CRLF
-- ============================================================
UPDATE notes SET
  title_en = 'SMC GS10P Backup via TFTP — Must Send \\r\\n, Not Just \\n',
  subtitle_en = 'SSH into switch works, Config Save command sent, but no file arrives in TFTP — wrong line ending',
  hero_caption_en = 'SMC GS10P-Smart — no Oxidized model available, had to write the script manually'
WHERE id = 17;

UPDATE note_sections SET heading_en = 'Context', body_en = 'Network config backup system covers 5 devices — both Cisco units work fine with Oxidized.

But SMC GS10P-Smart (192.168.2.42) has no model in Oxidized → had to write a Python script manually.

SMC doesn''t have show running-config — uses SSH to send "Config Save <ip> <filename>" which pushes the file over TFTP.' WHERE note_id = 17 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Problem Encountered', body_en = 'SSH connects, login succeeds, Config Save command sent — but TFTP server never receives the file.

Checking logs showed the command was sent but the switch didn''t respond, because the older SMC SSH terminal requires CRLF (\\r\\n) on every line — not just LF (\\n) that paramiko sends by default.' WHERE note_id = 17 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Force \\r\\n via paramiko', body_en = 'channel = ssh.invoke_shell()
channel.send("Config Save 192.168.2.254 smc-backup.cfg\r\n")
time.sleep(3)
output = channel.recv(4096).decode()

Important: must use \\r\\n on every command — not just \\n.
Otherwise the switch receives the command but doesn''t execute it.' WHERE note_id = 17 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Secondary Problem: Python TFTP Server vs tftpd-hpa', body_en = 'The self-written Python TFTP server had a race condition — sometimes not ready before the switch pushed the file.

Fix: use tftpd-hpa running permanently instead, then have the script read the file from /srv/tftp/ after the switch pushes it.

apt install tftpd-hpa
Set up once, runs forever, no race condition.' WHERE note_id = 17 AND section_order = 4;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Many older network devices require CRLF (\\r\\n) in SSH sessions.
paramiko only sends LF (\\n) by default — must force it manually.

If command is sent but device doesn''t respond → suspect line ending before anything else.' WHERE note_id = 17 AND section_order = 5;

-- ============================================================
-- NOTE 18 — TP-Link ER7206 SSH legacy algorithms
-- ============================================================
UPDATE notes SET
  title_en = 'TP-Link ER7206: SSH Fails Because Modern Client Doesn''t Support Legacy kex',
  subtitle_en = 'paramiko can''t connect — must force curve25519-sha256@libssh.org and aes128-ctr',
  hero_caption_en = 'TP-Link ER7206 — router using SSH algorithms different from other devices on the network'
WHERE id = 18;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Python script using paramiko SSH to connect to TP-Link ER7206 (192.168.1.1) got error:
No matching key exchange method found

Other devices (Cisco, SMC, MikroTik) worked fine with default paramiko settings.' WHERE note_id = 18 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Check Device kex Algorithms', body_en = 'Run ssh -vvv user@192.168.1.1 and look for:

debug2: KEX algorithms: curve25519-sha256@libssh.org, diffie-hellman-group14-sha1
debug2: ciphers ctos: aes128-ctr, aes256-ctr

ER7206 uses curve25519 + aes-ctr, which differs from SMC that uses diffie-hellman-group1 + aes-cbc.' WHERE note_id = 18 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Specify Algorithms in paramiko to Match Device', body_en = 'transport = paramiko.Transport((host, 22))
transport.get_security_options().kex = [
    ''curve25519-sha256@libssh.org'',
    ''diffie-hellman-group14-sha1''
]
transport.get_security_options().ciphers = [
    ''aes128-ctr'',
    ''aes256-ctr''
]
transport.connect(username=user, password=pwd)

Each device may need different algorithms — must debug each one individually.' WHERE note_id = 18 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Secondary Problem: ^M in Script', body_en = 'Opened .py file in vim and saw ^M at the end of every line — because the file was created on Windows then uploaded to Linux.

Fix with:
sed -i ''s/\r//'' script.py

Without this fix → Python reads commands incorrectly, \\r appended to strings causes commands to fail.' WHERE note_id = 18 AND section_order = 4;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'No single SSH client works with every device — always probe algorithms with ssh -vvv first.

Creating scripts on Windows then uploading to Linux → check line endings before running every time.
sed -i ''s/\r//'' is quick and effective.' WHERE note_id = 18 AND section_order = 5;

-- ============================================================
-- NOTE 19 — Oxidized Docker Swarm port mode:host
-- ============================================================
UPDATE notes SET
  title_en = 'Oxidized in Docker Swarm: Port 8888 Unreachable',
  subtitle_en = 'Swarm ingress routing makes port binding behave unexpectedly — must use mode: host',
  hero_caption_en = 'Oxidized running network config backup through Docker Swarm on ubuntu254'
WHERE id = 19;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Oxidized running in Docker Swarm but its web UI on port 8888 was inaccessible, even though the stack was deployed with ports: - "8888:8888".

LibreNMS integration via the Oxidized API also didn''t work.' WHERE note_id = 19 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause: Swarm Ingress Routing', body_en = 'Docker Swarm uses an ingress load balancer by default — port binding works via NAT through the routing mesh. This means some services like Oxidized that bind to localhost aren''t forwarded correctly.' WHERE note_id = 19 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix 1: mode: host', body_en = 'Change the port binding in the stack file:

ports:
  - target: 8888
    published: 8888
    protocol: tcp
    mode: host

Container binds the port directly to the host, bypassing ingress — accessible immediately.' WHERE note_id = 19 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Fix 2: Nginx Proxy to Container IP', body_en = 'If you don''t want to redeploy, workaround with Nginx:

CONTAINER=$(docker ps -q -f name=oxidized)
CONTAINER_IP=$(docker inspect $CONTAINER --format ''{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'')

Then proxy_pass directly to $CONTAINER_IP:8888.

Downside: must re-run the script every time container is recreated (IP changes).' WHERE note_id = 19 AND section_order = 4;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Docker Swarm ingress is suitable for stateless HTTP services that need load balancing.

But services that bind to localhost or need direct port access (e.g., Oxidized, databases) should use mode: host.

If container IP changes every restart → never reference the IP directly in production.' WHERE note_id = 19 AND section_order = 5;

-- ============================================================
-- NOTE 20 — USE [database] context stuck in connection pool
-- ============================================================
UPDATE notes SET
  title_en = 'USE [database] in Query Causes Auth Errors on Next Request',
  subtitle_en = 'Nova Platform API runs USE [CartonSystem] and connection context gets stuck there permanently',
  hero_caption_en = 'Multi-database API — connection context changes constantly, a stuck USE breaks everything'
WHERE id = 20;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Nova Platform monitors multiple databases simultaneously (nova_platform, files_system, CartonSystem).

Some queries had USE [CartonSystem] at the start — those queries worked fine.

But the next request that should query nova_platform got "Invalid object name ''sessions''" because the connection was still in CartonSystem context.' WHERE note_id = 20 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause', body_en = 'Connection pooling in Prisma/SQL Server reuses existing connections.

When USE [CartonSystem] runs in one query → that connection switches context to CartonSystem.

If the pool gives that same connection to the next request → query hits CartonSystem instead of nova_platform.' WHERE note_id = 20 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Use Database Prefix Instead of USE', body_en = 'Change from:
USE [CartonSystem]
SELECT * FROM sys.tables

To:
SELECT * FROM [CartonSystem].sys.tables

No USE needed — specify the database directly in the FROM clause every time. Connection context never changes.' WHERE note_id = 20 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Never use USE [database] in queries that run through a connection pool.

In multi-database scenarios, always specify the database prefix directly in queries:
[DatabaseName].[schema].[table]

If USE is truly necessary → open a separate connection, close it immediately after use.' WHERE note_id = 20 AND section_order = 4;

-- ============================================================
-- NOTE 21 — SQL Server error 8152 Thai NVARCHAR
-- ============================================================
UPDATE notes SET
  title_en = 'SQL Server Error 8152: String or Binary Data Would Be Truncated',
  subtitle_en = 'Syncing Thai text from MariaDB to SQL Server fails — a 70-char column can''t hold UTF-8 Thai',
  hero_caption_en = 'Thai character encoding — 1 Thai character can take up to 3 bytes in UTF-8'
WHERE id = 21;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Debezium syncing data from MariaDB (UTF-8) to SQL Server got error:
String or binary data would be truncated (error 8152)

Affected fields: bussi_name, dept — column size 70 chars.
In MariaDB the data fit within 70 chars fine, but SQL Server rejected it.' WHERE note_id = 21 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause', body_en = 'VARCHAR(70) in MariaDB counts 70 characters.
VARCHAR(70) in SQL Server counts 70 bytes.

Thai in UTF-8: 1 character = 3 bytes.
A company name with 25 Thai characters = 75 bytes → exceeds 70 immediately.

Data that "fit" in MariaDB gets truncated in SQL Server.' WHERE note_id = 21 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix', body_en = 'Increase column size in SQL Server:
ALTER TABLE history ALTER COLUMN bussi_name NVARCHAR(200)
ALTER TABLE history ALTER COLUMN dept NVARCHAR(200)

Use NVARCHAR instead of VARCHAR — NVARCHAR counts characters, not bytes.
Better suited for Unicode/Thai.

200 is a safe buffer instead of trying to calculate bytes precisely.' WHERE note_id = 21 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'VARCHAR in SQL Server counts bytes.
NVARCHAR in SQL Server counts characters (2 bytes per char).
VARCHAR in MySQL/MariaDB counts characters.

If a column stores Thai in SQL Server → always use NVARCHAR.
And size should be at least 2–3x larger than the source system.' WHERE note_id = 21 AND section_order = 4;

-- ============================================================
-- NOTE 22 — Prisma || vs ?? falsy value trap
-- ============================================================
UPDATE notes SET
  title_en = 'Prisma: copy: line.copy || undefined Turns 0 Into NULL',
  subtitle_en = '|| in JavaScript converts falsy values (including 0) to undefined — Prisma saves it as NULL',
  hero_caption_en = 'Falsy value trap in JavaScript — 0, empty string, and false are all falsy'
WHERE id = 22;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'The copy field in the history table was NULL for every record, even though the source CSV had a value of 0.

But in the text_line table the same field had the correct value of 0 — confirming the CSV was read correctly, but the value was lost during the history insert.' WHERE note_id = 22 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause: || with Falsy Values', body_en = 'The code had this line:
copy: line.copy || undefined

JavaScript treats 0 as falsy.
So 0 || undefined === undefined.
Prisma receives undefined → saves as NULL.' WHERE note_id = 22 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Use ?? Instead of ||', body_en = 'Change from:
copy: line.copy || undefined

To:
copy: line.copy ?? 0

?? (nullish coalescing) only triggers on null or undefined.
0, empty string, false — all pass through unchanged.' WHERE note_id = 22 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = '|| and ?? are very different:

|| → falsy: 0, '''', false, null, undefined all trigger it
?? → nullish only: only null and undefined trigger it

If a field can legitimately be 0 or false → always use ??.
Use || only when you actually want to replace all falsy values.' WHERE note_id = 22 AND section_order = 4;

-- ============================================================
-- NOTE 23 — Prisma groupBy misuse inflated count
-- ============================================================
UPDATE notes SET
  title_en = 'Prisma groupBy Misuse Inflates Count',
  subtitle_en = 'Counted 3,642 jobs but there were only a few hundred — because groupBy was in the wrong place',
  hero_caption_en = 'Prisma groupBy — must be a top-level method, not inside a where clause'
WHERE id = 23;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Dashboard counted job groups in the Nova system.
Query returned 3,642 but the team verified there were only a few hundred in reality.

Goal: count unique combinations of or_no + bussi_name + sender + ACTION.' WHERE note_id = 23 AND section_order = 1;
UPDATE note_sections SET heading_en = 'The Wrong Code', body_en = 'const count = await prisma.history.count({
  where: {
    // Wrong: groupBy is not a valid option inside where
    groupBy: [''or_no'', ''bussi_name'', ''sender'', ''ACTION'']
  }
})

Prisma doesn''t throw an error — it silently ignores groupBy and counts all rows instead.
Result: 3,642 (total row count).' WHERE note_id = 23 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix', body_en = 'const groups = await prisma.history.groupBy({
  by: [''or_no'', ''bussi_name'', ''sender'', ''ACTION''],
  where: { new: 0 }
})

const count = groups.length

groupBy is a top-level method — not a parameter of count() or findMany().' WHERE note_id = 23 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Prisma doesn''t throw an error when an unknown key is passed inside where — it silently ignores it.
This makes bugs like this very hard to find since there''s no error message.

If count looks wrong → check if the query structure matches the correct type.
Use TypeScript strict mode to catch misuse.' WHERE note_id = 23 AND section_order = 4;

-- ============================================================
-- NOTE 24 — find -mtime vs -mmin cron backup
-- ============================================================
UPDATE notes SET
  title_en = 'find -mtime Doesn''t Work as Expected',
  subtitle_en = 'Set DAYS=3 but 3-day-old files aren''t caught — because -mtime counts in integer 24h blocks',
  hero_caption_en = 'Snipe-IT backup script from sv51 to NAS83, running automatically every week'
WHERE id = 24;

UPDATE note_sections SET heading_en = 'Context', body_en = 'Created snipeit-backup-archive.sh to move old backup files from /var/www/snipeit/storage/app/backups to NAS83.

Used DAYS=3 as the threshold but after testing — no files were caught at all, even though there were clearly 3-day-old files present.' WHERE note_id = 24 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause: -mtime Uses Integer 24h Blocks', body_en = 'find -mtime +3 means "older than 4 × 24 hours" — not "older than 3 days".

A file that''s 3 days and 23 hours old → hasn''t reached the 4th block → not caught.
Must wait a full 96 hours before it shows up.' WHERE note_id = 24 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Use -mmin Instead', body_en = 'Change from:
find ... -mtime +$DAYS

To:
find ... -mmin +$(( DAYS * 24 * 60 ))

-mmin works at the minute level, much more precise. No integer block issue.' WHERE note_id = 24 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Second Problem in the Same Script', body_en = 'artisan backup returned error "proc_open(): posix_spawn() failed: Permission denied" because the script ran artisan from the wrong working directory.

Changed from:
sudo -u snipeit php artisan snipeit:backup

To:
su -s /bin/bash snipeit -c "cd /var/www/snipeit && php artisan snipeit:backup"

artisan always requires the correct working directory.' WHERE note_id = 24 AND section_order = 4;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'find -mtime is only suitable for rough filtering. For precision, use -mmin or -newer.

And every artisan command must run from the project root (/var/www/snipeit) — otherwise config won''t load.' WHERE note_id = 24 AND section_order = 5;

-- ============================================================
-- NOTE 25 — 502 Bad Gateway backend unreachable
-- ============================================================
UPDATE notes SET
  title_en = '502 Bad Gateway — Nginx Isn''t Broken, Backend Disappeared from Network',
  subtitle_en = 'Debugged config for 30 minutes, then discovered the server was simply unreachable by ping',
  hero_caption_en = 'Snipe-IT reverse proxied through Nginx — 502 caused by backend being down, not a config error'
WHERE id = 25;

UPDATE note_sections SET heading_en = 'Situation', body_en = 'Snipe-IT proxied through Nginx at /snipeit/ pointing to https://192.168.2.251.

Got 502 Bad Gateway — started debugging Nginx config immediately: adjusting SSL directives, rewrite rules, spent a long time on it.' WHERE note_id = 25 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Correct Debug Approach', body_en = 'Test in order:

1. curl -k https://192.168.2.251 → timeout
2. curl http://192.168.2.251 → timeout
3. ping 192.168.2.251 → "Destination host unreachable" from gateway 172.16.10.1

Step 3 made it clear: the server isn''t on the network at all — not a Nginx issue.' WHERE note_id = 25 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = '502 Bad Gateway has many possible causes — never assume it''s always a Nginx config error.

Before debugging config, verify the backend is actually reachable with ping/curl directly. Saves a lot of time.

If ping fails → problem is at the network or server level — not the config.' WHERE note_id = 25 AND section_order = 3;

-- ============================================================
-- NOTE 26 — VITE_ env vars build-time vs runtime
-- ============================================================
UPDATE notes SET
  title_en = 'VITE_ Environment Variables Must Be Injected at Build Time, Not Runtime',
  subtitle_en = 'Set env in docker-compose but API URL is still undefined — Vite embeds values at build time',
  hero_caption_en = 'Vite build process — env vars are embedded into static files at build, not at runtime'
WHERE id = 26;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Deployed Nova web app on Docker Swarm with VITE_API_BASE_URL set in the stack file environment.

After deployment — browser console showed API URL as undefined or a stale value, even though the container had the correct env var.' WHERE note_id = 26 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Reason: Vite Is a Build-Time Tool', body_en = 'Vite replaces every import.meta.env.VITE_* with the actual value at npm run build time.

The output is static JS with the value hard-coded:

// before build
const url = import.meta.env.VITE_API_BASE_URL

// after build (in dist/)
const url = "https://api.profile.co.th"

Runtime environment of the container has no effect — the value was already embedded.' WHERE note_id = 26 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Pass env as --build-arg', body_en = 'Must pass the value at build time:

docker build \
  --build-arg VITE_API_BASE_URL="https://api.profile.co.th" \
  -t myapp:latest .

And in Dockerfile:
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

Using GitHub Actions: pass as secrets in the build-args step.' WHERE note_id = 26 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'VITE_* env vars ≠ runtime env vars.
They are read and embedded only at build time.

If the value changes → must rebuild the image.
There is no way to change VITE_ vars in a container that''s already been built.' WHERE note_id = 26 AND section_order = 4;

-- ============================================================
-- NOTE 27 — NPM Custom Locations vs Advanced tab
-- ============================================================
UPDATE notes SET
  title_en = 'Nginx Proxy Manager: Custom Locations Took the Whole System Offline',
  subtitle_en = 'Moved Nginx config to NPM and added /snipeit/ in Custom Locations — everything went down',
  hero_caption_en = 'Nginx Proxy Manager — Custom Locations and Advanced tab behave very differently'
WHERE id = 27;

UPDATE note_sections SET heading_en = 'Situation', body_en = 'Migrating original Nginx config to Nginx Proxy Manager (NPM) in Docker Swarm.

Needed to proxy /snipeit/ to https://192.168.2.251 with a custom rewrite rule.

Added it in the Custom Locations tab → entire system went offline immediately, no site accessible.' WHERE note_id = 27 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause', body_en = 'NPM''s Custom Locations tab generates Nginx config in a way that easily conflicts with the main server block.

Especially with rewrite rules or complex proxy_pass configs — NPM doesn''t generate the syntax correctly → Nginx reload fails → all proxy hosts go down together.' WHERE note_id = 27 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Use Advanced Tab Instead', body_en = 'Put the location block in the Advanced tab instead:

location /snipeit/ {
    rewrite ^/snipeit/(.*) /$1 break;
    proxy_pass https://192.168.2.251;
    proxy_ssl_verify off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

Advanced tab injects config directly into the server block — bypasses the UI parser.' WHERE note_id = 27 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'NPM''s Custom Locations tab is only suitable for simple location blocks.

If you have rewrite rules, proxy_ssl directives, or header manipulation → always use the Advanced tab.

Before saving complex config in NPM → always prepare emergency SSH access first.' WHERE note_id = 27 AND section_order = 4;

-- ============================================================
-- NOTE 28 — SQL Server Collation rebuild
-- ============================================================
UPDATE notes SET
  title_en = 'Changing SQL Server Collation from Thai_CS_AS to Thai_CI_AS',
  subtitle_en = 'Must rebuild system databases — not just ALTER DATABASE — and requires careful planning',
  hero_caption_en = 'SQL Server Collation change — an operation that is very hard to reverse'
WHERE id = 28;

UPDATE note_sections SET heading_en = 'Why the Change Was Needed', body_en = 'Server collation was Thai_CS_AS (Case Sensitive), making queries that differ in letter case not match.

e.g., WHERE username = ''Admin'' ≠ WHERE username = ''admin''

Needed to change to Thai_CI_AS (Case Insensitive) for more flexible queries.' WHERE note_id = 28 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Common Misconception', body_en = 'ALTER DATABASE [mydb] COLLATE Thai_CI_AS

This only changes the database-level collation — it does NOT change the server-level collation.

Changing server collation requires rebuilding system databases (master, msdb, model) using Setup.exe:

Setup.exe /QUIET /ACTION=REBUILDDATABASE
  /INSTANCENAME=MSSQLSERVER
  /SQLCOLLATION=Thai_CI_AS

This rebuild deletes all logins, jobs, and linked servers — must script everything out first.' WHERE note_id = 28 AND section_order = 2;
UPDATE note_sections SET heading_en = 'What Must Be Done First', body_en = '1. Back up all databases fully
2. Script out: logins, SQL Agent jobs, linked servers, important SPs/functions
3. After rebuild → restore databases and re-run all scripts
4. Change column collation per column with ALTER COLUMN (must drop indexes first, then rebuild)' WHERE note_id = 28 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Server collation and database collation are different levels.

To change only a database → ALTER DATABASE is sufficient.
To change server level → rebuild system DB — takes a long time, high risk, must plan carefully.

Consider changing collation at the column level only where needed, instead of changing the whole server.' WHERE note_id = 28 AND section_order = 4;

-- ============================================================
-- NOTE 29 — PowerShell migrate DB FK order
-- ============================================================
UPDATE notes SET
  title_en = 'PowerShell DB Migration: TRUNCATE Fails Even After Disabling FK Constraints',
  subtitle_en = 'pfindex_test → pfindex migration — fixed FK order, DELETE/INSERT sequence, and array reversal bug',
  hero_caption_en = 'Script Sync-PfindexFromTest.ps1 — syncing 26 tables from test to production'
WHERE id = 29;

UPDATE note_sections SET heading_en = 'Context', body_en = 'Needed to sync data from pfindex_test → pfindex (production) using a PowerShell script.

Added complexity: OriginalHistory lives in the dbo schema on test but in the pfmaster schema on production.' WHERE note_id = 29 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Bug 1: TRUNCATE Fails Even After NOCHECK', body_en = 'TRUNCATE TABLE cannot be used on tables with FK references, even after ALTER TABLE NOCHECK CONSTRAINT ALL.

SQL Server refuses TRUNCATE if FK references exist — regardless of whether constraints are enabled or not.

Fix: switch from TRUNCATE to DELETE FROM and split into 2 phases:
- Phase 1: DELETE all tables ordered child → parent
- Phase 2: INSERT ordered parent → child' WHERE note_id = 29 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Bug 2: PowerShell Array Reversal', body_en = 'Needed to reverse an array for DELETE ordering, wrote:

[System.Linq.Enumerable]::Reverse($DboTables)

But PowerShell arrays don''t implement IEnumerable the way Linq expects.

Fix using slice syntax instead:
$DboTables[-1..-($DboTables.Count)]' WHERE note_id = 29 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Bug 3: SSL + Execution Policy', body_en = 'First run of the script hit 2 errors simultaneously:

1. Execution policy block: use Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
2. SSL cert error: add TrustServerCertificate = $true in Invoke-Sqlcmd params' WHERE note_id = 29 AND section_order = 4;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'TRUNCATE and DELETE are not the same — TRUNCATE always fails with FK, regardless of whether constraints are enabled.

If migrating multiple tables with FKs between them, map the dependency graph first, then DELETE/INSERT in the correct order.' WHERE note_id = 29 AND section_order = 5;

-- ============================================================
-- NOTE 30 — Cisco SG350 Netmiko ciscosb model
-- ============================================================
UPDATE notes SET
  title_en = 'Backing Up Cisco SG350/SG300 with Python: Use ciscosb, Not cisco_ios',
  subtitle_en = 'Netmiko has a separate driver for the Small Business series — cisco_ios doesn''t work with SG350',
  hero_caption_en = 'Cisco SG350-28 and SG300-28 — Small Business switches with a different CLI from Enterprise'
WHERE id = 30;

UPDATE note_sections SET heading_en = 'Initial Problem', body_en = 'Needed to back up config from Cisco SG350-28 and SG300-28.

Used Netmiko with device_type: cisco_ios → SSH connected but commands didn''t work.
Because SG350/SG300 is Small Business series — CLI is different from Enterprise IOS.' WHERE note_id = 30 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Fix: Use ciscosb Model', body_en = 'from netmiko import ConnectHandler

device = {
    ''device_type'': ''cisco_s300'',  # ← correct, not cisco_ios
    ''host'': ''192.168.2.44'',
    ''username'': ''spaprofile'',
    ''password'': ''YOUR_PASSWORD'',
}

conn = ConnectHandler(**device)
output = conn.send_command(''show running-config'')
conn.disconnect()

Oxidized uses model ''ciscosb'' — same thing, different name.' WHERE note_id = 30 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Per-Device Credential', body_en = 'Cisco SG350/SG300 may use credentials different from other devices in the system.
Oxidized supports per-device credentials in router.db:

192.168.2.44:ciscosb:username:password

Or in config:
source:
  default: csv
  csv:
    file: /opt/oxidized/data/router.db
    delimiter: '':''
    map:
      name: 0
      model: 1
      username: 2
      password: 3' WHERE note_id = 30 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Cisco has multiple product lines with different CLIs:
- IOS (Enterprise): cisco_ios, cisco_xe
- Small Business (SG series): ciscosb, cisco_s300
- NX-OS: cisco_nxos

If SSH connects but commands don''t work → check device_type/model first.' WHERE note_id = 30 AND section_order = 4;

-- ============================================================
-- NOTE 31 — React print footer overflow
-- ============================================================
UPDATE notes SET
  title_en = 'React Print: Footer Disappears on the Last Page',
  subtitle_en = 'Content fills 6 rows + summary → overflow pushes footer outside printable area',
  hero_caption_en = 'Print pagination — control rows per page to leave room for footer'
WHERE id = 31;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Report template: 6 rows per page + footer (print date, page number).

Last page with exactly 6 rows + a summary row → content overflows → footer gets pushed off the page.

Other pages worked fine because they had fewer than 6 rows.' WHERE note_id = 31 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Fix: Limit Last Page to 5 Rows', body_en = 'Change pagination logic:

// before: every page has 6 rows
const ROWS_PER_PAGE = 6

// after: last page can only have 5
function calculateTotalPages(total) {
  const full = Math.floor(total / ROWS_PER_PAGE)
  const remainder = total % ROWS_PER_PAGE
  if (remainder === 0) return full + 1
  if (remainder >= 5) return full + 2
  return full + 1
}' WHERE note_id = 31 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Secondary Bug: Every Page Reserves Space for Summary', body_en = 'Found another layered bug: CSS used flex: 1 to reserve space for the summary section on every page, even though summary only appears on the last page.

Fix: change from flex layout to fixed height.
And only insert summary HTML on the last page — don''t reserve space on others.' WHERE note_id = 31 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Print layouts must be tested with edge cases: exactly N rows, N+1 rows, single page, hundreds of pages.

If footer disappears → usually caused by content overflow.
Check: what space is every page reserving that it doesn''t actually need?' WHERE note_id = 31 AND section_order = 4;

-- ============================================================
-- NOTE 32 — Task Scheduler network drive mapping
-- ============================================================
UPDATE notes SET
  title_en = 'Batch Script Works Manually but Has No Effect in Task Scheduler',
  subtitle_en = 'Runs fine manually but Task Scheduler fails — because network drive isn''t mounted',
  hero_caption_en = 'Task Scheduler runs in a different context from interactive session — drive mapping doesn''t carry over'
WHERE id = 32;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'MySQL backup script that reads files from A:\ drive worked fine when run manually.

But after setting it up in Task Scheduler to run automatically — files not found, no error, just no effect.' WHERE note_id = 32 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause', body_en = 'Task Scheduler runs tasks in a non-interactive Windows session.

Network drive mapped in Windows Explorer (A:\ → \\10.20.1.83\Backup2026) is a user-session mapping — not available in service/task sessions.

Script accesses A:\ successfully when run manually because the user is logged in. When Task Scheduler runs — there is no user session → A:\ doesn''t exist.' WHERE note_id = 32 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Map Drive Inside the Script', body_en = 'Add at the top of the script:

net use A: /delete /y 2>nul
net use A: "\\10.20.1.83\Backup2026" /persistent:no
if %ERRORLEVEL% neq 0 (
    echo ERROR: Cannot map network drive >> %LOGFILE%
    exit /b 1
)

/persistent:no is important — prevents Windows from trying to remember the mapping across sessions.' WHERE note_id = 32 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Task Scheduler does not inherit network drives from the user session at all.

Every script that needs network path access in Task Scheduler must map the drive itself at the start and unmap it before finishing.

Can use UNC path (\\server\share) directly instead of a drive letter if a letter isn''t required.' WHERE note_id = 32 AND section_order = 4;

-- ============================================================
-- NOTE 33 — GitHub token exposed revoke SSH key
-- ============================================================
UPDATE notes SET
  title_en = 'GitHub Token Exposed in Chat and Logs Multiple Times — Revoke Immediately Every Time',
  subtitle_en = 'Pasted config without noticing the token was in the URL — must revoke within minutes before GitHub bot captures it',
  hero_caption_en = 'Personal Access Token exposed — GitHub secret scanning bot finds it within minutes'
WHERE id = 33;

UPDATE note_sections SET heading_en = 'Situation', body_en = 'During Oxidized Git remote URL setup, had a token embedded in the URL:
https://ghp_xxxx@github.com/patipark/profile-network-configs.git

Then pasted the config into chat or it appeared in terminal output during debugging — token exposed immediately.

This happened multiple times during setup because debugging printed the full config.' WHERE note_id = 33 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Immediate Response', body_en = '1. Go to https://github.com/settings/tokens
2. Find the leaked token → Revoke immediately
3. Generate a new token
4. Update remote URL in Oxidized config

GitHub has a secret scanning bot — if token is pushed to a public repo it gets auto-revoked. But if leaked elsewhere → must revoke manually.' WHERE note_id = 33 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Prevention: Use SSH Key Instead of Token in URL', body_en = 'Instead of embedding token in remote URL:
https://ghp_xxx@github.com/user/repo.git

Use SSH:
git@github.com:user/repo.git

Set up SSH key in GitHub → no credentials ever appear in config or logs.' WHERE note_id = 33 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Token in URL appears in:
- git log, git remote -v
- docker config when printed
- Application logs
- Support chats when pasting config to debug

For git operations requiring auth → always use SSH key, never token in URL.' WHERE note_id = 33 AND section_order = 4;

-- ============================================================
-- NOTE 34 — Counting boxes in warehouse: status NULL
-- ============================================================
UPDATE notes SET
  title_en = 'Counting Boxes in Warehouse: status NULL Doesn''t Mean "Not Here"',
  subtitle_en = 'COUNT(*) WHERE status = 2 gives the wrong number — 112,000+ boxes have status NULL but are physically in storage',
  hero_caption_en = '770,444 boxes in the system — how to count accurately'
WHERE id = 34;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Warehouse dashboard showed box counts that didn''t match physical reality.

Using WHERE status = 2 (in storage) → got a much lower number than actual.

Cause: many boxes still physically in the warehouse have status = NULL, not status = 2.' WHERE note_id = 34 AND section_order = 1;
UPDATE note_sections SET heading_en = 'isCartonInStorage Logic', body_en = 'The CartonSystem uses this logic:

- status = 2 → explicitly in storage
- status = NULL → determined by lastin and lastout
  - If lastin >= lastout (or lastout is NULL) → box is in storage
  - If lastout > lastin → box is with a customer' WHERE note_id = 34 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Correct Query', body_en = 'WHERE (
  status = 2
  OR (
    status IS NULL
    AND (
      lastout IS NULL
      OR lastin >= lastout
    )
  )
)

Result: 597,379 boxes with an actual location, out of 770,444 total in the system.' WHERE note_id = 34 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Never assume the status field is always the source of truth. Older systems often track state with timestamps instead.

Before building a dashboard, ask or verify with a domain expert: "what makes a record considered active?"' WHERE note_id = 34 AND section_order = 4;

-- ============================================================
-- NOTE 35 — SSD Ctrl+X recovery network share
-- ============================================================
UPDATE notes SET
  title_en = 'Recovering Files from SSD After Ctrl+X Then Deleting the Destination',
  subtitle_en = 'SSD + TRIM = very low recovery chance — but know where to focus first',
  hero_caption_en = 'File lost from Network Share — check server Shadow Copy first'
WHERE id = 35;

UPDATE note_sections SET heading_en = 'Situation', body_en = 'Cut (Ctrl+X) files from a source SSD → pasted to a Network Share → deleted from the Share.

Source SSD no longer has the files (move completed) → no point searching the SSD.' WHERE note_id = 35 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Why SSD Recovery Is Difficult', body_en = 'SSDs have TRIM — when a file is deleted, Windows sends a TRIM command telling the SSD to erase the data immediately. This is different from HDDs which just mark space as "free."

Common file recovery software will find only empty or corrupt files.' WHERE note_id = 35 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Steps to Take First', body_en = 'In this case the files were on a Network Share → focus on the server:

1. Check Recycle Bin on server
   \\server\share\$RECYCLE.BIN

2. Shadow Copy / Previous Versions (highest chance)
   Right-click folder → Restore previous versions

3. Ask IT admin if VSS is enabled and if there''s a recent backup

4. If server is Windows Server → ask admin about Backup Exec / Veeam' WHERE note_id = 35 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Before debugging — identify where the file currently is (SSD or Server), then choose the right approach.

If lost from Network Share → the server admin is who can help, not file recovery software on your PC.' WHERE note_id = 35 AND section_order = 4;

-- ============================================================
-- NOTE 36 — LibreNMS Storage HOST-RESOURCES-MIB
-- ============================================================
UPDATE notes SET
  title_en = 'LibreNMS Not Showing Storage — Must Check HOST-RESOURCES-MIB First',
  subtitle_en = 'CPU, Interface, Memory data all arrive but Storage tab is empty — it''s a different MIB',
  hero_caption_en = 'LibreNMS on ubuntu254 — monitoring 5 devices on the Pro-File network'
WHERE id = 36;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Device in LibreNMS showed complete CPU, Interface traffic, and Memory data.
But the Storage tab was empty — no data at all.

SNMP working normally, no connection errors — just no Storage.' WHERE note_id = 36 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause: Different MIB', body_en = 'Storage uses HOST-RESOURCES-MIB (hrStorageDescr, hrStorageSize) — separate from the standard interface/CPU MIBs.

Some device models (e.g., network devices that aren''t servers) don''t implement HOST-RESOURCES-MIB.
So no storage data appears even though SNMP is working fine.' WHERE note_id = 36 AND section_order = 2;
UPDATE note_sections SET heading_en = 'How to Check', body_en = 'Test from NMS server:
snmpwalk -v2c -c public <DEVICE_IP> 1.3.6.1.2.1.25.2.3.1.3

If no results → device doesn''t support the storage MIB.
If results appear → force discovery:

cd /opt/librenms
./discovery.php -h <DEVICE_IP> -m storage -v
./poller.php -h <DEVICE_IP> -m storage -d' WHERE note_id = 36 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = '"Everything else shows up but Storage doesn''t" = HOST-RESOURCES-MIB not supported.

Always verify with snmpwalk OID 1.3.6.1.2.1.25.2.3.1.3 first.
No results → device will never show a Storage tab in LibreNMS, regardless of configuration.' WHERE note_id = 36 AND section_order = 4;

-- ============================================================
-- NOTE 37 — Hard-code database name in raw SQL
-- ============================================================
UPDATE notes SET
  title_en = 'Hard-Coding Database Name in Raw SQL Breaks Cross-Environment Queries',
  subtitle_en = 'FROM [files_system].[dbo].[history] only works in production — dev database is named files_system_dev',
  hero_caption_en = 'Raw SQL in Prisma — hard-coded database prefix often breaks other environments'
WHERE id = 37;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'API /history worked correctly in production.
But dev environment found no records at all, even though the data existed.

Confirmed by running the query directly in SSMS on files_system_dev — data was there.
But through the API — nothing returned.' WHERE note_id = 37 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause', body_en = 'In the raw SQL query there was a line:
FROM [files_system].[dbo].[history]

The dev DATABASE_URL pointed to files_system_dev.
But the query always force-reads from files_system (production).

Prisma passes raw SQL directly — it does not replace the database name.' WHERE note_id = 37 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Remove the Database Name', body_en = 'Change from:
FROM [files_system].[dbo].[history]

To:
FROM [dbo].[history]

SQL Server uses the database from the connection string automatically. Both dev and prod can use the same query.' WHERE note_id = 37 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Never hard-code database names in raw SQL queries.
Use only schema.table — no database prefix needed.

Exception: genuine cross-database queries that intentionally reference another database.
In that case, inject the database name from an environment variable instead.' WHERE note_id = 37 AND section_order = 4;

-- ============================================================
-- NOTE 38 — GitHub Actions ARM64 build time
-- ============================================================
UPDATE notes SET
  title_en = 'Removing ARM64 from Docker Build Saves 5–7 Minutes',
  subtitle_en = 'Multi-platform build (amd64 + arm64) takes 8–12 minutes; removing arm64 leaves just 3–5 minutes',
  hero_caption_en = 'GitHub Actions workflow: auto-merge dev → main then build Docker image'
WHERE id = 38;

UPDATE note_sections SET heading_en = 'Context', body_en = 'GitHub Actions workflow pushes code to Docker Hub when commit message contains "push to main".

Workflow: merge dev → main → build Docker image → Telegram notification.

Problem: build took too long — 12+ minutes before the notification arrived.' WHERE note_id = 38 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Root Cause: QEMU Emulation for ARM64', body_en = 'platforms: linux/amd64,linux/arm64

Building arm64 on an amd64 machine requires QEMU emulation — much slower than native.

Every server in the infrastructure is x86_64/amd64 — no reason to build arm64.' WHERE note_id = 38 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix', body_en = 'Change just one line:

# before
platforms: linux/amd64,linux/arm64

# after
platforms: linux/amd64

Result: build time dropped from ~12 minutes to ~4 minutes.' WHERE note_id = 38 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'If no ARM devices are in actual use (Apple Silicon, Raspberry Pi, AWS Graviton) — no reason to build arm64.

Many projects add multi-platform by copy-pasting config without thinking about whether it''s actually needed.
Check what architecture your production servers use, then build only what''s necessary.' WHERE note_id = 38 AND section_order = 4;

-- ============================================================
-- NOTE 39 — Excel printer settings upload 502
-- ============================================================
UPDATE notes SET
  title_en = 'Excel Upload Returns 502 Due to Printer Settings and Thai Filename',
  subtitle_en = 'Two files with identical data — one uploads fine, the other gets 502 — only difference is Thai filename and printer settings',
  hero_caption_en = 'Excel file structure — printer settings hidden inside xl/printerSettings/ within the ZIP'
WHERE id = 39;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Two files with the same data — 137 rows, 6 columns:
- ADD__PROFILE_12_25.xlsx → uploads successfully
- ต_นADD__PROFILE_12_25.xlsx → 502 Bad Gateway

Only differences: Thai characters in filename, and file size (15KB vs 22KB).' WHERE note_id = 39 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Two Overlapping Causes', body_en = '1. Thai characters in filename: "ต_น" → many web servers don''t support UTF-8 filenames in multipart upload headers.

2. Printer settings: the larger file had xl/printerSettings1.bin inside its ZIP structure — Excel saved printer config along with the data. Some parsers error when reading this.' WHERE note_id = 39 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fix: Clean File with Python', body_en = 'import zipfile, shutil, os

# Excel is a ZIP — extract and delete printer settings
with zipfile.ZipFile(''input.xlsx'', ''r'') as z:
    z.extractall(''tmp_excel'')

# Remove printer settings
printer_dir = ''tmp_excel/xl/printerSettings''
if os.path.exists(printer_dir):
    shutil.rmtree(printer_dir)

# Repack
with zipfile.ZipFile(''clean.xlsx'', ''w'') as z:
    for f in ...: z.write(f)

Result: file shrank from 22KB → 9.56KB and uploaded successfully.' WHERE note_id = 39 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Excel files are ZIPs — if upload fails, extract and inspect the internal structure.

Thai/Unicode in filenames → use ASCII names for file uploads.

Printer settings in Excel increase file size and break some parsers → safe to remove.' WHERE note_id = 39 AND section_order = 4;

-- ============================================================
-- NOTE 40 — Unix timestamp UTC always
-- ============================================================
UPDATE notes SET
  title_en = 'Unix Timestamps Are Always UTC — Regardless of Server Timezone',
  subtitle_en = 'Date.now() on a Thai server gives the same result as on a UK server — because epoch is UTC',
  hero_caption_en = 'Unix timestamp — a single number with no timezone, convert to offset when displaying'
WHERE id = 40;

UPDATE note_sections SET heading_en = 'A Real Question That Came Up', body_en = 'Code in the IPTV system used:
const ts = Math.floor(Date.now() / 1000)

Question: is this timestamp stored as Thai time or UTC?' WHERE note_id = 40 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Answer: Always UTC', body_en = 'Unix timestamp = seconds elapsed since January 1, 1970 00:00:00 UTC.

Date.now() returns milliseconds in UTC always — regardless of what timezone the process is running in.

A user in Thailand and a user in the UK running Date.now() at the same moment → get the same number.' WHERE note_id = 40 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Convert to Thai Time for Display', body_en = '// Store timestamp as UTC always (correct)
const stored = Math.floor(Date.now() / 1000)

// Convert to Thai time when displaying
const thaiTime = new Date(stored * 1000).toLocaleString(''th-TH'', {
  timeZone: ''Asia/Bangkok''
})

// Or use dayjs
const display = dayjs.unix(stored).tz(''Asia/Bangkok'').format(''DD/MM/YYYY HH:mm:ss'')' WHERE note_id = 40 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Rule: store timestamps as UTC always — convert to local time only when displaying.

If stored as local time → when server timezone changes or user is in a different timezone, data becomes wrong.

Date.now() is safe to use directly — it is always UTC by spec.' WHERE note_id = 40 AND section_order = 4;

-- ============================================================
-- NOTE 41 — SQL Workflow SELECT before UPDATE CartonSystem
-- ============================================================
UPDATE notes SET
  title_en = 'SQL Workflow for Editing CartonSystem Data',
  subtitle_en = 'SELECT first, verify, then UPDATE — a pattern repeated every day',
  hero_caption_en = 'CartonSystem — document box management system, data must be 100% accurate'
WHERE id = 41;

UPDATE note_sections SET heading_en = 'Pattern Used Every Time', body_en = '1. Always SELECT * first to confirm the correct records are targeted
2. Verify row count matches expectation
3. Only then switch to UPDATE

Never UPDATE directly without SELECTing first.' WHERE note_id = 41 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Pitfall: cartno Without Quotes', body_en = 'Most common mistake — copying a cartno list from Excel where SQL has no quotes:

Wrong:
cartno IN (TKECAP002325 TKETCS000390)

Correct:
cartno IN (''TKECAP002325'', ''TKETCS000390'')

SQL Server will parse unquoted values as column names and error immediately.' WHERE note_id = 41 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Pitfall: Forgetting Filter Code → UPDATE Spans Records', body_en = 'Had a case where UPDATE was correct but forgot to include the filter code → UPDATE hit every record with that cartno across multiple customers.

WHERE must always have both code AND cartno IN (...) — missing either one is not acceptable.' WHERE note_id = 41 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'SELECT before UPDATE — always, no exceptions.
Include WHERE for both code and cartno every time.
If row count doesn''t match → stop, investigate, don''t proceed.' WHERE note_id = 41 AND section_order = 4;

-- ============================================================
-- NOTE 42 — Windows Server slmgr rearm
-- ============================================================
UPDATE notes SET
  title_en = 'Extending Windows Server Evaluation with slmgr /rearm',
  subtitle_en = 'Trial expired, worried server would shut down — rearm extends by up to 3 times, totaling 180 days',
  hero_caption_en = 'Windows Server Evaluation — used for test/dev before a real license is ready'
WHERE id = 42;

UPDATE note_sections SET heading_en = 'Context', body_en = 'Windows Server Evaluation edition has a 180-day (6-month) lifespan.
If it expires without activation → server reboots every 1 hour and eventually forces a shutdown.' WHERE note_id = 42 AND section_order = 1;
UPDATE note_sections SET heading_en = 'What Is slmgr /rearm', body_en = 'A command that resets the Windows activation grace period.

Can be done up to 3 times (including initial = 4 × 30 days = 180 days).

# Check status first
slmgr /dlv

# Check remaining rearm count
slmgr /xpr

# Rearm (must run as Administrator)
cscript %windir%\system32\slmgr.vbs /rearm

Must restart after running.' WHERE note_id = 42 AND section_order = 2;
UPDATE note_sections SET heading_en = 'PowerShell Version', body_en = '# Check status
Get-WmiObject -query ''select * from SoftwareLicensingProduct'' |
  Where-Object {$_.PartialProductKey} |
  Select-Object Name, LicenseStatus, GracePeriodRemaining

# Rearm via WMI
$sls = Get-WmiObject SoftwareLicensingService
$sls.ReArmWindows()' WHERE note_id = 42 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'slmgr /rearm is not activation — it only extends the grace period.
Can be done at most 3 times, after which you must activate properly or reinstall.

If used in production → must get a real license. Evaluation is not suitable for production workloads.' WHERE note_id = 42 AND section_order = 4;

-- ============================================================
-- NOTE 43 — Shared Printer Error 0x00000709 PrintNightmare
-- ============================================================
UPDATE notes SET
  title_en = 'Shared Printer Error 0x00000709 on Windows 11 — PrintNightmare Legacy',
  subtitle_en = 'Windows Update after PrintNightmare patch blocks shared printer installation — need Registry fix or local driver first',
  hero_caption_en = 'HP LaserJet Pro M12a shared from CENTER-SAWITREEK — Windows 11 blocks install after patch'
WHERE id = 43;

UPDATE note_sections SET heading_en = 'Problem', body_en = 'Windows 11 couldn''t install a shared printer from server CENTER-SAWITREEK.
Error 0x00000709: "Cannot complete the install of the printer"

Share path was correct, printer visible on network, but double-clicking returned an error.' WHERE note_id = 43 AND section_order = 1;
UPDATE note_sections SET heading_en = 'Cause: PrintNightmare Security Patch', body_en = 'Microsoft released a patch after the PrintNightmare vulnerability (CVE-2021-34527).

The patch requires admin privileges to install printer drivers from the network.
Windows 11 is stricter than Windows 10 — blocks shared printer installation in some configurations by default.' WHERE note_id = 43 AND section_order = 2;
UPDATE note_sections SET heading_en = 'Fixes That Work', body_en = '# Method 1: Registry edit
HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Print
RpcAuthnLevelPrivacyEnabled = 0

# Method 2: Install local driver first (recommended)
1. Download HP M12a PCL 6 Driver from hp.com
2. Install using "Add a local printer or network printer with manual settings"
3. After driver is installed → adding shared printer succeeds

# Method 3: Check Print Spooler on server side
Get-Service -Name Spooler | Select Status
# If Stopped → Start-Service Spooler' WHERE note_id = 43 AND section_order = 3;
UPDATE note_sections SET heading_en = 'Key Learning', body_en = 'Error 0x00000709 on Windows 11 is usually caused by the PrintNightmare patch — not a network issue.

If you can ping the server, see the share, but can''t install → problem is in security policy.

Safest fix: install the local driver first — no Registry editing needed.' WHERE note_id = 43 AND section_order = 4;

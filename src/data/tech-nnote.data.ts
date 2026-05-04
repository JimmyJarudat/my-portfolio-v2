// ─── Data ─────────────────────────────────────────────────────────────────────
// ─── Data (จากประสบการณ์จริงทั้งหมด) ──────────────────────────────────────────
export const NOTES: Note[] = [
    {
        id: 1,
        slug: "sql-server-dept-trailing-space",
        title: "SQL Server: = กับ LIKE ได้ผลไม่เท่ากัน",
        subtitle: "กรอง dept = 'RA' ได้ 31 แถว แต่ LIKE 'RA%' ได้ 43 แถว — หายไปไหน 12 แถว?",
        tags: ["SQL Server", "CartonSystem", "Debugging"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
        heroCaption: "Hidden character ใน SQL Server — ตาเปล่ามองไม่เห็น แต่ทำให้ query พัง",
        sections: [
            {
                heading: "ปัญหาที่เจอ",
                body: `ลูกค้า PER0001-26 มีกล่อง 43 ใบที่ dept ขึ้นต้นด้วย "RA" แต่พอ query ด้วย dept = 'RA' ได้แค่ 31 แถว — หาย 12 แถวไม่รู้ไปไหน

ตอนแรกคิดว่า record พวกนั้นหาย แต่ LIKE 'RA%' ยังเจออยู่ครบ`,
            },
            {
                heading: "วิธีตรวจสอบ",
                body: `รัน query นี้เพื่อดู hidden character:\n\nSELECT dept, LEN(dept) AS len, DATALENGTH(dept) AS byte_len, COUNT(*) AS cnt\nFROM [CartonSystem].[dbo].[carton]\nWHERE custcode = 'PER0001-26'\nGROUP BY dept, LEN(dept), DATALENGTH(dept)\n\nถ้า LEN กับ DATALENGTH ไม่เท่ากัน → มี hidden character แน่นอน\n\nและดู record ที่หายด้วย:\nSELECT boxno, dept, LEN(dept) AS len\nFROM [CartonSystem].[dbo].[carton]\nWHERE custcode = 'PER0001-26'\n  AND dept LIKE 'RA%'\n  AND dept != 'RA'`,
            },
            {
                heading: "สาเหตุ",
                body: `12 แถวที่หายเก็บ dept เป็น 'RA ' (มี trailing space) หรือ ' RA' (leading space)\n\nข้อควรรู้เรื่อง SQL Server:\n- = ใช้ collation comparison — trailing space ถูก pad ให้อัตโนมัติ (RA = RA✓)\n- แต่ถ้าเป็น leading space หรือ non-breaking space → = ไม่จับ\n- LIKE ทำงานต่างออกไป จึงจับได้มากกว่า`,
                isCallout: true,
            },
            {
                heading: "Key Learning",
                body: `อย่า assume ว่า = กับ LIKE ได้ผลเหมือนกันเสมอ โดยเฉพาะข้อมูลที่ manual key เข้ามา มักมี space แปลกๆ ซ่อนอยู่\n\nถ้าผลไม่เท่ากัน → ใช้ DATALENGTH เช็คก่อนเสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 2,
        slug: "snipeit-cron-backup-mtime",
        title: "find -mtime ทำงานไม่ตรงตามที่คิด",
        subtitle: "ตั้ง DAYS=3 แต่ไฟล์อายุ 3 วันไม่ถูกจับ — เพราะ -mtime นับแบบ integer block",
        tags: ["Linux", "Bash", "Cron", "Snipe-IT"],
        date: "2026",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
        heroCaption: "Script สำรองข้อมูล Snipe-IT จาก sv51 ไปยัง NAS83 อัตโนมัติทุกสัปดาห์",
        sections: [
            {
                heading: "Context",
                body: `สร้าง snipeit-backup-archive.sh เพื่อย้ายไฟล์ backup เก่าจาก /var/www/snipeit/storage/app/backups ไปเก็บที่ NAS83 (/mnt/sv83/backup2026/snipeit-backups)\n\nใช้ DAYS=3 เป็น threshold แต่พอทดสอบ — ไม่มีไฟล์ถูกจับเลย ทั้งที่มีไฟล์อายุ 3 วันอยู่ชัดๆ`,
            },
            {
                heading: "สาเหตุ: -mtime ใช้ integer 24h block",
                body: `find -mtime +3 หมายถึง "เก่ากว่า 4 × 24 ชั่วโมง" ไม่ใช่ "เก่ากว่า 3 วัน"\n\nไฟล์อายุ 3 วัน 23 ชั่วโมง → ยังไม่ถึง 4 block → ไม่ถูกจับ\nต้องรอจนครบ 96 ชั่วโมงเต็มๆ ถึงจะเจอ`,
                image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=700&q=75",
                imageCaption: "find -mtime ทำงานเป็น block 24 ชั่วโมง ไม่ใช่นาทีที่แน่นอน",
            },
            {
                heading: "วิธีแก้: ใช้ -mmin แทน",
                body: `เปลี่ยนจาก:\nfind ... -mtime +$DAYS\n\nเป็น:\nfind ... -mmin +$(( DAYS * 24 * 60 ))\n\n-mmin ทำงานระดับนาที ได้ผลตรงกว่ามาก ไม่มีเรื่อง integer block`,
                isCallout: false,
            },
            {
                heading: "ปัญหาที่สองใน script เดียวกัน",
                body: `artisan backup ให้ error "proc_open(): posix_spawn() failed: Permission denied" เพราะ script รัน artisan จากผิด working directory\n\nแก้จาก:\nsudo -u snipeit php artisan snipeit:backup\n\nเป็น:\nsu -s /bin/bash snipeit -c "cd /var/www/snipeit && php artisan snipeit:backup"\n\nartisan ต้องการ working directory ถูกต้องเสมอ`,
                isCallout: true,
            },
            {
                heading: "Key Learning",
                body: `find -mtime เหมาะกับ rough filter เท่านั้น ถ้าต้องการ precision ให้ใช้ -mmin หรือ -newer\n\nและ artisan command ทุกตัวต้องรันจาก project root (/var/www/snipeit) เสมอ — ไม่งั้น config ไม่โหลด`,
                isCallout: true,
            },
        ],
    },
    {
        id: 3,
        slug: "nginx-502-network-unreachable",
        title: "502 Bad Gateway — ไม่ใช่ Nginx พัง แต่ backend หายไปจาก network",
        subtitle: "debug ผิดที่ config นาน 30 นาที สุดท้าย ping ไป server ไม่ถึงเลย",
        tags: ["Nginx", "Docker", "Networking", "Snipe-IT"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        heroCaption: "Snipe-IT reverse proxy ผ่าน Nginx — 502 ที่เกิดจาก backend ล่ม ไม่ใช่ config ผิด",
        sections: [
            {
                heading: "สถานการณ์",
                body: `Snipe-IT รัน proxy ผ่าน Nginx ที่ /snipeit/ ชี้ไปยัง https://192.168.2.251\n\nเข้าเว็บแล้วได้ 502 Bad Gateway — เริ่ม debug ที่ Nginx config ก่อนเลย แก้ SSL directive, rewrite rule อยู่นาน`,
            },
            {
                heading: "วิธี debug ที่ถูก",
                body: `ทดสอบเป็นลำดับ:\n\n1. curl -k https://192.168.2.251 → timeout\n2. curl http://192.168.2.251 → timeout\n3. ping 192.168.2.251 → "Destination host unreachable" from gateway 172.16.10.1\n\nขั้นที่ 3 บอกชัดเจนว่า: server ไม่อยู่บน network เลย — ไม่ใช่เรื่อง Nginx`,
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=75",
                imageCaption: "ลำดับการ debug network: curl port → curl http → ping — จากนอกเข้าใน",
            },
            {
                heading: "Key Learning",
                body: `502 Bad Gateway มีสาเหตุได้หลายอย่าง อย่า assume ว่าเป็น Nginx config ผิดเสมอ\n\nก่อน debug config ให้ verify ก่อนว่า backend เข้าถึงได้จริงด้วย ping/curl ตรงๆ ประหยัดเวลาได้มาก\n\nถ้า ping ไม่ถึง → ปัญหาอยู่ที่ network หรือ server — ไม่ใช่ config`,
                isCallout: true,
            },
        ],
    },
    {
        id: 4,
        slug: "oxidized-docker-swarm-port",
        title: "Oxidized ใน Docker Swarm: port 8888 เข้าไม่ได้",
        subtitle: "Swarm ingress routing ทำให้ port binding ไม่ทำงานตามที่คาด — ต้องใช้ mode: host",
        tags: ["Docker", "Swarm", "Oxidized", "LibreNMS"],
        date: "2026",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
        heroCaption: "Oxidized รัน network config backup ผ่าน Docker Swarm บน ubuntu254 (192.168.2.254)",
        sections: [
            {
                heading: "ปัญหา",
                body: `Oxidized รันใน Docker Swarm แต่เข้า web UI port 8888 ไม่ได้ ทั้งที่ deploy ด้วย ports: - "8888:8888"\n\nLibreNMS integration ผ่าน Oxidized API ก็ใช้ไม่ได้`,
            },
            {
                heading: "สาเหตุ: Swarm ingress routing",
                body: `Docker Swarm ใช้ ingress load balancer โดย default — port binding ทำงานแบบ NAT ผ่าน routing mesh ทำให้บาง service เช่น Oxidized ที่ bind localhost ไม่ถูก forward มาอย่างถูกต้อง`,
            },
            {
                heading: "วิธีแก้ที่ 1: mode: host",
                body: `เปลี่ยน port binding ใน stack file:\n\nports:\n  - target: 8888\n    published: 8888\n    protocol: tcp\n    mode: host\n\nแบบนี้ container bind port ตรงกับ host โดยไม่ผ่าน ingress — เข้าได้ทันที`,
                isCallout: false,
            },
            {
                heading: "วิธีแก้ที่ 2: Nginx proxy ไปยัง container IP",
                body: `ถ้าไม่อยาก redeploy ทำ workaround ด้วย Nginx:\n\nCONTAINER=$(docker ps -q -f name=oxidized)\nCONTAINER_IP=$(docker inspect $CONTAINER --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')\n\nแล้ว proxy_pass ไปยัง $CONTAINER_IP:8888 โดยตรง\n\nข้อเสีย: ต้องรัน script ใหม่ทุกครั้งที่ container ถูก recreate (IP เปลี่ยน)`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `Docker Swarm ingress เหมาะกับ stateless HTTP service ที่ต้องการ load balancing\n\nแต่ service ที่ bind localhost หรือต้องการ direct port access (เช่น Oxidized, database) ควรใช้ mode: host\n\nถ้า container IP เปลี่ยนทุกครั้งที่ restart → ห้ามอ้างอิง IP ตรงๆ ใน production`,
                isCallout: true,
            },
        ],
    },
    {
        id: 5,
        slug: "carton-sql-workflow",
        title: "Workflow SQL สำหรับแก้ข้อมูล CartonSystem",
        subtitle: "SELECT ก่อน ยืนยัน แล้วค่อย UPDATE — pattern ที่ทำซ้ำทุกวัน",
        tags: ["SQL Server", "CartonSystem", "Workflow"],
        date: "2026",
        readTime: "2 min",
        heroImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
        heroCaption: "CartonSystem — ระบบจัดการกล่องเอกสาร ข้อมูลต้องแม่นยำ 100%",
        sections: [
            {
                heading: "Pattern ที่ใช้ซ้ำทุกครั้ง",
                body: `1. SELECT * ก่อนเสมอ เพื่อยืนยันว่าจับ record ถูกต้อง\n2. ตรวจนับว่า row count ตรงกับที่คาด\n3. ถ้าถูกแล้วค่อยเปลี่ยนเป็น UPDATE\n\nไม่เคย UPDATE ตรงโดยไม่ SELECT ดูก่อน`,
            },
            {
                heading: "Pitfall: cartno ไม่มี quotes",
                body: `ปัญหาที่เจอบ่อยที่สุด — copy cartno list มาจาก Excel แล้ว SQL ไม่มี quotes:\n\nผิด:\ncartno IN (TKECAP002325 TKETCS000390)\n\nถูก:\ncartno IN ('TKECAP002325', 'TKETCS000390')\n\nSQL Server จะ parse ตัวที่ไม่มี quotes เป็น column name แล้ว error ทันที`,
                isCallout: false,
            },
            {
                heading: "Pitfall: code ผิด record ล็อค",
                body: `เคยเจอกรณีที่ UPDATE ถูกต้อง แต่ลืมใส่ filter code → UPDATE ทุก record ที่มี cartno นั้น ข้ามลูกค้าหลายราย\n\nWHERE ต้องมีทั้ง code AND cartno IN (...) เสมอ ขาดอันใดอันหนึ่งไม่ได้`,
                isCallout: true,
            },
            {
                heading: "Key Learning",
                body: `SELECT ก่อน UPDATE เสมอ — ไม่มีข้อยกเว้น\nใส่ WHERE ทั้ง code และ cartno ครบทุกครั้ง\nถ้า row count ไม่ตรง → หยุด ตรวจสอบ อย่า proceed`,
                isCallout: true,
            },
        ],
    },
    {
        id: 6,
        slug: "ssd-ctrl-x-recovery",
        title: "กู้ไฟล์จาก SSD หลัง Ctrl+X แล้ว delete ปลายทาง",
        subtitle: "SSD + TRIM = โอกาสกู้คืนน้อยมาก — แต่ต้องรู้ว่าโฟกัสที่ไหนก่อน",
        tags: ["SSD", "Recovery", "Windows", "Networking"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        heroCaption: "ไฟล์หายจาก Network Share — ต้องตรวจ Shadow Copy ของ server ก่อน",
        sections: [
            {
                heading: "สถานการณ์",
                body: `ตัด (Ctrl+X) ไฟล์จาก SSD ต้นทาง → วางที่ Network Share ปลายทาง → ลบทิ้งบน Share\n\nต้นทาง SSD ไม่มีไฟล์แล้ว (ย้ายออกสมบูรณ์) → ไม่ต้องไปงมที่ SSD`,
            },
            {
                heading: "ทำไม SSD กู้ยาก",
                body: `SSD มี TRIM — เมื่อลบไฟล์ Windows สั่ง TRIM ให้ SSD ลบข้อมูลจริงทันที ต่างจาก HDD ที่แค่ mark ว่า "ว่าง"\n\nโปรแกรมกู้ไฟล์ทั่วไปจะเจอแค่ไฟล์เปล่า หรือ corrupt`,
            },
            {
                heading: "ลำดับที่ต้องทำก่อน",
                body: `กรณีนี้ไฟล์อยู่ที่ Network Share → โฟกัสที่ server:\n\n1. เช็ค Recycle Bin บน server\n   \\\\server\\share\\$RECYCLE.BIN\n\n2. Shadow Copy / Previous Versions (โอกาสสูงสุด)\n   คลิกขวาโฟลเดอร์ → Restore previous versions\n\n3. ถาม IT admin ว่า VSS เปิดอยู่ไหม มี backup ล่าสุดไหม\n\n4. ถ้า Server เป็น Windows Server → ถาม admin เรื่อง Backup Exec / Veeam`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `502 ก่อน debug — ระบุก่อนว่าไฟล์อยู่ที่ไหนตอนนี้ (SSD หรือ Server) แล้วค่อยเลือกวิธี\n\nถ้าหายจาก Network Share → server admin คือคนที่ช่วยได้ ไม่ใช่ software กู้ไฟล์บน PC`,
                isCallout: true,
            },
        ],
    },

    {
        id: 7,
        slug: "crystal-reports-thai-mai-tai-khu",
        title: "Crystal Reports crash กับ ์ (mai tai khu) ท้ายข้อความ",
        subtitle: "รายงาน C# พัง Access Violation 0xc0000005 — ไม่ใช่ null ไม่ใช่ data ผิด แต่เป็น Unicode combining character",
        tags: ["Crystal Reports", "C#", "SQL Server", "Thai"],
        date: "2025",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
        heroCaption: "Crystal Reports crash กับ dept ที่ลงท้ายด้วย ์ — เช่น โลจิสติกส์",
        sections: [
            {
                heading: "อาการ",
                body: `รายงาน Crystal Reports (.rpt) ทำงานปกติกับลูกค้าส่วนใหญ่ แต่ crash ทันทีกับ BPFL-25 ด้วย Access Violation 0xc0000005\n\nลองหลายอย่างก่อน: null check, data structure mismatch, string length — ไม่ใช่สักอัน`,
            },
            {
                heading: "สาเหตุที่แท้จริง",
                body: `Crystal Report engine มี bug กับ Thai Unicode combining character "์" (mai tai khu U+0E4C) ที่อยู่ท้ายสุดของ string\n\nเช่น dept = "โลจิสติกส์" → crash\nตัด "ส์" ออกเหลือ "โลจิสติก" → ทำงานได้\n\nเพิ่ม "ส์" กลับ → crash อีกครั้ง\nยืนยันว่าปัญหาคือ combining character ท้าย string โดยตรง`,
            },
            {
                heading: "วิธีแก้: CASE statement ใน SQL",
                body: `แก้ที่ query ก่อนส่งให้ Crystal Reports:\n\nSELECT\n  CASE\n    WHEN dept LIKE N'%์'\n    THEN dept + ' '\n    ELSE dept\n  END AS dept\nFROM ...\n\nเติม space ท้ายถ้าจบด้วย ์ — Crystal Reports รับได้ ข้อมูลที่แสดงก็ยังถูกต้อง`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `Crystal Reports มี known issue กับ Thai combining characters ท้าย string\n\nถ้า report crash แบบไม่มีสาเหตุชัดเจน และข้อมูลมีภาษาไทย → ให้นึกถึง ์ ็ ่ ้ ๊ ๋ ที่อาจอยู่ท้าย field ก่อนเลย\n\nแก้ที่ SQL ด้วย CASE + trailing space ดีกว่าแก้ที่ Crystal เพราะ Crystal ไม่มี config ให้จัดการ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 8,
        slug: "debezium-cascade-crash-morning",
        title: "แอปตายทุกเช้าเพราะ Debezium crash loop",
        subtitle: "Nova API ให้ 502 ตั้งแต่ตื่นมา — ต้นเหตุไม่ใช่ API แต่เป็น Debezium CDC ที่ restart วนอยู่",
        tags: ["Debezium", "CDC", "Docker", "Node.js"],
        date: "2026",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        heroCaption: "Cascade failure ใน Docker Swarm — service หนึ่งพังดึงอีก service ลงด้วย",
        sections: [
            {
                heading: "อาการ",
                body: `ทุกเช้าประมาณ 06:00 Nova API ส่ง 502 Bad Gateway ต้อง restart stack ด้วยมือทุกวัน\n\nดู log คิดว่า nova_api_web พัง — แต่จริงๆ แล้ว nova_api restart เพราะ unhandled promise rejection แล้วเริ่ม return 502 ให้ Debezium`,
            },
            {
                heading: "Root Cause: Cascade Failure",
                body: `Pattern ที่เกิดจริง:\n\n1. nova_api restart (unhandled promise rejection)\n2. ช่วง restart → return 502 ให้ Debezium connector\n3. Debezium ไม่มี error tolerance → exhaust retry แล้ว crash (exit code 1)\n4. Debezium เข้า restart loop ทุก ~1:49 นาที\n5. nova_api กลับมา online แล้ว แต่ Debezium ยังวน loop อยู่\n\nดู log แค่ nova_api จึงหา root cause ไม่เจอ`,
                isCallout: false,
            },
            {
                heading: "Fix 1: Debezium error tolerance",
                body: `เพิ่ม config ใน connector:\n\nerrors.tolerance=all\nerrors.retry.delay.max.ms=60000\nerrors.retry.timeout=-1\n\n-1 = retry ไม่มีสิ้นสุด — Debezium จะรอ API กลับมาเองแทนที่จะ crash`,
            },
            {
                heading: "Fix 2: แก้ unhandled rejection ใน index.ts",
                body: `เจอ initializeApp() ถูก call 2 ครั้งใน index.ts — ทำให้ startup race condition\n\nและ unhandledRejection handler เดิมทำ process.exit() ทุกครั้ง:\n\n// เดิม — อันตราย\nprocess.on('unhandledRejection', () => process.exit(1))\n\n// แก้ — log แทน\nprocess.on('unhandledRejection', (reason) => {\n  logger.error('Unhandled rejection:', reason)\n})`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `ถ้า service A พัง → อาจทำให้ service B ที่ depend on A เข้า crash loop ด้วย\n\nตอน debug ต้องดู log ทุก service พร้อมกัน ไม่ใช่แค่ service ที่คิดว่าพัง\n\nDebezium ไม่ควรรัน default config ใน production — error.tolerance และ retry ต้องตั้งทุกครั้ง`,
                isCallout: true,
            },
        ],
    },
    {
        id: 9,
        slug: "powershell-migration-fk-order",
        title: "PowerShell migrate DB: TRUNCATE ล้มเหลวแม้ disable FK แล้ว",
        subtitle: "pfindex_test → pfindex migration — แก้ FK, DELETE/INSERT order, และ array reversal bug",
        tags: ["SQL Server", "PowerShell", "Migration"],
        date: "2026",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
        heroCaption: "Script Sync-PfindexFromTest.ps1 — sync 26 tables จาก test สู่ production",
        sections: [
            {
                heading: "Context",
                body: `ต้องการ sync ข้อมูลจาก pfindex_test → pfindex (production) ด้วย PowerShell script\n\nมีความซับซ้อนเพิ่ม: OriginalHistory อยู่ใน dbo schema ที่ test แต่อยู่ใน pfmaster schema ที่ production`,
            },
            {
                heading: "Bug 1: TRUNCATE ล้มเหลวแม้ NOCHECK แล้ว",
                body: `TRUNCATE TABLE ไม่สามารถใช้กับ table ที่มี FK reference แม้จะ ALTER TABLE NOCHECK CONSTRAINT ALL ไว้แล้ว\n\nSQL Server ไม่ยอม TRUNCATE ถ้ามี FK อ้างอิงอยู่เลย ไม่ว่า constraint จะ enable อยู่หรือเปล่า\n\nFix: เปลี่ยนจาก TRUNCATE เป็น DELETE FROM และแยกเป็น 2 phase:\n- Phase 1: DELETE ทุก table เรียงจาก child → parent\n- Phase 2: INSERT เรียงจาก parent → child`,
            },
            {
                heading: "Bug 2: PowerShell array reversal",
                body: `ต้องการ reverse array เพื่อ DELETE ในลำดับกลับกัน เขียนว่า:\n\n[System.Linq.Enumerable]::Reverse($DboTables)\n\nแต่ PowerShell array ไม่ implement IEnumerable แบบที่ Linq คาดหวัง\n\nFix ใช้ slice syntax แทน:\n$DboTables[-1..-($DboTables.Count)]`,
                isCallout: false,
            },
            {
                heading: "Bug 3: SSL + Execution Policy",
                body: `รัน script ครั้งแรกเจอ 2 error พร้อมกัน:\n\n1. Execution policy block: ใช้ Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass\n2. SSL cert error: เพิ่ม TrustServerCertificate = $true ใน Invoke-Sqlcmd params`,
            },
            {
                heading: "Key Learning",
                body: `TRUNCATE กับ DELETE ไม่เหมือนกัน — TRUNCATE ติด FK เสมอ ไม่ว่า constraint จะ enabled หรือไม่\n\nถ้า migrate หลาย table ที่มี FK ระหว่างกัน ต้อง map dependency graph ก่อน แล้ว DELETE/INSERT ตามลำดับที่ถูกต้อง`,
                isCallout: true,
            },
        ],
    },
    {
        id: 10,
        slug: "sqlserver-use-db-context-bug",
        title: "USE [database] ใน query ทำให้ auth error ในครั้งถัดไป",
        subtitle: "Nova Platform API รัน USE [CartonSystem] แล้ว connection context ค้างอยู่กับ DB นั้นตลอด",
        tags: ["SQL Server", "Prisma", "Node.js", "Debugging"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
        heroCaption: "Multi-database API — connection context เปลี่ยนตลอด ถ้า USE ค้างอยู่จะพัง",
        sections: [
            {
                heading: "ปัญหา",
                body: `Nova Platform monitor หลาย database พร้อมกัน (nova_platform, files_system, CartonSystem ฯลฯ)\n\nในบาง query ใส่ USE [CartonSystem] ไว้ต้น query — ทำงานถูกต้อง\n\nแต่ request ถัดไปที่ควร query nova_platform กลับ error "Invalid object name 'sessions'" เพราะ connection ยังอยู่ที่ CartonSystem`,
            },
            {
                heading: "สาเหตุ",
                body: `Connection pooling ใน Prisma/SQL Server ใช้ connection เดิมซ้ำ\n\nพอรัน USE [CartonSystem] ใน query หนึ่ง → connection นั้นเปลี่ยน context ไปอยู่ที่ CartonSystem\n\nถ้า pool นำ connection นั้นกลับมาใช้ใน request ถัดไป → query ไปโดน CartonSystem แทน nova_platform`,
            },
            {
                heading: "Fix: ใช้ database prefix แทน USE",
                body: `เปลี่ยนจาก:\nUSE [CartonSystem]\nSELECT * FROM sys.tables\n\nเป็น:\nSELECT * FROM [CartonSystem].sys.tables\n\nไม่ต้อง USE เลย — ระบุ database ตรงๆ ใน FROM clause ทุกครั้ง connection context ไม่เปลี่ยน`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `ห้ามใช้ USE [database] ใน query ที่รันผ่าน connection pool\n\nใน multi-database scenario ให้ระบุ database prefix ใน query โดยตรงเสมอ:\n[DatabaseName].[schema].[table]\n\nถ้าต้องรัน USE จริงๆ → เปิด connection ใหม่แยก ปิดทันทีหลังใช้งาน`,
                isCallout: true,
            },
        ],
    },
    {
        id: 11,
        slug: "npm-custom-location-vs-advanced",
        title: "Nginx Proxy Manager: Custom Locations ทำให้ระบบ offline",
        subtitle: "ย้าย Nginx config ไป NPM แล้วใส่ /snipeit/ ใน Custom Locations tab — ทุกอย่างดับ",
        tags: ["Nginx", "Docker", "Snipe-IT", "DevOps"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
        heroCaption: "Nginx Proxy Manager — Custom Locations กับ Advanced tab ทำงานต่างกันมาก",
        sections: [
            {
                heading: "สถานการณ์",
                body: `ย้าย Nginx config ดั้งเดิมไปใช้ Nginx Proxy Manager (NPM) ใน Docker Swarm\n\nต้องการ proxy /snipeit/ ชี้ไปยัง https://192.168.2.251 มี custom rewrite rule\n\nใส่ใน Custom Locations tab → ระบบ offline ทันที ทุก site เข้าไม่ได้เลย`,
            },
            {
                heading: "สาเหตุ",
                body: `Custom Locations tab ใน NPM generate Nginx config ในลักษณะที่ conflict กับ main server block ได้ง่ายมาก\n\nโดยเฉพาะถ้ามี rewrite rule หรือ proxy_pass ที่ซับซ้อน NPM จัดการ syntax ให้ไม่ถูกต้อง → Nginx reload fail → ทุก proxy host ดับพร้อมกัน`,
            },
            {
                heading: "Fix: ใช้ Advanced tab แทน",
                body: `ใส่ location block ใน Advanced tab แทน:\n\nlocation /snipeit/ {\n    rewrite ^/snipeit/(.*) /$1 break;\n    proxy_pass https://192.168.2.251;\n    proxy_ssl_verify off;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n}\n\nAdvanced tab inject config โดยตรงใน server block — ไม่ผ่าน UI parser ที่อาจสร้าง syntax ผิด`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `NPM Custom Locations tab เหมาะกับ location block ง่ายๆ เท่านั้น\n\nถ้ามี rewrite rule, proxy_ssl directives, หรือ header manipulation → ใช้ Advanced tab เสมอ มีควบคุมมากกว่าและไม่ผ่าน UI parser\n\nก่อน save config ที่ซับซ้อนใน NPM → ควรเตรียม emergency SSH access ไว้ก่อนทุกครั้ง`,
                isCallout: true,
            },
        ],
    },
    {
        id: 12,
        slug: "task-scheduler-network-drive",
        title: "Batch script ทำงานใน Task Scheduler แต่ไม่ได้ผล",
        subtitle: "รัน manual ได้ปกติ แต่ Task Scheduler fail — เพราะ network drive ไม่ได้ mount",
        tags: ["Windows", "Batch", "Task Scheduler", "Networking"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
        heroCaption: "Task Scheduler ทำงาน context ต่างจาก interactive session — drive mapping ไม่ติด",
        sections: [
            {
                heading: "ปัญหา",
                body: `Script backup MySQL ที่อ่านไฟล์จาก A:\\ drive ทำงานปกติตอนรัน manual\n\nแต่พอตั้ง Task Scheduler ให้รันอัตโนมัติ — ไม่เจอไฟล์เลย ไม่มี error แค่ไม่ทำงาน`,
            },
            {
                heading: "สาเหตุ",
                body: `Task Scheduler รัน task ใน non-interactive session ของ Windows\n\nNetwork drive ที่ map ไว้ใน Windows Explorer (A:\\ → \\\\10.20.1.83\\Backup2026) เป็น user-session mapping — ไม่ available ใน service/task session\n\nScript เข้าถึง A:\\ ได้ตอน manual เพราะ user login อยู่ ตอน Task Scheduler ไม่มี user session → A:\\ ไม่มี`,
            },
            {
                heading: "Fix: map drive ใน script เอง",
                body: `เพิ่มต้น script:\n\nnet use A: /delete /y 2>nul\nnet use A: "\\\\10.20.1.83\\Backup2026" /persistent:no\nif %ERRORLEVEL% neq 0 (\n    echo ERROR: Cannot map network drive >> %LOGFILE%\n    exit /b 1\n)\n\n/persistent:no สำคัญมาก — ไม่ให้ Windows พยายาม remember mapping ข้าม session`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `Task Scheduler ไม่ inherit network drive จาก user session เลย\n\nทุก script ที่ต้องเข้า network path ใน Task Scheduler ต้อง map drive เองในช่วงต้น script และ unmap ก่อนจบ\n\nใช้ UNC path (\\\\server\\share) แทน drive letter ได้เลย ถ้าไม่จำเป็นต้องใช้ letter`,
                isCallout: true,
            },
        ],
    },
    {
        id: 13,
        slug: "sqlserver-collation-rebuild",
        title: "เปลี่ยน Collation SQL Server Thai_CS_AS → Thai_CI_AS",
        subtitle: "ต้อง rebuild system database — ไม่ใช่แค่ ALTER DATABASE — และต้องวางแผนดีก่อนทำ",
        tags: ["SQL Server", "Collation", "DBA"],
        date: "2026",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
        heroCaption: "SQL Server Collation change — operation ที่ทำแล้วย้อนยากมาก",
        sections: [
            {
                heading: "ทำไมถึงต้องเปลี่ยน",
                body: `Server collation เป็น Thai_CS_AS (Case Sensitive) ทำให้ query ที่ใช้ตัวพิมพ์เล็ก/ใหญ่ต่างกันไม่ match\n\nเช่น WHERE username = 'Admin' ≠ WHERE username = 'admin'\n\nต้องการเปลี่ยนเป็น Thai_CI_AS (Case Insensitive) เพื่อให้ query ยืดหยุ่นกว่า`,
            },
            {
                heading: "สิ่งที่คนมักเข้าใจผิด",
                body: `ALTER DATABASE [mydb] COLLATE Thai_CI_AS\n\nใช้ได้กับ database-level collation แต่ไม่เปลี่ยน server-level collation\n\nการเปลี่ยน server collation ต้อง rebuild system databases (master, msdb, model) ด้วย Setup.exe:\n\nSetup.exe /QUIET /ACTION=REBUILDDATABASE\n  /INSTANCENAME=MSSQLSERVER\n  /SQLSYSADMINACCOUNTS=<admin>\n  /SAPWD=<pwd>\n  /SQLCOLLATION=Thai_CI_AS\n\nการ rebuild นี้ลบ logins, jobs, linked servers ทั้งหมด ต้อง script ออกก่อน`,
                isCallout: false,
            },
            {
                heading: "สิ่งที่ต้องทำก่อน",
                body: `1. Backup ทุก database ครบ\n2. Script ออก: logins, SQL Agent jobs, linked servers, sp/function ที่สำคัญ\n3. หลัง rebuild → restore databases และ re-run scripts ทั้งหมด\n4. เปลี่ยน column collation ทีละ column ด้วย ALTER COLUMN (index ต้อง drop ก่อน rebuild)`,
            },
            {
                heading: "Key Learning",
                body: `Server collation กับ database collation คือคนละ level กัน\n\nถ้าต้องการเปลี่ยนแค่ database → ALTER DATABASE ได้เลย\nถ้าต้องการเปลี่ยน server level → rebuild system DB — ใช้เวลานาน มีความเสี่ยงสูง ต้องวางแผนดี\n\nพิจารณาเปลี่ยน collation ระดับ column เฉพาะที่จำเป็นแทนการเปลี่ยน server ทั้งหมด`,
                isCallout: true,
            },
        ],
    },
    {
        id: 14,
        slug: "github-actions-arm64-build-time",
        title: "ตัด ARM64 ออกจาก Docker build ประหยัดเวลาได้ 5-7 นาที",
        subtitle: "Multi-platform build (amd64 + arm64) ใช้เวลา 8-12 นาที ตัด arm64 เหลือ 3-5 นาที",
        tags: ["Docker", "GitHub Actions", "DevOps", "CI/CD"],
        date: "2025",
        readTime: "2 min",
        heroImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
        heroCaption: "GitHub Actions workflow: auto merge dev → main แล้ว build Docker image",
        sections: [
            {
                heading: "Context",
                body: `GitHub Actions workflow push code ไปยัง Docker Hub เมื่อ commit message มีคำว่า 'push to main'\n\nWorkflow: merge dev → main → build Docker image → Telegram notification\n\nปัญหาคือ build ใช้เวลานานมาก กว่า notification จะมา 12+ นาที`,
            },
            {
                heading: "ต้นเหตุ: QEMU emulation สำหรับ ARM64",
                body: `platforms: linux/amd64,linux/arm64\n\nการ build arm64 บน amd64 machine ต้องผ่าน QEMU emulation — ช้ากว่า native มาก\n\nServer ทั้งหมดใน infrastructure เป็น x86_64/amd64 ทั้งนั้น — ไม่มีเหตุผลต้อง build arm64`,
            },
            {
                heading: "Fix",
                body: `เปลี่ยนแค่บรรทัดเดียว:\n\n# เดิม\nplatforms: linux/amd64,linux/arm64\n\n# แก้\nplatforms: linux/amd64\n\nผล: build time ลดจาก ~12 นาที เหลือ ~4 นาที`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `ถ้าไม่มี ARM device ในใช้งานจริง (Apple Silicon Mac, Raspberry Pi, AWS Graviton) — ไม่มีเหตุผลต้อง build arm64\n\nหลาย project เพิ่ม multi-platform โดย copy config มา โดยไม่ได้คิดว่าต้องการจริงหรือเปล่า\nตรวจ production servers ก่อนว่า architecture อะไร แล้วค่อย build เฉพาะที่จำเป็น`,
                isCallout: true,
            },
        ],
    },
    {
        id: 15,
        slug: "iscarton-in-storage-logic",
        title: "นับกล่องใน warehouse: status NULL ไม่ได้แปลว่า 'ไม่อยู่'",
        subtitle: "COUNT(*) WHERE status = 2 ได้ตัวเลขผิด — กล่อง 112,000+ ใบมี status NULL แต่ยังอยู่ใน storage จริง",
        tags: ["SQL Server", "CartonSystem", "Warehouse"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        heroCaption: "กล่อง 770,444 ใบในระบบ — นับยังไงให้ตรงกับความเป็นจริง",
        sections: [
            {
                heading: "ปัญหา",
                body: `Dashboard warehouse แสดงตัวเลขกล่องในคลังไม่ตรงกับของจริง\n\nใช้ WHERE status = 2 (in storage) → ได้ตัวเลขต่ำกว่าจริงมาก\n\nสาเหตุ: กล่องจำนวนมากที่ยังอยู่ในคลังมี status = NULL ไม่ใช่ status = 2`,
            },
            {
                heading: "isCartonInStorage Logic",
                body: `ระบบ CartonSystem ใช้ logic:\n\n- status = 2 → อยู่ใน storage ชัดเจน\n- status = NULL → ดูจาก lastin กับ lastout\n  - ถ้า lastin >= lastout (หรือ lastout เป็น NULL) → กล่องอยู่ใน storage\n  - ถ้า lastout > lastin → กล่องอยู่กับลูกค้า\n\nทำ helper function isCartonInStorage แทน query ตรง status`,
            },
            {
                heading: "Query ที่ถูกต้อง",
                body: `WHERE (\n  status = 2\n  OR (\n    status IS NULL\n    AND (\n      lastout IS NULL\n      OR lastin >= lastout\n    )\n  )\n)\n\nผล: ได้ 597,379 กล่องที่มี location จริง จากทั้งหมด 770,444 ใบในระบบ`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `อย่า assume ว่า status field เป็น source of truth เสมอ ในระบบเก่าๆ มักมี legacy logic ที่ track ด้วย timestamp แทน\n\nก่อนทำ dashboard ต้องถามหรือ verify กับ domain expert ก่อนว่า "record นี้ถือว่า active ยังไง" — อย่าเดาจาก field name อย่างเดียว`,
                isCallout: true,
            },
        ],
    },
    {
        id: 16,
        slug: "multi-tab-token-refresh-race",
        title: "Multi-tab token refresh: race condition ทำให้ logout กะทันหัน",
        subtitle: "เปิด 10 แท็บ แต่ละแท็บ call refresh พร้อมกัน — token เก่าหมดอายุก่อน token ใหม่มา",
        tags: ["React", "TypeScript", "Auth", "Nova"],
        date: "2025",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        heroCaption: "Nova Platform — session management ข้าม browser tab ด้วย BroadcastChannel",
        sections: [
            {
                heading: "ปัญหา",
                body: `Nova Platform เปิดใช้งานหลาย tab พร้อมกัน — เมื่อ access token หมดอายุ ทุก tab พยายาม call /refresh พร้อมกัน\n\nTab แรก refresh สำเร็จ ได้ token ใหม่\nTab 2-10 ยังใช้ refresh token เดิมที่ใช้ไปแล้ว → ถูก revoke → logout กะทันหัน`,
            },
            {
                heading: "วิธีแก้: TokenManager + mutex lock",
                body: `สร้าง TokenManager class ที่มี lock mechanism:\n\nclass TokenManager {\n  private isRefreshing = false\n  private queue: Function[] = []\n\n  async getToken() {\n    if (this.isRefreshing) {\n      // รอ tab อื่น refresh เสร็จก่อน\n      return new Promise(resolve => this.queue.push(resolve))\n    }\n    this.isRefreshing = true\n    // ... refresh ...\n    this.queue.forEach(fn => fn(newToken))\n    this.isRefreshing = false\n  }\n}\n\nมีแค่ 1 request ที่ refresh จริง ที่เหลือรอใน queue`,
            },
            {
                heading: "BroadcastChannel ซิงค์ข้าม tab",
                body: `ใช้ BroadcastChannel ส่ง token ใหม่ไปยังทุก tab:\n\nconst channel = new BroadcastChannel('auth_token')\n\n// Tab ที่ refresh สำเร็จ\nchannel.postMessage({ type: 'TOKEN_REFRESHED', token: newToken })\n\n// Tab อื่นๆ\nchannel.onmessage = (e) => {\n  if (e.data.type === 'TOKEN_REFRESHED') setToken(e.data.token)\n}\n\nAccess token เก็บใน memory (useState) ไม่ใช่ localStorage — ปลอดภัยจาก XSS`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `Multi-tab app ต้องคิดเรื่อง token refresh coordination เสมอ\n\nPattern: mutex lock ใน tab เดียวกัน + BroadcastChannel ข้าม tab\nAccess token → memory เท่านั้น\nRefresh token → httpOnly cookie\nไม่มีอะไร sensitive ใน localStorage`,
                isCallout: true,
            },
        ],
    },
    {
        id: 17,
        slug: "vite-env-vars-build-time",
        title: "VITE_ environment variables ต้อง inject ตอน build ไม่ใช่ runtime",
        subtitle: "ใส่ env ใน docker-compose แล้วทำไม API URL ยังเป็น undefined — เพราะ Vite embed ค่าตอน build เสร็จแล้ว",
        tags: ["Vite", "Docker", "React", "DevOps"],
        date: "2025",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
        heroCaption: "Vite build process — env vars ถูก embed ลง static files ตอน build ไม่ใช่ runtime",
        sections: [
            {
                heading: "ปัญหา",
                body: `Deploy Nova web app บน Docker Swarm ใส่ VITE_API_BASE_URL ใน environment ของ stack file\n\nแต่หลัง deploy — browser console แสดง API URL เป็น undefined หรือค่าเก่า ทั้งที่ container มี env var ถูกต้อง`,
            },
            {
                heading: "เหตุผล: Vite คือ build-time tool",
                body: `Vite แทนที่ import.meta.env.VITE_* ทุกตัวด้วยค่าจริงตอน npm run build\n\nผลลัพธ์คือ static JS ที่มีค่า hard-coded อยู่แล้ว:\n\n// ก่อน build\nconst url = import.meta.env.VITE_API_BASE_URL\n\n// หลัง build (ใน dist/)\nconst url = "https://api.profile.co.th"\n\nRuntime environment ของ container ไม่มีผลเลย เพราะค่าถูก embed ไปแล้ว`,
                isCallout: false,
            },
            {
                heading: "Fix: ส่ง env เป็น --build-arg",
                body: `ต้องส่งค่าตอน build:\n\ndocker build \\\n  --build-arg VITE_API_BASE_URL="https://api.profile.co.th" \\\n  -t myapp:latest .\n\nและใน Dockerfile:\nARG VITE_API_BASE_URL\nENV VITE_API_BASE_URL=$VITE_API_BASE_URL\nRUN npm run build\n\nถ้าใช้ GitHub Actions: ส่งเป็น secrets แล้วใส่ใน build-args step`,
            },
            {
                heading: "Key Learning",
                body: `VITE_* env vars ≠ runtime env vars\nมันถูกอ่านและ embed ตอน build เท่านั้น\n\nถ้าค่าเปลี่ยน → ต้อง rebuild image ใหม่ทุกครั้ง\nไม่มีทางเปลี่ยน VITE_ vars ใน container ที่ build แล้ว (ถ้าไม่ใช้ workaround พิเศษอย่าง entrypoint script แทนที่ placeholder)`,
                isCallout: true,
            },
        ],
    },
    {
        id: 18,
        slug: "nginx-websocket-headers-break-login",
        title: "Nginx ส่ง WebSocket headers ไปทุก request ทำให้ login คืน HTML",
        subtitle: "login POST ได้รับ 'Route not found' แทน JSON — เพราะ middleware แปลงเป็น WS method",
        tags: ["Nginx", "Node.js", "WebSocket", "Debugging"],
        date: "2025",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        heroCaption: "Nginx reverse proxy — upgrade headers ที่ส่งมาโดยไม่ตั้งใจ",
        sections: [
            {
                heading: "อาการ",
                body: `API /api/auth/login ใน production คืน HTML ("Route not found") แทน JSON\n\nLocal dev ทำงานปกติ — ปัญหาเกิดเฉพาะเมื่อผ่าน Nginx reverse proxy`,
            },
            {
                heading: "Root Cause: Nginx forward upgrade headers ทุก request",
                body: `Nginx config มี:\nproxy_set_header Upgrade $http_upgrade;\nproxy_set_header Connection "upgrade";\n\nนี่ทำให้ทุก HTTP request รวมถึง POST /api/auth/login ส่ง header:\nupgrade: websocket\nconnection: upgrade\n\nBackend middleware ตรวจเจอ header พวกนี้ → เปลี่ยน method จาก POST เป็น WS\n→ หา route "WS /api/auth/login" ไม่เจอ → คืน 404 HTML`,
                isCallout: false,
            },
            {
                heading: "Fix: conditional upgrade ใน Nginx",
                body: `ใช้ map directive แทนการ force upgrade ทุก request:\n\nmap $http_upgrade $connection_upgrade {\n  default keep-alive;\n  websocket upgrade;\n}\n\nserver {\n  proxy_set_header Upgrade $http_upgrade;\n  proxy_set_header Connection $connection_upgrade;\n}\n\nแบบนี้จะ forward upgrade header เฉพาะเมื่อ client ส่งมาจริงๆ`,
                isCallout: false,
            },
            {
                heading: "Fix ฝั่ง backend ด้วย",
                body: `เพิ่ม whitelist ใน isWebSocketRequest():\n\nfunction isWebSocketRequest(req) {\n  const isWsHeaders = req.headers.upgrade === 'websocket'\n  const isWsPath = WS_PATHS.includes(req.path)\n  const hasJsonBody = req.headers['content-type']?.includes('application/json')\n  \n  // request ที่มี JSON body ไม่ใช่ WebSocket แน่นอน\n  return isWsHeaders && isWsPath && !hasJsonBody\n}`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `Nginx config ที่ copy มาจาก tutorial WebSocket มักมี upgrade headers แบบ global\nซึ่งทำให้ทุก request ดูเหมือน WebSocket upgrade\n\nDebug rule: ถ้าใช้งานได้ local แต่พังผ่าน proxy → ดู request headers ที่ proxy เพิ่มเข้ามาก่อนเลย`,
                isCallout: true,
            },
        ],
    },
    {
        id: 19,
        slug: "prisma-logical-or-zero-value-null",
        title: "Prisma: copy: line.copy || undefined ทำให้ 0 กลายเป็น NULL",
        subtitle: "|| ใน JavaScript แปลง falsy value (รวมถึง 0) เป็น undefined — Prisma บันทึกเป็น NULL",
        tags: ["Prisma", "TypeScript", "Node.js", "Debugging"],
        date: "2025",
        readTime: "2 min",
        heroImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
        heroCaption: "Falsy value trap ใน JavaScript — 0, '', false ล้วน falsy ทั้งนั้น",
        sections: [
            {
                heading: "ปัญหา",
                body: `Field copy ใน table history เป็น NULL ทุก record ทั้งที่ CSV ต้นทางมีค่า 0 อยู่\n\nแต่ใน table text_line field เดียวกันมีค่า 0 ถูกต้อง — แสดงว่า CSV อ่านได้ถูก แต่หาย ตอน insert history`,
            },
            {
                heading: "สาเหตุ: || กับ falsy value",
                body: `ใน code มีบรรทัด:\ncopy: line.copy || undefined\n\nJavaScript ถือว่า 0 เป็น falsy\nดังนั้น 0 || undefined === undefined\nPrisma รับ undefined → บันทึกเป็น NULL\n\nต่างจากกรณีที่ต้องการ:\n- line.copy = 0 → ต้องการบันทึก 0\n- line.copy = null → ต้องการบันทึก NULL หรือ default`,
                isCallout: false,
            },
            {
                heading: "Fix: ใช้ ?? แทน ||",
                body: `เปลี่ยนจาก:\ncopy: line.copy || undefined\n\nเป็น:\ncopy: line.copy ?? 0\n\n?? (nullish coalescing) ตรวจเฉพาะ null หรือ undefined เท่านั้น\n0, '', false — ผ่านได้หมด ไม่ถูก replace`,
            },
            {
                heading: "Key Learning",
                body: `|| กับ ?? ต่างกันมาก:\n\n|| → falsy: 0, '', false, null, undefined ล้วน trigger\n?? → nullish only: เฉพาะ null และ undefined เท่านั้น\n\nถ้า field อาจเป็น 0 หรือ false ที่ถูกต้อง → ใช้ ?? เสมอ\n|| ใช้เฉพาะตอนต้องการ default ที่ไม่สนใจ falsy values`,
                isCallout: true,
            },
        ],
    },
    {
        id: 20,
        slug: "prisma-hardcoded-db-name-raw-sql",
        title: "Hard-code ชื่อ database ใน raw SQL ทำให้ dev กับ prod ใช้ query เดียวกันไม่ได้",
        subtitle: "FROM [files_system].[dbo].[history] ใช้ได้แค่ production — dev database ชื่อ files_system_dev",
        tags: ["SQL Server", "Prisma", "Node.js", "Debugging"],
        date: "2025",
        readTime: "2 min",
        heroImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
        heroCaption: "Raw SQL ใน Prisma — database prefix ที่ hard-code มักพัง environment อื่น",
        sections: [
            {
                heading: "ปัญหา",
                body: `API /history ทำงานปกติใน production\nแต่ dev environment หา record ไม่เจอเลย ทั้งที่ข้อมูลมีอยู่\n\nConfirm ด้วยการรัน query ตรงใน SSMS บน files_system_dev — เจอข้อมูล\nแต่ผ่าน API ไม่เจอ`,
            },
            {
                heading: "สาเหตุ",
                body: `ใน raw SQL query มีบรรทัด:\nFROM [files_system].[dbo].[history]\n\nDATABASE_URL ของ dev ชี้ไปที่ files_system_dev\nแต่ query force อ่านจาก files_system (production) อยู่เสมอ\n\nPrisma ส่ง raw SQL ตรงๆ ไม่ได้ replace database name ให้`,
                isCallout: false,
            },
            {
                heading: "Fix: ตัดชื่อ database ออก",
                body: `เปลี่ยนจาก:\nFROM [files_system].[dbo].[history]\n\nเป็น:\nFROM [dbo].[history]\n\nSQL Server จะใช้ database จาก connection string อัตโนมัติ ทั้ง dev และ prod ใช้ query เดียวกันได้`,
            },
            {
                heading: "Key Learning",
                body: `ห้าม hard-code database name ใน raw SQL queries\nใช้เฉพาะ schema.table ไม่ต้องมี database prefix\n\nยกเว้น cross-database query จริงๆ ที่ต้องอ้างถึง database อื่นโดยตั้งใจ\nในกรณีนั้นให้ inject ชื่อ database จาก environment variable แทน`,
                isCallout: true,
            },
        ],
    },
    {
        id: 21,
        slug: "sql-server-8152-thai-column-size",
        title: "SQL Server error 8152: String or binary data would be truncated",
        subtitle: "Sync ข้อมูลภาษาไทย MariaDB → SQL Server แล้ว error — เพราะ column 70 chars รับ UTF-8 Thai ไม่ไหว",
        tags: ["SQL Server", "MariaDB", "Thai", "Debezium"],
        date: "2025",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        heroCaption: "Thai character encoding — 1 ตัวอักษรไทยอาจใช้ 3 bytes ใน UTF-8",
        sections: [
            {
                heading: "ปัญหา",
                body: `Debezium sync ข้อมูลจาก MariaDB (UTF-8) ไป SQL Server แล้วได้ error:\nString or binary data would be truncated (error 8152)\n\nField ที่พัง: bussi_name, dept — column size 70 chars\nใน MariaDB ข้อมูลอยู่ในขนาด 70 chars ปกติ แต่ SQL Server reject`,
            },
            {
                heading: "สาเหตุ",
                body: `VARCHAR(70) ใน MariaDB นับ 70 ตัวอักษร\nVARCHAR(70) ใน SQL Server นับ 70 bytes\n\nภาษาไทยใน UTF-8: 1 ตัวอักษร = 3 bytes\nชื่อบริษัท 25 ตัวอักษรไทย = 75 bytes → เกิน 70 ทันที\n\nข้อมูลที่ดูเหมือน "พอดี" ใน MariaDB จึง truncate ใน SQL Server`,
                isCallout: false,
            },
            {
                heading: "Fix",
                body: `เพิ่ม column size ใน SQL Server:\nALTER TABLE history ALTER COLUMN bussi_name NVARCHAR(200)\nALTER TABLE history ALTER COLUMN dept NVARCHAR(200)\n\nใช้ NVARCHAR แทน VARCHAR — NVARCHAR นับ characters ไม่ใช่ bytes\nเหมาะกับ Unicode/Thai มากกว่า\n\n200 เป็น buffer ปลอดภัย แทนที่จะคำนวณ bytes ให้แม่นยำ`,
            },
            {
                heading: "Key Learning",
                body: `VARCHAR ใน SQL Server นับ bytes\nNVARCHAR ใน SQL Server นับ characters (2 bytes ต่อ char)\nVARCHAR ใน MySQL/MariaDB นับ characters\n\nถ้า column เก็บภาษาไทยใน SQL Server → ใช้ NVARCHAR เสมอ\nและ size ควรใหญ่กว่าที่คิด อย่างน้อย 2-3x จาก source system`,
                isCallout: true,
            },
        ],
    },
    {
        id: 22,
        slug: "prisma-groupby-misuse-inflated-count",
        title: "Prisma groupBy ใช้ใน where clause ทำให้ count ออกมาเกินจริง",
        subtitle: "นับ job เจอ 3,642 แต่จริงๆ มีแค่หลักร้อย — เพราะ groupBy อยู่ผิดที่",
        tags: ["Prisma", "TypeScript", "Node.js", "Debugging"],
        date: "2025",
        readTime: "2 min",
        heroImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
        heroCaption: "Prisma groupBy — ต้องเป็น top-level method ไม่ใช่ใน where clause",
        sections: [
            {
                heading: "ปัญหา",
                body: `Dashboard นับจำนวน job group ในระบบ Nova\nQuery คืนค่า 3,642 แต่ทีม verify แล้วมีจริงแค่หลักร้อย\n\nอยากได้: นับ unique combinations ของ or_no + bussi_name + sender + ACTION`,
            },
            {
                heading: "โค้ดที่ผิด",
                body: `const count = await prisma.history.count({\n  where: {\n    // ผิด: groupBy ไม่ใช่ option ของ where\n    groupBy: ['or_no', 'bussi_name', 'sender', 'ACTION']\n  }\n})\n\nPrisma ไม่ error — แต่ ignore groupBy และ count ทุก record แทน\nผลลัพธ์คือ 3,642 (จำนวน row ทั้งหมด)`,
                isCallout: false,
            },
            {
                heading: "Fix",
                body: `const groups = await prisma.history.groupBy({\n  by: ['or_no', 'bussi_name', 'sender', 'ACTION'],\n  where: { new: 0 }\n})\n\nconst count = groups.length\n\ngroupBy เป็น top-level method — ไม่ใช่ parameter ของ count() หรือ findMany()`,
            },
            {
                heading: "Key Learning",
                body: `Prisma ไม่ throw error เมื่อใส่ key ที่ไม่รู้จักใน where — มัน silently ignore\nทำให้ bug แบบนี้หาเจอยากมากเพราะไม่มี error\n\nถ้า count ผิดปกติ → ตรวจสอบว่า query structure ถูก type ไหม\nใช้ TypeScript strict mode ช่วยจับ misuse ได้`,
                isCallout: true,
            },
        ],
    },
    {
        id: 23,
        slug: "react-print-footer-last-page-overflow",
        title: "React print: footer หายบนหน้าสุดท้าย",
        subtitle: "Content เต็ม 6 แถว + summary → overflow ดัน footer ออกนอก printable area",
        tags: ["React", "TypeScript", "Print", "Nova"],
        date: "2025",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80",
        heroCaption: "Print pagination — ควบคุมจำนวน row ต่อหน้าให้มี room สำหรับ footer",
        sections: [
            {
                heading: "ปัญหา",
                body: `Report template: 6 rows ต่อหน้า + footer (วันที่พิมพ์, เลขหน้า)\n\nหน้าสุดท้ายที่มีพอดี 6 แถว + summary row → content overflow → footer ถูกดันออกหน้า\n\nหน้าอื่นทำงานปกติ เพราะมี rows น้อยกว่า 6`,
            },
            {
                heading: "วิธีแก้: limit หน้าสุดท้ายให้มีแค่ 5 rows",
                body: `เปลี่ยน pagination logic:\n\n// เดิม: ทุกหน้ามี 6 rows\nconst ROWS_PER_PAGE = 6\n\n// ใหม่: หน้าสุดท้ายมีได้แค่ 5\nfunction calculateTotalPages(total) {\n  const full = Math.floor(total / ROWS_PER_PAGE)\n  const remainder = total % ROWS_PER_PAGE\n  // ถ้า remainder = 0 → แยกเป็นหน้าใหม่ที่มี 5 rows + summary\n  if (remainder === 0) return full + 1\n  if (remainder >= 5) return full + 2 // ต้องแยก\n  return full + 1\n}`,
                isCallout: false,
            },
            {
                heading: "ปัญหาย่อย: ทุกหน้า reserve space สำหรับ summary",
                body: `เจอ bug ซ้อน: CSS ใช้ flex: 1 reserve space สำหรับ summary section ทุกหน้า\nทั้งที่ summary แสดงแค่หน้าสุดท้าย\n\nFix: เปลี่ยนจาก flex layout เป็น fixed height\nและใส่ summary HTML เฉพาะหน้าสุดท้ายเท่านั้น ไม่ reserve space ไว้`,
            },
            {
                heading: "Key Learning",
                body: `Print layout ต้องทดสอบกับ edge cases: N rows พอดี, N+1 rows, หน้าเดียว, หลายร้อยหน้า\n\nถ้า footer หาย → มักเกิดจาก content overflow\nตรวจสอบ: ทุกหน้า reserve space อะไรบ้าง ที่ไม่จำเป็นต้องมีในทุกหน้า`,
                isCallout: true,
            },
        ],
    },
    {
        id: 24,
        slug: "debezium-deadlock-retry-queue",
        title: "Debezium SQL Server deadlock — ต้องมี retry queue ไม่ใช่แค่ log แล้วทิ้ง",
        subtitle: "CDC sync fail เพราะ deadlock — event หาย ข้อมูล 2 database ไม่ตรงกัน",
        tags: ["Debezium", "CDC", "SQL Server", "TypeScript"],
        date: "2025",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
        heroCaption: "Failed Events Queue — CDC events ที่ fail ต้องมีที่เก็บและ retry อัตโนมัติ",
        sections: [
            {
                heading: "ปัญหา",
                body: `Debezium sync ข้อมูลระหว่าง database หลายตัว (Main, Dev, MariaDB)\n\nบางครั้ง SQL Server deadlock ทำให้ event ใส่ database ไม่ได้\nระบบ log error แล้วผ่านไป — ข้อมูลทั้ง 2 ฝั่งไม่ตรงกัน (data drift) โดยไม่รู้ตัว`,
            },
            {
                heading: "วิธีแก้: Failed Events Queue",
                body: `สร้าง queue table สำหรับเก็บ event ที่ fail:\n\n- event_id, payload, attempt_count, last_error, status\n- Service retry ทุก 1 นาที (max 50 attempts)\n- Exponential backoff: delay เพิ่มตาม attempt\n- หลังครบ 50 ครั้ง → alert admin ผ่าน Telegram`,
                isCallout: false,
            },
            {
                heading: "Exponential backoff",
                body: `const delay = Math.min(1000 * 2 ** attempt, 60000)\n// attempt 1 → 2s, attempt 2 → 4s, ... สูงสุด 60s\n\nป้องกัน retry storm ในกรณีที่ database กลับมาช้า\nถ้า retry ทุก 1s พร้อมกัน 50 event → ยิ่ง deadlock หนักขึ้น`,
            },
            {
                heading: "Key Learning",
                body: `Deadlock เป็น transient error — ส่วนใหญ่ retry แล้วหาย\nแต่ถ้าไม่มี retry mechanism → event หาย ข้อมูลไม่ consistent\n\nทุก CDC pipeline ที่ critical ต้องมี:\n1. Failed event storage\n2. Automatic retry with backoff\n3. Alert เมื่อ retry หมด\n4. Dashboard monitor retry queue`,
                isCallout: true,
            },
        ],
    },
    {
        id: 25,
        slug: "smc-tftp-line-ending",
        title: "SMC GS10P backup ผ่าน TFTP — ต้องส่ง \\r\\n ไม่ใช่แค่ \\n",
        subtitle: "SSH เข้าสวิตช์ได้ สั่ง Config Save ได้ แต่ไม่มีไฟล์มาใน TFTP — เพราะ line ending ผิด",
        tags: ["SMC", "TFTP", "Python", "Networking"],
        date: "2026",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        heroCaption: "SMC GS10P-Smart — สวิตช์ที่ Oxidized ไม่มี model รองรับ ต้องเขียน script เอง",
        sections: [
            {
                heading: "Context",
                body: `ระบบ network config backup ครอบคลุม 5 อุปกรณ์ — Cisco ทั้งสองตัวใช้ Oxidized ได้ปกติ\n\nแต่ SMC GS10P-Smart (192.168.2.42) ไม่มี model ใน Oxidized → ต้องเขียน Python script เอง\n\nSMC ไม่มี show running-config — ใช้วิธี SSH สั่ง "Config Save <ip> <filename>" แทน ซึ่ง push ไฟล์มาผ่าน TFTP`,
            },
            {
                heading: "ปัญหาที่เจอ",
                body: `SSH เข้าได้ login ได้ สั่ง Config Save ได้ แต่ TFTP server ไม่ได้รับไฟล์เลย\n\nตรวจสอบ log พบว่า command ถูกส่งไปแต่ switch ไม่ตอบสนอง เพราะ SSH terminal ของ SMC รุ่นเก่าต้องการ CRLF (\\r\\n) ทุกบรรทัด ไม่ใช่แค่ LF (\\n) ที่ paramiko ส่งให้ default`,
                isCallout: false,
            },
            {
                heading: "Fix: บังคับ \\r\\n ผ่าน paramiko",
                body: `channel = ssh.invoke_shell()\nchannel.send("Config Save 192.168.2.254 smc-backup.cfg\\r\\n")\ntime.sleep(3)\noutput = channel.recv(4096).decode()\n\nสำคัญ: ต้องใช้ \\r\\n ทุกคำสั่ง ไม่ใช่แค่ \\n\nไม่งั้น switch รับ command แต่ไม่ execute`,
            },
            {
                heading: "ปัญหา TFTP ซ้อน: Python TFTP server vs tftpd-hpa",
                body: `Python TFTP server ที่เขียนเองมี race condition — บางครั้งยังไม่ ready ก่อน switch push มา\n\nFix: ใช้ tftpd-hpa ที่รันตลอดเวลาแทน แล้วให้ script อ่านไฟล์จาก /srv/tftp/ หลัง switch push มา\n\napt install tftpd-hpa\nทำครั้งเดียว รันตลอด ไม่มีปัญหา race condition`,
            },
            {
                heading: "Key Learning",
                body: `Network device รุ่นเก่าหลายตัวต้องการ CRLF (\\r\\n) ใน SSH session\npariko ส่งแค่ LF (\\n) default — ต้องบังคับเอง\n\nถ้า command ส่งไปแต่ device ไม่ตอบสนอง → suspect line ending ก่อนอย่างอื่น`,
                isCallout: true,
            },
        ],
    },
    {
        id: 26,
        slug: "tplink-er7206-ssh-legacy-algorithms",
        title: "TP-Link ER7206: SSH ล้มเหลวเพราะ modern client ไม่ support legacy kex",
        subtitle: "paramiko connect ไม่ได้ — ต้อง force ใช้ curve25519-sha256@libssh.org และ aes128-ctr",
        tags: ["TP-Link", "SSH", "Python", "Networking"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
        heroCaption: "TP-Link ER7206 — router ที่ใช้ SSH algorithms ที่ต่างจากอุปกรณ์อื่นในเครือข่าย",
        sections: [
            {
                heading: "ปัญหา",
                body: `Script Python ใช้ paramiko SSH เข้า TP-Link ER7206 (192.168.1.1) ได้ error:\nNo matching key exchange method found\n\nอุปกรณ์อื่น (Cisco, SMC, MikroTik) ใช้ default paramiko settings ได้ปกติ`,
            },
            {
                heading: "ตรวจสอบ kex ของ device",
                body: `ssh -vvv user@192.168.1.1 แล้วดู:\n\ndebug2: KEX algorithms: curve25519-sha256@libssh.org, diffie-hellman-group14-sha1\ndebug2: ciphers ctos: aes128-ctr, aes256-ctr\n\nER7206 ใช้ curve25519 + aes-ctr ซึ่งต่างจาก SMC ที่ใช้ diffie-hellman-group1 + aes-cbc`,
                isCallout: false,
            },
            {
                heading: "Fix: ระบุ algorithms ให้ paramiko ตรงกับ device",
                body: `transport = paramiko.Transport((host, 22))\ntransport.get_security_options().kex = [\n    'curve25519-sha256@libssh.org',\n    'diffie-hellman-group14-sha1'\n]\ntransport.get_security_options().ciphers = [\n    'aes128-ctr',\n    'aes256-ctr'\n]\ntransport.connect(username=user, password=pwd)\n\nแต่ละ device อาจต้องการ algorithms ต่างกัน — ต้อง debug ทีละตัว`,
            },
            {
                heading: "ปัญหาซ้อน: ^M ใน script",
                body: `เปิดไฟล์ .py ด้วย vim แล้วเห็น ^M ท้ายทุกบรรทัด — เพราะสร้างไฟล์บน Windows แล้ว upload มา Linux\n\nแก้ด้วย:\nsed -i 's/\\r//' script.py\n\nถ้าไม่แก้ → Python อ่าน command ผิด \\r ติดท้าย string ทำให้ command ไม่ทำงาน`,
            },
            {
                heading: "Key Learning",
                body: `ไม่มี SSH client ตัวเดียวที่ใช้ได้กับทุก device — ต้อง probe algorithms ด้วย ssh -vvv ก่อนเสมอ\n\nสร้าง script บน Windows แล้ว upload Linux → เช็ค line ending ก่อนรันทุกครั้ง\nsed -i 's/\\r//' ใช้งานได้เร็ว`,
                isCallout: true,
            },
        ],
    },
    {
        id: 27,
        slug: "github-token-exposed-in-chat-logs",
        title: "GitHub token หลุดในแชทและ logs หลายครั้ง — revoke ทันทีทุกครั้ง",
        subtitle: "paste config แล้วลืมว่ามี token อยู่ใน URL — ต้อง revoke ภายในนาทีก่อน GitHub bot เก็บได้",
        tags: ["GitHub", "Security", "Oxidized", "DevOps"],
        date: "2026",
        readTime: "2 min",
        heroImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
        heroCaption: "Personal Access Token ที่หลุด — GitHub scan bot เจอเองภายในไม่กี่นาที",
        sections: [
            {
                heading: "สถานการณ์",
                body: `ระหว่าง setup Oxidized Git remote URL ใส่ token ใน URL:\nhttps://ghp_xxxx@github.com/patipark/profile-network-configs.git\n\nแล้ว paste config ลงในแชท หรือ log ออกมาใน terminal ที่ share อยู่ — token โผล่ทันที\n\nเกิดขึ้นหลายครั้งระหว่าง setup เพราะ debug แล้ว print config ออกมา`,
            },
            {
                heading: "วิธีตอบสนองทันที",
                body: `1. ไป https://github.com/settings/tokens\n2. หา token ที่หลุด → Revoke ทันที\n3. สร้าง token ใหม่\n4. แก้ไข remote URL ใน Oxidized config\n\nGitHub มี secret scanning bot — ถ้า token ถูก push ขึ้น public repo จะถูก revoke อัตโนมัติอยู่แล้ว แต่ถ้าหลุดในที่อื่นต้อง manual revoke`,
                isCallout: false,
            },
            {
                heading: "วิธีป้องกัน: ใช้ SSH key แทน token ใน URL",
                body: `แทนที่จะใส่ token ใน remote URL:\nhttps://ghp_xxx@github.com/user/repo.git\n\nใช้ SSH:\ngit@github.com:user/repo.git\n\nตั้งค่า SSH key ใน GitHub → ไม่มี credential โผล่ใน config หรือ log เลย`,
            },
            {
                heading: "Key Learning",
                body: `Token ใน URL โผล่ใน:\n- git log, git remote -v\n- docker config ที่ print ออกมา\n- log ของ application\n- แชทสนับสนุนเมื่อ paste config เพื่อ debug\n\nงานทุก git operation ที่ต้องการ auth → ใช้ SSH key เสมอ ไม่ใช่ token ใน URL`,
                isCallout: true,
            },
        ],
    },
    {
        id: 28,
        slug: "librenms-storage-host-resources-mib",
        title: "LibreNMS ไม่แสดง Storage — ต้องเช็ค HOST-RESOURCES-MIB ก่อน",
        subtitle: "ข้อมูล CPU, Interface, Memory มาครบ แต่ Storage ว่างเปล่า — SNMP OID คนละ MIB",
        tags: ["LibreNMS", "SNMP", "Networking", "Monitoring"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        heroCaption: "LibreNMS บน ubuntu254 — monitor 5 อุปกรณ์ในเครือข่าย Pro-File",
        sections: [
            {
                heading: "ปัญหา",
                body: `Device ใน LibreNMS แสดงข้อมูล CPU, Interface traffic, Memory ครบ\nแต่ Tab Storage ว่างเปล่า ไม่มีข้อมูลเลย\n\nSNMP ทำงานปกติ ไม่มี connection error — แค่ Storage ไม่ขึ้น`,
            },
            {
                heading: "สาเหตุ: คนละ MIB",
                body: `Storage ใช้ HOST-RESOURCES-MIB (hrStorageDescr, hrStorageSize)\nแยกจาก standard interface/CPU MIBs ที่ใช้ทั่วไป\n\nอุปกรณ์บางรุ่น (เช่น network device ที่ไม่ใช่ server) ไม่ implement HOST-RESOURCES-MIB\nจึงไม่มีข้อมูล storage แม้ SNMP ทำงานปกติ`,
                isCallout: false,
            },
            {
                heading: "วิธีตรวจสอบ",
                body: `ทดสอบจาก NMS server:\nsnmpwalk -v2c -c public <DEVICE_IP> 1.3.6.1.2.1.25.2.3.1.3\n\nถ้าไม่มีผลลัพธ์ → device ไม่รองรับ storage MIB\nถ้ามีผลลัพธ์ → force discovery:\n\ncd /opt/librenms\n./discovery.php -h <DEVICE_IP> -m storage -v\n./poller.php -h <DEVICE_IP> -m storage -d`,
            },
            {
                heading: "TP-Link ER7206: ต้องรอ polling cycle",
                body: `ER7206 ที่เพิ่งเพิ่มใน LibreNMS แสดง "Never polled"\nแม้ ping และ snmpwalk ได้ปกติ\n\nไม่ใช่ error — LibreNMS poll ทุก 5 นาที device ที่เพิ่งเพิ่มต้องรอรอบแรก\nหรือ force poll ด้วย: ./poller.php -h <DEVICE_IP> -d`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `"ข้อมูลอื่นมาหมด แต่ Storage ไม่ขึ้น" = HOST-RESOURCES-MIB ไม่รองรับ\n\nตรวจด้วย snmpwalk OID 1.3.6.1.2.1.25.2.3.1.3 ก่อนเสมอ\nไม่มีผล → device จะไม่มี Storage tab ใน LibreNMS ไม่ว่าจะ config ยังไงก็ตาม`,
                isCallout: true,
            },
        ],
    },
    {
        id: 29,
        slug: "ad-secure-channel-broken-gpupdate",
        title: "gpupdate /force ล้มเหลว: LDAP Bind failed — แก้ด้วย Test-ComputerSecureChannel -Repair",
        subtitle: "Domain-joined PC คุย AD ไม่ได้ทั้งที่ network ปกติ — secure channel ขาด ไม่ใช่ network",
        tags: ["Active Directory", "Windows", "Group Policy", "Networking"],
        date: "2025",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
        heroCaption: "Active Directory Domain — secure channel ระหว่าง PC กับ Domain Controller",
        sections: [
            {
                heading: "อาการ",
                body: `gpupdate /force ล้มเหลวด้วย error:\n"Windows could not authenticate to the Active Directory service on a domain controller. (LDAP Bind function call failed)"\n\nPing DC ได้ปกติ, DNS resolve ได้, เวลา sync ตรงกัน — แต่ Group Policy update ไม่ผ่าน`,
            },
            {
                heading: "ตรวจสอบ Secure Channel",
                body: `Test-ComputerSecureChannel -Verbose\n\nถ้าได้ False → secure channel ระหว่าง computer account กับ DC ขาด\n\nสาเหตุที่พบบ่อย:\n- Computer account ถูก reset ใน AD\n- Password ของ computer account หมดอายุ (default 30 วัน)\n- DC ถูก promote/demote ใหม่โดยไม่ re-join`,
            },
            {
                heading: "Fix: Repair ด้วย Credential",
                body: `Test-ComputerSecureChannel -Repair -Credential (Get-Credential)\n\nใส่ credential ของ Domain Admin\nถ้าคืนค่า True → secure channel ซ่อมสำเร็จ\n\nหลังจากนั้นควร restart เครื่อง — repair บางครั้งต้องการ restart ถึงจะมีผลเต็มที่`,
                isCallout: false,
            },
            {
                heading: "Debug ก่อนถ้าไม่แน่ใจ",
                body: `# ดู error code จริงๆ\ngpresult /h C:\\GPReport.html\nstart C:\\GPReport.html\n\n# ดู Event Log\nGet-WinEvent -LogName System -MaxEvents 20 |\n  Where-Object {$_.ProviderName -like "*GroupPolicy*"} |\n  Format-List TimeCreated, Id, Message\n\nError code อย่าง 0x8007054B บอกตรงๆ ว่า DC ไม่พบ`,
            },
            {
                heading: "Key Learning",
                body: `"LDAP Bind failed" ≠ network problem เสมอ\n\nถ้า ping DC ได้แต่ gpupdate ไม่ผ่าน → suspect secure channel ก่อน\nใช้ Test-ComputerSecureChannel เช็คก่อน troubleshoot network\n\nComputer account มี password หมดอายุเหมือนกัน (default 30 วัน) แต่ Windows update ให้อัตโนมัติเมื่อ channel ปกติ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 30,
        slug: "windows-server-disk-offline-sv70",
        title: "Windows Server: Disk/Share offline กะทันหัน — ดู Event Viewer ก่อนอย่างอื่น",
        subtitle: "SV70 แจ้ง folder state offline — อาจเป็นหลายสาเหตุมาก Event Log บอกตรง",
        tags: ["Windows Server", "SV70", "Storage", "Troubleshooting"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
        heroCaption: "SV70 — Windows Server ที่รัน SQL Server, Arctera Backup Exec และ shared folders",
        sections: [
            {
                heading: "Error message",
                body: `"The disk is offline. This is typically caused by the folder becoming inaccessible due to it being deleted, renamed, or unshared. It may also be caused by a disk full condition."\n\nข้อความนี้กว้างมาก — ต้องดู Event Log ก่อนทำอะไร ไม่งั้นแก้ผิดจุด`,
            },
            {
                heading: "ขั้นตอนที่ถูก",
                body: `1. Event Viewer ก่อนเสมอ:\n   eventvwr.msc → Windows Logs → Application\n   กรอง Source: VSS, ntfs, disk, srv\n\n2. เช็ค Disk Space:\n   wmic logicaldisk get size,freespace,caption\n   ถ้า Free = 0 → เคลียร์พื้นที่ก่อน\n\n3. ถ้า Disk offline จริง:\n   diskpart → select disk X → online disk\n   หรือ diskmgmt.msc คลิกขวา → Online\n\n4. ถ้า Share path หาย:\n   Server Manager → File and Storage Services → Shares\n   สร้าง folder ใหม่แล้ว re-share`,
                isCallout: false,
            },
            {
                heading: "VSS ที่เกี่ยวข้อง",
                body: `ถ้า Shadow Copy/Backup ทำให้เกิดปัญหา:\nRestart-Service VSS\nRestart-Service swprv\n\nหรือ vssadmin list shadows เพื่อดู shadow copy ที่มี`,
            },
            {
                heading: "Key Learning",
                body: `"Disk offline" เป็น generic message ครอบหลายสาเหตุมาก:\n- Disk เต็ม\n- Folder ถูกลบ/rename\n- Disk จริง offline\n- VSS/Shadow Copy issue\n- Share path เปลี่ยน\n\nดู Event Viewer ก่อนทุกครั้ง จะได้ error code จริงๆ แทนที่จะเดาและแก้ผิดจุด`,
                isCallout: true,
            },
        ],
    },
    {
        id: 31,
        slug: "arctera-backup-exec-bkupexec64-service-order",
        title: "Arctera Backup Exec ไม่ start — instance ชื่อ BKUPEXEC64 ไม่ใช่ BKUPEXEC",
        subtitle: "Error 1064 ทุกครั้ง — เพราะ start service ผิดลำดับ และใช้ instance name ผิด",
        tags: ["Backup Exec", "SV70", "Windows Server", "SQL Server"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
        heroCaption: "Arctera (Veritas) Backup Exec บน SV70 — SQL Server instance แยกจาก production",
        sections: [
            {
                heading: "ปัญหา",
                body: `Backup Exec Management Service ไม่สามารถ start ได้ — Error 1064\n"Service failed to respond to the start request"\n\nตรวจสอบ Services เจอว่า SQL Server instance สำหรับ Backup Exec ชื่อ BKUPEXEC64 ไม่ใช่ BKUPEXEC ตามที่ document บอก`,
            },
            {
                heading: "สาเหตุ: ลำดับการ start ผิด",
                body: `Backup Exec ต้องการ SQL Server instance ของตัวเองก่อน\n\nลำดับที่ถูก:\n1. SQL Server (BKUPEXEC64) → start ก่อน รอให้ Running\n2. Backup Exec Management Service\n3. Backup Exec Agent Browser\n4. Backup Exec Device & Media Service\n5. Backup Exec Job Engine\n6. Backup Exec Server (beserver)\n\nถ้า SQL Server ยังไม่ ready แล้ว Management Service start → Error 1064 ทันที`,
                isCallout: false,
            },
            {
                heading: "PowerShell start ถูกลำดับ",
                body: `# Start SQL instance ของ Backup Exec ก่อน\nStart-Service -Name "MSSQL\`$BKUPEXEC64"\nStart-Sleep -Seconds 15  # รอ SQL Server ready\n\n# Start Backup Exec services\nGet-Service -DisplayName "Backup Exec*" |\n  Where-Object {$_.Status -ne 'Running'} |\n  Start-Service\n\n# Verify\nGet-Service -DisplayName "Backup Exec*" |\n  Format-Table DisplayName, Status`,
            },
            {
                heading: "Key Learning",
                body: `Backup Exec ใช้ SQL Server instance แยก — ชื่ออาจไม่ใช่ BKUPEXEC เสมอ\nเช็คชื่อจริงใน services.msc ก่อนทุกครั้ง\n\nถ้า Error 1064 → 90% เกิดจาก SQL Server ยังไม่ ready\nแก้ด้วยการ start SQL ก่อนและรอ 10-15 วินาทีก่อน start services อื่น`,
                isCallout: true,
            },
        ],
    },
    {
        id: 32,
        slug: "dhcp-service-error-1058-disabled",
        title: "DHCP Service ไม่ start — Error 1058 เพราะ Startup Type เป็น Disabled",
        subtitle: "คิดว่า config หาย หรือ database เสีย แต่จริงๆ แค่ service ถูก set เป็น Disabled อยู่",
        tags: ["DHCP", "Windows Server", "Networking"],
        date: "2026",
        readTime: "2 min",
        heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        heroCaption: "DHCP บน Windows Server — ให้บริการ 116 active clients ใน subnet 192.168.2.0",
        sections: [
            {
                heading: "ปัญหา",
                body: `DHCP Server service ที่เคยทำงานปกติ start ไม่ขึ้น — Error 1058\n"The service cannot be started, either because it is disabled or because it has no enabled devices associated with it"\n\nทีมเริ่ม debug ที่ database, scope config, และ event log`,
            },
            {
                heading: "Root Cause: Startup Type = Disabled",
                body: `ก่อนหน้านี้มีคนเคย set Startup Type เป็น Disabled ชั่วคราวเพื่อ troubleshoot อะไรบางอย่าง แล้วลืม set กลับ\n\nError 1058 บอกตรงๆ แต่มักถูก ignore เพราะคิดว่าเป็น error อื่น\n\nFix ง่ายมาก:\nservices.msc → DHCPServer → Properties → Startup type: Automatic\nแล้ว Start`,
                isCallout: false,
            },
            {
                heading: "Verify หลังแก้",
                body: `# ดู active leases\nGet-DhcpServerv4Lease -ScopeId 192.168.2.0\n\n# ดูสถิติ\nGet-DhcpServerv4ScopeStatistics -ScopeId 192.168.2.0\n\nกลับมาเห็น 116 active clients และ 2 reservations ครบ — config เดิมยังอยู่ครบ`,
            },
            {
                heading: "Key Learning",
                body: `Error 1058 = service Disabled หรือไม่มี device enabled\nอ่าน error message ตรงๆ บอกสาเหตุชัดเจนมาก\n\nก่อน troubleshoot DHCP service ให้เช็ค:\n1. Startup Type ใน services.msc\n2. Error code จาก Event Log\n3. ค่อย debug config/database ถ้า 2 อย่างแรกปกติ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 33,
        slug: "docker-swarm-redis-volume-pin-node",
        title: "Redis บน Docker Swarm: data หายทุกครั้งที่ service restart",
        subtitle: "Swarm schedule container ไปคนละ node — volume บน node เก่าไม่ติดตามไป",
        tags: ["Docker", "Swarm", "Redis", "DevOps"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
        heroCaption: "Docker Swarm stateful service — ต้องผูก container กับ node ไม่งั้น volume หาย",
        sections: [
            {
                heading: "ปัญหา",
                body: `Redis รันใน Docker Swarm แบบ volume mount ที่ host\nแต่ทุกครั้งที่ Swarm restart service — cache หายหมด\n\nเกิดเพราะ Swarm อาจ schedule container ไปรันบน node อื่น ที่ไม่มี volume ที่ bind mount ไว้`,
            },
            {
                heading: "วิธีแก้: Pin service ไว้กับ node เดิม",
                body: `services:\n  redis:\n    image: redis:alpine\n    volumes:\n      - /var/lib/redis/data:/data\n    deploy:\n      placement:\n        constraints:\n          - node.role == manager\n          # หรือ pin ด้วย hostname\n          - node.hostname == ubuntu254\n\nPlacement constraint ทำให้ Swarm schedule container ไปแค่ node ที่ระบุ — volume ไม่หาย`,
                isCallout: false,
            },
            {
                heading: "ทำไม /var/lib/redis/data",
                body: `ตาม Linux Filesystem Hierarchy Standard:\n/var/lib/ → application data ที่ต้อง persist\n\nเหตุผลที่เลือก path นี้:\n- ง่ายต่อ backup script\n- ไม่ conflict กับ application path อื่น\n- Redis user (UID 999) ต้องได้ permission: chown -R 999:999 /var/lib/redis/data`,
            },
            {
                heading: "Key Learning",
                body: `Docker Swarm ออกแบบมาสำหรับ stateless service — stateful service ต้องดูแลพิเศษ\n\nStateful services (Database, Redis, Elasticsearch) ใน Swarm:\n1. ต้อง pin ไว้กับ node ที่มี volume\n2. หรือใช้ distributed storage (NFS, GlusterFS)\n\nถ้า data หายทุก restart → ตรวจสอบ node ที่ container รันก่อนเลย`,
                isCallout: true,
            },
        ],
    },
    {
        id: 34,
        slug: "docker-swarm-dns-service-name",
        title: "Docker Swarm: hostname 'db' ใช้ไม่ได้ข้าม node — ต้องใช้ชื่อ service จริง",
        subtitle: "ENOTFOUND db — app บน htv-proxy1 หา database บน htv-proxy2 ไม่เจอ เพราะ hostname ผิด",
        tags: ["Docker", "Swarm", "Networking", "Nginx"],
        date: "2025",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
        heroCaption: "Docker Swarm overlay network DNS — service discovery ใช้ชื่อ service ไม่ใช่ hostname",
        sections: [
            {
                heading: "ปัญหา",
                body: `ติดตั้ง Nginx Proxy Manager ใน Docker Swarm กับ MariaDB\nApp container ให้ 502 Bad Gateway ตอน login\n\nดู log เจอ:\ngetaddrinfo ENOTFOUND db\n\nApp บน htv-proxy1 พยายาม connect "db" แต่หาไม่เจอ ทั้งที่ MariaDB รันอยู่บน htv-proxy2`,
            },
            {
                heading: "สาเหตุ: Docker Swarm DNS ใช้ service name ไม่ใช่ hostname",
                body: `ใน docker-compose.yml ตั้ง hostname: npm-db สำหรับ database container\nแต่ใน environment ของ app ตั้ง DB_MYSQL_HOST: "db"\n\nDocker Swarm overlay DNS resolve ชื่อ service (ชื่อตาม stack: npm_db)\nไม่ใช่ hostname ที่ตั้งใน container definition\n\nHostname ใน Swarm ใช้ได้แค่ภายใน container เดียวกัน ไม่ข้าม service`,
                isCallout: false,
            },
            {
                heading: "Fix",
                body: `เปลี่ยน environment variable:\n\n# เดิม\nDB_MYSQL_HOST: "db"\n\n# แก้ — ใช้ชื่อ service จาก stack\nDB_MYSQL_HOST: "npm_db"\n\nชื่อ service ใน Swarm คือ {stack_name}_{service_name}\nถ้า deploy stack ชื่อ npm และ service ชื่อ db → DNS ชื่อ npm_db`,
            },
            {
                heading: "ปัญหาซ้อน: MariaDB 2 replicas = data corruption",
                body: `config เดิมตั้ง replicas: 2 สำหรับ MariaDB\n\nนี่อันตรายมาก — MariaDB ไม่ใช่ distributed database\n2 container เขียน volume เดียวกันพร้อมกัน → data corruption ทันที\n\nDatabase ทุกชนิด (MySQL, MariaDB, PostgreSQL) ใน Swarm ต้องเป็น replicas: 1 เสมอ\nถ้าต้องการ HA → ใช้ Galera Cluster หรือ replica set ที่ database รองรับ`,
                isCallout: true,
            },
            {
                heading: "Key Learning",
                body: `Swarm DNS: ใช้ service name {stack}_{service} เสมอ\nHostname ใน container definition ≠ DNS name บน overlay network\n\nStateful database บน Swarm → replicas: 1 เสมอ ไม่มีข้อยกเว้น`,
                isCallout: true,
            },
        ],
    },
    {
        id: 35,
        slug: "debezium-composite-pk-mismatch-phantom-records",
        title: "Debezium sync สร้าง phantom records เพราะ composite PK ต่างกัน 2 ฝั่ง",
        subtitle: "noreturn_main มี record มากกว่า noreturn — เพราะ rack field เป็น PK ฝั่งปลายทาง แต่ไม่ใช่ต้นทาง",
        tags: ["Debezium", "CDC", "MariaDB", "SQL Server"],
        date: "2025",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        heroCaption: "Composite Primary Key mismatch — ต้นทางและปลายทาง key ต่างกัน ทำให้ record ซ้ำซ้อน",
        sections: [
            {
                heading: "ปัญหา",
                body: `DBSyncer sync noreturn → noreturn_main\n\nnoreturn (MariaDB): 126,978 records\nnoreturn_main (MariaDB): 132,429 records\n\nnoreturn_main มีมากกว่า ซึ่งไม่ควรเกิด — เพราะ noreturn_main เป็นปลายทาง`,
            },
            {
                heading: "Root Cause: PK ต่างกัน",
                body: `noreturn PK: [PFCarton, id, carton]  — 3 fields\nnoreturn_main PK: [PFCarton, id, carton, rack]  — 4 fields\n\nเมื่อ sync record เดิมที่ rack เปลี่ยนค่า:\n- noreturn_main ไม่ upsert เพราะ PK (รวม rack) ต่างกัน\n- สร้าง record ใหม่แทน\n\nผลคือ record เดิม ยังอยู่ + record ใหม่ที่ rack ต่างกัน = phantom records`,
                isCallout: false,
            },
            {
                heading: "วิธีตรวจสอบ",
                body: `# ดู log แบบ real-time\ndocker logs -f <container_id> 2>&1 | \\\n  grep -E "noreturn|duplicates|error"\n\n# ดู duplicate count\ndocker logs <container_id> 2>&1 | \\\n  grep "duplicates" | tail -20\n\nถ้า "duplicates: 5" ขึ้นซ้ำๆ — Prisma เจอ PK conflict แต่ไม่ crash เพราะมี error handler`,
            },
            {
                heading: "Key Learning",
                body: `ก่อน build CDC pipeline ต้องตรวจสอบ Primary Key ของทุก table ทั้ง 2 ฝั่ง\n\nถ้า PK ต่างกัน → upsert จะสร้าง record ใหม่แทน update ของเดิม\n\nตรวจสอบด้วย: SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS\nดู constraint type = PRIMARY KEY ของแต่ละ table ทั้ง source และ destination`,
                isCallout: true,
            },
        ],
    },
    {
        id: 36,
        slug: "dbsyncer-datetime-time-type-mismatch",
        title: "SQL Server TIME field → MariaDB ได้ integer milliseconds แทน string",
        subtitle: "Debezium แปลง TIME เป็น milliseconds since midnight — MariaDB รับไม่ได้ต้อง convert เอง",
        tags: ["Debezium", "SQL Server", "MariaDB", "TypeScript"],
        date: "2025",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
        heroCaption: "Time field sync — Debezium serialize TIME เป็น int64 milliseconds ไม่ใช่ string",
        sections: [
            {
                heading: "ปัญหา",
                body: `DBSyncer sync fax_main, fr_main จาก SQL Server → MariaDB\nได้ error: "Invalid value provided. Expected DateTime, provided Int"\n\nField ที่พัง: issue_time ใน fax_main, fax_tmp, fr_main, fr_tmp, ret_tmp`,
            },
            {
                heading: "สาเหตุ: Debezium serialize TIME เป็น milliseconds",
                body: `SQL Server TIME field → Debezium ส่งเป็น int64 (milliseconds since midnight)\n\nเช่น 09:30:00 → 34,200,000 ms\n\nMariaDB Prisma schema รอรับ DateTime object หรือ string "HH:MM:SS"\nพอได้ integer มา → type error`,
                isCallout: false,
            },
            {
                heading: "Fix: แปลง milliseconds → time string",
                body: `function convertMsToTimeString(ms: number | null): string | null {\n  if (ms === null || ms === undefined) return null\n  const totalSec = Math.floor(ms / 1000)\n  const h = Math.floor(totalSec / 3600)\n  const m = Math.floor((totalSec % 3600) / 60)\n  const s = totalSec % 60\n  return \`\${String(h).padStart(2,'0')}:\${String(m).padStart(2,'0')}:\${String(s).padStart(2,'0')}\`\n}\n\n// ใช้ก่อน upsert ใน MariaDB\nconst TIME_FIELDS = ['issue_time', 'rettime']\nfor (const field of TIME_FIELDS) {\n  if (typeof data[field] === 'number') {\n    data[field] = convertMsToTimeString(data[field])\n  }\n}`,
            },
            {
                heading: "Key Learning",
                body: `Debezium serialize temporal types แตกต่างกันตาม source database:\n- DATE → days since epoch (integer)\n- TIME → milliseconds since midnight (integer)\n- DATETIME/TIMESTAMP → milliseconds since Unix epoch (integer)\n\nต้องเขียน converter สำหรับ time fields ทุกตัวเสมอ เมื่อ sink ไป database ที่ expect string/DateTime`,
                isCallout: true,
            },
        ],
    },
    {
        id: 37,
        slug: "cisco-sg350-netmiko-ciscosb-model",
        title: "Backup Cisco SG350/SG300 ด้วย Python: ต้องใช้ model ciscosb ไม่ใช่ cisco_ios",
        subtitle: "Netmiko มี driver แยกสำหรับ Small Business series — cisco_ios ไม่ work กับ SG350",
        tags: ["Cisco", "Python", "Networking", "Oxidized"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        heroCaption: "Cisco SG350-28 และ SG300-28 — Small Business switch ที่ใช้ IOS แตกต่างจาก Enterprise",
        sections: [
            {
                heading: "ปัญหาเริ่มต้น",
                body: `ต้องการ backup config ของ Cisco SG350-28 (192.168.2.44) และ SG300-28 (192.168.2.49)\n\nใช้ Netmiko device_type: cisco_ios → SSH connect ได้แต่ command ไม่ work\nเพราะ SG350/SG300 เป็น Small Business series — CLI ต่างจาก Enterprise IOS`,
            },
            {
                heading: "Fix: ใช้ ciscosb model",
                body: `from netmiko import ConnectHandler\n\ndevice = {\n    'device_type': 'cisco_s300',  # ← ถูกต้อง ไม่ใช่ cisco_ios\n    'host': '192.168.2.44',\n    'username': 'spaprofile',\n    'password': 'YOUR_PASSWORD',\n}\n\nconn = ConnectHandler(**device)\noutput = conn.send_command('show running-config')\nconn.disconnect()\n\nOxidized ใช้ model 'ciscosb' — ตัวเดียวกัน แค่ชื่อต่างกัน`,
            },
            {
                heading: "Oxidized config สำหรับ Cisco Small Business",
                body: `# /opt/oxidized/data/config (ส่วน model)\nmodel_map:\n  cisco: ios\n  smc: smc\n  tplink: tplink\n\n# ใน router.db\n192.168.2.44:ciscosb\n192.168.2.49:ciscosb\n\n# ถ้าใช้ LibreNMS integration\n# ตั้งค่า Misc → Oxidized → exclude device ที่ไม่มี model`,
                isCallout: false,
            },
            {
                heading: "Per-device credential",
                body: `Cisco SG350/SG300 อาจใช้ credential ต่างจาก device อื่นในระบบ\nOxidized รองรับ per-device credential ใน router.db:\n\n192.168.2.44:ciscosb:username:password\n\nหรือใน config:\nsource:\n  default: csv\n  csv:\n    file: /opt/oxidized/data/router.db\n    delimiter: ':'\n    map:\n      name: 0\n      model: 1\n      username: 2\n      password: 3`,
            },
            {
                heading: "Key Learning",
                body: `Cisco มีหลาย product line ที่ใช้ CLI ต่างกัน:\n- IOS (Enterprise): cisco_ios, cisco_xe\n- Small Business (SG series): ciscosb, cisco_s300\n- NX-OS: cisco_nxos\n\nถ้า SSH ได้แต่ command ไม่ work → ตรวจสอบ device_type/model ก่อน`,
                isCallout: true,
            },
        ],
    },
    {
        id: 38,
        slug: "unix-timestamp-always-utc",
        title: "Unix timestamp เก็บเป็น UTC เสมอ — ไม่ว่า server จะอยู่ timezone ไหน",
        subtitle: "Date.now() บน server ไทย ให้ผลเหมือน Date.now() บน server UK — เพราะ epoch คือ UTC",
        tags: ["Node.js", "TypeScript", "Timezone", "Nova"],
        date: "2025",
        readTime: "2 min",
        heroImage: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80",
        heroCaption: "Unix timestamp — ตัวเลขเดียว ไม่มี timezone แปลแล้วค่อย offset",
        sections: [
            {
                heading: "คำถามที่เกิดขึ้นจริง",
                body: `Code ใน IPTV system ใช้:\nconst ts = Math.floor(Date.now() / 1000)\n\nคำถาม: timestamp นี้ถูกเก็บเป็น Thai time หรือ UTC?`,
            },
            {
                heading: "คำตอบ: UTC เสมอ",
                body: `Unix timestamp = วินาทีที่ผ่านมาตั้งแต่ 1 มกราคม 1970 00:00:00 UTC\n\nDate.now() คืน milliseconds ตาม UTC เสมอ — ไม่ว่า process จะรันบน server ที่ timezone ไหน\n\nUser ใน Thailand กับ User ใน UK รัน Date.now() พร้อมกัน → ได้เลขเดียวกัน`,
            },
            {
                heading: "แปลงเป็น Thai time สำหรับ display",
                body: `// เก็บ timestamp เป็น UTC เสมอ (ถูกต้อง)\nconst stored = Math.floor(Date.now() / 1000)\n\n// แปลงเป็น Thai time ตอนแสดงผล\nconst thaiTime = new Date(stored * 1000).toLocaleString('th-TH', {\n  timeZone: 'Asia/Bangkok'\n})\n\nหรือใช้ dayjs/moment:\nconst display = dayjs.unix(stored).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm:ss')`,
            },
            {
                heading: "Key Learning",
                body: `กฎ: เก็บ timestamp เป็น UTC เสมอ แปลงเป็น local time เฉพาะตอน display\n\nถ้าเก็บเป็น local time → พอเปลี่ยน server timezone หรือ user อยู่ timezone อื่น ข้อมูลผิดหมด\n\nDate.now() ปลอดภัยใช้ได้เลย — มันเป็น UTC เสมอโดย spec`,
                isCallout: true,
            },
        ],
    },
    {
        id: 39,
        slug: "excel-printer-settings-upload-fail",
        title: "Excel upload 502 เพราะไฟล์มี printer settings และ Thai filename",
        subtitle: "ไฟล์เหมือนกันทุกอย่าง แต่ตัวหนึ่ง upload ได้ อีกตัวได้ 502 — ต่างแค่ชื่อไฟล์และ printer settings",
        tags: ["Excel", "Upload", "Encoding", "Node.js"],
        date: "2025",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
        heroCaption: "Excel file structure — printer settings ซ่อนอยู่ใน xl/printerSettings/ ภายใน ZIP",
        sections: [
            {
                heading: "ปัญหา",
                body: `ไฟล์ 2 ไฟล์ข้อมูลเหมือนกัน 137 rows 6 columns:\n- ADD__PROFILE_12_25.xlsx → upload สำเร็จ\n- ต_นADD__PROFILE_12_25.xlsx → 502 Bad Gateway\n\nต่างกันแค่ชื่อไฟล์มีภาษาไทย และขนาดต่างกัน (15KB vs 22KB)`,
            },
            {
                heading: "สาเหตุ 2 อย่างซ้อนกัน",
                body: `1. Thai character ใน filename: "ต_น" → web server หลายตัวไม่รองรับ UTF-8 filename ใน multipart upload header\n\n2. Printer settings: ไฟล์ที่ใหญ่กว่ามี xl/printerSettings1.bin อยู่ใน ZIP structure — Excel บันทึก printer config ไว้ด้วย บาง parser อ่านแล้ว error`,
                isCallout: false,
            },
            {
                heading: "Fix: ทำไฟล์ clean ด้วย Python",
                body: `import zipfile, shutil, os\n\n# Excel คือ ZIP — แตกแล้วลบ printer settings\nwith zipfile.ZipFile('input.xlsx', 'r') as z:\n    z.extractall('tmp_excel')\n\n# ลบ printer settings\nprinter_dir = 'tmp_excel/xl/printerSettings'\nif os.path.exists(printer_dir):\n    shutil.rmtree(printer_dir)\n\n# แก้ relationships ที่อ้างถึง printer settings\n# (ต้องแก้ xml ใน xl/worksheets/_rels/)\n\n# Repack\nwith zipfile.ZipFile('clean.xlsx', 'w') as z:\n    for f in ...: z.write(f)\n\nผล: ไฟล์เล็กลงจาก 22KB → 9.56KB และ upload ได้`,
            },
            {
                heading: "Key Learning",
                body: `Excel file เป็น ZIP — ถ้า upload fail ให้แตกดูโครงสร้างข้างใน\n\nThai/Unicode ในชื่อไฟล์ → ใช้ชื่อ ASCII สำหรับ file upload เสมอ\n\nPrinter settings ใน Excel ทำให้ไฟล์ใหญ่ขึ้นและบาง parser พัง → ลบออกได้ปลอดภัย ไม่กระทบข้อมูล`,
                isCallout: true,
            },
        ],
    },
    {
        id: 40,
        slug: "windows-server-evaluation-slmgr-rearm",
        title: "ยืด Windows Server Evaluation ด้วย slmgr /rearm",
        subtitle: "Trial หมดอายุ กลัว server ดับ — rearm ต่อเวลาได้สูงสุด 3 ครั้ง รวม 180 วัน",
        tags: ["Windows Server", "License", "SV70"],
        date: "2025",
        readTime: "2 min",
        heroImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
        heroCaption: "Windows Server Evaluation — ใช้สำหรับ test/dev ก่อน license จริงพร้อม",
        sections: [
            {
                heading: "Context",
                body: `Windows Server Evaluation edition มีอายุ 180 วัน (6 เดือน)\nถ้าหมดอายุโดยไม่ activate → server reboot ทุก 1 ชั่วโมง และสุดท้ายบังคับปิดเครื่อง`,
            },
            {
                heading: "slmgr /rearm คืออะไร",
                body: `เป็นคำสั่ง reset grace period ของ Windows activation\n\nทำได้สูงสุด 3 ครั้ง (รวม initial = 4 × 30 วัน = 180 วัน)\n\n# ตรวจสอบสถานะก่อน\nslmgr /dlv\n\n# ดู rearm count ที่เหลือ\nslmgr /xpr\n\n# Rearm (ต้อง run as Administrator)\ncscript %windir%\\system32\\slmgr.vbs /rearm\n\nหลังรันต้อง restart เครื่อง`,
            },
            {
                heading: "PowerShell version",
                body: `# ดูสถานะ\nGet-WmiObject -query 'select * from SoftwareLicensingProduct' |\n  Where-Object {$_.PartialProductKey} |\n  Select-Object Name, LicenseStatus, GracePeriodRemaining\n\n# Rearm ผ่าน WMI (ไม่ต้อง restart ทันที)\n$sls = Get-WmiObject SoftwareLicensingService\n$sls.ReArmWindows()`,
            },
            {
                heading: "Key Learning",
                body: `slmgr /rearm ไม่ใช่การ activate — แค่ต่ออายุ grace period\nทำได้สูงสุด 3 ครั้ง หลังจากนั้นต้อง activate จริงหรือ reinstall\n\nถ้าใช้ใน production → ต้องหา license จริง evaluation ไม่ suitable สำหรับ production workload\nใช้สำหรับ test/dev/staging เท่านั้น`,
                isCallout: true,
            },
        ],
    },
    {
        id: 41,
        slug: "printer-shared-error-0x00000709-printnight",
        title: "Shared Printer Error 0x00000709 บน Windows 11 — PrintNightmare legacy",
        subtitle: "Windows Update หลัง PrintNightmare patch บล็อก shared printer install — ต้องแก้ Registry หรือลง driver local ก่อน",
        tags: ["Windows", "Printer", "Networking"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
        heroCaption: "HP LaserJet Pro M12a shared จาก CENTER-SAWITREEK — Windows 11 block install หลัง patch",
        sections: [
            {
                heading: "ปัญหา",
                body: `Windows 11 ติดตั้ง shared printer จาก server CENTER-SAWITREEK ไม่ได้\nError 0x00000709: "Cannot complete the install of the printer"\n\nShare path ถูกต้อง เห็น printer จาก network แต่ double-click แล้ว error`,
            },
            {
                heading: "สาเหตุ: PrintNightmare Security Patch",
                body: `Microsoft ออก patch หลัง PrintNightmare vulnerability (CVE-2021-34527)\n\nPatch บังคับให้ admin privileges เพื่อ install printer driver จาก network\nWindows 11 strict กว่า Windows 10 มาก — Block shared printer installation บาง configuration โดย default`,
                isCallout: false,
            },
            {
                heading: "วิธีแก้ที่ทำงานได้",
                body: `# วิธีที่ 1: แก้ Registry (RpcAuthnLevelPrivacyEnabled)\nHKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Print\nRpcAuthnLevelPrivacyEnabled = 0\n\n# วิธีที่ 2: ลง driver local ก่อน (แนะนำ)\n1. Download HP M12a PCL 6 Driver จาก hp.com\n2. ติดตั้งแบบ "Add a local printer or network printer with manual settings"\n3. หลังลง driver แล้ว → add shared printer จะผ่าน\n\n# วิธีที่ 3: ตรวจสอบ Print Spooler ฝั่ง server\nGet-Service -Name Spooler | Select Status\n# ถ้า Stopped → Start-Service Spooler`,
            },
            {
                heading: "Key Learning",
                body: `Error 0x00000709 บน Windows 11 มักเกิดจาก PrintNightmare patch ไม่ใช่ network issue\n\nถ้า ping server ได้ เห็น share ได้ แต่ install ไม่ได้ → ปัญหาอยู่ที่ security policy\n\nวิธีที่ปลอดภัยที่สุด: ลง driver local ก่อน ไม่ต้องแก้ Registry`,
                isCallout: true,
            },
        ],
    },
    {
        id: 42,
        slug: "security-middleware-7-layers",
        title: "Security Middleware 7 ชั้นใน Elysia — ออกแบบให้ครอบคลุมจริง",
        subtitle: "Rate limit, IP block, CSRF, SQL injection, XSS, path traversal, timing attack — ทำได้ใน middleware ตัวเดียว",
        tags: ["Elysia.js", "Security", "Node.js", "Nova"],
        date: "2025",
        readTime: "5 min",
        heroImage: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
        heroCaption: "Defense in depth — 7 ชั้นกรองที่ request ต้องผ่านก่อนถึง handler",
        sections: [
            {
                heading: "Architecture: ลำดับของ 7 ชั้น",
                body: `ลำดับสำคัญมาก — ตรวจ cheapest check ก่อนเสมอ:\n\n1. Runtime Flag → ถ้า security disabled ข้ามทุกอย่าง (dev mode)\n2. Admin Bypass → header x-jimmy-handsome ผ่านได้ทุกอย่าง\n3. IP Blocking → ตรวจ Redis blacklist ก่อน (microseconds)\n4. Rate Limiting → จำกัด req/min ต่อ IP (Redis / RAM fallback)\n5. CSRF Protection → ตรวจ Origin/Referer สำหรับ POST/PUT/DELETE/PATCH\n6. Input Validation → scan query params + body หา attack patterns\n7. Timing Protection → padding เวลา response สำหรับ /api/auth/*`,
            },
            {
                heading: "Input Validation Patterns ที่ใช้จริง",
                body: `const INJECTION_PATTERNS = [\n  // SQL Injection\n  /UNION\\s+SELECT/i, /INSERT\\s+INTO/i, /DROP\\s+TABLE/i, /XP_CMDSHELL/i,\n  // XSS\n  /<script/i, /javascript:/i, /on\\w+\\s*=/i, /<iframe/i,\n  // Path Traversal\n  /\\.\\.\\//, /\\/etc\\/passwd/,\n  // Command Injection\n  /cmd\\.exe/i, /powershell\\.exe/i,\n  // Template Injection\n  /\\$\\{.*\\}/,\n  // Double encoding\n  /%25[0-9a-fA-F]{2}/,\n]\n\nถ้า pattern ใดๆ match → return 400 ทันที บันทึก IP ใน Redis counter`,
                isCallout: false,
            },
            {
                heading: "Timing Attack Protection",
                body: `// เฉพาะ auth routes — ให้ response เร็วเกินไปก็อันตราย\n// attacker วัดเวลาเดาได้ว่า username ถูกหรือไม่\n\nconst MIN_RESPONSE_MS = 200\n\nconst start = Date.now()\n// ... actual auth logic ...\nconst elapsed = Date.now() - start\n\nif (elapsed < MIN_RESPONSE_MS) {\n  await new Promise(r => setTimeout(r, MIN_RESPONSE_MS - elapsed))\n}\n\nทุก auth response ใช้เวลาอย่างน้อย 200ms เสมอ — attacker วัดเวลาไม่ได้`,
            },
            {
                heading: "Redis fallback เป็น RAM",
                body: `Rate limiter ใช้ Redis เป็น primary store\nแต่ถ้า Redis down → fallback เป็น in-memory Map\n\nทำให้ service ยังทำงานได้แม้ Redis ล่ม\nข้อเสีย: rate limit ไม่ sync ระหว่าง node แต่ยังดีกว่าหยุดทำงาน\n\nDesign principle: security feature ที่ทำให้ service down เองก็คือ vulnerability`,
                isCallout: false,
            },
            {
                heading: "Upload Path Exception",
                body: `บาง route ต้องได้รับ binary/base64 ขนาดใหญ่:\n/api/system/popup/upload-image\n/api/upload\n/api/file/upload\n\nRoute พวกนี้ exempt จาก input validation length check\nแต่ยังผ่าน rate limit และ CSRF ตามปกติ\n\nException ต้อง explicit list — อย่า "ผ่อนปรน" แบบ wildcard`,
                isCallout: true,
            },
        ],
    },
    {
        id: 43,
        slug: "sql-server-orphaned-user-explicit-sid",
        title: "SQL Server Orphaned User หลัง Restore — แก้ที่ต้นเหตุด้วย explicit SID",
        subtitle: "ALTER USER แก้ได้ชั่วคราว แต่ถ้าต้องการถาวรต้อง CREATE LOGIN ด้วย SID เดียวกับ backup",
        tags: ["SQL Server", "CartonSystem", "DBA", "Security"],
        date: "2025",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
        heroCaption: "SID (Security Identifier) — ตัวระบุ identity ของ SQL Server login ที่ต้องตรงกันทั้ง 2 ฝั่ง",
        sections: [
            {
                heading: "ทำไม orphaned user เกิดซ้ำทุกครั้งที่ restore",
                body: `ทุกครั้งที่ restore CartonSystem.bak → user 'cartonrw' ใน database กลับมาพร้อม SID จาก backup server\n\nแต่ login 'cartonrw' บน server ปัจจุบันมี SID ต่างออกไป (สร้างใหม่ทีหลัง)\n\nSQL Server จับคู่ DB user กับ login ด้วย SID ไม่ใช่ชื่อ → SID ไม่ตรง = orphaned user\n\nALTER USER [cartonrw] WITH LOGIN = [cartonrw] แก้ได้แค่ชั่วคราว restore ใหม่ก็กลับมา`,
            },
            {
                heading: "แก้ที่ต้นเหตุ: ดู SID จาก backup แล้ว CREATE LOGIN ให้ตรง",
                body: `-- Step 1: ดู SID ของ user ใน backup (หลัง restore แล้ว)\nUSE CartonSystem\nSELECT name, sid FROM sys.database_principals WHERE name = 'cartonrw'\n-- ได้: 0x34FFF44E1982C34691B3E9EC6D150C59\n\n-- Step 2: ลบ login เดิมแล้วสร้างใหม่ด้วย SID ที่ได้\nUSE master\nDROP LOGIN [cartonrw]\n\nCREATE LOGIN [cartonrw]\n  WITH PASSWORD = 'YOUR_PASSWORD',\n  SID = 0x34FFF44E1982C34691B3E9EC6D150C59,  -- SID จาก backup\n  CHECK_POLICY = OFF\n\nหลังจากนี้ restore กี่ครั้งก็ไม่ต้องแก้ orphaned user อีก`,
                isCallout: false,
            },
            {
                heading: "CartonSystem cross-database permissions",
                body: `cartonrw ต้องเข้าถึงหลาย database:\n- CartonSystem → db_owner (restore บ่อย)\n- COMMON → db_owner (ไม่ restore)\n- CartonLog → db_owner (ไม่ restore)\n- TRIGGERLOG → INSERT, SELECT, UPDATE บน schema TRG_CartonSystem\n- yii2_file_system → db_owner\n\nDatabase ที่ไม่ restore → setup user ครั้งเดียวแล้วไม่ต้องแตะอีก\nDatabase ที่ restore บ่อย → ใช้ explicit SID ให้ match`,
            },
            {
                heading: "Key Learning",
                body: `SQL Server Login SID = fingerprint ของ login\nDB user เก็บ SID ไว้เพื่อ map กลับไปหา login\n\nBackup → Restore ข้าม server = SID ไม่ตรงเสมอ\n\nวิธีแก้ถาวร:\n1. ดู SID จาก backup\n2. DROP + CREATE LOGIN ด้วย SID เดียวกัน\n3. หรือใช้ Contained Database (user ไม่ขึ้นกับ server login)`,
                isCallout: true,
            },
        ],
    },
    {
        id: 44,
        slug: "debezium-cdc-disabled-after-restore-ddl-trigger",
        title: "CDC ถูก disable อัตโนมัติหลัง restore — และ DDL Trigger บล็อก enable",
        subtitle: "Restore → CDC หาย → enable ใหม่ → DDL Trigger ยิง error — ต้อง disable trigger ก่อนชั่วคราว",
        tags: ["Debezium", "SQL Server", "CDC", "DBA"],
        date: "2025",
        readTime: "5 min",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        heroCaption: "Debezium CDC บน SQL Server — ต้องเปิด CDC ใหม่ทุกครั้งหลัง restore",
        sections: [
            {
                heading: "CDC ถูก disable หลัง restore — ทุกครั้ง",
                body: `SQL Server CDC เก็บ state ใน system tables ภายใน database\nเมื่อ restore จาก backup → CDC state จาก backup กลับมา\nถ้า backup ทำตอน CDC disabled → restore แล้วก็ disabled\n\nนอกจากนี้ CDC jobs (SQL Agent) ไม่ได้อยู่ใน backup → หายทุกครั้ง\n\nChecklist หลัง restore:\n1. EXEC sys.sp_cdc_enable_db\n2. EXEC sys.sp_cdc_enable_table สำหรับแต่ละ table\n3. Verify jobs: EXEC sys.sp_cdc_help_jobs (ต้องมี 2 jobs: capture + cleanup)\n4. Restart Debezium connector`,
            },
            {
                heading: "DDL Trigger ขัดกับ CDC enable",
                body: `CartonSystem มี DDL Trigger (TR_DDLTrigger) คอย log ทุก DDL statement ลง TRIGGERLOG\n\nเมื่อรัน sp_cdc_enable_table → SQL Server execute DDL ภายใน → trigger ยิง\n→ trigger พยายาม INSERT ลง TRIGGERLOG\n→ ถ้า schema ไม่ตรงหรือไม่มีสิทธิ์ → error → CDC enable ล้มเหลว\n\nErrorมักเป็น: "Cannot insert the value NULL into column 'is_retrieve_while_cancel'"`,
                isCallout: false,
            },
            {
                heading: "Fix: Disable DDL Trigger ชั่วคราว",
                body: `-- Disable trigger ก่อน enable CDC\nDISABLE TRIGGER TR_DDLTrigger ON DATABASE\n\n-- Enable CDC\nEXEC sys.sp_cdc_enable_db\nEXEC sys.sp_cdc_enable_table\n  @source_schema = 'dbo',\n  @source_name = 'text_file',\n  @role_name = NULL\n\n-- Enable trigger กลับ\nENABLE TRIGGER TR_DDLTrigger ON DATABASE\n\nทำแบบนี้ทุกครั้งที่ต้อง modify CDC configuration`,
            },
            {
                heading: "LSN position reset หลัง restore",
                body: `Debezium track position ด้วย LSN (Log Sequence Number)\nหลัง restore → LSN ใน transaction log เปลี่ยน\nถ้า Debezium ยังจำ LSN เก่า → เริ่ม streaming จาก position ที่ไม่มีอยู่ → error\n\nFix: ลบ offsets ของ Debezium แล้วให้ snapshot ใหม่:\n# ลบ topic offsets ใน Kafka\n# หรือเปลี่ยน connector name (สร้าง connector ใหม่)\n# หรือตั้ง snapshot.mode=initial ใหม่`,
                isCallout: true,
            },
            {
                heading: "Key Learning",
                body: `Restore SQL Server database ที่มี CDC = ต้องทำ 4 ขั้นตอนเสมอ\n\nถ้า DDL Trigger ยิง error ระหว่าง CDC enable → disable trigger ชั่วคราว\nถ้า Debezium error หลัง restore → ลบ offset แล้ว snapshot ใหม่\n\nสร้าง post-restore script ให้ครบ ทำแค่รันไฟล์เดียวจบ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 45,
        slug: "payment-webhook-signature-and-regex-parsing",
        title: "Webhook ชำระเงิน: Signature Verification + Regex Reference Parsing",
        subtitle: "ตรวจ HMAC signature ก่อน parse reference — regex แบบ fixed digits ทำให้ error เมื่อ format เปลี่ยน",
        tags: ["NestJS", "TypeScript", "Webhook", "Security"],
        date: "2025",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        heroCaption: "Payment webhook pipeline — verify signature → parse reference → process business logic",
        sections: [
            {
                heading: "Flow ของ Webhook ที่ถูกต้อง",
                body: `1. รับ webhook payload\n2. Verify HMAC signature ก่อนทุกอย่าง\n3. บันทึกลง webhook log (ทุก request แม้ duplicate)\n4. เช็ค duplicate ด้วย EventId\n5. Parse reference strings\n6. Execute business logic (renew/register)`,
            },
            {
                heading: "Signature Verification",
                body: `// ต้อง verify ก่อน parse payload\nconst computedSig = crypto\n  .createHmac('sha256', process.env.WEBHOOK_SECRET)\n  .update(rawBody)  // ต้องใช้ raw body ไม่ใช่ parsed JSON\n  .digest('hex')\n\nif (computedSig !== receivedSig) {\n  throw new UnauthorizedException('Invalid signature')\n}\n\nสำคัญ: ต้องใช้ rawBody (Buffer) ไม่ใช่ JSON.stringify(parsedBody)\nการ serialize กลับอาจเปลี่ยน key order → signature ไม่ตรง`,
                isCallout: false,
            },
            {
                heading: "Regex ที่ยืดหยุ่น แทน fixed digits",
                body: `// Reference format: C{customerID}P{period}U{uid}\n// customerID อาจ 9 หรือ 10 หลัก — ห้าม hardcode\n\n// ผิด: จำนวนหลักแน่นอน\nconst r1 = /^C\\d{10}P\\d+U/  // พัง ถ้า ID 9 หลัก\n\n// ถูก: ยืดหยุ่น\nconst r1 = /^(C\\d+)P(\\d+)U/\n\n// Reference 2: RN/RE + YYMMDD + quantity + U + uid\n// เจอ 7 digits แทน 6 เพราะ quantity ติดกับ date\nconst r2 = /^(RE|RN)(\\d{6})(\\d*)U/\nconst [, type, dateStr, qty] = ref2.match(r2)`,
            },
            {
                heading: "Business Logic: RN vs RE",
                body: `RN (Renewal) → คำนวณวันหมดอายุจากวันหมดอายุเดิม + period months\nRE (Register) → คำนวณจากวันนี้ + period months\n\n// RN: ต่ออายุ\nconst newExpiry = addMonths(customer.current_expiry, period)\n\n// RE: สมัครใหม่\nconst newExpiry = addMonths(new Date(), period)\n\nlogic ต่างกันมาก — parse type ให้ถูกก่อนคำนวณ`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `Webhook ที่ดีต้องมีทุกอย่างนี้:\n1. HMAC signature verification (rawBody เท่านั้น)\n2. Idempotency ด้วย EventId (ป้องกัน duplicate processing)\n3. Log ทุก request ก่อน process\n4. Regex ที่ยืดหยุ่น — payment gateway มักเปลี่ยน format โดยไม่แจ้ง\n5. Separate parse logic ออกจาก business logic`,
                isCallout: true,
            },
        ],
    },
    {
        id: 46,
        slug: "thai-encoding-detection-scoring-system",
        title: "Thai Encoding Detection ด้วย Scoring System — ไม่เดา แต่ให้คะแนน",
        subtitle: "ลอง decode หลาย encoding แล้วให้คะแนนตามความเป็นไทย — encoding ที่ได้คะแนนสูงสุดชนะ",
        tags: ["Encoding", "Thai", "Node.js", "Nova"],
        date: "2025",
        readTime: "4 min",
        heroImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
        heroCaption: "Scoring-based encoding detection — decode หลายแบบแล้วเลือกที่ให้ผลดีที่สุด",
        sections: [
            {
                heading: "ทำไมไม่ใช้ chardet / encoding-japanese ตรงๆ",
                body: `Auto-detection library มักผิดพลาดกับไฟล์ไทยรุ่นเก่า\nเพราะ TIS-620 กับ Windows-874 มี byte range ทับซ้อนกับ Latin encodings\n\nBrowser-side TextDecoder ก็ไม่รองรับ TIS-620 โดย native\nต้องใช้ iconv-lite บน Node.js backend เท่านั้น`,
            },
            {
                heading: "Scoring System",
                body: `function scoreText(text: string): number {\n  let score = 0\n  \n  // Thai Unicode range: \\u0E00-\\u0E7F\n  const thaiChars = text.match(/[\\u0E00-\\u0E7F]/g) || []\n  score += thaiChars.length * 2\n  \n  // คำไทยทั่วไปที่ควรเจอในเอกสาร\n  const COMMON_THAI = ['เอกสาร', 'สัญญา', 'ยืม', 'คืน', 'แผนก']\n  for (const word of COMMON_THAI) {\n    if (text.includes(word)) score += 5\n  }\n  \n  // Penalty: replacement character\n  const replacements = text.match(/\\uFFFD/g) || []\n  score -= replacements.length * 10\n  \n  // Big penalty: encoded pattern ที่ยังเป็น garbled text\n  if (text.match(/เรียนเธอเป็นๆ|á¿¡«/)) score -= 50\n  \n  return score\n}`,
                isCallout: false,
            },
            {
                heading: "UTF-8 First Strategy",
                body: `// ลอง UTF-8 ก่อนเสมอ — ถ้าดีพอก็ไม่ต้องลองอื่น\nconst utf8 = decode(buffer, 'utf-8')\nif (scoreText(utf8) > 10) return utf8  // เร็วกว่า\n\n// ถ้า UTF-8 ไม่ดี → ลองต่อ\nconst encodings = ['windows-874', 'tis620', 'iso-8859-11']\nlet best = { text: utf8, score: scoreText(utf8) }\n\nfor (const enc of encodings) {\n  const decoded = iconv.decode(buffer, enc)\n  const score = scoreText(decoded)\n  if (score > best.score) best = { text: decoded, score }\n}\n\nreturn best.text`,
            },
            {
                heading: "Key Learning",
                body: `อย่าเชื่อ encoding detection library 100% สำหรับภาษาไทย\nโดยเฉพาะไฟล์จาก legacy system ที่อาจ mix encoding\n\nScoring approach:\n- Transparent: รู้ว่าทำไมเลือก encoding นั้น\n- Tunable: เพิ่ม/ลด weight ได้ตามลักษณะไฟล์\n- Fallback-safe: ถ้าทุกอย่างได้คะแนนต่ำ → UTF-8 เป็น default`,
                isCallout: true,
            },
        ],
    },




    {
        id: 47,
        slug: "debezium-identity-insert-cdc-sync",
        title: "Debezium sync ข้ามฝั่ง: IDENTITY column update ไม่ได้ ต้องใช้ IDENTITY_INSERT",
        subtitle: "Cannot update identity column 'id' — Prisma update ธรรมดาใช้ไม่ได้ ต้องใช้ raw SQL + IDENTITY_INSERT ON",
        tags: ["Debezium", "SQL Server", "Prisma", "CDC"],
        date: "2025",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
        heroCaption: "SQL Server IDENTITY column — insert ได้แต่ update ไม่ได้ ต้องเปิด IDENTITY_INSERT ก่อน",
        sections: [
            {
                heading: "ปัญหา",
                body: `Debezium CDC sync text_file จาก MariaDB → SQL Server\nเมื่อ source INSERT record ใหม่ → ปลายทางต้องเก็บ id เดิมไว้ด้วย\n\nแต่ SQL Server ไม่ยอมให้ insert ค่า id เองถ้า column เป็น IDENTITY\nPrisma create() ก็ไม่รองรับ — ต้อง raw SQL เท่านั้น`,
            },
            {
                heading: "Fix: Raw SQL + IDENTITY_INSERT",
                body: `async function insertTextFileWithIdentity(data: any) {\n  await prisma.$executeRawUnsafe(\n    'SET IDENTITY_INSERT [dbo].[text_file] ON'\n  )\n  \n  try {\n    await prisma.$executeRawUnsafe(\n      'INSERT INTO [dbo].[text_file] (id, ...) VALUES (@p0, ...)',\n      data.id,\n      // ... other values\n    )\n  } finally {\n    // ต้อง OFF เสมอ ไม่งั้น session ค้าง\n    await prisma.$executeRawUnsafe(\n      'SET IDENTITY_INSERT [dbo].[text_file] OFF'\n    )\n  }\n}`,
                isCallout: false,
            },
            {
                heading: "Idempotent: ตรวจก่อน insert",
                body: `// Debezium อาจส่ง event ซ้ำ (network retry)\n// ต้องตรวจก่อนเสมอ\n\nconst existing = await prisma.text_file.findUnique({ where: { id: data.id } })\n\nif (existing) {\n  // มีแล้ว → update แทน (ไม่ต้อง IDENTITY_INSERT)\n  const { id, ...updateData } = data\n  await prisma.text_file.update({ where: { id }, data: updateData })\n} else {\n  // ยังไม่มี → insert พร้อม IDENTITY_INSERT\n  await insertTextFileWithIdentity(data)\n}`,
            },
            {
                heading: "Key Learning",
                body: `IDENTITY_INSERT ใน SQL Server:\n- ต้อง SET ON ก่อน INSERT\n- ต้อง SET OFF หลัง INSERT เสมอ (ใน finally block)\n- Prisma ไม่รองรับ — ต้องใช้ $executeRawUnsafe\n- ใช้ได้แค่ table เดียวต่อ session ในเวลาเดียวกัน\n\nCDC sync ที่ดีต้องเป็น idempotent — รับ event เดิม 2 ครั้งต้องได้ผลเหมือนกัน`,
                isCallout: true,
            },
        ],
    },
    {
        id: 48,
        slug: "webhook-duplicate-detection-wrong-comparison",
        title: "Duplicate Webhook Detection ที่ตรวจผิด — ทุก request ถูก flag ว่า duplicate",
        subtitle: "เปรียบ ReceivedAt กับ Timestamp — สองอย่างไม่เคยเท่ากัน ทำให้ logic พัง 100%",
        tags: ["NestJS", "TypeScript", "Webhook", "Debugging"],
        date: "2025",
        readTime: "2 min",
        heroImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
        heroCaption: "Logic bug ที่ subtle — เงื่อนไขที่ดูสมเหตุสมผลแต่ไม่เคยเป็นจริง",
        sections: [
            {
                heading: "โค้ดที่ผิด",
                body: `// ดูเหมือนสมเหตุสมผล แต่ logic ผิดทั้งหมด\nconst isDuplicate = savedWebhook.ReceivedAt.getTime()\n                 !== savedWebhook.Timestamp.getTime()\n\n// ReceivedAt = เวลาที่ server ได้รับ webhook (ตอนนี้)\n// Timestamp = เวลาที่ payment gateway สร้าง event\n// ทั้งสองจะไม่เท่ากันเลย ทุก request\n// → isDuplicate = true เสมอ → ทุก request ถูก reject`,
            },
            {
                heading: "Fix: เช็ค EventId แทน",
                body: `// EventId คือ unique identifier ของ event นั้นจาก payment gateway\n// ถ้า EventId เดิมส่งมาซ้ำ = duplicate จริงๆ\n\nasync function isDuplicateWebhook(eventId: string): Promise<boolean> {\n  const existing = await prisma.webhook.findUnique({\n    where: { event_id: eventId }\n  })\n  return !!existing\n}\n\n// ใช้งาน\nif (await isDuplicateWebhook(payload.event_id)) {\n  return { status: 'duplicate', message: 'Already processed' }\n}`,
                isCallout: false,
            },
            {
                heading: "Key Learning",
                body: `Duplicate detection ต้องใช้ identifier ที่ payment gateway กำหนด\nไม่ใช่ timestamp ที่ server สร้างเอง\n\nหลักการ: Idempotency Key มาจาก caller ไม่ใช่ receiver\n\nBug แบบนี้หาเจอยาก เพราะ:\n- ไม่มี error — แค่ return status ผิด\n- test แบบ unit อาจผ่าน\n- เจอได้ตอน integration test เท่านั้น`,
                isCallout: true,
            },
        ],
    },
    {
        id: 49,
        slug: "nova-admin-dashboard-bigint-dmv",
        title: "SQL Server DMV + BigInt Serialization ใน Node.js — Dashboard พัง เพราะ JSON ไม่รู้จัก BigInt",
        subtitle: "ดึง DMV metrics ได้ถูกต้อง แต่ส่ง JSON ไป frontend แล้ว error — เพราะ BigInt ไม่ serialize ได้",
        tags: ["SQL Server", "Node.js", "TypeScript", "Nova"],
        date: "2026",
        readTime: "3 min",
        heroImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
        heroCaption: "SQL Server DMV (Dynamic Management Views) — ข้อมูล performance realtime ที่ DBA ใช้",
        sections: [
            {
                heading: "Context",
                body: `Nova Admin Dashboard ดึง SQL Server performance metrics จาก DMVs:\n- sys.dm_os_sys_memory (memory usage)\n- sys.dm_exec_requests (active queries)\n- sys.dm_os_wait_stats (wait statistics)\n- sys.dm_io_virtual_file_stats (disk I/O)\n\nใช้ข้อมูลเหล่านี้แสดง health dashboard แบบ realtime`,
            },
            {
                heading: "ปัญหา: BigInt ไม่ serialize เป็น JSON",
                body: `DMV columns เช่น pages_kb, io_stall มักเป็น BIGINT\nPrisma $queryRaw คืนค่าเป็น JavaScript BigInt\n\nพอทำ JSON.stringify() → error:\nTypeError: Do not know how to serialize a BigInt\n\nเพราะ JSON spec ไม่รองรับ BigInt — มีแค่ Number ที่มี precision จำกัด`,
                isCallout: false,
            },
            {
                heading: "Fix: แปลง BigInt ก่อน return",
                body: `// Helper ที่ใช้ทั่วทั้ง project\nfunction serializeBigInt(obj: any): any {\n  if (obj === null || obj === undefined) return obj\n  if (typeof obj === 'bigint') return Number(obj)\n  if (Array.isArray(obj)) return obj.map(serializeBigInt)\n  if (typeof obj === 'object') {\n    return Object.fromEntries(\n      Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)])\n    )\n  }\n  return obj\n}\n\n// ใช้หลัง $queryRaw ทุกครั้ง\nconst raw = await prisma.$queryRaw\`SELECT ...\`\nreturn serializeBigInt(raw)`,
            },
            {
                heading: "Context switch bug ซ้อนอีกชั้น",
                body: `DMV query บางตัวดึงข้อมูลจากหลาย database พร้อมกัน\nใส่ USE [CartonSystem] ไว้ใน query → connection context เปลี่ยน\n→ session table ใน nova_platform ถูก query ในบริบท CartonSystem\n→ "Invalid object name 'sessions'"\n\nFix: ใช้ database prefix แทน USE ทุกตัว\nFROM [CartonSystem].sys.tables แทน USE [CartonSystem]; FROM sys.tables`,
                isCallout: true,
            },
            {
                heading: "Key Learning",
                body: `Prisma $queryRaw คืน BigInt สำหรับ BIGINT columns เสมอ\nต้องมี serialization layer ก่อน ส่ง HTTP response ทุกครั้ง\n\nDMV queries มักดึงข้อมูลจากหลาย database → ห้ามใช้ USE statement\nใช้ 3-part naming: [database].[schema].[table] ตลอด`,
                isCallout: true,
            },
        ],
    },

    {
        id: 48,
        slug: "windows-server-permission-inheritance-break",
        title: "NTFS Permission เพี้ยนเพราะ inheritance ถูกตัด",
        subtitle: "ให้สิทธิ์แล้ว user ยังเข้าไม่ได้ — เพราะ folder ไม่ inherit permission จาก parent",
        tags: ["Windows Server", "Security", "File Server"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `ตั้ง permission ให้ user แล้ว แต่ยัง access folder ไม่ได้`,
            },
            {
                heading: "สาเหตุ",
                body: `Folder มีการ Disable inheritance ทำให้ permission จาก parent ไม่ถูก apply`,
            },
            {
                heading: "Fix",
                body: `Right-click folder → Properties → Security → Advanced\n\nEnable inheritance หรือ add permission ใหม่ให้ครบ`,
            },
            {
                heading: "Key Learning",
                body: `Permission issue ต้องดู inheritance เสมอ ไม่ใช่ดูแค่ ACL ปัจจุบัน`,
                isCallout: true,
            },
        ],
    },
    {
        id: 49,
        slug: "dns-internal-vs-external-resolution",
        title: "DNS resolve ได้แต่ ping ไม่ได้ เพราะ internal DNS ชี้ผิด",
        subtitle: "nslookup ได้ IP แต่เป็น IP ภายในที่ unreachable",
        tags: ["DNS", "Networking"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `nslookup domain ได้ IP แต่ ping ไม่ได้`,
            },
            {
                heading: "สาเหตุ",
                body: `Internal DNS record ชี้ไป IP private ที่ access ไม่ได้จาก client`,
            },
            {
                heading: "Fix",
                body: `ตรวจ DNS zone และ split-brain DNS configuration`,
            },
            {
                heading: "Key Learning",
                body: `DNS ถูกไม่ได้แปลว่า network ใช้งานได้ — ต้องดูว่า IP ที่ resolve ถูก route ได้จริง`,
                isCallout: true,
            },
        ],
    },
    {
        id: 50,
        slug: "ad-account-lockout-root-cause",
        title: "Account lockout ซ้ำๆ เพราะ service ใช้ password เก่า",
        subtitle: "user เปลี่ยน password แล้ว แต่ account ยังโดน lock ทุก 5 นาที",
        tags: ["Active Directory", "Security"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `Account ถูก lock ซ้ำๆ แม้ user login ถูก`,
            },
            {
                heading: "สาเหตุ",
                body: `มี service, scheduled task หรือ mapped drive ที่ยังใช้ password เก่า`,
            },
            {
                heading: "วิธีตรวจสอบ",
                body: `Event Viewer → Security → Event ID 4740`,
            },
            {
                heading: "Key Learning",
                body: `Account lock ไม่ใช่ user พิมพ์ผิดเสมอ — ต้อง trace source ของ request`,
                isCallout: true,
            },
        ],
    },
    {
        id: 51,
        slug: "vpn-connected-but-no-internet-route",
        title: "VPN ต่อได้แต่ใช้งานไม่ได้ เพราะ route ไม่ถูก",
        subtitle: "connected แต่เข้า resource ไม่ได้ — เพราะ missing route",
        tags: ["VPN", "Networking"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `VPN connected แต่ ping network ภายในไม่ได้`,
            },
            {
                heading: "สาเหตุ",
                body: `ไม่มี route ไป subnet ภายใน หรือ split tunnel config ผิด`,
            },
            {
                heading: "Fix",
                body: `ตรวจ routing table (route print / ip route)\nเพิ่ม route หรือแก้ VPN config`,
            },
            {
                heading: "Key Learning",
                body: `VPN connect ≠ network ใช้งานได้ ต้องตรวจ route เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 52,
        slug: "sql-server-tempdb-full-impact",
        title: "TempDB เต็มทำให้ query ทั้งระบบช้า",
        subtitle: "ระบบช้าทั้ง server แต่ CPU/Memory ปกติ — เพราะ tempdb เต็ม",
        tags: ["SQL Server", "Performance"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `Query ช้าทั้งระบบ`,
            },
            {
                heading: "สาเหตุ",
                body: `TempDB เต็มหรือ auto-grow ช้า`,
            },
            {
                heading: "Fix",
                body: `เพิ่ม size tempdb และตั้ง auto-growth ที่เหมาะสม`,
            },
            {
                heading: "Key Learning",
                body: `TempDB คือ critical component ของ SQL Server — ต้อง monitor เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 53,
        slug: "firewall-block-port-but-ping-ok",
        title: "Ping ได้แต่เข้า service ไม่ได้ เพราะ firewall block port",
        subtitle: "network ดูเหมือนปกติ แต่ service ใช้งานไม่ได้",
        tags: ["Firewall", "Networking"],
        date: "2026",
        readTime: "2 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `Ping ได้ แต่เข้าเว็บ/DB ไม่ได้`,
            },
            {
                heading: "สาเหตุ",
                body: `Firewall block port เช่น 80, 443, 1433`,
            },
            {
                heading: "Key Learning",
                body: `Ping ใช้ ICMP — ไม่เกี่ยวกับ TCP port`,
                isCallout: true,
            },
        ],
    },
    {
        id: 54,
        slug: "domain-gpo-not-applied",
        title: "GPO ไม่ apply เพราะ client ไม่ได้ contact DC",
        subtitle: "ตั้ง policy แล้วไม่ทำงาน — เพราะเครื่องไม่ได้ sync กับ Domain Controller",
        tags: ["Active Directory", "GPO"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `GPO ไม่ apply`,
            },
            {
                heading: "สาเหตุ",
                body: `Client ติดต่อ DC ไม่ได้ หรือ DNS ชี้ผิด`,
            },
            {
                heading: "Fix",
                body: `gpupdate /force\ngpresult /r`,
            },
            {
                heading: "Key Learning",
                body: `GPO พึ่งพา DNS + DC — ถ้า 2 อย่างนี้พัง policy จะไม่ทำงาน`,
                isCallout: true,
            },
        ],
    },
    {
        id: 55,
        slug: "disk-full-service-crash",
        title: "Disk เต็มทำให้ service ล่มโดยไม่แจ้งชัดเจน",
        subtitle: "service down แต่ไม่มี error — เพราะ write ไม่ได้",
        tags: ["Linux", "Windows", "Monitoring"],
        date: "2026",
        readTime: "2 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `Service ล่มแบบไม่มี error ชัดเจน`,
            },
            {
                heading: "สาเหตุ",
                body: `Disk เต็ม ทำให้ write log หรือ temp file ไม่ได้`,
            },
            {
                heading: "Key Learning",
                body: `Disk usage เป็น metric ที่ต้อง monitor ตลอด`,
                isCallout: true,
            },
        ],
    },
    {
        id: 56,
        slug: "time-sync-ntp-critical-system",
        title: "Time ไม่ตรงทำให้ระบบ auth และ log เพี้ยน",
        subtitle: "Login ไม่ได้ / log mismatch — เพราะ time server ไม่ sync",
        tags: ["NTP", "Security"],
        date: "2026",
        readTime: "2 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `Login fail หรือ log timestamp ไม่ตรง`,
            },
            {
                heading: "สาเหตุ",
                body: `เครื่องไม่ sync เวลา (NTP)`,
            },
            {
                heading: "Fix",
                body: `ตั้ง NTP server และ sync เวลา`,
            },
            {
                heading: "Key Learning",
                body: `Time เป็น dependency สำคัญของ security และ system integrity`,
                isCallout: true,
            },
        ],
    },
    {
        id: 57,
        slug: "incident-no-backup-data-loss-root-cause",
        title: "Incident จริง: ข้อมูลหายทั้งระบบเพราะ 'คิดว่ามี backup'",
        subtitle: "Backup job run ทุกวัน แต่ restore ไม่ได้ — เพราะไม่เคย test recovery",
        tags: ["Backup", "Incident", "Disaster Recovery"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "สถานการณ์จริง",
                body: `User ลบข้อมูลสำคัญใน network share\nIT มั่นใจว่ามี backup → เริ่ม restore\n\nแต่ restore ไม่ได้ — backup file เสีย และบาง job ไม่เคย run สำเร็จ`,
            },
            {
                heading: "Root Cause",
                body: `- ไม่มีการ test restore เลย\n- Backup success = แค่ job ไม่ error ไม่ใช่ data usable\n- ไม่มี monitoring alert เมื่อ backup fail`,
            },
            {
                heading: "Impact",
                body: `ข้อมูล production หายถาวร\nต้องให้ user re-create เอกสารเอง`,
            },
            {
                heading: "Fix (ระดับองค์กร)",
                body: `1. ทำ Restore Test ทุกเดือน (mandatory)\n2. แยก Backup vs Restore validation\n3. มี alert ถ้า backup fail\n4. ทำ DR drill (simulate disaster)`,
            },
            {
                heading: "Key Learning",
                body: `Backup ที่ไม่เคย restore = ไม่มีค่า\n\nองค์กรที่ mature จะวัด "Restore Success Rate" ไม่ใช่ Backup Success`,
                isCallout: true,
            },
        ],
    },
    {
        id: 58,
        slug: "single-point-of-failure-network-design",
        title: "Network ล่มทั้งองค์กรเพราะ Single Point of Failure",
        subtitle: "Router ตัวเดียวพัง = ทุกระบบหยุด แม้ server ยังปกติ",
        tags: ["Networking", "Architecture", "Incident"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "สถานการณ์",
                body: `Internet และระบบภายในล่มทั้งบริษัท\nServer ยังทำงาน แต่ user ใช้งานไม่ได้เลย`,
            },
            {
                heading: "Root Cause",
                body: `Router มีแค่ตัวเดียว (Single Point of Failure)\nไม่มี failover`,
            },
            {
                heading: "Impact",
                body: `- ระบบ ERP ใช้งานไม่ได้\n- user ทั้งองค์กรหยุดงาน`,
            },
            {
                heading: "Fix (ระดับ architecture)",
                body: `- ใช้ Dual WAN + Load Balance\n- ทำ Router redundancy (VRRP / Failover)\n- แยก network critical ออกจาก internet`,
            },
            {
                heading: "Key Learning",
                body: `Infrastructure ที่ไม่มี redundancy = ไม่ใช่ production-grade\n\nDowntime ไม่ได้เกิดจาก bug เสมอ แต่เกิดจาก design`,
                isCallout: true,
            },
        ],
    },
    {
        id: 59,
        slug: "no-monitoring-no-visibility-problem",
        title: "ไม่มี Monitoring = แก้ปัญหาช้า 10 เท่า",
        subtitle: "รู้ปัญหาจาก user complain ไม่ใช่ system alert",
        tags: ["Monitoring", "Operations"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "สถานการณ์",
                body: `User แจ้งระบบช้า\nIT ไม่มี metric ย้อนหลังดู`,
            },
            {
                heading: "Root Cause",
                body: `ไม่มี monitoring system (CPU, disk, network, service)\nหรือมีแต่ไม่ได้ใช้งานจริง`,
            },
            {
                heading: "Impact",
                body: `- แก้ปัญหาจาก "เดา"\n- ใช้เวลานานมาก`,
            },
            {
                heading: "Fix",
                body: `- ติดตั้ง monitoring (LibreNMS, Prometheus)\n- ตั้ง alert threshold\n- เก็บ historical data`,
            },
            {
                heading: "Key Learning",
                body: `You can't fix what you can't see\n\nMonitoring คือ foundation ของ operations`,
                isCallout: true,
            },
        ],
    },
    {
        id: 60,
        slug: "human-error-production-impact",
        title: "Human Error: UPDATE ผิด WHERE ทำข้อมูล production พัง",
        subtitle: "คำสั่งเดียวกระทบทั้งระบบ เพราะไม่มี safeguard",
        tags: ["SQL Server", "Incident"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "สถานการณ์",
                body: `รัน UPDATE โดยลืม WHERE condition\nข้อมูลทั้ง table ถูกแก้`,
            },
            {
                heading: "Root Cause",
                body: `- ไม่มี transaction\n- ไม่มี approval process\n- ไม่มี rollback plan`,
            },
            {
                heading: "Impact",
                body: `ข้อมูลเสียทั้งระบบ ต้อง restore`,
            },
            {
                heading: "Fix",
                body: `- ใช้ BEGIN TRANSACTION ทุกครั้ง\n- SELECT ก่อน UPDATE\n- จำกัด permission (ไม่ให้แก้ production ตรง)`,
            },
            {
                heading: "Key Learning",
                body: `Production system ต้องออกแบบให้ "ป้องกันคนพลาด" ไม่ใช่หวังว่า "คนจะไม่พลาด"`,
                isCallout: true,
            },
        ],
    },
    {
        id: 61,
        slug: "security-incident-no-access-control",
        title: "Security Incident: ทุกคนเข้าถึงทุก folder เพราะ permission ไม่แยก",
        subtitle: "Data exposure ไม่ใช่ hack แต่เกิดจาก config ผิด",
        tags: ["Security", "Compliance"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "สถานการณ์",
                body: `User เข้าถึงข้อมูลฝ่ายอื่นได้ทั้งหมด`,
            },
            {
                heading: "Root Cause",
                body: `- ใช้ Everyone full control\n- ไม่มี role-based access`,
            },
            {
                heading: "Impact",
                body: `เสี่ยง data leakage และ audit fail`,
            },
            {
                heading: "Fix",
                body: `- ใช้ RBAC (Role-Based Access Control)\n- แยก folder ตาม department\n- audit permission`,
            },
            {
                heading: "Key Learning",
                body: `Security problem ส่วนใหญ่ไม่ได้มาจาก hacker แต่มาจาก config ภายใน`,
                isCallout: true,
            },
        ],
    },
    {
        id: 62,
        slug: "no-documentation-risk",
        title: "ไม่มี Documentation = Risk สูงระดับองค์กร",
        subtitle: "ระบบทำงานได้ แต่ไม่มีใครรู้ว่ามันทำงานยังไง",
        tags: ["Process", "Management"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "สถานการณ์",
                body: `ระบบสำคัญมีแค่คนเดียวที่รู้ config`,
            },
            {
                heading: "Impact",
                body: `- ถ้าคนนั้นลาออก → ระบบเสี่ยงล่ม\n- แก้ปัญหาช้า`,
            },
            {
                heading: "Fix",
                body: `- ทำ system documentation\n- runbook\n- knowledge transfer`,
            },
            {
                heading: "Key Learning",
                body: `ระบบที่ไม่มี documentation = technical debt ระดับองค์กร`,
                isCallout: true,
            },
        ],
    },
    {
        id: 63,
        slug: "capacity-planning-failure",
        title: "Capacity Planning พลาดทำให้ระบบล่มโดยไม่คาดคิด",
        subtitle: "Disk เต็ม / CPU เต็ม เพราะไม่เคย forecast",
        tags: ["Planning", "Infrastructure"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "สถานการณ์",
                body: `ระบบล่มเพราะ resource เต็ม`,
            },
            {
                heading: "Root Cause",
                body: `ไม่มี capacity planning`,
            },
            {
                heading: "Fix",
                body: `- ทำ trend analysis\n- วางแผนล่วงหน้า`,
            },
            {
                heading: "Key Learning",
                body: `ระบบ production ต้องคิด "อนาคต" ไม่ใช่แค่ "ปัจจุบัน"`,
                isCallout: true,
            },
        ],
    },
    {
        id: 64,
        slug: "incident-response-no-process",
        title: "Incident Response ไม่มี process ทำให้ downtime นานขึ้น",
        subtitle: "ทุกคนแก้ปัญหาเอง ไม่มี coordination",
        tags: ["Incident", "Management"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "สถานการณ์",
                body: `ระบบล่ม แต่ทีมทำงานไม่เป็นระบบ`,
            },
            {
                heading: "Root Cause",
                body: `ไม่มี incident response plan`,
            },
            {
                heading: "Fix",
                body: `- define role (incident commander)\n- communication plan\n- post-mortem`,
            },
            {
                heading: "Key Learning",
                body: `Incident ที่ดีไม่ใช่ "ไม่มี downtime"\nแต่คือ "recover ได้เร็ว"`,
                isCallout: true,
            },
        ],
    },
    {
        id: 65,
        slug: "backup-without-offsite-risk",
        title: "Backup อยู่ที่เดียวกับ production = เสี่ยงเท่ากัน",
        subtitle: "NAS เสีย = backup หายพร้อม data",
        tags: ["Backup", "Disaster Recovery"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `Backup อยู่ NAS เดียวกับระบบ`,
            },
            {
                heading: "Risk",
                body: `ไฟไหม้ / ransomware → หายหมด`,
            },
            {
                heading: "Fix",
                body: `- offsite backup\n- cloud backup`,
            },
            {
                heading: "Key Learning",
                body: `Backup ต้องอยู่คนละ location เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 66,
        slug: "overengineering-vs-practical-solution",
        title: "Overengineering: ระบบซับซ้อนเกินจำเป็นทำให้ดูแลยาก",
        subtitle: "เทคโนโลยีเยอะ ≠ ระบบดี",
        tags: ["Architecture", "Engineering"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `ระบบมีหลาย layer เกินจำเป็น`,
            },
            {
                heading: "Impact",
                body: `debug ยาก / maintain ยาก`,
            },
            {
                heading: "Key Learning",
                body: `Simple system > Complex system\n\nความง่ายคือความแข็งแรง`,
                isCallout: true,
            },
        ],
    },
    {
        id: 67,
        slug: "it-as-cost-center-vs-business-enabler",
        title: "IT ไม่ใช่ Cost Center แต่เป็น Business Enabler",
        subtitle: "องค์กรที่มอง IT เป็นแค่ค่าใช้จ่าย จะเจอ downtime แพงกว่าเสมอ",
        tags: ["Management", "Strategy"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "Insight",
                body: `หลายองค์กรลดงบ IT เพื่อประหยัดต้นทุน\nแต่ผลลัพธ์คือ downtime, data loss, security risk`,
            },
            {
                heading: "Reality",
                body: `Downtime 1 ชั่วโมง อาจเสียมากกว่าค่า IT ทั้งปี`,
            },
            {
                heading: "Key Learning",
                body: `IT ที่ดีไม่ใช่แค่ "ทำให้ระบบใช้ได้"\nแต่ต้อง "ทำให้ธุรกิจเดินต่อได้โดยไม่สะดุด"`,
                isCallout: true,
            },
        ],
    },
    {
        id: 68,
        slug: "no-root-cause-analysis-repeat-incident",
        title: "Incident เกิดซ้ำเพราะไม่ทำ Root Cause Analysis",
        subtitle: "แก้ปลายเหตุเร็ว แต่ปัญหากลับมาอีก",
        tags: ["Incident", "Process"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `ระบบล่ม → restart → ใช้งานได้ → จบ\nแต่ล่มอีกใน 2 วัน`,
            },
            {
                heading: "Root Cause",
                body: `ไม่เคยวิเคราะห์ root cause จริง`,
            },
            {
                heading: "Fix",
                body: `ทำ post-mortem ทุก incident:\n- What happened\n- Why it happened\n- How to prevent`,
            },
            {
                heading: "Key Learning",
                body: `Fix ที่ไม่แก้ root cause = delay ของปัญหา`,
                isCallout: true,
            },
        ],
    },
    {
        id: 69,
        slug: "lack-of-change-management-risk",
        title: "ไม่มี Change Management = Production เสี่ยงตลอดเวลา",
        subtitle: "แก้ config เล็กๆ แต่กระทบทั้งระบบ",
        tags: ["Process", "ITIL"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `แก้ config เล็กน้อย → ระบบล่ม`,
            },
            {
                heading: "Root Cause",
                body: `ไม่มี change approval / rollback plan`,
            },
            {
                heading: "Fix",
                body: `- Change request\n- Approval\n- Test ก่อน deploy\n- Rollback plan`,
            },
            {
                heading: "Key Learning",
                body: `Production change ต้อง "ควบคุม" ไม่ใช่ "ลองดู"`,
                isCallout: true,
            },
        ],
    },
    {
        id: 70,
        slug: "knowledge-silo-risk",
        title: "Knowledge Silo: ความรู้กระจุกตัว = ความเสี่ยงองค์กร",
        subtitle: "มีคนเดียวรู้ระบบ = Single Point of Failure",
        tags: ["Management", "Risk"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `มี engineer คนเดียวรู้ระบบ critical`,
            },
            {
                heading: "Impact",
                body: `ลาออก = system risk`,
            },
            {
                heading: "Fix",
                body: `- Documentation\n- Cross training\n- Knowledge sharing`,
            },
            {
                heading: "Key Learning",
                body: `Knowledge ต้องกระจาย ไม่ใช่เก็บไว้ที่คนเดียว`,
                isCallout: true,
            },
        ],
    },
    {
        id: 71,
        slug: "no-sla-no-expectation",
        title: "ไม่มี SLA ทำให้ expectation ไม่ตรงกัน",
        subtitle: "User คิดว่าระบบต้องไม่ล่ม แต่ IT ไม่มี commitment",
        tags: ["Management", "Service"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `User คาดหวัง uptime 100%`,
            },
            {
                heading: "Reality",
                body: `ไม่มี system ไหน 100% uptime`,
            },
            {
                heading: "Fix",
                body: `กำหนด SLA เช่น 99.9% uptime`,
            },
            {
                heading: "Key Learning",
                body: `Expectation ต้อง define ไม่งั้น conflict แน่นอน`,
                isCallout: true,
            },
        ],
    },
    {
        id: 72,
        slug: "alert-fatigue-problem",
        title: "Alert เยอะเกินไปทำให้ไม่สนใจ alert",
        subtitle: "สุดท้าย alert จริงก็ถูก ignore",
        tags: ["Monitoring", "Operations"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `Alert เด้งทั้งวัน`,
            },
            {
                heading: "Impact",
                body: `ทีมเริ่ม ignore alert`,
            },
            {
                heading: "Fix",
                body: `- ปรับ threshold\n- ลด noise\n- focus critical alert`,
            },
            {
                heading: "Key Learning",
                body: `Better no alert than useless alert`,
                isCallout: true,
            },
        ],
    },
    {
        id: 73,
        slug: "technical-debt-accumulation",
        title: "Technical Debt: หนี้ที่มองไม่เห็นแต่ส่งผลระยะยาว",
        subtitle: "ระบบยังทำงานได้ แต่เริ่มช้าและพังง่าย",
        tags: ["Engineering", "Architecture"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `ระบบ patch เพิ่มเรื่อยๆ ไม่มี refactor`,
            },
            {
                heading: "Impact",
                body: `- debug ยาก\n- change ยาก`,
            },
            {
                heading: "Fix",
                body: `- refactor\n- redesign\n- cleanup`,
            },
            {
                heading: "Key Learning",
                body: `Technical debt ไม่เคยหายไปเอง\nมันจะ "คิดดอกเบี้ย" เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 74,
        slug: "lack-of-automation-risk",
        title: "Manual Process = Error Rate สูง",
        subtitle: "ทำมือซ้ำๆ = เสี่ยงผิดพลาด",
        tags: ["Automation", "DevOps"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `ทำ task ซ้ำๆ ด้วยมือ`,
            },
            {
                heading: "Impact",
                body: `เกิด human error`,
            },
            {
                heading: "Fix",
                body: `automation script / pipeline`,
            },
            {
                heading: "Key Learning",
                body: `Anything manual → eventually fail`,
                isCallout: true,
            },
        ],
    },
    {
        id: 75,
        slug: "no-logging-no-debugging",
        title: "ไม่มี Logging = Debug ไม่ได้",
        subtitle: "ระบบพังแต่ไม่มีข้อมูลว่าเกิดอะไรขึ้น",
        tags: ["Logging", "Debugging"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `Error เกิด แต่ไม่มี log`,
            },
            {
                heading: "Impact",
                body: `แก้ปัญหาช้ามาก`,
            },
            {
                heading: "Fix",
                body: `- structured logging\n- central log`,
            },
            {
                heading: "Key Learning",
                body: `No logs = no truth`,
                isCallout: true,
            },
        ],
    },
    {
        id: 76,
        slug: "system-without-testing-risk",
        title: "Deploy โดยไม่ test = gamble กับ production",
        subtitle: "code ทำงานใน dev แต่พังใน production",
        tags: ["Testing", "DevOps"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `deploy แล้วพัง`,
            },
            {
                heading: "Root Cause",
                body: `ไม่มี test environment`,
            },
            {
                heading: "Fix",
                body: `- staging environment\n- automated test`,
            },
            {
                heading: "Key Learning",
                body: `Test ไม่ได้ทำให้มั่นใจ 100%\nแต่ไม่ test = เสี่ยง 100%`,
                isCallout: true,
            },
        ],
    },
    {
        id: 77,
        slug: "ransomware-incident-no-immutable-backup",
        title: "Ransomware ลบทั้ง production + backup เพราะไม่มี Immutable",
        subtitle: "มี backup แต่โดนเข้ารหัสไปพร้อมกัน — เพราะอยู่ domain เดียวกัน",
        tags: ["Security", "Backup", "Incident"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "สถานการณ์จริง",
                body: `Ransomware เข้าเครื่อง user → privilege escalate → เข้า file server และ NAS\n\nข้อมูล production และ backup ถูก encrypt ทั้งหมด`,
            },
            {
                heading: "Root Cause",
                body: `- Backup อยู่ใน network เดียวกัน\n- ไม่มี immutable / offline backup\n- ใช้ credential เดียวกัน`,
            },
            {
                heading: "Fix (ระดับองค์กร)",
                body: `- Immutable backup (WORM / Object Lock)\n- Offline backup (air-gap)\n- แยก credential`,
            },
            {
                heading: "Key Learning",
                body: `Backup ที่ attacker ลบได้ = ไม่ใช่ backup\n\nต้อง assume ว่า attacker "เข้าถึง network ได้แล้ว"`,
                isCallout: true,
            },
        ],
    },
    {
        id: 78,
        slug: "privilege-creep-security-risk",
        title: "Privilege Creep: สิทธิ์สะสมจนกลายเป็นช่องโหว่",
        subtitle: "user ได้สิทธิ์เพิ่มเรื่อยๆ จนเข้าถึงข้อมูลที่ไม่ควร",
        tags: ["Security", "Compliance"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `user ย้ายตำแหน่ง แต่สิทธิ์เดิมยังอยู่`,
            },
            {
                heading: "Impact",
                body: `เข้าถึงข้อมูล sensitive ได้`,
            },
            {
                heading: "Fix",
                body: `- periodic access review\n- least privilege`,
            },
            {
                heading: "Key Learning",
                body: `Security ไม่ใช่แค่ "ให้สิทธิ์" แต่ต้อง "เอาสิทธิ์ออก" ด้วย`,
                isCallout: true,
            },
        ],
    },
    {
        id: 79,
        slug: "shadow-it-risk",
        title: "Shadow IT: user ใช้ระบบนอกโดยไม่ผ่าน IT",
        subtitle: "ข้อมูลบริษัทไปอยู่ใน Google Drive ส่วนตัว",
        tags: ["Security", "Governance"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "สถานการณ์",
                body: `user ใช้ cloud storage ส่วนตัวแทนระบบองค์กร`,
            },
            {
                heading: "Impact",
                body: `- data leak\n- ไม่มี control`,
            },
            {
                heading: "Fix",
                body: `- provide official tools\n- enforce policy`,
            },
            {
                heading: "Key Learning",
                body: `ถ้า IT ให้เครื่องมือไม่พอ user จะหาทางเอง`,
                isCallout: true,
            },
        ],
    },
    {
        id: 80,
        slug: "over-reliance-on-single-vendor",
        title: "Vendor Lock-in ทำให้องค์กรเสี่ยง",
        subtitle: "ระบบ critical พึ่ง vendor เดียว → downtime ยาว",
        tags: ["Strategy", "Architecture"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `ระบบทั้งหมดอยู่บน vendor เดียว`,
            },
            {
                heading: "Impact",
                body: `vendor ล่ม → ทุกอย่างล่ม`,
            },
            {
                heading: "Fix",
                body: `- multi-vendor\n- exit strategy`,
            },
            {
                heading: "Key Learning",
                body: `Design ต้องคิด worst-case เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 81,
        slug: "no-audit-trail-risk",
        title: "ไม่มี Audit Trail = ตรวจสอบย้อนหลังไม่ได้",
        subtitle: "ข้อมูลถูกแก้ แต่ไม่รู้ว่าใครทำ",
        tags: ["Security", "Compliance"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `data เปลี่ยน แต่ trace ไม่ได้`,
            },
            {
                heading: "Impact",
                body: `audit fail / trust loss`,
            },
            {
                heading: "Fix",
                body: `- enable audit log\n- log user action`,
            },
            {
                heading: "Key Learning",
                body: `System ที่ไม่มี audit = ไม่มี accountability`,
                isCallout: true,
            },
        ],
    },
    {
        id: 82,
        slug: "backup-window-not-meeting-rpo",
        title: "Backup window ไม่ตรง RPO ทำให้ data loss เกินรับได้",
        subtitle: "backup วันละครั้ง แต่ธุรกิจต้องการไม่เกิน 1 ชั่วโมง",
        tags: ["Backup", "Business"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `backup ทุก 24 ชม.`,
            },
            {
                heading: "Impact",
                body: `data loss ได้ 24 ชม.`,
            },
            {
                heading: "Fix",
                body: `- incremental backup\n- replication`,
            },
            {
                heading: "Key Learning",
                body: `Backup strategy ต้อง align กับ business requirement (RPO/RTO)`,
                isCallout: true,
            },
        ],
    },
    {
        id: 83,
        slug: "no-capacity-headroom-risk",
        title: "ไม่มี Capacity Headroom ทำให้ scale ไม่ทัน",
        subtitle: "traffic spike → system ล่มทันที",
        tags: ["Infrastructure", "Scaling"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `resource ใช้ 90-100% ตลอด`,
            },
            {
                heading: "Impact",
                body: `ไม่มี buffer รองรับ spike`,
            },
            {
                heading: "Fix",
                body: `- reserve capacity\n- auto scale`,
            },
            {
                heading: "Key Learning",
                body: `Production ต้องมี headroom เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 84,
        slug: "no-segmentation-flat-network-risk",
        title: "Flat Network ทำให้ attacker เคลื่อนที่ได้ง่าย",
        subtitle: "เครื่อง user compromise → เข้าถึง server ได้ทันที",
        tags: ["Security", "Networking"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `network ไม่มี segmentation`,
            },
            {
                heading: "Impact",
                body: `lateral movement ง่าย`,
            },
            {
                heading: "Fix",
                body: `- VLAN segmentation\n- firewall rules`,
            },
            {
                heading: "Key Learning",
                body: `Security ไม่ใช่แค่กันข้างนอก แต่ต้องกันภายในด้วย`,
                isCallout: true,
            },
        ],
    },
    {
        id: 85,
        slug: "no-runbook-during-incident",
        title: "ไม่มี Runbook ทำให้แก้ Incident แบบเดาสุ่ม",
        subtitle: "ทุกครั้งที่ล่มต้องคิดใหม่หมด",
        tags: ["Operations", "Incident"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `incident เกิด แต่ไม่มี guideline`,
            },
            {
                heading: "Fix",
                body: `- สร้าง runbook\n- step-by-step recovery`,
            },
            {
                heading: "Key Learning",
                body: `Runbook ลดเวลาแก้ปัญหาได้มหาศาล`,
                isCallout: true,
            },
        ],
    },
    {
        id: 86,
        slug: "misaligned-it-and-business-goals",
        title: "IT กับ Business ไม่ align ทำให้ลงทุนผิดจุด",
        subtitle: "ลงทุน infra แต่ไม่แก้ pain point จริง",
        tags: ["Strategy", "Management"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "ปัญหา",
                body: `IT focus technical แต่ business มีปัญหาอื่น`,
            },
            {
                heading: "Impact",
                body: `ลงทุนไม่เกิด ROI`,
            },
            {
                heading: "Fix",
                body: `- เข้าใจ business process\n- prioritize impact`,
            },
            {
                heading: "Key Learning",
                body: `IT ที่ดีต้องเข้าใจ business ไม่ใช่แค่ technology`,
                isCallout: true,
            },
        ],
    },
    {
        id: 87,
        slug: "sql-server-connection-pool-exhausted",
        title: "API ล่มเพราะ SQL Connection Pool เต็ม",
        subtitle: "ไม่มี error ชัดเจน แต่ request ค้าง — เพราะ connection ไม่ถูก release",
        tags: ["SQL Server", "Node.js", "Production"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `API ช้าลงเรื่อยๆ → สุดท้ายค้าง\nCPU ปกติ แต่ request ไม่ตอบ`,
            },
            {
                heading: "Root Cause",
                body: `Connection ถูกเปิดแต่ไม่ถูก close\npool เต็ม → request ใหม่รอคิว`,
            },
            {
                heading: "วิธีตรวจสอบ",
                body: `SELECT * FROM sys.dm_exec_sessions\nดูจำนวน connection ค้าง`,
            },
            {
                heading: "Fix",
                body: `- ensure close connection\n- ใช้ connection pool ถูกต้อง`,
            },
            {
                heading: "Key Learning",
                body: `ระบบไม่ล่มทันที แต่จะ "ค่อยๆ ตาย" — อันตรายกว่า crash`,
                isCallout: true,
            },
        ],
    },
    {
        id: 88,
        slug: "windows-server-dns-misconfig-domain-issue",
        title: "Domain Login ช้าเพราะ DNS ชี้ไป public DNS",
        subtitle: "เครื่อง join domain แต่ใช้ 8.8.8.8 → auth ช้าและ fail",
        tags: ["Windows Server", "Active Directory"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `Login domain ช้ามาก หรือบางครั้งเข้าไม่ได้`,
            },
            {
                heading: "Root Cause",
                body: `Client ใช้ DNS เป็น 8.8.8.8 แทน AD DNS`,
            },
            {
                heading: "Fix",
                body: `ตั้ง DNS ให้ชี้ Domain Controller เท่านั้น`,
            },
            {
                heading: "Key Learning",
                body: `AD พังส่วนใหญ่เริ่มจาก DNS`,
                isCallout: true,
            },
        ],
    },
    {
        id: 89,
        slug: "docker-disk-full-log-growth",
        title: "Docker disk เต็มเพราะ log container โตไม่จำกัด",
        subtitle: "container ปกติ แต่ disk เต็มเพราะ json.log",
        tags: ["Docker", "Linux"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `Disk เต็มแบบไม่รู้สาเหตุ`,
            },
            {
                heading: "Root Cause",
                body: `Docker log (/var/lib/docker/containers/*.log) โตหลาย GB`,
            },
            {
                heading: "Fix",
                body: `ตั้ง log rotation:\n--log-opt max-size=10m\n--log-opt max-file=3`,
            },
            {
                heading: "Key Learning",
                body: `Default Docker = ไม่จำกัด log`,
                isCallout: true,
            },
        ],
    },
    {
        id: 90,
        slug: "sql-deadlock-production-issue",
        title: "Deadlock ทำให้ transaction fail แบบสุ่ม",
        subtitle: "บาง request สำเร็จ บาง request fail — เพราะ lock ชนกัน",
        tags: ["SQL Server", "Performance"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `API error เป็นช่วงๆ`,
            },
            {
                heading: "Root Cause",
                body: `Transaction lock resource คนละ order → deadlock`,
            },
            {
                heading: "Fix",
                body: `- ใช้ consistent order\n- retry logic`,
            },
            {
                heading: "Key Learning",
                body: `Deadlock ไม่ใช่ bug แต่เป็น behavior ของ DB`,
                isCallout: true,
            },
        ],
    },
    {
        id: 91,
        slug: "nas-permission-cache-issue",
        title: "แก้ permission แล้วแต่ยังเข้าไม่ได้ เพราะ cache",
        subtitle: "NAS / Windows cache สิทธิ์ไว้ ทำให้ผลไม่อัปเดตทันที",
        tags: ["NAS", "Windows"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `แก้ permission แล้ว user ยังเข้าไม่ได้`,
            },
            {
                heading: "Root Cause",
                body: `SMB session cache permission`,
            },
            {
                heading: "Fix",
                body: `logoff/logon ใหม่ หรือ restart service`,
            },
            {
                heading: "Key Learning",
                body: `Permission ไม่ได้ apply real-time เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 92,
        slug: "ssl-certificate-expired-downtime",
        title: "SSL หมดอายุทำให้ระบบใช้งานไม่ได้ทันที",
        subtitle: "เว็บเข้าไม่ได้เพราะ certificate expire",
        tags: ["SSL", "Security"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `User เข้าเว็บไม่ได้`,
            },
            {
                heading: "Root Cause",
                body: `SSL certificate หมดอายุ`,
            },
            {
                heading: "Fix",
                body: `renew certificate + ตั้ง auto-renew`,
            },
            {
                heading: "Key Learning",
                body: `Certificate expiry = predictable incident ที่ป้องกันได้`,
                isCallout: true,
            },
        ],
    },
    {
        id: 93,
        slug: "high-cpu-single-process-nodejs",
        title: "CPU 100% เพราะ infinite loop ใน Node.js",
        subtitle: "process เดียวกิน CPU ทั้งเครื่อง",
        tags: ["Node.js", "Performance"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `CPU 100% ตลอด`,
            },
            {
                heading: "Root Cause",
                body: `loop ไม่มี exit condition`,
            },
            {
                heading: "Fix",
                body: `debug stack trace และแก้ logic`,
            },
            {
                heading: "Key Learning",
                body: `Bug เล็กใน code = impact ใหญ่ใน production`,
                isCallout: true,
            },
        ],
    },
    {
        id: 94,
        slug: "network-latency-intermittent-issue",
        title: "ระบบช้าเป็นช่วงๆ เพราะ latency network",
        subtitle: "ไม่ใช่ server ช้า แต่ network delay",
        tags: ["Networking", "Performance"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `บางช่วงเร็ว บางช่วงช้า`,
            },
            {
                heading: "Root Cause",
                body: `network congestion หรือ packet loss`,
            },
            {
                heading: "Fix",
                body: `monitor latency / packet loss`,
            },
            {
                heading: "Key Learning",
                body: `Performance problem ไม่ได้อยู่ที่ server เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 95,
        slug: "windows-update-break-service",
        title: "Windows Update ทำ service พัง",
        subtitle: "update แล้วระบบใช้งานไม่ได้",
        tags: ["Windows", "Incident"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `service หยุดหลัง update`,
            },
            {
                heading: "Root Cause",
                body: `dependency เปลี่ยน`,
            },
            {
                heading: "Fix",
                body: `rollback update`,
            },
            {
                heading: "Key Learning",
                body: `Update ต้อง test ก่อนเสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 96,
        slug: "file-locking-multi-user-problem",
        title: "ไฟล์ใช้งานร่วมกันแล้ว save ไม่ได้เพราะ lock",
        subtitle: "multi-user access ทำให้ file conflict",
        tags: ["Windows", "File Server"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `save file ไม่ได้`,
            },
            {
                heading: "Root Cause",
                body: `file ถูก lock โดย user อื่น`,
            },
            {
                heading: "Fix",
                body: `identify user ที่ lock`,
            },
            {
                heading: "Key Learning",
                body: `File-based system ไม่เหมาะกับ concurrent user`,
                isCallout: true,
            },
        ],
    },
    {
        id: 97,
        slug: "sql-server-blocking-chain",
        title: "Query ช้าทั้งระบบเพราะ Blocking Chain",
        subtitle: "ไม่ได้ช้าเพราะ query แย่ แต่รอ lock จาก query อื่น",
        tags: ["SQL Server", "Performance"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `Query ช้าทั้งระบบ แต่ CPU ไม่สูง`,
            },
            {
                heading: "Root Cause",
                body: `มี query ตัวหนึ่ง lock resource แล้ว query อื่นรอ (blocking chain)`,
            },
            {
                heading: "วิธีตรวจสอบ",
                body: `sp_who2 หรือ sys.dm_exec_requests`,
            },
            {
                heading: "Fix",
                body: `kill session ที่ block หรือ optimize query`,
            },
            {
                heading: "Key Learning",
                body: `Slow system ≠ slow query เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 98,
        slug: "mikrotik-firewall-rule-order",
        title: "Firewall Rule ทำงานผิดเพราะลำดับ rule",
        subtitle: "rule ถูกต้องแต่ไม่ทำงาน เพราะถูก rule ก่อนหน้าจับไปแล้ว",
        tags: ["MikroTik", "Firewall"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `rule allow ไม่ทำงาน`,
            },
            {
                heading: "Root Cause",
                body: `rule deny อยู่ก่อน`,
            },
            {
                heading: "Fix",
                body: `จัดลำดับ rule ใหม่`,
            },
            {
                heading: "Key Learning",
                body: `Firewall = first match wins`,
                isCallout: true,
            },
        ],
    },
    {
        id: 99,
        slug: "hypervisor-overcommit-memory",
        title: "VM ช้าเพราะ overcommit RAM",
        subtitle: "host มี RAM ไม่พอ แต่รัน VM เยอะเกิน",
        tags: ["Virtualization", "Performance"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `VM ทุกตัวช้า`,
            },
            {
                heading: "Root Cause",
                body: `RAM จริงไม่พอ แต่ allocate ให้ VM เยอะ`,
            },
            {
                heading: "Fix",
                body: `ลด VM หรือเพิ่ม RAM`,
            },
            {
                heading: "Key Learning",
                body: `Overcommit มากไป = performance collapse`,
                isCallout: true,
            },
        ],
    },
    {
        id: 100,
        slug: "dns-cache-poison-local-machine",
        title: "เครื่องเข้าเว็บผิดเพราะ DNS cache เพี้ยน",
        subtitle: "domain ถูก แต่ resolve ไป IP ผิด",
        tags: ["DNS", "Windows"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `เข้าเว็บไปอีก server`,
            },
            {
                heading: "Root Cause",
                body: `DNS cache เก่า`,
            },
            {
                heading: "Fix",
                body: `ipconfig /flushdns`,
            },
            {
                heading: "Key Learning",
                body: `DNS cache เป็น source ของ bug ที่มองไม่เห็น`,
                isCallout: true,
            },
        ],
    },
    {
        id: 101,
        slug: "sql-index-missing-performance",
        title: "Query ช้าเพราะไม่มี Index",
        subtitle: "table โตขึ้น แต่ query ยังเหมือนเดิม",
        tags: ["SQL Server", "Performance"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `Query เคยเร็ว ตอนนี้ช้า`,
            },
            {
                heading: "Root Cause",
                body: `table โต แต่ไม่มี index`,
            },
            {
                heading: "Fix",
                body: `create index`,
            },
            {
                heading: "Key Learning",
                body: `Data growth = performance change`,
                isCallout: true,
            },
        ],
    },
    {
        id: 102,
        slug: "windows-service-dependency-fail",
        title: "Service start ไม่ขึ้นเพราะ dependency ไม่พร้อม",
        subtitle: "service ตัวหนึ่งต้องรออีกตัว",
        tags: ["Windows", "Service"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `service start fail`,
            },
            {
                heading: "Root Cause",
                body: `dependency service ยังไม่ start`,
            },
            {
                heading: "Fix",
                body: `set startup delay หรือ dependency`,
            },
            {
                heading: "Key Learning",
                body: `Service chain สำคัญใน Windows`,
                isCallout: true,
            },
        ],
    },
    {
        id: 103,
        slug: "network-loop-switch-storm",
        title: "Network loop ทำให้ทั้ง LAN ใช้งานไม่ได้",
        subtitle: "เสียบสายผิด → broadcast storm",
        tags: ["Networking", "Switch"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `Network ทั้งบริษัทช้า/ล่ม`,
            },
            {
                heading: "Root Cause",
                body: `Loop ใน switch`,
            },
            {
                heading: "Fix",
                body: `ถอดสาย / enable STP`,
            },
            {
                heading: "Key Learning",
                body: `Loop เล็กๆ = impact ใหญ่`,
                isCallout: true,
            },
        ],
    },
    {
        id: 104,
        slug: "sql-timeout-long-query",
        title: "Query timeout เพราะ query ใช้เวลานานเกิน",
        subtitle: "ไม่ได้ error DB แต่ client timeout",
        tags: ["SQL Server", "Application"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `API timeout`,
            },
            {
                heading: "Root Cause",
                body: `query ใช้เวลานาน`,
            },
            {
                heading: "Fix",
                body: `optimize query`,
            },
            {
                heading: "Key Learning",
                body: `Timeout ไม่ใช่ DB fail แต่เป็น latency issue`,
                isCallout: true,
            },
        ],
    },
    {
        id: 105,
        slug: "nas-disk-degraded-ignore",
        title: "Disk RAID degraded แต่ไม่มี alert",
        subtitle: "รู้ตัวอีกที disk เสีย 2 ลูก data หาย",
        tags: ["NAS", "Storage"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `NAS ใช้งานปกติ`,
            },
            {
                heading: "Root Cause",
                body: `disk เสีย 1 ลูก แต่ไม่รู้`,
            },
            {
                heading: "Fix",
                body: `monitor RAID status`,
            },
            {
                heading: "Key Learning",
                body: `RAID ต้อง monitor`,
                isCallout: true,
            },
        ],
    },
    {
        id: 106,
        slug: "cpu-throttling-overheat",
        title: "Server ช้าเพราะ CPU throttle จากความร้อน",
        subtitle: "hardware issue ไม่ใช่ software",
        tags: ["Hardware", "Performance"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `server ช้าเป็นช่วง`,
            },
            {
                heading: "Root Cause",
                body: `CPU overheat`,
            },
            {
                heading: "Fix",
                body: `clean fan / improve cooling`,
            },
            {
                heading: "Key Learning",
                body: `Performance issue ไม่ได้มาจาก software เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 107,
        slug: "memory-leak-nodejs-production",
        title: "Memory Leak ใน Node.js ทำให้ระบบล่มแบบค่อยๆ ตาย",
        subtitle: "RAM เพิ่มเรื่อยๆ จน container restart — ไม่ crash ทันที",
        tags: ["Node.js", "Production", "Performance"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `ระบบปกติช่วงแรก → RAM เพิ่มเรื่อยๆ → OOM → restart`,
            },
            {
                heading: "Root Cause",
                body: `object ถูกเก็บใน memory แต่ไม่ถูก GC (เช่น global cache, event listener ซ้ำ)`,
            },
            {
                heading: "วิธีตรวจ",
                body: `heap snapshot / clinic.js / --inspect`,
            },
            {
                heading: "Key Learning",
                body: `Memory leak = slow death ของ system`,
                isCallout: true,
            },
        ],
    },
    {
        id: 108,
        slug: "asymmetric-routing-network-issue",
        title: "Network ใช้ได้บ้างไม่ได้บ้างเพราะ Asymmetric Routing",
        subtitle: "request ไปเส้นหนึ่ง แต่ response กลับอีกเส้น → firewall drop",
        tags: ["Networking", "Advanced"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `ping ได้ แต่บาง service ใช้ไม่ได้`,
            },
            {
                heading: "Root Cause",
                body: `routing ไม่ symmetric`,
            },
            {
                heading: "Key Learning",
                body: `Network issue ที่ debug ยากที่สุดคือ "บางครั้งใช้ได้"`,
                isCallout: true,
            },
        ],
    },
    {
        id: 109,
        slug: "sql-server-parameter-sniffing",
        title: "Parameter Sniffing ทำ query บางครั้งเร็ว บางครั้งช้า",
        subtitle: "execution plan ถูก cache แต่ไม่เหมาะกับทุกค่า",
        tags: ["SQL Server", "Advanced"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `query เดียวกัน บางครั้งเร็ว บางครั้งช้า`,
            },
            {
                heading: "Root Cause",
                body: `execution plan cache จาก parameter แรก`,
            },
            {
                heading: "Fix",
                body: `OPTION (RECOMPILE) หรือ optimize`,
            },
            {
                heading: "Key Learning",
                body: `SQL ไม่ได้ deterministic เสมอ`,
                isCallout: true,
            },
        ],
    },
    {
        id: 110,
        slug: "ad-replication-fail-silent",
        title: "AD Replication Fail แบบเงียบ ทำให้ user login ไม่ตรงกัน",
        subtitle: "DC แต่ละตัวมีข้อมูลไม่เหมือนกัน",
        tags: ["Active Directory", "Critical"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `บางเครื่อง login ได้ บางเครื่องไม่ได้`,
            },
            {
                heading: "Root Cause",
                body: `AD replication fail`,
            },
            {
                heading: "Key Learning",
                body: `AD problem มักไม่ error ชัด แต่ impact สูง`,
                isCallout: true,
            },
        ],
    },
    {
        id: 111,
        slug: "tcp-ephemeral-port-exhaustion",
        title: "Server ใช้งานไม่ได้เพราะ TCP port หมด",
        subtitle: "เปิด connection เยอะเกิน → port ไม่พอ",
        tags: ["Networking", "OS"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `connect service ไม่ได้`,
            },
            {
                heading: "Root Cause",
                body: `ephemeral port หมด`,
            },
            {
                heading: "Fix",
                body: `tune port range / close connection`,
            },
            {
                heading: "Key Learning",
                body: `OS limitation ก็ทำให้ system ล่มได้`,
                isCallout: true,
            },
        ],
    },
    {
        id: 112,
        slug: "split-brain-dns-issue",
        title: "Split-brain DNS ทำให้ resolve ต่างกันใน network เดียวกัน",
        subtitle: "เครื่องใน LAN กับ VPN ได้ IP คนละค่า",
        tags: ["DNS", "Advanced"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `user บางคนเข้าได้ บางคนเข้าไม่ได้`,
            },
            {
                heading: "Root Cause",
                body: `DNS view ต่างกัน`,
            },
            {
                heading: "Key Learning",
                body: `DNS issue = confusing ที่สุดใน network`,
                isCallout: true,
            },
        ],
    },
    {
        id: 113,
        slug: "clock-drift-distributed-system",
        title: "Time drift ทำ distributed system พัง",
        subtitle: "เวลาไม่ตรง → token invalid / log เพี้ยน",
        tags: ["Distributed System", "NTP"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `auth fail ทั้งที่ credential ถูก`,
            },
            {
                heading: "Root Cause",
                body: `server time ไม่ sync`,
            },
            {
                heading: "Key Learning",
                body: `Time sync คือ dependency ที่คนมองข้าม`,
                isCallout: true,
            },
        ],
    },
    {
        id: 114,
        slug: "mtu-mismatch-network-problem",
        title: "MTU mismatch ทำให้ packet หายแบบแปลกๆ",
        subtitle: "ping ได้ แต่ upload/download fail",
        tags: ["Networking", "Advanced"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `บางเว็บโหลดไม่ได้`,
            },
            {
                heading: "Root Cause",
                body: `MTU mismatch`,
            },
            {
                heading: "Key Learning",
                body: `Layer 3/4 problem มักซับซ้อน`,
                isCallout: true,
            },
        ],
    },
    {
        id: 115,
        slug: "file-descriptor-limit-linux",
        title: "Linux service ล่มเพราะ file descriptor เต็ม",
        subtitle: "เปิด connection/file มากเกิน limit",
        tags: ["Linux", "System"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `service error: too many open files`,
            },
            {
                heading: "Root Cause",
                body: `ulimit ต่ำ`,
            },
            {
                heading: "Fix",
                body: `เพิ่ม ulimit`,
            },
            {
                heading: "Key Learning",
                body: `OS limit คือ bottleneck ที่มองไม่เห็น`,
                isCallout: true,
            },
        ],
    },
    {
        id: 116,
        slug: "cache-invalidation-bug",
        title: "Cache ทำข้อมูลไม่ตรง reality",
        subtitle: "user เห็นข้อมูลเก่าเพราะ cache",
        tags: ["System Design"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `data ไม่ update`,
            },
            {
                heading: "Root Cause",
                body: `cache ไม่ invalidate`,
            },
            {
                heading: "Key Learning",
                body: `There are only 2 hard things: cache & naming`,
                isCallout: true,
            },
        ],
    },
    {
        id: 117,
        slug: "zombie-process-linux",
        title: "Zombie Process สะสมจน system แปลกๆ",
        subtitle: "process ตายแต่ยังอยู่ใน table",
        tags: ["Linux"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `process แปลกๆ เพิ่ม`,
            },
            {
                heading: "Root Cause",
                body: `parent ไม่ reap child`,
            },
            {
                heading: "Key Learning",
                body: `Process management สำคัญใน OS`,
                isCallout: true,
            },
        ],
    },
    {
        id: 118,
        slug: "kernel-panic-linux",
        title: "Kernel Panic ทำ server reboot เอง",
        subtitle: "ระดับ OS crash ไม่ใช่ application",
        tags: ["Linux", "Critical"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `server reboot เอง`,
            },
            {
                heading: "Root Cause",
                body: `kernel bug / hardware`,
            },
            {
                heading: "Key Learning",
                body: `บางปัญหาอยู่ต่ำกว่า application`,
                isCallout: true,
            },
        ],
    },
    {
        id: 119,
        slug: "dns-ttl-propagation-delay",
        title: "แก้ DNS แล้วแต่ยังไม่ update เพราะ TTL",
        subtitle: "user บางคนยังเข้า IP เก่า",
        tags: ["DNS"],
        date: "2026",
        readTime: "3 min",
        sections: [
            {
                heading: "อาการ",
                body: `บาง user ใช้ IP เก่า`,
            },
            {
                heading: "Root Cause",
                body: `DNS TTL cache`,
            },
            {
                heading: "Key Learning",
                body: `DNS change ไม่ได้ real-time`,
                isCallout: true,
            },
        ],
    },
    {
        id: 120,
        slug: "thread-pool-starvation",
        title: "Thread Pool เต็มทำให้ request ค้าง",
        subtitle: "ไม่ได้ crash แต่ไม่ตอบ",
        tags: ["Backend", "Performance"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `request ค้าง`,
            },
            {
                heading: "Root Cause",
                body: `thread pool หมด`,
            },
            {
                heading: "Key Learning",
                body: `Resource exhaustion ไม่จำเป็นต้อง crash`,
                isCallout: true,
            },
        ],
    },
    {
        id: 121,
        slug: "ghost-network-issue-no-packet-capture",
        title: "Network ใช้งานไม่ได้บางช่วง แต่ packet capture ไม่เห็นอะไรผิด",
        subtitle: "ทุกอย่างดูปกติ แต่ user ใช้งานไม่ได้ — สุดท้ายเป็น NIC firmware bug",
        tags: ["Networking", "Hardware", "Advanced"],
        date: "2026",
        readTime: "6 min",
        sections: [
            {
                heading: "อาการ",
                body: `User บ่นใช้งานไม่ได้เป็นช่วงๆ แต่ ping ได้, tcpdump ปกติ`,
            },
            {
                heading: "Root Cause",
                body: `NIC firmware มี bug ทำให้ drop packet บาง pattern`,
            },
            {
                heading: "Key Learning",
                body: `ถ้า software ทุกอย่างปกติ → suspect hardware`,
                isCallout: true,
            },
        ],
    },
    {
        id: 122,
        slug: "sql-server-ghost-record-fragmentation",
        title: "Query ช้าจาก Ghost Record และ Fragmentation",
        subtitle: "ลบข้อมูลแล้วแต่ performance ไม่ดีขึ้น",
        tags: ["SQL Server", "Deep Performance"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `ลบ data ไปเยอะ แต่ query ยังช้า`,
            },
            {
                heading: "Root Cause",
                body: `ghost record + index fragmentation`,
            },
            {
                heading: "Fix",
                body: `index rebuild / reorganize`,
            },
            {
                heading: "Key Learning",
                body: `Delete ≠ space คืนทันที`,
                isCallout: true,
            },
        ],
    },
    {
        id: 123,
        slug: "ad-dns-srv-record-missing",
        title: "AD ใช้งานไม่ได้เพราะ SRV record หาย",
        subtitle: "Domain ยังอยู่ แต่ client หา DC ไม่เจอ",
        tags: ["Active Directory", "DNS"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `Login domain ไม่ได้`,
            },
            {
                heading: "Root Cause",
                body: `SRV record (_ldap._tcp) หาย`,
            },
            {
                heading: "Key Learning",
                body: `AD = DNS-driven system`,
                isCallout: true,
            },
        ],
    },
    {
        id: 124,
        slug: "docker-overlay-network-bug",
        title: "Docker Swarm network ใช้ได้บาง node",
        subtitle: "container บางเครื่อง connect กันไม่ได้",
        tags: ["Docker", "Swarm", "Networking"],
        date: "2026",
        readTime: "6 min",
        sections: [
            {
                heading: "อาการ",
                body: `service บาง node ใช้งานได้ บาง node fail`,
            },
            {
                heading: "Root Cause",
                body: `overlay network bug / MTU mismatch`,
            },
            {
                heading: "Key Learning",
                body: `Distributed system = debug ยากกว่า single host หลายเท่า`,
                isCallout: true,
            },
        ],
    },
    {
        id: 125,
        slug: "cpu-steal-virtualization",
        title: "VM ช้าเพราะ CPU Steal จาก Hypervisor",
        subtitle: "CPU usage ต่ำ แต่ performance แย่",
        tags: ["Virtualization", "Performance"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `CPU ใน VM ดูว่าง แต่ระบบช้า`,
            },
            {
                heading: "Root Cause",
                body: `CPU ถูก host แย่งไป (steal time)`,
            },
            {
                heading: "Key Learning",
                body: `VM metric ไม่ได้บอกความจริงทั้งหมด`,
                isCallout: true,
            },
        ],
    },
    {
        id: 126,
        slug: "ssl-chain-intermediate-missing",
        title: "SSL ใช้ได้บาง browser เพราะ chain ไม่ครบ",
        subtitle: "Chrome เข้าได้ แต่บาง client ไม่ได้",
        tags: ["SSL", "Security"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `บาง user เข้าได้ บาง user error`,
            },
            {
                heading: "Root Cause",
                body: `missing intermediate certificate`,
            },
            {
                heading: "Key Learning",
                body: `SSL ต้องครบ chain ไม่ใช่แค่ cert เดียว`,
                isCallout: true,
            },
        ],
    },
    {
        id: 127,
        slug: "ntfs-mft-fragmentation",
        title: "Disk ช้าเพราะ MFT fragmentation",
        subtitle: "IO สูงผิดปกติแม้ disk ปกติ",
        tags: ["Windows", "Storage"],
        date: "2026",
        readTime: "5 min",
        sections: [
            {
                heading: "อาการ",
                body: `disk usage สูง แต่ throughput ต่ำ`,
            },
            {
                heading: "Root Cause",
                body: `MFT fragmentation`,
            },
            {
                heading: "Key Learning",
                body: `Filesystem ก็มี performance issue ของมันเอง`,
                isCallout: true,
            },
        ],
    },
    {
        id: 128,
        slug: "tls-version-mismatch",
        title: "TLS version mismatch ทำให้ connect ไม่ได้",
        subtitle: "server รองรับ TLS1.2 แต่ client ใช้ TLS1.0",
        tags: ["Security", "Networking"],
        date: "2026",
        readTime: "4 min",
        sections: [
            {
                heading: "อาการ",
                body: `connect fail แบบไม่มี message ชัด`,
            },
            {
                heading: "Root Cause",
                body: `TLS version ไม่ตรง`,
            },
            {
                heading: "Key Learning",
                body: `Security hardening มี impact ต่อ compatibility`,
                isCallout: true,
            },
        ],
    },
    {
        id: 129,
        slug: "race-condition-distributed-system",
        title: "Race Condition ใน distributed system ทำ data เพี้ยน",
        subtitle: "request มาพร้อมกัน → state ไม่ตรง",
        tags: ["Distributed System", "Concurrency"],
        date: "2026",
        readTime: "6 min",
        sections: [
            {
                heading: "อาการ",
                body: `data บาง record ไม่ถูกต้อง`,
            },
            {
                heading: "Root Cause",
                body: `race condition`,
            },
            {
                heading: "Key Learning",
                body: `Concurrency bug = debug ยากที่สุด`,
                isCallout: true,
            },
        ],
    },
    {
        id: 130,
        slug: "no-root-cause-after-hours-debug",
        title: "Debug 6 ชั่วโมงแต่ไม่เจอสาเหตุ เพราะไม่มี data",
        subtitle: "สุดท้ายแก้ด้วยการเพิ่ม observability ไม่ใช่ fix bug",
        tags: ["Observability", "Reality"],
        date: "2026",
        readTime: "6 min",
        sections: [
            {
                heading: "สถานการณ์จริง",
                body: `system มีปัญหา intermittent แต่ไม่มี log, metric, trace`,
            },
            {
                heading: "สิ่งที่ทำ",
                body: `debug ทุก layer แต่ไม่มี evidence`,
            },
            {
                heading: "Fix จริง",
                body: `เพิ่ม logging, monitoring, tracing ก่อน`,
            },
            {
                heading: "Key Learning",
                body: `ปัญหาบางอย่าง "แก้ไม่ได้" ถ้าไม่มี data\n\nObservability มาก่อน troubleshooting`,
                isCallout: true,
            },
        ],
    },
];

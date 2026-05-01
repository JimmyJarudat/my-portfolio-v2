export const GUIDES: Guide[] = [
    {
        id: 1, slug: "vps-initial-setup-ubuntu", category: "infrastructure",
        title: "VPS Initial Setup — SSH Key + Custom Port",
        description: "หลังเช่า VPS มาแล้ว: สร้าง user ส่วนตัว, ให้สิทธิ์ root, สร้าง SSH key แบบมีรหัสสองชั้น, เปลี่ยน port SSH, ปิด root login และทดสอบ login ผ่าน Bash / MobaXterm",
        difficulty: "beginner", time: "30 min",
        tags: ["Ubuntu", "SSH", "UFW", "MobaXterm", "SSH Key"], updated: "Apr 2025",
        prerequisites: ["VPS ที่รัน Ubuntu 22.04", "เข้าถึง root ได้ครั้งแรกผ่าน Console หรือ SSH"],
        steps: [
            {
                title: "Login ครั้งแรกด้วย root",
                body: "Provider ส่วนใหญ่จะมี Web Console ให้เข้าได้เลย หรือถ้ามี IP + password root ก็ SSH เข้าตรงได้เลยครั้งแรก",
                code: "ssh root@YOUR_SERVER_IP",
                lang: "bash",
                note: "ขั้นตอนนี้ใช้ password root ที่ได้จาก provider — ยังไม่ต้องมี key",
            },
            {
                title: "สร้าง user ส่วนตัว",
                body: "ตั้งชื่อ user เป็นชื่อที่ต้องการ ใช้ชื่อนี้แทนตลอด guide",
                code: "adduser yourname",
                lang: "bash",
                note: "ระบบจะถามรหัสผ่านและข้อมูลเพิ่มเติม — กรอกรหัสให้แน่น ส่วนที่เหลือ Enter ผ่านได้",
            },
            {
                title: "ให้สิทธิ์ sudo เต็ม (root-level)",
                body: "เพิ่ม user เข้า group sudo เพื่อให้สามารถรันคำสั่งด้วยสิทธิ์ root ได้",
                code: "usermod -aG sudo yourname\n\n# ตรวจสอบว่าอยู่ใน group sudo แล้ว\ngroups yourname",
                lang: "bash",
            },
            {
                title: "ทดสอบ login และตรวจสอบสิทธิ์",
                body: "เปิด terminal ใหม่อีกอัน login ด้วย user ที่สร้าง — อย่าปิด session root เดิมจนกว่าจะแน่ใจ",
                code: "ssh yourname@YOUR_SERVER_IP\n\n# ทดสอบสิทธิ์ sudo\nsudo whoami   # ต้องได้ root",
                lang: "bash",
                note: "ถ้า sudo whoami ได้ root แสดงว่าสิทธิ์ครบ — ค่อยปิด session root เดิม",
            },
            {
                title: "สร้าง SSH Key แบบ ED25519 + Passphrase (สองชั้น)",
                body: "รันบนเครื่อง local — ไม่ใช่บน server key แบบ ED25519 ปลอดภัยกว่า RSA และสั้นกว่า passphrase คือรหัสชั้นที่สองที่ต้องใส่ทุกครั้งที่ใช้ key",
                code: "# รันบนเครื่อง local\nssh-keygen -t ed25519 -C \"yourname@vps\" -f ~/.ssh/id_vps\n\n# ระบบจะถาม passphrase — ใส่รหัสให้แน่น\n\n# ไฟล์ที่ได้:\n# ~/.ssh/id_vps       ← private key (เก็บไว้บน local เท่านั้น)\n# ~/.ssh/id_vps.pub   ← public key (จะ copy ขึ้น server)",
                lang: "bash",
                note: "ห้ามแชร์ไฟล์ id_vps (private key) กับใครเด็ดขาด — แชร์ได้แค่ .pub",
            },
            {
                title: "คัดลอก Public Key ขึ้น Server",
                body: "นำ public key ไปใส่ใน authorized_keys ของ user บน server",
                code: "# วิธีที่ 1: ใช้ ssh-copy-id (Mac/Linux/Git Bash)\nssh-copy-id -i ~/.ssh/id_vps.pub yourname@YOUR_SERVER_IP\n\n# วิธีที่ 2: Copy ด้วยมือ\nmkdir -p ~/.ssh && chmod 700 ~/.ssh\necho \"PASTE_PUBLIC_KEY_HERE\" >> ~/.ssh/authorized_keys\nchmod 600 ~/.ssh/authorized_keys",
                lang: "bash",
            },
            {
                title: "ทดสอบ Login ด้วย SSH Key (ยังใช้ port 22)",
                body: "ทดสอบก่อนที่จะเปลี่ยน port — ต้องล็อกอินได้ด้วย key ก่อน ถึงค่อยล็อค password auth",
                code: "ssh -i ~/.ssh/id_vps yourname@YOUR_SERVER_IP\n# ระบบจะถาม passphrase — ใส่รหัสที่ตั้งไว้",
                lang: "bash",
                note: "ถ้า login ได้แล้ว ค่อยไปขั้นต่อไป — ถ้ายังไม่ได้ ตรวจ authorized_keys และ permission ก่อน",
            },
            {
                title: "เปลี่ยน Port SSH และปิด root login + password auth",
                body: "แก้ไข sshd_config เพื่อเปลี่ยน port จาก 22 และปิด password auth ทั้งหมด",
                code: "sudo nano /etc/ssh/sshd_config\n\n# แก้ไขค่าเหล่านี้:\n# เปลี่ยนจาก 22 เป็นเลขที่ต้องการ\nPort 2222\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\n\n# บันทึก: Ctrl+O → Enter → Ctrl+X",
                lang: "bash",
                note: "เลือก port ระหว่าง 1024–65535 เช่น 2222, 4822, 55022",
            },
            {
                title: "เปิด Port ใหม่ใน UFW ก่อน restart SSH",
                body: "สำคัญมาก — ต้องเปิด port ใหม่ใน firewall ก่อน ไม่งั้นจะเข้า server ไม่ได้เลยหลัง restart",
                code: "sudo ufw allow 2222/tcp\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable\nsudo ufw status\n\n# หลังตรวจ UFW แล้ว ค่อย restart\nsudo systemctl restart sshd\n\n# ลบ rule port 22 เดิมออก\nsudo ufw delete allow 22/tcp",
                lang: "bash",
                note: "ตรวจ ufw status ให้เห็น port ใหม่ก่อนเสมอ — ถ้าพลาด lock ตัวเองออก ต้องใช้ Web Console ของ provider เข้าแก้",
            },
            {
                title: "ทดสอบ SSH ด้วย Port ใหม่",
                body: "เปิด terminal ใหม่ทดสอบด้วย port ที่เปลี่ยน — อย่าปิด session เดิมจนกว่าจะเข้าได้",
                code: "ssh -i ~/.ssh/id_vps -p 2222 yourname@YOUR_SERVER_IP",
                lang: "bash",
                note: "ถ้าเข้าได้แล้ว แสดงว่าสำเร็จ — ปิด session เดิมได้เลย",
            },
            {
                title: "ตั้งชื่อ Host ใน SSH Config",
                body: "สร้าง shortcut ใน ~/.ssh/config บนเครื่อง local เพื่อให้ใช้แค่ ssh myvps แทนการพิมพ์ IP + port + key ทุกครั้ง",
                code: "nano ~/.ssh/config\n\n# เพิ่มข้อความนี้:\nHost myvps\n    HostName YOUR_SERVER_IP\n    User yourname\n    Port 2222\n    IdentityFile ~/.ssh/id_vps\n\n# ตั้ง permission ให้ถูกต้อง\nchmod 600 ~/.ssh/config\n\n# ทดสอบ\nssh myvps",
                lang: "bash",
                note: "ตั้งชื่อ Host เป็นอะไรก็ได้ เช่น myserver, prod, homelab",
            },
            {
                title: "ตั้งค่า MobaXterm (Windows)",
                body: "สำหรับคนใช้ Windows — MobaXterm รองรับ SSH key และ port กำหนดเอง ใช้งานง่ายกว่า command line",
                code: "# ขั้นตอนใน MobaXterm:\n# 1. Session → SSH\n# 2. Remote host: YOUR_SERVER_IP\n# 3. Username: yourname\n# 4. Port: 2222\n# 5. Advanced SSH settings → Use private key → เลือกไฟล์ id_vps\n# 6. ตั้งชื่อ session แล้ว Save\n\n# ถ้าต้องการ .ppk format ให้แปลงด้วย PuTTYgen:\n# Load → เลือก id_vps → Save private key → id_vps.ppk",
                lang: "bash",
                note: "ดาวน์โหลด MobaXterm: https://mobaxterm.mobatek.net — Home Edition ฟรี",
            },
        ],
    },

    {
        id: 2, slug: "server-hardening-system-prep", category: "infrastructure",
        title: "Server Hardening + System Prep",
        description: "เตรียม server ให้พร้อมก่อน deploy จริง: อัปเดต packages, ติดตั้ง Fail2ban, ตั้งค่า timezone, hostname และ essential tools",
        difficulty: "beginner", time: "20 min",
        tags: ["Ubuntu", "Fail2ban", "UFW", "Hardening"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 1 แล้ว — มี user ส่วนตัว + SSH key + port กำหนดเอง"],
        steps: [
            {
                title: "อัปเดต packages ทั้งหมด",
                body: "ก่อนทำอะไรกับ server ใหม่ ต้องอัปเดต package list และ upgrade ทุกอย่างให้เป็น version ล่าสุดก่อนเสมอ",
                code: "sudo apt update && sudo apt upgrade -y\nsudo apt autoremove -y",
                lang: "bash",
                note: "ถ้าระหว่าง upgrade มีถามเรื่อง config file ให้เลือก 'keep the local version' ไว้ก่อน",
            },
            {
                title: "ตั้งค่า Timezone",
                body: "ตั้ง timezone ให้ถูกต้องเพื่อให้ log และ cron job ตรงเวลา",
                code: "# ดู timezone ปัจจุบัน\ntimedatectl\n\n# ตั้งเป็น Asia/Bangkok\nsudo timedatectl set-timezone Asia/Bangkok\n\n# ตรวจสอบ\ntimedatectl",
                lang: "bash",
                note: "ค้นหา timezone อื่นได้ด้วย: timedatectl list-timezones | grep Asia",
            },
            {
                title: "ตั้งชื่อ Hostname",
                body: "ตั้งชื่อ server ให้จำง่าย จะได้รู้ว่ากำลัง SSH อยู่กับเครื่องไหน",
                code: "# ดู hostname ปัจจุบัน\nhostname\n\n# เปลี่ยนชื่อ\nsudo hostnamectl set-hostname myserver\n\n# เพิ่มลงใน /etc/hosts ด้วย\nsudo nano /etc/hosts\n# เพิ่มบรรทัดนี้:\n# 127.0.1.1   myserver",
                lang: "bash",
                note: "ชื่อ hostname จะแสดงใน prompt เช่น yourname@myserver — ช่วยให้รู้ทันทีว่าอยู่เครื่องไหน",
            },
            {
                title: "ติดตั้ง Essential Tools",
                body: "ติดตั้ง tools พื้นฐานที่ใช้บ่อยใน server — บาง package อาจมีอยู่แล้ว",
                code: "sudo apt install -y \\\n  curl \\\n  wget \\\n  git \\\n  htop \\\n  net-tools \\\n  unzip \\\n  ca-certificates \\\n  gnupg \\\n  lsb-release",
                lang: "bash",
            },
            {
                title: "ติดตั้ง Fail2ban",
                body: "Fail2ban คอย monitor log และ ban IP ที่พยายาม login ผิดเกินกำหนด — ป้องกัน brute-force ได้โดยอัตโนมัติ",
                code: "sudo apt install fail2ban -y\nsudo systemctl enable fail2ban --now\n\n# ตรวจสอบสถานะ\nsudo systemctl status fail2ban",
                lang: "bash",
                note: "Fail2ban จะ ban IP ที่ login ผิดเกิน 5 ครั้งใน 10 นาทีโดยอัตโนมัติ",
            },
            {
                title: "ตั้งค่า Fail2ban สำหรับ SSH port กำหนดเอง",
                body: "ถ้าเปลี่ยน SSH port ไปแล้วตาม Guide 1 ต้องบอก Fail2ban ด้วย ไม่งั้นจะ monitor port 22 อยู่เฉยๆ",
                code: "sudo nano /etc/fail2ban/jail.local\n\n# ใส่ข้อความนี้:\n[sshd]\nenabled  = true\nport     = 2222\nlogpath  = %(sshd_log)s\nbackend  = auto\nmaxretry = 5\nbantime  = 3600\n\n# restart\nsudo systemctl restart fail2ban\n\n# ดู status\nsudo fail2ban-client status sshd",
                lang: "bash",
                note: "bantime = 3600 คือ ban 1 ชั่วโมง — เพิ่มเป็น 86400 ถ้าอยากให้ ban 1 วัน",
            },
            {
                title: "เปิด unattended-upgrades (Security Patch อัตโนมัติ)",
                body: "ให้ server อัปเดต security patch โดยอัตโนมัติ โดยไม่ต้อง upgrade ทุก package — ลด risk ช่องโหว่ที่ถูกปล่อยทิ้งไว้",
                code: "sudo apt install unattended-upgrades -y\nsudo dpkg-reconfigure --priority=low unattended-upgrades\n\n# ตรวจสอบ config\ncat /etc/apt/apt.conf.d/20auto-upgrades",
                lang: "bash",
                note: "เลือก Yes เมื่อถามว่าต้องการเปิด automatic updates — จะอัปเดตเฉพาะ security patch เท่านั้น",
            },
            {
                title: "ตรวจสอบ UFW และ port ที่เปิดอยู่",
                body: "ตรวจสอบว่า firewall ทำงานถูกต้อง และ port ที่เปิดมีเฉพาะที่จำเป็นจริงๆ",
                code: "sudo ufw status verbose\n\n# ดู port ที่กำลัง listen อยู่ทั้งหมด\nsudo ss -tlnp",
                lang: "bash",
                note: "ถ้าเห็น port แปลกๆ ที่ไม่ได้เปิดเองให้ตรวจสอบก่อน — อาจเป็น service ที่ติดมากับ OS",
            },
            {
                title: "ตรวจสอบ Login History และ User ที่มีอยู่",
                body: "ดูว่ามีใคร login เข้ามาบ้าง และ user ที่มีสิทธิ์ sudo มีใครบ้าง",
                code: "# ดู login ล่าสุด\nlast -n 10\n\n# ดู user ที่อยู่ใน sudo group\ngetent group sudo\n\n# ดู user ทั้งหมดที่ login ได้\ncat /etc/passwd | grep -v nologin | grep -v false",
                lang: "bash",
                note: "ถ้าเห็น user ที่ไม่รู้จักใน sudo group ให้ลบออกทันที: sudo deluser username sudo",
            },
            {
                title: "Reboot และทดสอบ Login อีกครั้ง",
                body: "Reboot เพื่อให้การเปลี่ยนแปลงทั้งหมดมีผล แล้วทดสอบว่า SSH ยังเข้าได้ปกติ",
                code: "sudo reboot\n\n# รอสักครู่แล้ว SSH เข้าใหม่\nssh myvps\n\n# ตรวจสอบ service ที่ควรรันอยู่\nsudo systemctl status fail2ban\nsudo ufw status",
                lang: "bash",
                note: "ถ้า SSH เข้าไม่ได้หลัง reboot ให้ใช้ Web Console ของ provider เข้าตรวจสอบ",
            },
        ],
    },

    {
        id: 3, slug: "zsh-ohmyzsh-setup", category: "infrastructure",
        title: "ติดตั้ง Zsh + Oh My Zsh + ตั้งค่า History",
        description: "ติดตั้ง zsh, oh-my-zsh พร้อม plugin, แต่ง prompt และตั้งค่า history ให้ค้นหาด้วย ↑↓ ได้แม่นขึ้น",
        difficulty: "beginner", time: "20 min",
        tags: ["Zsh", "Oh My Zsh", "Terminal", "History"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 2 แล้ว — server พร้อม deploy"],
        steps: [
            {
                title: "ติดตั้ง Zsh",
                body: "ติดตั้ง zsh และตั้งให้เป็น default shell แทน bash",
                code: "sudo apt install zsh -y\n\n# ตรวจสอบ version\nzsh --version\n\n# ตั้งเป็น default shell\nchsh -s $(which zsh)\n\n# logout แล้ว login ใหม่ให้มีผล\nexit",
                lang: "bash",
                note: "หลัง login ใหม่ zsh จะถามว่าจะตั้งค่ายังไง — กด q เพื่อออกก่อน เดี๋ยว oh-my-zsh จะจัดการให้เอง",
            },
            {
                title: "ติดตั้ง Oh My Zsh",
                body: "oh-my-zsh คือ framework จัดการ zsh — มี theme, plugin และ config สำเร็จรูปมาให้",
                code: `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`,
                lang: "bash",
                note: "ระหว่างติดตั้งจะถามว่าจะเปลี่ยน default shell เป็น zsh ไหม — กด Y",
            },
            {
                title: "ติดตั้ง Plugin zsh-autosuggestions",
                body: "plugin นี้ไม่ได้ติดมากับ oh-my-zsh ต้องโคลน repo มาเองก่อน",
                code: "git clone https://github.com/zsh-users/zsh-autosuggestions \\\n  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions",
                lang: "bash",
            },
            {
                title: "ติดตั้ง Plugin zsh-syntax-highlighting",
                body: "ต้องโคลนมาก่อนถึงจะเปิดใช้ใน .zshrc ได้",
                code: "git clone https://github.com/zsh-users/zsh-syntax-highlighting \\\n  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting",
                lang: "bash",
                note: "zsh-syntax-highlighting ต้องอยู่ลำดับสุดท้ายใน plugins=() เสมอ",
            },
            {
                title: "เปิดไฟล์ .zshrc",
                body: "ไฟล์นี้คือ config ทั้งหมดของ zsh — โหลดทุกครั้งที่เปิด terminal ใหม่",
                code: "vim ~/.zshrc",
                lang: "bash",
            },
            {
                title: "เปิด Plugin ใน .zshrc",
                body: "แก้บรรทัด plugins= ให้เปิด plugin ที่โคลนมาแล้ว พร้อมเพิ่ม z และ command-not-found",
                code: `plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting  # ต้องอยู่สุดท้ายเสมอ
  z                        # จำ directory ที่เคยไป — พิมพ์แค่ z myproject
  command-not-found        # แนะนำ package ถ้าพิมพ์ command ที่ยังไม่ได้ติดตั้ง
)`,
                lang: "zsh",
                note: "plugin z ใช้แทน cd ได้เลย — พิมพ์ z ตามด้วยชื่อ directory บางส่วน มันจะพาไปให้",
            },
            {
                title: "แต่ง Prompt",
                body: "เพิ่มสีและแสดง git branch ใน prompt — แทนที่บรรทัด PROMPT เดิมท้ายไฟล์",
                code: `# แทนที่บรรทัด PROMPT เดิม:
PROMPT='%F{cyan}%n%f%F{white}@%f%F{green}%m%f:%F{yellow}%~%f%F{white}$(git branch --show-current 2>/dev/null | sed "s/.*/ [&]/")%f$ '`,
                lang: "zsh",
                note: "สีที่ใช้ได้: black, red, green, yellow, blue, magenta, cyan, white — หรือใส่ตัวเลข %F{214}",
            },
            {
                title: "ตั้งค่า History",
                body: "เพิ่ม block นี้ท้ายสุดของ .zshrc — ให้ history จำได้มากขึ้น ไม่ซ้ำ และค้นหาด้วย ↑↓ ตาม prefix ได้",
                code: `# ─── History ───────────────────────────────────
HISTSIZE=10000
HISTFILE=~/.zsh_history
SAVEHIST=10000

setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_ALL_DUPS
setopt SHARE_HISTORY
setopt INC_APPEND_HISTORY

bindkey '^[[A' history-search-backward
bindkey '^[[B' history-search-forward`,
                lang: "zsh",
                note: "พิมพ์ 'sudo' แล้วกด ↑ — จะเห็นเฉพาะ command ที่ขึ้นต้นด้วย sudo เท่านั้น",
            },
            {
                title: "เพิ่ม Alias ที่ใช้บ่อย",
                body: "เพิ่ม alias ท้ายสุดของ .zshrc เพื่อย่อ command ที่พิมพ์บ่อย",
                code: `# ─── Aliases ────────────────────────────────────
alias ll='ls -alF'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'

# Docker
alias dps='docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
alias dlogs='docker logs -f'

# Systemctl
alias sstart='sudo systemctl start'
alias sstop='sudo systemctl stop'
alias sstatus='sudo systemctl status'`,
                lang: "zsh",
            },
            {
                title: "บันทึกและโหลด .zshrc ใหม่",
                body: "บันทึกไฟล์แล้ว reload ให้การเปลี่ยนแปลงทั้งหมดมีผลทันที",
                code: "# บันทึกใน vim: Esc → :wq\n\n# reload\nsource ~/.zshrc",
                lang: "bash",
            },
            {
                title: "ทดสอบ History และ Plugin",
                body: "ทดสอบว่าทุกอย่างทำงานถูกต้อง",
                code: "# ทดสอบ history search\n# พิมพ์ 'sudo' แล้วกด ↑ — ควรเห็นเฉพาะ command ที่ขึ้นต้นด้วย sudo\n\n# ทดสอบ autosuggestions\n# พิมพ์ command บางส่วน — ควรเห็น suggestion สีเทาๆ กด → เพื่อ accept\n\n# ทดสอบ syntax highlighting\n# command ที่มีอยู่ → สีเขียว / ไม่มี → สีแดง\n\n# ดู history ทั้งหมด\nhistory | tail -20",
                lang: "bash",
                note: "ถ้า ↑↓ ยังไม่ทำงานตาม prefix ให้ลอง logout แล้ว login ใหม่ครั้งเดียว",
            },
        ],
    },

    {
        id: 4, slug: "docker-portainer-setup", category: "infrastructure",
        title: "ติดตั้ง Docker + Portainer + Docker Swarm",
        description: "ติดตั้ง Docker Engine, ติดตั้ง Portainer สำหรับจัดการ container ผ่าน UI, เปิด Swarm mode และสร้าง overlay network main_public สำหรับ deploy service ที่ต้องการให้อยู่ network เดียวกัน",
        difficulty: "beginner", time: "30 min",
        tags: ["Docker", "Portainer", "Swarm", "Overlay Network", "Container"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 2 แล้ว — server พร้อม deploy"],
        steps: [
            {
                title: "ติดตั้ง Docker Engine",
                body: "ใช้ official script จาก Docker — ติดตั้ง Docker Engine, CLI และ containerd ให้ครบในคำสั่งเดียว",
                code: "curl -fsSL https://get.docker.com | sh",
                lang: "bash",
                note: "script นี้ดูแลโดย Docker Inc. โดยตรง — เหมาะสำหรับ Ubuntu 22.04 ขึ้นไป",
            },
            {
                title: "เพิ่ม User เข้า Group docker",
                body: "เพื่อให้รัน docker command ได้โดยไม่ต้องพิมพ์ sudo ทุกครั้ง",
                code: "sudo usermod -aG docker $USER\n\n# logout แล้ว login ใหม่ให้มีผล\nexit",
                lang: "bash",
                note: "ต้อง logout แล้ว login ใหม่ก่อน — ไม่งั้น group ยังไม่มีผล",
            },
            {
                title: "ตรวจสอบ Docker",
                body: "ตรวจว่า Docker ทำงานถูกต้องและ version ที่ได้",
                code: "docker version\ndocker run hello-world",
                lang: "bash",
                note: "ถ้าเห็น 'Hello from Docker!' แสดงว่าติดตั้งสำเร็จ",
            },
            {
                title: "เปิด Docker ให้ start อัตโนมัติ",
                body: "ให้ Docker รันทันทีเมื่อ server reboot",
                code: "sudo systemctl enable docker --now\n\n# ตรวจสอบสถานะ\nsudo systemctl status docker",
                lang: "bash",
            },
            {
                title: "Init Docker Swarm",
                body: "เปิด Swarm mode บน node นี้ — จะกลายเป็น manager node ทันที",
                code: "docker swarm init --advertise-addr $(hostname -I | awk '{print $1}')\n\n# ตรวจสอบสถานะ\ndocker node ls",
                lang: "bash",
                note: "เก็บ join token ไว้ด้วยถ้าต้องการเพิ่ม worker node ทีหลัง — ดูได้ด้วย: docker swarm join-token worker",
            },
            {
                title: "สร้าง Overlay Network main_public",
                body: "สร้าง network ที่ใช้ร่วมกันระหว่าง service ที่ deploy ใน Swarm — service ไหนที่อยากให้คุยกันได้ให้ต่อ network นี้เลย",
                code: "docker network create \\\n  --driver overlay \\\n  --attachable \\\n  main_public\n\n# ตรวจสอบ\ndocker network ls",
                lang: "bash",
                note: "--attachable ทำให้ container ปกติ (ที่ไม่ได้อยู่ใน Swarm service) สามารถต่อเข้า network นี้ได้ด้วย",
            },
            {
                title: "สร้าง Volume สำหรับ Portainer",
                body: "Portainer เก็บข้อมูลของตัวเองไว้ใน volume — ต้องสร้างก่อน deploy",
                code: "docker volume create portainer_data",
                lang: "bash",
            },
            {
                title: "Deploy Portainer",
                body: "รัน Portainer เป็น container — เปิด port 9443 สำหรับ HTTPS UI",
                code: "docker run -d \\\n  --name portainer \\\n  --restart=always \\\n  -p 9443:9443 \\\n  -v /var/run/docker.sock:/var/run/docker.sock \\\n  -v portainer_data:/data \\\n  portainer/portainer-ce:latest",
                lang: "bash",
                note: "port 9443 คือ HTTPS — Portainer จะ generate self-signed cert ให้เอง",
            },
            {
                title: "เปิด Port 9443 ใน UFW",
                body: "เปิด port ชั่วคราวเพื่อ setup Portainer — จะปิดอีกครั้งใน Guide WireGuard",
                code: "sudo ufw allow 9443/tcp\nsudo ufw status",
                lang: "bash",
                note: "port นี้จะเปิดแค่ช่วง setup เท่านั้น — หลังจาก WireGuard พร้อมแล้วจะปิดและเข้าผ่าน VPN แทน",
            },
            {
                title: "ตั้งค่า Portainer ครั้งแรก",
                body: "เข้า UI ผ่าน browser และสร้าง admin account",
                code: "# เปิด browser แล้วไปที่:\nhttps://YOUR_SERVER_IP:9443\n\n# browser จะเตือน SSL certificate — กด Advanced → Proceed\n# สร้าง username และ password admin",
                lang: "bash",
                note: "ต้องเข้าภายใน 5 นาทีหลัง deploy — ถ้าเกินเวลา Portainer จะ lock และต้อง restart container",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/portainer_home.png", caption: "หน้า portainer หลังจากตั้งค่าเสร็จ" }
                ]
            },
            {
                title: "ตรวจสอบ Swarm และ Network ใน Portainer",
                body: "เข้า Portainer UI ตรวจสอบว่าเห็น Swarm node และ network main_public",
                code: "# ใน Portainer UI:\n# Home → Primary → Swarm → ควรเห็น node 1 ตัว status = Ready\n# Networks → ควรเห็น main_public เป็น driver = overlay",
                lang: "bash",
                note: "ถ้าเห็น Swarm node และ main_public network แสดงว่าพร้อม deploy service ได้แล้ว",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/portainer_main_public.png", caption: "Networks → ควรเห็น main_public เป็น driver = overlay" }
                ]
            },
            {
                title: "ตรวจสอบจาก CLI",
                body: "ตรวจสอบ Swarm, network และ Portainer จาก command line",
                code: "# ดู Swarm node\ndocker node ls\n\n# ดู network ทั้งหมด\ndocker network ls\n\n# ดู container ที่รันอยู่\ndocker ps\n\n# ดู log Portainer ถ้ามีปัญหา\ndocker logs portainer",
                lang: "bash",
            },
            {
                title: "เชื่อม Docker Hub ใน Portainer",
                body: "เพิ่ม Docker Hub credentials ใน Portainer เพื่อให้ pull image จาก private repository ของตัวเองได้",
                code: "# ใน Portainer UI:\n# Account Settings → Registry → Add registry\n# เลือก Docker Hub\n# ใส่ Username และ Password (หรือ Access Token)\n# กด Save",
                lang: "bash",
                note: "แนะนำให้ใช้ Access Token แทน password จริง — สร้างได้ที่ hub.docker.com → Account Settings → Security → New Access Token",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/portainer_token.png", caption: "หน้าเพิ่ม Docker Hub registry ใน Portainer" }
                ],
            },
        ],
    },

    {
        id: 5, slug: "wireguard-wg-easy-setup", category: "infrastructure",
        title: "ติดตั้ง WireGuard VPN ด้วย wg-easy",
        description: "ติดตั้ง wg-easy ใน Docker เพื่อให้มี WireGuard VPN พร้อม Web UI สำหรับจัดการ client — หลังจากนี้จะเข้า server ผ่าน VPN แทน public port ทั้งหมด",
        difficulty: "beginner", time: "20 min",
        tags: ["WireGuard", "VPN", "wg-easy", "Docker", "UFW"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 4 แล้ว — Docker + Portainer + Swarm พร้อมใช้งาน"],
        steps: [
            {
                title: "สร้าง Directory สำหรับ wg-easy",
                body: "สร้าง directory เก็บ config ของ WireGuard บน host",
                code: "sudo mkdir -p /opt/wg-easy\nsudo chown $USER:$USER /opt/wg-easy",
                lang: "bash",
            },
            {
                title: "สร้าง Password Hash สำหรับ Web UI",
                body: "wg-easy ต้องการ bcrypt hash ของ password — สร้างด้วย Docker run ชั่วคราว",
                code: "docker run --rm ghcr.io/wg-easy/wg-easy wgpw 'YOUR_PASSWORD'\n\n# ผลลัพธ์จะได้ hash แบบนี้:\n# $2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                lang: "bash",
                note: "เก็บ hash ไว้ใช้ใน step ถัดไป — อย่าใส่ password จริงตรงๆ ใน compose file",
            },
            {
                title: "สร้าง docker-compose.yml",
                body: "สร้างไฟล์ compose สำหรับ wg-easy",
                code: "nano /opt/wg-easy/docker-compose.yml\n\n# ใส่ข้อความนี้:\nservices:\n  wg-easy:\n    image: ghcr.io/wg-easy/wg-easy\n    container_name: wg-easy\n    restart: always\n    environment:\n      - LANG=en\n      - WG_HOST=YOUR_SERVER_IP\n      - PASSWORD_HASH=PASTE_HASH_HERE\n      - WG_PORT=51820\n      - WG_DEFAULT_DNS=1.1.1.1\n    volumes:\n      - /opt/wg-easy:/etc/wireguard\n    ports:\n      - 51820:51820/udp\n      - 51821:51821/tcp\n    cap_add:\n      - NET_ADMIN\n      - SYS_MODULE\n    sysctls:\n      - net.ipv4.ip_forward=1\n      - net.ipv4.conf.all.src_valid_mark=1",
                lang: "bash",
                note: "แทน YOUR_SERVER_IP ด้วย IP จริงของ server และ PASTE_HASH_HERE ด้วย hash จาก step ก่อน",
            },
            {
                title: "เปิด Port ใน UFW",
                body: "เปิด port สำหรับ WireGuard VPN และ Web UI ก่อน deploy",
                code: "sudo ufw allow 51820/udp\nsudo ufw allow 51821/tcp\nsudo ufw status",
                lang: "bash",
                note: "port 51821 เปิดชั่วคราวเพื่อ setup เท่านั้น — จะปิดใน Guide ถัดไปหลังจาก VPN ใช้งานได้แล้ว",
            },
            {
                title: "Deploy wg-easy",
                body: "รัน wg-easy ด้วย docker compose",
                code: "cd /opt/wg-easy\ndocker compose up -d\n\n# ตรวจสอบสถานะ\ndocker ps\ndocker logs wg-easy",
                lang: "bash",
                note: "ถ้าเห็น 'WireGuard started' ใน log แสดงว่า deploy สำเร็จ",
            },
            {
                title: "เข้า Web UI และสร้าง Client แรก",
                body: "เข้า wg-easy UI ผ่าน browser แล้วสร้าง VPN client สำหรับเครื่องของตัวเอง",
                code: "# เปิด browser แล้วไปที่:\nhttp://YOUR_SERVER_IP:51821\n\n# ใส่ password ที่ตั้งไว้\n# กด + New Client\n# ตั้งชื่อ client เช่น laptop, phone",
                lang: "bash",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/wg-home.png", caption: "หน้า dashboard wg-easy" },
                ],
            },
            {
                title: "ติดตั้ง WireGuard Client บนเครื่อง Local",
                body: "ดาวน์โหลด WireGuard client แล้ว import config จาก wg-easy",
                code: "# Windows / Mac / iOS / Android:\n# ดาวน์โหลดที่ https://www.wireguard.com/install/\n\n# ใน wg-easy UI:\n# กด QR code icon → scan ด้วย mobile\n# หรือกด Download icon → import ไฟล์ .conf ใน WireGuard app",
                lang: "bash",
                note: "Linux: sudo apt install wireguard -y แล้ว import ไฟล์ .conf",
            },
            {
                title: "ทดสอบการเชื่อมต่อ VPN",
                body: "เปิด VPN บนเครื่อง local แล้วทดสอบว่าเข้าถึง server ได้ผ่าน VPN IP",
                code: "# หลังเปิด VPN แล้ว — ทดสอบ ping VPN IP ของ server\n# WireGuard จะให้ IP ในช่วง 10.8.0.x\n\nping 10.8.0.1\n\n# ทดสอบ SSH ผ่าน VPN IP\nssh -i ~/.ssh/id_vps -p 2222 yourname@10.8.0.1",
                lang: "bash",
                note: "ถ้า ping และ SSH ผ่าน 10.8.0.1 ได้ แสดงว่า VPN ทำงานถูกต้อง — พร้อมไป Guide ถัดไปเพื่อปิด public port",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/wg-program.png", caption: "หน้า  wg-easy " },
                ],
            },
            {
                title: "อัปเดต SSH Config ให้ใช้ VPN IP",
                body: "แก้ ~/.ssh/config บนเครื่อง local ให้ชี้ไปที่ VPN IP แทน public IP",
                code: "nano ~/.ssh/config\n\n# แก้ไข:\nHost myvps\n    HostName 10.8.0.1\n    User yourname\n    Port 2222\n    IdentityFile ~/.ssh/id_vps",
                lang: "bash",
                note: "หลังแก้แล้ว ssh myvps จะวิ่งผ่าน VPN เสมอ — ต้องเปิด WireGuard ก่อนถึงจะ SSH ได้",
            },
            {
                title: "ตรวจสอบ wg-easy และ Client Status",
                body: "ตรวจสอบว่า client เชื่อมต่ออยู่และ traffic วิ่งผ่าน VPN",
                code: "# ดู log wg-easy\ndocker logs wg-easy --tail 20\n\n# ดูสถานะ WireGuard บน server\ndocker exec wg-easy wg show",
                lang: "bash",
                note: "ใน wg-easy UI จะเห็น client ที่ online มีจุดสีเขียว และแสดง last handshake time",

            },
        ],
    },

    {
        id: 6, slug: "close-ports-vpn-only", category: "infrastructure",
        title: "ปิด Port และเข้า Server ผ่าน VPN อย่างเดียว",
        description: "หลังจาก WireGuard ใช้งานได้แล้ว ปิด public port ทั้งหมด เหลือแค่ 80, 443 และ 51820/UDP — เข้า server ทุกอย่างผ่าน VPN เท่านั้น",
        difficulty: "beginner", time: "15 min",
        tags: ["UFW", "WireGuard", "Security", "Firewall"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 5 แล้ว — WireGuard VPN เชื่อมต่อได้และ SSH ผ่าน VPN IP ได้แล้ว"],
        steps: [
            {
                title: "ตรวจสอบก่อนปิด Port",
                body: "ต้องแน่ใจว่า SSH ผ่าน VPN IP ได้จริงก่อน — ถ้าปิด port แล้วเข้าไม่ได้จะต้องใช้ Web Console ของ provider แก้",
                code: "# ทดสอบ SSH ผ่าน VPN IP ให้ได้ก่อน\nssh myvps\n\n# ตรวจสอบ port ที่เปิดอยู่ทั้งหมด\nsudo ufw status verbose",
                lang: "bash",
                note: "ถ้า SSH ผ่าน VPN IP ได้แล้ว ค่อยไป step ถัดไป — ห้ามข้ามขั้นตอนนี้",
            },
            {
                title: "ปิด Port SSH (2222) จาก Public",
                body: "ปิด port SSH ที่เปิดไว้ตอนแรก — หลังจากนี้ SSH ได้ผ่าน VPN เท่านั้น",
                code: "sudo ufw delete allow 2222/tcp",
                lang: "bash",
                note: "ถ้ายัง SSH อยู่ผ่าน VPN session นี้จะไม่หลุด — แค่ครั้งต่อไปต้องเปิด WireGuard ก่อน",
            },
            {
                title: "ปิด Port Portainer (9443) จาก Public",
                body: "ปิด port Portainer ที่เปิดไว้ตอน setup — เข้า Portainer ผ่าน VPN IP แทน",
                code: "sudo ufw delete allow 9443/tcp",
                lang: "bash",
                note: "เข้า Portainer ได้ที่ https://10.8.0.1:9443 หลังเปิด VPN แล้ว",
            },
            {
                title: "ปิด Port wg-easy Web UI (51821) จาก Public",
                body: "ปิด port Web UI ของ wg-easy — เข้าจัดการ VPN client ผ่าน VPN IP แทน",
                code: "sudo ufw delete allow 51821/tcp",
                lang: "bash",
                note: "เข้า wg-easy ได้ที่ http://10.8.0.1:51821 หลังเปิด VPN แล้ว",
            },
            {
                title: "ตรวจสอบ Port ที่เหลืออยู่",
                body: "ตรวจสอบว่าเหลือแค่ port ที่จำเป็นจริงๆ",
                code: "sudo ufw status verbose",
                lang: "bash",
                note: "ควรเห็นแค่ 80/tcp, 443/tcp และ 51820/udp เท่านั้น",
            },
            {
                title: "ทดสอบหลังปิด Port",
                body: "ทดสอบว่า SSH และ Portainer ยังเข้าได้ผ่าน VPN และ public port ถูกปิดแล้ว",
                code: "# ทดสอบ SSH ผ่าน VPN\nssh myvps\n\n# ทดสอบว่า public port ถูกปิดแล้ว — ควร timeout\nssh -p 2222 yourname@YOUR_SERVER_IP\n\n# ดู port ที่ listen อยู่\nsudo ss -tlnp",
                lang: "bash",
                note: "ถ้า SSH ผ่าน public IP timeout แต่ผ่าน VPN ได้ปกติ แสดงว่าสำเร็จ",
            },
            {
                title: "อัปเดต Fail2ban ให้ monitor VPN Interface",
                body: "หลังปิด public port แล้ว Fail2ban ยังคง monitor อยู่ — แต่ traffic จะวิ่งผ่าน interface wg0 แทน eth0",
                code: "sudo nano /etc/fail2ban/jail.local\n\n# แก้ไขเพิ่ม:\n[sshd]\nenabled  = true\nport     = 2222\nlogpath  = %(sshd_log)s\nbackend  = auto\nmaxretry = 5\nbantime  = 3600\n\n# restart\nsudo systemctl restart fail2ban\nsudo fail2ban-client status sshd",
                lang: "bash",
            },
            {
                title: "สรุป Port ที่เปิดอยู่",
                body: "หลังจาก Guide นี้ server จะเหลือ public port แค่สามตัว",
                code: "# Port ที่เปิดอยู่:\n# 80/tcp   — HTTP  (สำหรับ Nginx Proxy Manager)\n# 443/tcp  — HTTPS (สำหรับ Nginx Proxy Manager)\n# 51820/udp — WireGuard VPN\n\n# Port ที่เข้าผ่าน VPN เท่านั้น:\n# 2222     — SSH\n# 9443     — Portainer\n# 51821    — wg-easy Web UI",
                lang: "bash",
                note: "ทุกครั้งที่อยากเข้า server ต้องเปิด WireGuard ก่อนเสมอ",
            },
        ],
    },

    {
        id: 7, slug: "nginx-proxy-manager-setup", category: "infrastructure",
        title: "ติดตั้ง Nginx Proxy Manager ใน Docker Swarm",
        description: "Deploy Nginx Proxy Manager ใน Swarm ผ่าน Portainer UI, ตั้งค่า DNS ใน Cloudflare และออก wildcard SSL cert อัตโนมัติด้วย Let's Encrypt + Cloudflare DNS challenge",
        difficulty: "intermediate", time: "30 min",
        tags: ["Nginx", "Proxy Manager", "Cloudflare", "SSL", "Swarm", "Portainer"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 6 แล้ว — VPN พร้อมใช้และ Portainer เข้าได้ผ่าน VPN"],
        steps: [
            {
                title: "สร้าง Cloudflare API Token",
                body: "NPM ต้องการ Cloudflare API Token สำหรับ DNS challenge — สร้าง token แยกเฉพาะสำหรับงานนี้",
                code: "# ไปที่ Cloudflare Dashboard:\n# My Profile → API Tokens → Create Token\n# ใช้ template: Edit zone DNS\n# Zone Resources: Include → Specific zone → เลือก domain ของคุณ\n# กด Continue to summary → Create Token\n\n# เก็บ token ไว้ใช้ใน step ถัดไป — จะดูได้แค่ครั้งเดียว",
                lang: "bash",
                note: "ใช้ token แยกจาก Global API Key เสมอ — ถ้า token หายก็ลบแล้วสร้างใหม่ได้โดยไม่กระทบส่วนอื่น",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/pm1.png", caption: "หน้าสร้าง API Token ใน Cloudflare" },
                ],
            },
            {
                title: "ตั้งค่า DNS ใน Cloudflare",
                body: "สร้าง A record ชี้ domain มาที่ server IP และ wildcard สำหรับ subdomain",
                code: "# ใน Cloudflare Dashboard → DNS → Records:\n\n# A record หลัก\nType: A\nName: @\nContent: YOUR_SERVER_IP\nProxy: DNS only (ปิด orange cloud)\n\n# Wildcard สำหรับ subdomain\nType: A\nName: *\nContent: YOUR_SERVER_IP\nProxy: DNS only (ปิด orange cloud)",
                lang: "bash",
                note: "ปิด Cloudflare Proxy (orange cloud) ไว้ก่อน — NPM จะจัดการ SSL เอง ไม่ต้องผ่าน Cloudflare proxy",
            },
            {
                title: "สร้าง Stack ใน Portainer",
                body: "เข้า Portainer UI แล้วสร้าง stack ใหม่สำหรับ NPM",
                code: "# ใน Portainer UI (https://10.8.0.1:9443):\n# Primary → Stacks → Add stack\n# ตั้งชื่อ: nginx-proxy-manager\n# เลือก Web editor แล้วใส่ compose ใน step ถัดไป",
                lang: "bash",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/pm2.png", caption: "หน้าสร้าง stack ใหม่ใน Portainer" },
                ],
            },
            {
                title: "เขียน Compose File สำหรับ NPM",
                body: "ใส่ compose นี้ใน Web editor ของ Portainer",
                code: "services:\n  npm:\n    image: jc21/nginx-proxy-manager:latest\n    ports:\n      - 80:80\n      - 443:443\n      - 81:81\n    volumes:\n      - npm_data:/data\n      - npm_letsencrypt:/etc/letsencrypt\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\nvolumes:\n  npm_data:\n  npm_letsencrypt:\n\nnetworks:\n  main_public:\n    external: true",
                lang: "yaml",
                note: "ต่อ network main_public เพื่อให้ NPM proxy ไปยัง service อื่นใน network เดียวกันได้",
            },
            {
                title: "Deploy Stack",
                body: "กด Deploy stack ใน Portainer แล้วรอ NPM พร้อม",
                code: "# กด Deploy the stack ใน Portainer\n\n# ตรวจสอบจาก CLI:\ndocker service ls\ndocker service logs nginx-proxy-manager_npm --tail 20",
                lang: "bash",
                note: "รอสักครู่จน service status เป็น 1/1 — ถ้า 0/1 ให้ดู log หาสาเหตุ",
            },
            {
                title: "เข้า NPM Web UI ครั้งแรก",
                body: "เข้า NPM UI ผ่าน port 81 และ login ด้วย default credentials",
                code: "# เปิด browser แล้วไปที่:\nhttp://10.8.0.1:81\n\n# Default credentials:\n# Email: admin@example.com\n# Password: changeme\n\n# ระบบจะบังคับให้เปลี่ยน email และ password ทันที",
                lang: "bash",
                note: "port 81 สำหรับ NPM Admin UI — เข้าได้ผ่าน VPN เท่านั้น ไม่ได้เปิด public",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/pm3.png", caption: "หน้า login NPM ครั้งแรก" },
                ],
            },
            {
                title: "ออก Wildcard SSL Certificate ด้วย Cloudflare DNS Challenge",
                body: "สร้าง SSL cert แบบ wildcard ที่ครอบคลุมทุก subdomain ในครั้งเดียว",
                code: "# ใน NPM UI:\n# SSL Certificates → Add SSL Certificate → Let's Encrypt\n\n# Domain Names:\n# yourdomain.com\n# *.yourdomain.com\n\n# เปิด Use a DNS Challenge\n# เลือก Cloudflare\n# ใส่ Cloudflare API Token ที่สร้างไว้\n# กด Save",
                lang: "bash",
                note: "wildcard cert ครอบคลุม *.yourdomain.com ทุก subdomain — ไม่ต้องออก cert ใหม่ทุกครั้งที่เพิ่ม service",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/pm4.0.png", caption: "หน้าออก wildcard SSL cert ด้วย Cloudflare DNS challenge" },
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/pm4.png", caption: "หน้าออก wildcard SSL cert ด้วย Cloudflare DNS challenge" },
                ],
            },
            {
                title: "สร้าง Proxy Host แรก",
                body: "ทดสอบสร้าง proxy host โดยชี้ subdomain ไปที่ service ใน main_public network",
                code: "# ใน NPM UI:\n# Hosts → Proxy Hosts → Add Proxy Host\n\n# Details:\n# Domain Names: portainer.yourdomain.com\n# Scheme: https\n# Forward Hostname: portainer\n# Forward Port: 9443\n# เปิด Websockets Support\n\n# SSL:\n# เลือก cert wildcard ที่ออกไว้\n# เปิด Force SSL",
                lang: "bash",
                note: "Forward Hostname ใช้ชื่อ container แทน IP ได้เลย เพราะอยู่ใน network main_public เดียวกัน",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/pm5.png", caption: "หน้าสร้าง Proxy Host ใน NPM" },
                ],
            },
            {
                title: "ทดสอบ Proxy Host",
                body: "ทดสอบเข้า Portainer ผ่าน subdomain ที่ตั้งไว้",
                code: "# เปิด browser แล้วไปที่:\nhttps://portainer.yourdomain.com\n\n# ควรเข้าได้และมี SSL cert ถูกต้อง (ไม่มี warning)",
                lang: "bash",
                note: "ถ้าเข้าได้และ SSL เป็นสีเขียว แสดงว่า NPM และ Cloudflare ตั้งค่าถูกต้องแล้ว",
            },
            {
                title: "ปิด Port 81 จาก Public",
                body: "NPM Admin UI ไม่ควรเปิด public — เข้าได้ผ่าน VPN เท่านั้น ตรวจสอบว่า UFW ไม่ได้เปิด port 81 ไว้",
                code: "sudo ufw status verbose\n\n# ถ้าเห็น 81 เปิดอยู่ให้ปิด\nsudo ufw delete allow 81/tcp",
                lang: "bash",
                note: "port 80 และ 443 เปิด public ได้ — แต่ 81 ต้องเข้าผ่าน VPN เท่านั้น",
            },
            {
                title: "ตัวอย่าง — Deploy Service และเชื่อม Domain ผ่าน NPM",
                body: "ตัวอย่างนี้แสดงวิธี deploy stack ใหม่ใน Portainer และตั้งค่า proxy ใน NPM เพื่อให้เข้าถึงได้ผ่าน domain — NPM Admin UI เองไม่ควรเปิด public ให้เข้าได้ผ่าน domain ใช้ผ่าน VPN เท่านั้น",
                code: "# 1. Deploy stack ใหม่ใน Portainer\n# Primary → Stacks → Add stack\n# ตั้งชื่อ: myapp\n\n# ตัวอย่าง compose:\nservices:\n  myapp:\n    image: myapp:latest\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n\nnetworks:\n  main_public:\n    external: true\n\n# 2. หลัง deploy แล้ว ไปตั้งค่า NPM\n# เข้า NPM ผ่าน VPN: http://10.8.0.1:81\n# Hosts → Proxy Hosts → Add Proxy Host\n\n# Details:\n# Domain Names: myapp.yourdomain.com\n# Scheme: http\n# Forward Hostname: myapp\n# Forward Port: PORT_ของ_APP\n# เปิด Websockets Support (ถ้าใช้)\n\n# SSL:\n# เลือก wildcard cert ที่ออกไว้\n# เปิด Force SSL",
                lang: "yaml",
                note: "หลักการ: service ที่อยากเปิด public ให้ต่อ network main_public แล้วสร้าง proxy host ใน NPM — NPM Admin UI (port 81) เข้าได้ผ่าน VPN เท่านั้น ไม่ควรสร้าง proxy host ให้ NPM เอง",
            },
        ],
    },

    {
        id: 8, slug: "deploy-database-stacks", category: "infrastructure",
        title: "Deploy Database Stacks ใน Docker Swarm",
        description: "Deploy MariaDB, PostgreSQL, MongoDB และ Redis ใน Swarm ผ่าน Portainer โดยใช้ Docker Secret เก็บ password — ทุก service อยู่ใน network main_public เดียวกัน พร้อมใช้งานกับ service อื่นได้ทันที",
        difficulty: "intermediate", time: "40 min",
        tags: ["Docker", "Swarm", "MariaDB", "PostgreSQL", "MongoDB", "Redis", "Docker Secret", "Portainer"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 7 แล้ว — Swarm, Portainer และ NPM พร้อมใช้งาน"],
        steps: [
            {
                title: "ทำความเข้าใจ Docker Secret",
                body: "Docker Secret คือวิธีเก็บ password หรือข้อมูล sensitive ใน Swarm โดยไม่ต้องใส่ตรงๆ ใน compose file — Swarm จะ mount secret เป็นไฟล์ที่ /run/secrets/ชื่อ_secret ภายใน container",
                code: "# สร้าง secret\necho \"mypassword\" | docker secret create secret_name -\n\n# ดู secret ที่มีอยู่\ndocker secret ls\n\n# ลบ secret\ndocker secret rm secret_name",
                lang: "bash",
                note: "ค่าของ secret จะไม่สามารถดูได้หลังสร้างแล้ว — ถ้าลืมต้องลบแล้วสร้างใหม่เท่านั้น",
            },
            {
                title: "สร้าง Secret สำหรับทุก Database",
                body: "สร้าง secret ทีเดียวทั้งหมดก่อน deploy — ใช้ password ที่แข็งแรงแต่ละตัว",
                code: "# MariaDB\necho \"YOUR_MARIADB_ROOT_PASSWORD\" | docker secret create mariadb_root_password -\necho \"YOUR_MARIADB_PASSWORD\" | docker secret create mariadb_password -\n\n# PostgreSQL\necho \"YOUR_POSTGRES_PASSWORD\" | docker secret create postgres_password -\n\n# MongoDB\necho \"YOUR_MONGO_ROOT_PASSWORD\" | docker secret create mongo_root_password -\n\n# ตรวจสอบ\ndocker secret ls",
                lang: "bash",
                note: "Redis ไม่ต้องการ secret เพราะจะใช้งานแบบ internal เท่านั้น — ถ้าอยากตั้ง password Redis ก็สร้าง secret เพิ่มได้",
            },
            {
                title: "Deploy MariaDB",
                body: "สร้าง stack MariaDB ใน Portainer — ใช้ Docker Secret สำหรับ password",
                code: "# ใน Portainer UI:\n# Stacks → Add stack → ตั้งชื่อ: mariadb\n\nservices:\n  mariadb:\n    image: mariadb:11\n    environment:\n      MARIADB_ROOT_PASSWORD_FILE: /run/secrets/mariadb_root_password\n      MARIADB_PASSWORD_FILE: /run/secrets/mariadb_password\n      MARIADB_DATABASE: mydb\n      MARIADB_USER: myuser\n    secrets:\n      - mariadb_root_password\n      - mariadb_password\n    volumes:\n      - mariadb_data:/var/lib/mysql\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\nvolumes:\n  mariadb_data:\n\nnetworks:\n  main_public:\n    external: true\n\nsecrets:\n  mariadb_root_password:\n    external: true\n  mariadb_password:\n    external: true",
                lang: "yaml",
                note: "ไม่ได้เปิด port 3306 — เข้าถึงได้เฉพาะ service ที่อยู่ใน main_public network เท่านั้น ถ้าอยากทดสอบจากเครื่อง local ดู step เปิด port ด้านล่าง",
            },
            {
                title: "Deploy PostgreSQL",
                body: "สร้าง stack PostgreSQL ใน Portainer",
                code: "# Stacks → Add stack → ตั้งชื่อ: postgres\n\nservices:\n  postgres:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password\n      POSTGRES_DB: mydb\n      POSTGRES_USER: myuser\n    secrets:\n      - postgres_password\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\nvolumes:\n  postgres_data:\n\nnetworks:\n  main_public:\n    external: true\n\nsecrets:\n  postgres_password:\n    external: true",
                lang: "yaml",
                note: "ไม่ได้เปิด port 5432 — service อื่นใน main_public เชื่อมด้วย hostname: postgres",
            },
            {
                title: "Deploy MongoDB",
                body: "สร้าง stack MongoDB ใน Portainer",
                code: "# Stacks → Add stack → ตั้งชื่อ: mongodb\n\nservices:\n  mongodb:\n    image: mongo:7\n    environment:\n      MONGO_INITDB_ROOT_USERNAME: root\n      MONGO_INITDB_ROOT_PASSWORD_FILE: /run/secrets/mongo_root_password\n    secrets:\n      - mongo_root_password\n    volumes:\n      - mongodb_data:/data/db\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\nvolumes:\n  mongodb_data:\n\nnetworks:\n  main_public:\n    external: true\n\nsecrets:\n  mongo_root_password:\n    external: true",
                lang: "yaml",
                note: "ไม่ได้เปิด port 27017 — service อื่นใน main_public เชื่อมด้วย hostname: mongodb",
            },
            {
                title: "Deploy Redis",
                body: "สร้าง stack Redis ใน Portainer — ใช้แบบ internal ไม่ต้องการ password",
                code: "# Stacks → Add stack → ตั้งชื่อ: redis\n\nservices:\n  redis:\n    image: redis:7-alpine\n    volumes:\n      - redis_data:/data\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\nvolumes:\n  redis_data:\n\nnetworks:\n  main_public:\n    external: true",
                lang: "yaml",
                note: "Redis ใช้งานแบบ internal only — service อื่นใน main_public เชื่อมด้วย hostname: redis port 6379",
            },
            {
                title: "ตรวจสอบ Services ทั้งหมด",
                body: "ตรวจสอบว่าทุก service รันอยู่และ replica พร้อม",
                code: "docker service ls\n\n# ดู log แต่ละ service ถ้ามีปัญหา\ndocker service logs mariadb_mariadb --tail 20\ndocker service logs postgres_postgres --tail 20\ndocker service logs mongodb_mongodb --tail 20\ndocker service logs redis_redis --tail 20",
                lang: "bash",
                note: "ทุก service ควรแสดง 1/1 — ถ้า 0/1 ให้ดู log หาสาเหตุ",
            },
            {
                title: "ทดสอบเชื่อมต่อจาก Service อื่น",
                body: "ทดสอบว่า service ใน main_public network เชื่อมต่อ database ได้จริง โดยใช้ชื่อ service เป็น hostname",
                code: "# ทดสอบ MariaDB\ndocker run --rm --network main_public mariadb:11 \\\n  mysql -h mariadb -u myuser -p mydb\n\n# ทดสอบ PostgreSQL\ndocker run --rm --network main_public postgres:16 \\\n  psql -h postgres -U myuser -d mydb\n\n# ทดสอบ Redis\ndocker run --rm --network main_public redis:7-alpine \\\n  redis-cli -h redis ping",
                lang: "bash",
                note: "ถ้าได้ PONG จาก Redis และเข้า shell ของ MariaDB/PostgreSQL ได้ แสดงว่าทุก service พร้อมใช้งาน",
            },
            {
                title: "เปิด Port ชั่วคราวสำหรับทดสอบ (ไม่แนะนำ)",
                body: "ถ้าอยากทดสอบเชื่อมจากเครื่อง local ด้วย database client เช่น DBeaver หรือ TablePlus — เปิด port ชั่วคราวได้ แต่ต้องปิดทันทีหลังทดสอบเสร็จ",
                code: "# เปิด port ชั่วคราว\nsudo ufw allow 3306/tcp   # MariaDB\nsudo ufw allow 5432/tcp   # PostgreSQL\nsudo ufw allow 27017/tcp  # MongoDB\n\n# อัปเดต compose ให้ publish port — เพิ่มใน service:\n# ports:\n#   - 3306:3306\n\n# หลังทดสอบเสร็จ — ปิดทันที\nsudo ufw delete allow 3306/tcp\nsudo ufw delete allow 5432/tcp\nsudo ufw delete allow 27017/tcp",
                lang: "bash",
                note: "วิธีที่ดีกว่าคือเชื่อมผ่าน VPN แล้วใช้ SSH tunnel แทนการเปิด port — ปลอดภัยกว่าและไม่ต้องแก้ compose",
            },
            {
                title: "เชื่อมต่อ Database ผ่าน SSH Tunnel (แนะนำ)",
                body: "วิธีที่ปลอดภัยที่สุดสำหรับเชื่อมต่อ database จากเครื่อง local — ใช้ SSH tunnel ผ่าน VPN โดยไม่ต้องเปิด port เพิ่ม",
                code: "# เปิด VPN ก่อน แล้วรัน SSH tunnel\n\n# MariaDB\nssh -L 3306:mariadb:3306 myvps\n\n# PostgreSQL\nssh -L 5432:postgres:5432 myvps\n\n# MongoDB\nssh -L 27017:mongodb:27017 myvps\n\n# จากนั้นเปิด DBeaver/TablePlus เชื่อมที่:\n# Host: 127.0.0.1\n# Port: ตามที่ tunnel ไว้",
                lang: "bash",
                note: "SSH tunnel วิ่งผ่าน VPN — ไม่ต้องเปิด port เพิ่มและ database ไม่ได้ expose ออก public เลย",
            },
        ],
    },

    {
        id: 9, slug: "deploy-n8n", category: "infrastructure",
        title: "Deploy n8n ใน Docker Swarm",
        description: "Deploy n8n workflow automation ใน Swarm ผ่าน Portainer โดยใช้ PostgreSQL เป็น database และเชื่อม domain ผ่าน NPM สำหรับ webhook",
        difficulty: "intermediate", time: "30 min",
        tags: ["n8n", "Docker", "Swarm", "PostgreSQL", "Portainer", "Webhook"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 8 แล้ว — PostgreSQL deploy และพร้อมใช้งานใน main_public network"],
        steps: [
            {
                title: "สร้าง Database สำหรับ n8n",
                body: "สร้าง database และ user แยกสำหรับ n8n ใน PostgreSQL ที่ deploy ไว้แล้ว",
                code: "# เข้า PostgreSQL container\ndocker exec -it $(docker ps -q -f name=postgres_postgres) psql -U myuser -d mydb\n\n# สร้าง database และ user สำหรับ n8n\nCREATE DATABASE n8n;\nCREATE USER n8n WITH PASSWORD 'YOUR_N8N_DB_PASSWORD';\nGRANT ALL PRIVILEGES ON DATABASE n8n TO n8n;\n\\q",
                lang: "bash",
                note: "แยก database และ user เฉพาะ n8n — ไม่ใช้ user เดียวกับ service อื่น",
            },
            {
                title: "สร้าง Secret สำหรับ n8n",
                body: "สร้าง secret สำหรับ database password และ encryption key ของ n8n",
                code: "# Database password\necho \"YOUR_N8N_DB_PASSWORD\" | docker secret create n8n_db_password -\n\n# Encryption key — ใช้สำหรับเข้ารหัส credential ใน n8n\necho \"YOUR_RANDOM_ENCRYPTION_KEY\" | docker secret create n8n_encryption_key -\n\n# ตรวจสอบ\ndocker secret ls",
                lang: "bash",
                note: "Encryption key ควรเป็น string สุ่มยาวๆ — สร้างได้ด้วย: openssl rand -hex 32",
            },
            {
                title: "สร้าง Stack n8n ใน Portainer",
                body: "สร้าง stack n8n ใน Portainer — เชื่อม PostgreSQL และ main_public network",
                code: "# Stacks → Add stack → ตั้งชื่อ: n8n\n\nservices:\n  n8n:\n    image: n8nio/n8n:latest\n    environment:\n      - N8N_HOST=n8n.yourdomain.com\n      - N8N_PORT=5678\n      - N8N_PROTOCOL=https\n      - WEBHOOK_URL=https://n8n.yourdomain.com\n      - DB_TYPE=postgresdb\n      - DB_POSTGRESDB_HOST=postgres\n      - DB_POSTGRESDB_PORT=5432\n      - DB_POSTGRESDB_DATABASE=n8n\n      - DB_POSTGRESDB_USER=n8n\n      - DB_POSTGRESDB_PASSWORD_FILE=/run/secrets/n8n_db_password\n      - N8N_ENCRYPTION_KEY_FILE=/run/secrets/n8n_encryption_key\n      - N8N_USER_MANAGEMENT_DISABLED=false\n      - GENERIC_TIMEZONE=Asia/Bangkok\n    secrets:\n      - n8n_db_password\n      - n8n_encryption_key\n    volumes:\n      - n8n_data:/home/node/.n8n\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\nvolumes:\n  n8n_data:\n\nnetworks:\n  main_public:\n    external: true\n\nsecrets:\n  n8n_db_password:\n    external: true\n  n8n_encryption_key:\n    external: true",
                lang: "yaml",
                note: "แทน n8n.yourdomain.com ด้วย subdomain จริงของคุณ — WEBHOOK_URL สำคัญมาก ต้องตรงกับ domain ที่ใช้จริง",
            },
            {
                title: "ตั้งค่า Proxy Host ใน NPM",
                body: "สร้าง proxy host ใน NPM เพื่อให้เข้าถึง n8n ผ่าน domain และรับ webhook จาก internet ได้",
                code: "# เข้า NPM ผ่าน VPN: http://10.8.0.1:81\n# Hosts → Proxy Hosts → Add Proxy Host\n\n# Details:\n# Domain Names: n8n.yourdomain.com\n# Scheme: http\n# Forward Hostname: n8n\n# Forward Port: 5678\n# เปิด Websockets Support\n\n# SSL:\n# เลือก wildcard cert ที่ออกไว้\n# เปิด Force SSL",
                lang: "bash",
                note: "n8n ต้องการ Websockets — ถ้าไม่เปิด Websockets Support จะใช้งาน editor ไม่ได้",
                images: [
                    { src: "/guides/deploy-n8n/npm-n8n-proxy.png", caption: "ตั้งค่า Proxy Host สำหรับ n8n ใน NPM" },
                ],
            },
            {
                title: "ตรวจสอบ Service และ Log",
                body: "ตรวจสอบว่า n8n รันอยู่และเชื่อม PostgreSQL ได้สำเร็จ",
                code: "docker service ls\n\n# ดู log n8n\ndocker service logs n8n_n8n --tail 30\n\n# ถ้าเชื่อม DB สำเร็จจะเห็น:\n# Database connection established\n# n8n ready on 0.0.0.0:5678",
                lang: "bash",
                note: "ถ้าเห็น error เรื่อง database connection ให้ตรวจสอบว่า postgres service รันอยู่และ secret ถูกต้อง",
            },
            {
                title: "เข้า n8n และตั้งค่า Admin Account",
                body: "เข้า n8n ผ่าน domain และสร้าง admin account ครั้งแรก",
                code: "# เปิด browser แล้วไปที่:\nhttps://n8n.yourdomain.com\n\n# สร้าง owner account:\n# ใส่ชื่อ, email และ password\n# กด Next → Setup complete",
                lang: "bash",
                images: [
                    { src: "/guides/deploy-n8n/n8n-setup.png", caption: "หน้าตั้งค่า n8n ครั้งแรก" },
                ],
            },
            {
                title: "ทดสอบ Webhook",
                body: "ทดสอบว่า n8n รับ webhook จาก internet ได้จริง — สร้าง workflow ง่ายๆ เพื่อทดสอบ",
                code: "# สร้าง workflow ใหม่ใน n8n:\n# + Add node → Webhook\n# Method: GET\n# กด Listen for test event\n\n# ทดสอบจากเครื่อง local:\ncurl https://n8n.yourdomain.com/webhook-test/YOUR_WEBHOOK_PATH\n\n# ถ้า n8n รับได้จะเห็น event ใน editor ทันที",
                lang: "bash",
                note: "ถ้า webhook ไม่ทำงาน ตรวจสอบ WEBHOOK_URL ใน compose ว่าตรงกับ domain จริง",
            },
            {
                title: "Backup Encryption Key ไว้ด้วย",
                body: "Encryption key ของ n8n ใช้เข้ารหัส credential ทั้งหมด — ถ้าหายจะเข้า credential เดิมไม่ได้เลย",
                code: "# เก็บ encryption key ไว้ในที่ปลอดภัย เช่น password manager\n# ดูค่าจาก secret ไม่ได้แล้ว — ต้องเก็บไว้ก่อนสร้าง\n\n# ถ้าลืม key ต้องสร้างใหม่และ re-enter credential ทั้งหมดใน n8n",
                lang: "bash",
                note: "สำคัญมาก — เก็บ encryption key ไว้นอก server ด้วย เช่น Bitwarden หรือ 1Password",
            },
        ],
    },

    {
        id: 10, slug: "deploy-nextcloud-nfs", category: "infrastructure",
        title: "Deploy Nextcloud + NFS NAS",
        description: "Deploy Nextcloud ใน Swarm ผ่าน Portainer โดยใช้ PostgreSQL เป็น database และ mount NFS จาก NAS สำหรับเก็บไฟล์ — config และ metadata เก็บใน database, ไฟล์จริงเก็บบน NAS",
        difficulty: "intermediate", time: "40 min",
        tags: ["Nextcloud", "NFS", "NAS", "PostgreSQL", "Docker", "Swarm", "Portainer"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 8 แล้ว — PostgreSQL deploy และพร้อมใช้งานใน main_public network", "NAS รองรับ NFS และเปิด export ไว้แล้ว"],
        steps: [
            {
                title: "เตรียม NFS Export บน NAS",
                body: "ตรวจสอบว่า NAS เปิด NFS export และ server เข้าถึงได้ก่อน",
                code: "# ติดตั้ง nfs-common บน server\nsudo apt install nfs-common -y\n\n# ทดสอบว่า NAS เปิด NFS export ไว้\nshowmount -e YOUR_NAS_IP\n\n# ควรเห็น export path เช่น:\n# /volume1/nextcloud  *",
                lang: "bash",
                note: "ถ้า showmount ไม่ response ให้ตรวจสอบ firewall บน NAS และ NFS service ว่าเปิดอยู่",
            },
            {
                title: "สร้าง Mount Point และทดสอบ NFS",
                body: "สร้าง directory สำหรับ mount NFS และทดสอบ mount ก่อน deploy",
                code: "# สร้าง mount point\nsudo mkdir -p /mnt/nas/nextcloud\n\n# ทดสอบ mount\nsudo mount -t nfs YOUR_NAS_IP:/volume1/nextcloud /mnt/nas/nextcloud\n\n# ทดสอบเขียนไฟล์\ntouch /mnt/nas/nextcloud/test.txt\nls /mnt/nas/nextcloud\n\n# unmount หลังทดสอบ\nsudo umount /mnt/nas/nextcloud",
                lang: "bash",
                note: "ถ้า mount ได้และเขียนไฟล์ได้ แสดงว่า NFS พร้อม — ค่อย umount แล้วไป step ถัดไป",
            },
            {
                title: "ตั้งค่า Auto Mount ใน /etc/fstab",
                body: "ให้ server mount NFS อัตโนมัติทุกครั้งที่ reboot",
                code: "sudo nano /etc/fstab\n\n# เพิ่มบรรทัดนี้:\nYOUR_NAS_IP:/volume1/nextcloud  /mnt/nas/nextcloud  nfs  defaults,_netdev,nofail  0  0\n\n# ทดสอบ fstab\nsudo mount -a\n\n# ตรวจสอบว่า mount อยู่\ndf -h | grep nas",
                lang: "bash",
                note: "_netdev บอกให้รอ network พร้อมก่อน mount — nofail ป้องกัน server boot ค้างถ้า NAS ไม่ online",
            },
            {
                title: "สร้าง Database สำหรับ Nextcloud",
                body: "สร้าง database และ user แยกสำหรับ Nextcloud ใน PostgreSQL",
                code: "# เข้า PostgreSQL container\ndocker exec -it $(docker ps -q -f name=postgres_postgres) psql -U myuser -d mydb\n\n# สร้าง database และ user\nCREATE DATABASE nextcloud;\nCREATE USER nextcloud WITH PASSWORD 'YOUR_NEXTCLOUD_DB_PASSWORD';\nGRANT ALL PRIVILEGES ON DATABASE nextcloud TO nextcloud;\n\\q",
                lang: "bash",
            },
            {
                title: "สร้าง Secret สำหรับ Nextcloud",
                body: "สร้าง secret สำหรับ database password และ admin password ของ Nextcloud",
                code: "# Database password\necho \"YOUR_NEXTCLOUD_DB_PASSWORD\" | docker secret create nextcloud_db_password -\n\n# Admin password\necho \"YOUR_NEXTCLOUD_ADMIN_PASSWORD\" | docker secret create nextcloud_admin_password -\n\n# ตรวจสอบ\ndocker secret ls",
                lang: "bash",
            },
            {
                title: "สร้าง Stack Nextcloud ใน Portainer",
                body: "สร้าง stack Nextcloud ใน Portainer — config เก็บใน PostgreSQL, ไฟล์เก็บบน NFS",
                code: "# Stacks → Add stack → ตั้งชื่อ: nextcloud\n\nservices:\n  nextcloud:\n    image: nextcloud:28\n    environment:\n      - POSTGRES_HOST=postgres\n      - POSTGRES_DB=nextcloud\n      - POSTGRES_USER=nextcloud\n      - POSTGRES_PASSWORD_FILE=/run/secrets/nextcloud_db_password\n      - NEXTCLOUD_ADMIN_USER=admin\n      - NEXTCLOUD_ADMIN_PASSWORD_FILE=/run/secrets/nextcloud_admin_password\n      - NEXTCLOUD_TRUSTED_DOMAINS=nextcloud.yourdomain.com\n      - REDIS_HOST=redis\n      - REDIS_HOST_PORT=6379\n    secrets:\n      - nextcloud_db_password\n      - nextcloud_admin_password\n    volumes:\n      - nextcloud_config:/var/www/html\n      - /mnt/nas/nextcloud:/var/www/html/data\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\nvolumes:\n  nextcloud_config:\n\nnetworks:\n  main_public:\n    external: true\n\nsecrets:\n  nextcloud_db_password:\n    external: true\n  nextcloud_admin_password:\n    external: true",
                lang: "yaml",
                note: "nextcloud_config volume เก็บ config และ app — /mnt/nas/nextcloud เก็บไฟล์จริงของ user ทั้งหมด",
            },
            {
                title: "ตั้งค่า Proxy Host ใน NPM",
                body: "สร้าง proxy host ใน NPM สำหรับ Nextcloud",
                code: "# เข้า NPM ผ่าน VPN: http://10.8.0.1:81\n# Hosts → Proxy Hosts → Add Proxy Host\n\n# Details:\n# Domain Names: nextcloud.yourdomain.com\n# Scheme: http\n# Forward Hostname: nextcloud\n# Forward Port: 80\n# เปิด Websockets Support\n\n# SSL:\n# เลือก wildcard cert ที่ออกไว้\n# เปิด Force SSL",
                lang: "bash",
            },
            {
                title: "ตั้งค่า Nextcloud หลัง Deploy",
                body: "แก้ config.php เพิ่มค่าที่จำเป็นสำหรับ reverse proxy และ performance",
                code: "# เข้า container\ndocker exec -it $(docker ps -q -f name=nextcloud_nextcloud) bash\n\n# แก้ config.php\nnano /var/www/html/config/config.php\n\n# เพิ่มใน array:\n'trusted_proxies' => ['10.8.0.0/24'],\n'overwriteprotocol' => 'https',\n'overwrite.cli.url' => 'https://nextcloud.yourdomain.com',\n'default_phone_region' => 'TH',\n'memcache.local' => '\\OC\\Memcache\\APCu',\n'memcache.distributed' => '\\OC\\Memcache\\Redis',\n'redis' => [\n  'host' => 'redis',\n  'port' => 6379,\n],",
                lang: "bash",
                note: "trusted_proxies สำคัญมาก — ถ้าไม่ใส่ Nextcloud จะแสดง warning เรื่อง reverse proxy ตลอด",
            },
            {
                title: "ตรวจสอบ Nextcloud และ NFS",
                body: "ทดสอบ upload ไฟล์และตรวจสอบว่าไฟล์ไปอยู่บน NAS จริง",
                code: "# เข้า Nextcloud ผ่าน browser:\nhttps://nextcloud.yourdomain.com\n\n# ทดสอบ upload ไฟล์ใดก็ได้\n\n# ตรวจสอบบน server ว่าไฟล์อยู่บน NFS:\nls /mnt/nas/nextcloud/admin/files/\n\n# ดู log ถ้ามีปัญหา\ndocker service logs nextcloud_nextcloud --tail 30",
                lang: "bash",
                note: "ถ้าเห็นไฟล์ที่ upload ใน /mnt/nas/nextcloud แสดงว่า NFS mount ทำงานถูกต้อง",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/next1.png", caption: "หน้า dashboard Nextcloud หลัง login ครั้งแรก" },
                ],
            },
            {
                title: "ตั้งค่า Cron Job สำหรับ Nextcloud",
                body: "Nextcloud ต้องการ cron job รันทุก 5 นาทีสำหรับ background task เช่น scan ไฟล์และ notification",
                code: "# เพิ่ม cron job บน server\ncrontab -e\n\n# เพิ่มบรรทัดนี้:\n*/5 * * * * docker exec $(docker ps -q -f name=nextcloud_nextcloud) php /var/www/html/cron.php\n\n# ตรวจสอบใน Nextcloud UI:\n# Settings → Administration → Basic settings\n# Background jobs → เลือก Cron",
                lang: "bash",
                note: "ถ้าไม่ตั้ง cron job Nextcloud จะใช้ AJAX แทน ซึ่งช้ากว่าและไม่ reliable",
            },
        ],
    },

    {
        id: 11, slug: "deploy-gitlab", category: "infrastructure",
        title: "Deploy GitLab ใน Docker Swarm",
        description: "Deploy GitLab CE ใน Swarm ผ่าน Portainer สำหรับ self-hosted Git repository — เชื่อม domain ผ่าน NPM และตั้งค่า email notification",
        difficulty: "intermediate", time: "40 min",
        tags: ["GitLab", "Git", "Docker", "Swarm", "Portainer", "NPM"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 7 แล้ว — NPM พร้อมใช้งานและมี wildcard SSL cert"],
        steps: [
            {
                title: "ตรวจสอบ RAM ก่อน Deploy",
                body: "GitLab CE ต้องการ RAM อย่างน้อย 4GB — ตรวจสอบก่อนว่า server มีพอ",
                code: "free -h\n\n# ควรเห็น available RAM อย่างน้อย 4GB\n# ถ้าไม่พอ GitLab จะรันได้แต่ช้ามาก",
                lang: "bash",
                note: "GitLab เป็น service ที่กิน RAM มากที่สุดใน stack — ถ้า server มี RAM น้อยกว่า 4GB แนะนำให้ใช้ Gitea แทน",
            },
            {
                title: "สร้าง Directory สำหรับ GitLab",
                body: "สร้าง directory เก็บ config, log และ data ของ GitLab บน host",
                code: "sudo mkdir -p /opt/gitlab/{config,logs,data}\nsudo chown -R $USER:$USER /opt/gitlab",
                lang: "bash",
            },
            {
                title: "สร้าง Secret สำหรับ GitLab",
                body: "สร้าง secret สำหรับ root password ของ GitLab",
                code: "echo \"YOUR_GITLAB_ROOT_PASSWORD\" | docker secret create gitlab_root_password -\n\n# ตรวจสอบ\ndocker secret ls",
                lang: "bash",
                note: "root password ต้องยาวอย่างน้อย 8 ตัวอักษร — GitLab จะ reject ถ้าสั้นกว่านี้",
            },
            {
                title: "สร้าง Stack GitLab ใน Portainer",
                body: "สร้าง stack GitLab ใน Portainer — ใช้ volume บน host แทน named volume เพื่อให้ backup ง่ายกว่า",
                code: "# Stacks → Add stack → ตั้งชื่อ: gitlab\n\nservices:\n  gitlab:\n    image: gitlab/gitlab-ce:latest\n    hostname: gitlab.yourdomain.com\n    environment:\n      GITLAB_OMNIBUS_CONFIG: |\n        external_url 'https://gitlab.yourdomain.com'\n        nginx['listen_port'] = 80\n        nginx['listen_https'] = false\n        gitlab_rails['initial_root_password'] = File.read('/run/secrets/gitlab_root_password').strip\n        gitlab_rails['gitlab_shell_ssh_port'] = 2224\n        gitlab_rails['time_zone'] = 'Asia/Bangkok'\n    secrets:\n      - gitlab_root_password\n    volumes:\n      - /opt/gitlab/config:/etc/gitlab\n      - /opt/gitlab/logs:/var/log/gitlab\n      - /opt/gitlab/data:/var/opt/gitlab\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n      resources:\n        limits:\n          memory: 4g\n\nnetworks:\n  main_public:\n    external: true\n\nsecrets:\n  gitlab_root_password:\n    external: true",
                lang: "yaml",
                note: "nginx['listen_https'] = false เพราะ SSL จัดการโดย NPM แทน — GitLab รับ HTTP แล้ว NPM ทำ HTTPS ให้",
            },
            {
                title: "ตั้งค่า Proxy Host ใน NPM",
                body: "สร้าง proxy host ใน NPM สำหรับ GitLab",
                code: "# เข้า NPM ผ่าน VPN: http://10.8.0.1:81\n# Hosts → Proxy Hosts → Add Proxy Host\n\n# Details:\n# Domain Names: gitlab.yourdomain.com\n# Scheme: http\n# Forward Hostname: gitlab\n# Forward Port: 80\n# เปิด Websockets Support\n\n# SSL:\n# เลือก wildcard cert ที่ออกไว้\n# เปิด Force SSL",
                lang: "bash",
            },
            {
                title: "เปิด Port SSH สำหรับ Git Clone ผ่าน SSH",
                body: "ถ้าอยากใช้ git clone ผ่าน SSH ต้องเปิด port แยกจาก SSH ของ server",
                code: "# เปิด port 2224 สำหรับ GitLab SSH\nsudo ufw allow 2224/tcp\nsudo ufw status",
                lang: "bash",
                note: "ใช้ port 2224 แทน 22 เพื่อไม่ชนกับ SSH ของ server — clone ด้วย: git clone ssh://git@gitlab.yourdomain.com:2224/user/repo.git",
            },
            {
                title: "รอ GitLab เริ่มต้น",
                body: "GitLab ใช้เวลานานในการ start ครั้งแรก — ตรวจสอบ log จนกว่าจะพร้อม",
                code: "# ดู log GitLab\ndocker service logs gitlab_gitlab --tail 50 -f\n\n# รอจนเห็น:\n# gitlab Reconfigured!\n# gitlab ready\n\n# หรือตรวจสอบด้วย\ndocker exec -it $(docker ps -q -f name=gitlab_gitlab) gitlab-healthcheck",
                lang: "bash",
                note: "GitLab ใช้เวลา 3-5 นาทีในการ start ครั้งแรก — อย่า refresh browser บ่อยเกินไประหว่างรอ",
            },
            {
                title: "เข้า GitLab และเปลี่ยน Root Password",
                body: "เข้า GitLab ครั้งแรกด้วย root account",
                code: "# เปิด browser แล้วไปที่:\nhttps://gitlab.yourdomain.com\n\n# Login:\n# Username: root\n# Password: ที่ตั้งไว้ใน secret\n\n# เปลี่ยน password ทันทีหลัง login:\n# Avatar → Edit profile → Password",
                lang: "bash",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/gitlab1.png", caption: "หน้า dashboard GitLab หลัง login ครั้งแรก" },
                ],
            },
            {
                title: "ตั้งค่า GitLab — ปิด Sign Up",
                body: "ปิด public sign up เพื่อไม่ให้คนอื่น register เข้ามาได้",
                code: "# ใน GitLab UI:\n# Admin → Settings → General\n# Sign-up restrictions\n# ปิด Sign-up enabled\n# กด Save changes",
                lang: "bash",
                note: "สำคัญมาก — ถ้าลืมปิด ใครก็ได้ที่เข้าถึง domain จะ register เข้ามาได้",
            },
            {
                title: "ตั้งค่า Email (SMTP)",
                body: "ตั้งค่า SMTP เพื่อให้ GitLab ส่ง email notification ได้ — แก้ใน gitlab.rb",
                code: "# แก้ config บน host\nsudo nano /opt/gitlab/config/gitlab.rb\n\n# เพิ่มค่าเหล่านี้:\ngitlab_rails['smtp_enable'] = true\ngitlab_rails['smtp_address'] = \"smtp.gmail.com\"\ngitlab_rails['smtp_port'] = 587\ngitlab_rails['smtp_user_name'] = \"your@gmail.com\"\ngitlab_rails['smtp_password'] = \"YOUR_APP_PASSWORD\"\ngitlab_rails['smtp_domain'] = \"gmail.com\"\ngitlab_rails['smtp_authentication'] = \"login\"\ngitlab_rails['smtp_enable_starttls_auto'] = true\ngitlab_rails['gitlab_email_from'] = \"your@gmail.com\"\n\n# Reconfigure GitLab\ndocker exec -it $(docker ps -q -f name=gitlab_gitlab) gitlab-ctl reconfigure",
                lang: "bash",
                note: "Gmail ต้องใช้ App Password แทน password จริง — สร้างได้ที่ Google Account → Security → 2-Step Verification → App passwords",
            },
            {
                title: "สร้าง Project แรกและทดสอบ Clone",
                body: "ทดสอบสร้าง project และ clone ผ่าน HTTPS และ SSH",
                code: "# Clone ผ่าน HTTPS\ngit clone https://gitlab.yourdomain.com/root/myproject.git\n\n# Clone ผ่าน SSH\ngit clone ssh://git@gitlab.yourdomain.com:2224/root/myproject.git\n\n# ทดสอบ push\ncd myproject\necho \"# My Project\" > README.md\ngit add .\ngit commit -m \"Initial commit\"\ngit push",
                lang: "bash",
                note: "ถ้า clone และ push ได้ทั้ง HTTPS และ SSH แสดงว่า GitLab พร้อมใช้งานเต็มรูปแบบ",
            },
        ],
    },

    {
        id: 12, slug: "deploy-librenms", category: "infrastructure",
        title: "Deploy LibreNMS ใน Docker Swarm",
        description: "Deploy LibreNMS network monitoring ใน Swarm ผ่าน Portainer โดยใช้ MariaDB เป็น database และ Redis สำหรับ cache — monitor อุปกรณ์ network ทั้งหมดผ่าน SNMP",
        difficulty: "intermediate", time: "45 min",
        tags: ["LibreNMS", "SNMP", "Network", "Monitoring", "Docker", "Swarm", "Portainer", "MariaDB"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 8 แล้ว — MariaDB และ Redis deploy และพร้อมใช้งานใน main_public network"],
        steps: [
            {
                title: "สร้าง Database สำหรับ LibreNMS",
                body: "สร้าง database และ user แยกสำหรับ LibreNMS ใน MariaDB",
                code: "# เข้า MariaDB container\ndocker exec -it $(docker ps -q -f name=mariadb_mariadb) \\\n  mysql -u root -p\n\n# สร้าง database และ user\nCREATE DATABASE librenms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nCREATE USER 'librenms'@'%' IDENTIFIED BY 'YOUR_LIBRENMS_DB_PASSWORD';\nGRANT ALL PRIVILEGES ON librenms.* TO 'librenms'@'%';\nFLUSH PRIVILEGES;\nEXIT;",
                lang: "bash",
                note: "ต้องใช้ CHARACTER SET utf8mb4 — LibreNMS จะ error ถ้า charset ไม่ถูกต้อง",
            },
            {
                title: "สร้าง Secret สำหรับ LibreNMS",
                body: "สร้าง secret สำหรับ database password และ app key",
                code: "# Database password\necho \"YOUR_LIBRENMS_DB_PASSWORD\" | docker secret create librenms_db_password -\n\n# App key สำหรับ encrypt session\necho \"YOUR_RANDOM_APP_KEY\" | docker secret create librenms_app_key -\n\n# สร้าง random app key ด้วย\nopenssl rand -hex 32\n\n# ตรวจสอบ\ndocker secret ls",
                lang: "bash",
            },
            {
                title: "สร้าง Directory สำหรับ LibreNMS",
                body: "สร้าง directory เก็บ config และ RRD data ของ LibreNMS",
                code: "sudo mkdir -p /opt/librenms/{config,rrd,logs}\nsudo chown -R $USER:$USER /opt/librenms",
                lang: "bash",
                note: "RRD data เก็บ graph ของ traffic และ metric ต่างๆ — ควรอยู่บน host เพื่อให้ backup ได้",
            },
            {
                title: "สร้าง Stack LibreNMS ใน Portainer",
                body: "สร้าง stack LibreNMS ใน Portainer — ประกอบด้วย app, dispatcher และ syslog",
                code: "# Stacks → Add stack → ตั้งชื่อ: librenms\n\nservices:\n  librenms:\n    image: librenms/librenms:latest\n    hostname: librenms\n    environment:\n      - TZ=Asia/Bangkok\n      - PUID=1000\n      - PGID=1000\n      - DB_HOST=mariadb\n      - DB_NAME=librenms\n      - DB_USER=librenms\n      - DB_PASSWORD_FILE=/run/secrets/librenms_db_password\n      - REDIS_HOST=redis\n      - REDIS_PORT=6379\n      - DISPATCHER_NODE_ID=dispatcher1\n      - SIDECAR_DISPATCHER=1\n    secrets:\n      - librenms_db_password\n    volumes:\n      - /opt/librenms/config:/data/config\n      - /opt/librenms/rrd:/data/rrd\n      - /opt/librenms/logs:/data/logs\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\n  librenms_dispatcher:\n    image: librenms/librenms:latest\n    hostname: librenms_dispatcher\n    environment:\n      - TZ=Asia/Bangkok\n      - PUID=1000\n      - PGID=1000\n      - DB_HOST=mariadb\n      - DB_NAME=librenms\n      - DB_USER=librenms\n      - DB_PASSWORD_FILE=/run/secrets/librenms_db_password\n      - REDIS_HOST=redis\n      - REDIS_PORT=6379\n      - DISPATCHER_NODE_ID=dispatcher1\n      - SIDECAR_DISPATCHER=1\n    secrets:\n      - librenms_db_password\n    volumes:\n      - /opt/librenms/config:/data/config\n      - /opt/librenms/rrd:/data/rrd\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\nnetworks:\n  main_public:\n    external: true\n\nsecrets:\n  librenms_db_password:\n    external: true",
                lang: "yaml",
                note: "dispatcher รับผิดชอบ poll อุปกรณ์ทุก 5 นาที — แยก container ออกมาเพื่อให้ app ไม่ช้าตอน poll",
            },
            {
                title: "ตั้งค่า Proxy Host ใน NPM",
                body: "สร้าง proxy host ใน NPM สำหรับ LibreNMS",
                code: "# เข้า NPM ผ่าน VPN: http://10.8.0.1:81\n# Hosts → Proxy Hosts → Add Proxy Host\n\n# Details:\n# Domain Names: librenms.yourdomain.com\n# Scheme: http\n# Forward Hostname: librenms\n# Forward Port: 8000\n# เปิด Websockets Support\n\n# SSL:\n# เลือก wildcard cert ที่ออกไว้\n# เปิด Force SSL",
                lang: "bash",
            },
            {
                title: "เข้า LibreNMS และ Login ครั้งแรก",
                body: "เข้า LibreNMS UI และ login ด้วย default credentials",
                code: "# เปิด browser แล้วไปที่:\nhttps://librenms.yourdomain.com\n\n# Default credentials:\n# Username: admin\n# Password: admin\n\n# เปลี่ยน password ทันทีหลัง login",
                lang: "bash",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/nms1.png", caption: "หน้า dashboard LibreNMS หลัง login ครั้งแรก" },
                ],
            },
            {
                title: "ตั้งค่า SNMP Community",
                body: "ตั้งค่า SNMP community string ที่ใช้กับอุปกรณ์ network — ต้องตรงกับที่ตั้งบนอุปกรณ์",
                code: "# ใน LibreNMS UI:\n# Settings → Global Settings → SNMP\n# v1/v2c communities: public, YOUR_COMMUNITY_STRING\n\n# หรือแก้ใน config.php:\ndocker exec -it $(docker ps -q -f name=librenms_librenms) bash\nnano /data/config/config.php\n\n# เพิ่ม:\n$config['snmp']['community'] = ['public', 'YOUR_COMMUNITY_STRING'];",
                lang: "bash",
                note: "ควรเปลี่ยน community string จาก public เป็นค่าที่กำหนดเองเสมอ — public เป็นค่า default ที่ไม่ปลอดภัย",
            },
            {
                title: "เพิ่มอุปกรณ์ Network แรก",
                body: "เพิ่มอุปกรณ์ network เข้า LibreNMS เพื่อเริ่ม monitor",
                code: "# ใน LibreNMS UI:\n# Devices → Add Device\n\n# กรอกข้อมูล:\n# Hostname/IP: IP ของอุปกรณ์\n# SNMP Version: v2c\n# Community: YOUR_COMMUNITY_STRING\n# กด Add Device\n\n# หรือเพิ่มจาก CLI:\ndocker exec -it $(docker ps -q -f name=librenms_librenms) \\\n  lnms device:add YOUR_DEVICE_IP --community YOUR_COMMUNITY_STRING",
                lang: "bash",
                note: "ถ้าเพิ่มแล้วขึ้น SNMP timeout ให้ตรวจสอบว่าอุปกรณ์เปิด SNMP และ community string ถูกต้อง",
            },
            {
                title: "ตั้งค่า Auto Discovery",
                body: "เปิด auto discovery เพื่อให้ LibreNMS ค้นหาอุปกรณ์ใหม่ในเครือข่ายอัตโนมัติ",
                code: "# ใน LibreNMS UI:\n# Settings → Global Settings → Discovery\n# เปิด Enable network discovery\n# ใส่ network range เช่น 192.168.1.0/24\n\n# รัน discovery ทันที\ndocker exec -it $(docker ps -q -f name=librenms_librenms) \\\n  lnms discovery:run",
                lang: "bash",
                note: "Discovery จะรันอัตโนมัติทุก 6 ชั่วโมง — รันด้วยมือได้ถ้าอยากเห็นผลทันที",
            },
            {
                title: "ตั้งค่า Alert และ Notification",
                body: "ตั้ง alert rule และช่องทาง notification เมื่ออุปกรณ์ down หรือ threshold เกิน",
                code: "# ใน LibreNMS UI:\n# Alerts → Alert Rules → + Create Rule\n\n# ตัวอย่าง rule อุปกรณ์ down:\n# Name: Device Down\n# Builder: devices.status = 0\n# Severity: critical\n\n# ตั้ง Notification:\n# Alerts → Alert Transports → + Create Transport\n# เลือก Telegram หรือ Email\n# ใส่ Bot Token และ Chat ID",
                lang: "bash",
                note: "LibreNMS มี alert template สำเร็จรูปให้เลือกใช้ได้เลย — ไปที่ Alerts → Alert Rules → จะเห็น default rules",
            },
            {
                title: "ตรวจสอบ Polling และ Graph",
                body: "ตรวจสอบว่า LibreNMS poll อุปกรณ์ได้และ graph แสดงข้อมูลถูกต้อง",
                code: "# ดู log dispatcher\ndocker service logs librenms_librenms_dispatcher --tail 30\n\n# รัน poll ทันที\ndocker exec -it $(docker ps -q -f name=librenms_librenms) \\\n  lnms device:poll YOUR_DEVICE_IP\n\n# ตรวจสอบ overview validation\ndocker exec -it $(docker ps -q -f name=librenms_librenms) \\\n  lnms validate",
                lang: "bash",
                note: "ถ้า lnms validate ผ่านทุก check แสดงว่า LibreNMS พร้อมใช้งานเต็มรูปแบบ",
            },
        ],
    },

    {
        id: 15, slug: "grafana-prometheus-monitoring", category: "infrastructure",
        title: "Deploy Grafana + Prometheus ใน Docker Swarm",
        description: "Deploy Prometheus สำหรับเก็บ metric และ Grafana สำหรับ visualize — monitor ทั้ง server resource และ container ผ่าน Node Exporter และ cAdvisor เชื่อม domain ผ่าน NPM",
        difficulty: "intermediate", time: "45 min",
        tags: ["Grafana", "Prometheus", "Node Exporter", "cAdvisor", "Docker", "Swarm", "Monitoring"], updated: "Apr 2025",
        prerequisites: ["ผ่าน Guide 7 แล้ว — NPM พร้อมใช้งานและมี wildcard SSL cert"],
        steps: [
            {
                title: "สร้าง Directory สำหรับ Prometheus",
                body: "สร้าง directory เก็บ config ของ Prometheus บน host",
                code: "sudo mkdir -p /opt/prometheus\nsudo chown $USER:$USER /opt/prometheus",
                lang: "bash",
            },
            {
                title: "สร้าง prometheus.yml",
                body: "เขียน config หลักของ Prometheus — กำหนด scrape target ทั้งหมดที่จะ collect metric",
                code: "nano /opt/prometheus/prometheus.yml\n\n# ใส่ข้อความนี้:\nglobal:\n  scrape_interval: 15s\n  evaluation_interval: 15s\n\nscrape_configs:\n  - job_name: 'prometheus'\n    static_configs:\n      - targets: ['localhost:9090']\n\n  - job_name: 'node'\n    static_configs:\n      - targets: ['node-exporter:9100']\n\n  - job_name: 'cadvisor'\n    static_configs:\n      - targets: ['cadvisor:8080']",
                lang: "bash",
                note: "scrape_interval: 15s คือ Prometheus จะ pull metric ทุก 15 วินาที — เพิ่มได้ถ้าต้องการ resolution ละเอียดขึ้น แต่กิน disk มากขึ้น",
            },
            {
                title: "สร้าง Stack Monitoring ใน Portainer",
                body: "สร้าง stack เดียวที่รวม Prometheus, Grafana, Node Exporter และ cAdvisor — ทุกอย่างอยู่ใน main_public network เดียวกัน",
                code: "# Stacks → Add stack → ตั้งชื่อ: monitoring\n\nservices:\n  prometheus:\n    image: prom/prometheus:latest\n    volumes:\n      - /opt/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml\n      - prometheus_data:/prometheus\n    command:\n      - '--config.file=/etc/prometheus/prometheus.yml'\n      - '--storage.tsdb.path=/prometheus'\n      - '--storage.tsdb.retention.time=30d'\n      - '--web.enable-lifecycle'\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\n  grafana:\n    image: grafana/grafana:latest\n    environment:\n      - GF_SECURITY_ADMIN_USER=admin\n      - GF_SECURITY_ADMIN_PASSWORD=YOUR_GRAFANA_PASSWORD\n      - GF_SERVER_ROOT_URL=https://grafana.yourdomain.com\n      - GF_USERS_ALLOW_SIGN_UP=false\n    volumes:\n      - grafana_data:/var/lib/grafana\n    networks:\n      - main_public\n    deploy:\n      replicas: 1\n      placement:\n        constraints:\n          - node.role == manager\n\n  node-exporter:\n    image: prom/node-exporter:latest\n    volumes:\n      - /proc:/host/proc:ro\n      - /sys:/host/sys:ro\n      - /:/rootfs:ro\n    command:\n      - '--path.procfs=/host/proc'\n      - '--path.rootfs=/rootfs'\n      - '--path.sysfs=/host/sys'\n      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'\n    networks:\n      - main_public\n    deploy:\n      mode: global\n\n  cadvisor:\n    image: gcr.io/cadvisor/cadvisor:latest\n    volumes:\n      - /:/rootfs:ro\n      - /var/run:/var/run:ro\n      - /sys:/sys:ro\n      - /var/lib/docker/:/var/lib/docker:ro\n      - /dev/disk/:/dev/disk:ro\n    networks:\n      - main_public\n    deploy:\n      mode: global\n\nvolumes:\n  prometheus_data:\n  grafana_data:\n\nnetworks:\n  main_public:\n    external: true",
                lang: "yaml",
                note: "node-exporter และ cadvisor ใช้ mode: global — รันทุก node ใน Swarm โดยอัตโนมัติ ไม่ต้องตั้ง replicas",
            },
            {
                title: "ตรวจสอบ Services",
                body: "ตรวจสอบว่าทุก service รันอยู่และ replica พร้อม",
                code: "docker service ls\n\n# ดู log ถ้ามีปัญหา\ndocker service logs monitoring_prometheus --tail 20\ndocker service logs monitoring_grafana --tail 20",
                lang: "bash",
                note: "Prometheus และ Grafana ควรแสดง 1/1 — node-exporter และ cadvisor จะแสดงตามจำนวน node ใน Swarm",
            },
            {
                title: "ตั้งค่า Proxy Host ใน NPM",
                body: "สร้าง proxy host สำหรับ Grafana — Prometheus ไม่ต้องเปิด public เข้าผ่าน VPN พอ",
                code: "# เข้า NPM ผ่าน VPN: http://10.8.0.1:81\n# Hosts → Proxy Hosts → Add Proxy Host\n\n# Details:\n# Domain Names: grafana.yourdomain.com\n# Scheme: http\n# Forward Hostname: grafana\n# Forward Port: 3000\n\n# SSL:\n# เลือก wildcard cert ที่ออกไว้\n# เปิด Force SSL",
                lang: "bash",
                note: "Prometheus ไม่มี authentication — ไม่ควรเปิด public เด็ดขาด เข้าได้แค่ http://10.8.0.1:9090 ผ่าน VPN เท่านั้น",
            },
            {
                title: "ตรวจสอบ Prometheus Targets",
                body: "เข้า Prometheus UI ตรวจสอบว่า scrape target ทั้งหมด status เป็น UP",
                code: "# เปิด browser แล้วไปที่ (ต้องเปิด VPN):\nhttp://10.8.0.1:9090\n\n# ไปที่ Status → Targets\n# ควรเห็น 3 targets:\n# prometheus  → UP\n# node        → UP\n# cadvisor    → UP",
                lang: "bash",
                note: "ถ้า target ใด DOWN ให้ตรวจสอบว่า container รันอยู่และ hostname ใน prometheus.yml ตรงกับชื่อ service",
            },
            {
                title: "เข้า Grafana และเพิ่ม Prometheus Data Source",
                body: "Login Grafana แล้วเชื่อม Prometheus เป็น data source",
                code: "# เปิด browser แล้วไปที่:\nhttps://grafana.yourdomain.com\n\n# Login:\n# Username: admin\n# Password: ที่ตั้งไว้ใน compose\n\n# เพิ่ม Data Source:\n# Connections → Data Sources → Add new data source\n# เลือก Prometheus\n# URL: http://prometheus:9090\n# กด Save & Test → ควรเห็น 'Successfully queried the Prometheus API'",
                lang: "bash",
                note: "ใช้ชื่อ service prometheus แทน IP ได้เลย เพราะอยู่ใน main_public network เดียวกัน",
            },
            {
                title: "Import Dashboard Node Exporter Full",
                body: "Import dashboard สำเร็จรูปสำหรับ monitor server resource — ไม่ต้องสร้าง panel เอง",
                code: "# ใน Grafana UI:\n# Dashboards → New → Import\n# ใส่ Dashboard ID: 1860\n# กด Load\n# เลือก Prometheus data source ที่เพิ่มไว้\n# กด Import",
                lang: "bash",
                note: "Dashboard ID 1860 คือ 'Node Exporter Full' — แสดง CPU, RAM, Disk, Network ครบในหน้าเดียว",
            },
            {
                title: "Import Dashboard cAdvisor",
                body: "Import dashboard สำหรับ monitor container resource แยกรายตัว",
                code: "# ใน Grafana UI:\n# Dashboards → New → Import\n# ใส่ Dashboard ID: 14282\n# กด Load\n# เลือก Prometheus data source\n# กด Import",
                lang: "bash",
                note: "Dashboard ID 14282 แสดง CPU, RAM และ network ของแต่ละ container — ใช้ดูว่า container ไหนกิน resource มากผิดปกติ",
            },
            {
                title: "สร้าง Alert Rule ใน Grafana",
                body: "ตั้ง alert เมื่อ CPU หรือ RAM เกิน threshold — ส่งแจ้งเตือนผ่าน Telegram หรือ Email",
                code: "# ใน Grafana UI:\n# Alerting → Contact Points → Add contact point\n# ตั้งชื่อ: telegram\n# Integration: Telegram\n# ใส่ Bot Token และ Chat ID\n# กด Test → Save\n\n# สร้าง Alert Rule:\n# Alerting → Alert Rules → New alert rule\n\n# ตัวอย่าง CPU สูงเกิน 80%:\n# Query A:\n# 100 - (avg by (instance)(rate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)\n# Condition: IS ABOVE 80\n# For: 5m",
                lang: "bash",
                note: "For: 5m หมายความว่า condition ต้องเป็นจริงติดต่อกัน 5 นาที ถึงจะส่ง alert — ป้องกัน false positive จาก spike ชั่วคราว",
            },
            {
                title: "ตั้งค่า Grafana Default Dashboard",
                body: "ตั้ง dashboard ที่เปิดอยู่เสมอเมื่อ login เข้า Grafana",
                code: "# ใน Grafana UI:\n# Administration → Default Preferences\n# Home Dashboard → เลือก Node Exporter Full\n# กด Save",
                lang: "bash",
            },
            {
                title: "ตรวจสอบ Retention และ Disk Usage",
                body: "ตรวจสอบว่า Prometheus เก็บข้อมูลได้ตาม retention ที่ตั้งไว้และดู disk ที่ใช้",
                code: "# ดู disk ที่ Prometheus ใช้\ndocker exec -it $(docker ps -q -f name=monitoring_prometheus) \\\n  du -sh /prometheus\n\n# ดู retention ที่ตั้งไว้\ndocker service inspect monitoring_prometheus \\\n  --format '{{json .Spec.TaskTemplate.ContainerSpec.Args}}'",
                lang: "bash",
                note: "retention 30 วัน กับ scrape interval 15 วินาที และ 3 target จะกิน disk ประมาณ 2-5 GB — ปรับ retention.time ได้ตามต้องการ",
            },
        ],
    },

    {
        id: 13, slug: "deploy-vercel", category: "infrastructure",
        title: "Deploy Next.js / Vite ขึ้น Vercel + เชื่อม Domain ผ่าน Cloudflare",
        description: "เชื่อม GitHub repo เข้า Vercel, ตั้งค่า Environment Variables, ให้ build อัตโนมัติทุกครั้งที่ push main และชี้ custom domain ผ่าน Cloudflare DNS",
        difficulty: "beginner", time: "20 min",
        tags: ["Vercel", "Next.js", "Vite", "GitHub", "Cloudflare", "CI/CD"], updated: "Apr 2025",
        prerequisites: ["มี GitHub repo ของ project พร้อมแล้ว", "มี domain ที่ใช้ Cloudflare เป็น nameserver"],
        steps: [
            {
                title: "สมัครและ Login Vercel",
                body: "เข้า vercel.com แล้ว login ด้วย GitHub account เดียวกับที่เก็บ repo — Vercel จะขอ permission เข้าถึง repo",
                code: "# เปิด browser แล้วไปที่:\nhttps://vercel.com\n\n# กด Continue with GitHub\n# อนุญาต Vercel เข้าถึง GitHub account",
                lang: "bash",
                note: "แนะนำให้เลือก 'Only select repositories' แทน 'All repositories' — ให้ Vercel เข้าถึงเฉพาะ repo ที่ต้องการ",
            },
            {
                title: "Import Git Repository",
                body: "เพิ่ม project ใหม่โดย import จาก GitHub repo ที่มีอยู่",
                code: "# ใน Vercel Dashboard:\n# Add New → Project\n# เลือก Import Git Repository\n# หา repo ที่ต้องการแล้วกด Import",
                lang: "bash",
            },
            {
                title: "ตั้งค่า Project — Framework และ Build",
                body: "Vercel จะ detect framework อัตโนมัติ — ตรวจสอบให้ถูกต้องก่อน deploy",
                code: "# Vercel จะ detect ให้เองจาก package.json:\n# Next.js   → Framework: Next.js    | Build: next build\n# Vite      → Framework: Vite       | Build: vite build\n\n# ถ้า detect ผิด แก้ได้ที่:\n# Framework Preset → เลือก framework ที่ถูกต้อง\n\n# Build & Output Settings (ถ้าต้องการกำหนดเอง):\n# Build Command:  npm run build\n# Output Dir:     dist   (Vite) หรือ .next  (Next.js)\n# Install Command: npm install",
                lang: "bash",
                note: "ส่วนใหญ่ไม่ต้องแตะ — Vercel detect และตั้งค่าให้ถูกต้องอยู่แล้ว ตรวจแค่ว่า Framework Preset ถูก",
            },
            {
                title: "ตั้งค่า Environment Variables",
                body: "เพิ่ม env var ที่ project ต้องการก่อน deploy — ค่าเหล่านี้จะถูก inject ตอน build และ runtime",
                code: "# ใน Vercel Project Settings:\n# Settings → Environment Variables\n# กด Add\n\n# กรอกแต่ละตัว:\n# Key:   DATABASE_URL\n# Value: postgresql://...\n# Environment: Production, Preview, Development (เลือกได้)\n\n# Next.js — ตัวที่ต้องการให้ browser เข้าถึงได้ต้องขึ้นต้นด้วย:\nNEXT_PUBLIC_API_URL=https://api.yourdomain.com\n\n# Vite — ตัวที่ต้องการให้ browser เข้าถึงได้ต้องขึ้นต้นด้วย:\nVITE_API_URL=https://api.yourdomain.com",
                lang: "bash",
                note: "env var ที่ไม่มี prefix NEXT_PUBLIC_ หรือ VITE_ จะเข้าถึงได้แค่ฝั่ง server เท่านั้น — ไม่ถูก expose ออก browser",

            },
            {
                title: "Deploy ครั้งแรก",
                body: "กด Deploy แล้วรอ Vercel build และ deploy project — ครั้งแรกใช้เวลา 1-3 นาที",
                code: "# กด Deploy ใน Vercel UI\n# ดู build log แบบ real-time ได้ระหว่างรอ\n\n# ถ้า build สำเร็จจะเห็น:\n# ✓ Build Completed\n# ✓ Deployed to Production\n\n# Vercel จะให้ URL สำเร็จรูปทันที เช่น:\n# https://myproject.vercel.app",
                lang: "bash",
                note: "ถ้า build fail ดู log ได้เลยในหน้านั้น — error ส่วนใหญ่มาจาก missing env var หรือ type error ที่ผ่านบน local แต่ fail บน build server",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/vercel4.png", caption: "หน้า build log ระหว่าง deploy" },
                ],
            },
            {
                title: "ทดสอบ Auto Deploy เมื่อ Push main",
                body: "หลัง import แล้ว Vercel จะ build ใหม่อัตโนมัติทุกครั้งที่ push ขึ้น branch main — ไม่ต้องทำอะไรเพิ่ม",
                code: "# ทดสอบบนเครื่อง local:\ngit add .\ngit commit -m \"test auto deploy\"\ngit push origin main\n\n# เข้า Vercel Dashboard → Project → Deployments\n# จะเห็น deployment ใหม่เริ่ม build ทันทีหลัง push",
                lang: "bash",
                note: "branch อื่นนอกจาก main ก็ deploy ได้เช่นกัน แต่จะได้เป็น Preview URL แยกต่างหาก ไม่กระทบ Production",
            },
            {
                title: "เพิ่ม Custom Domain ใน Vercel",
                body: "เพิ่ม domain ที่ต้องการใช้งานจริงเข้าไปใน project",
                code: "# ใน Vercel Dashboard:\n# Project → Settings → Domains\n# กด Add Domain\n# พิมพ์ domain เช่น yourdomain.com\n# กด Add\n\n# Vercel จะแสดง DNS record ที่ต้องตั้งใน Cloudflare:\n# Type: CNAME\n# Name: @  (หรือ www)\n# Value: cname.vercel-dns.com",
                lang: "bash",
                note: "Vercel จะแนะนำ record ที่ต้องตั้งให้เลย — copy ค่าไปใส่ Cloudflare ใน step ถัดไปได้เลย",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/vercel5.png", caption: "หน้าเพิ่ม Domain และ DNS record ที่ต้องตั้งใน Vercel" },
                ],
            },
            {
                title: "ตั้งค่า DNS ใน Cloudflare",
                body: "เพิ่ม DNS record ใน Cloudflare ให้ชี้ domain มาที่ Vercel",
                code: "# ใน Cloudflare Dashboard → DNS → Records:\n\n# สำหรับ root domain (yourdomain.com)\nType:    CNAME\nName:    @\nContent: cname.vercel-dns.com\nProxy:   DNS only (ปิด orange cloud)\n\n# สำหรับ www (ถ้าต้องการ)\nType:    CNAME\nName:    www\nContent: cname.vercel-dns.com\nProxy:   DNS only (ปิด orange cloud)",
                lang: "bash",
                note: "ต้องปิด Cloudflare Proxy (orange cloud) — ถ้าเปิดไว้ Vercel จะออก SSL cert ไม่ได้และ domain จะ error",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/vercel6.png", caption: "ตั้งค่า CNAME record ใน Cloudflare สำหรับชี้มาที่ Vercel" },
                ],
            },
            {
                title: "ตรวจสอบ Domain และ SSL",
                body: "กลับมาที่ Vercel รอให้ DNS propagate แล้วตรวจสอบว่า domain ใช้งานได้และ SSL พร้อม",
                code: "# กลับมาที่ Vercel → Project → Settings → Domains\n# รอจนสถานะเปลี่ยนจาก 'Pending' เป็น 'Valid'\n\n# ทดสอบในเครื่อง local:\ncurl -I https://yourdomain.com\n\n# ควรเห็น:\n# HTTP/2 200\n# x-vercel-id: ...",
                lang: "bash",
                note: "DNS propagate ใช้เวลา 1-10 นาทีสำหรับ Cloudflare — ถ้านานกว่านั้นให้ตรวจสอบว่า CNAME record ถูกต้องและปิด proxy แล้ว",
            },
            {
                title: "สรุป Flow การทำงาน",
                body: "หลังตั้งค่าครบแล้ว workflow จะเป็นดังนี้ทุกครั้ง",
                code: "# Workflow หลังตั้งค่าครบ:\n\n# 1. แก้ code บนเครื่อง local\n# 2. git push origin main\n# 3. Vercel รับ webhook จาก GitHub → เริ่ม build อัตโนมัติ\n# 4. Build สำเร็จ → deploy ขึ้น Production ทันที\n# 5. https://yourdomain.com แสดง version ใหม่\n\n# ดู deployment history ทั้งหมด:\n# Vercel Dashboard → Project → Deployments\n\n# Rollback ถ้า version ใหม่มีปัญหา:\n# กด ... → Instant Rollback บน deployment เก่าที่ต้องการ",
                lang: "bash",
                note: "Vercel เก็บทุก deployment ไว้เสมอ — rollback กลับไป version ไหนก็ได้ในคลิกเดียว ไม่ต้อง git revert",
            },
        ],
    },


    {
        id: 14, slug: "github-actions-docker-ci-cd", category: "infrastructure",
        title: "GitHub Actions — Build Docker Image + Auto Merge + Telegram Notify",
        description: "ตั้งค่า GitHub Actions สองรูปแบบ: (1) push main → build → push Docker Hub และ (2) dev → auto merge main → build → notify Telegram — พร้อม Dockerfile สำหรับ NestJS, Vite และ Elysia (Bun)",
        difficulty: "intermediate", time: "40 min",
        tags: ["GitHub Actions", "Docker", "CI/CD", "Telegram", "NestJS", "Vite", "Elysia", "Bun"], updated: "Apr 2025",
        prerequisites: ["มี GitHub repo พร้อมแล้ว", "มี Docker Hub account", "ผ่าน Guide 4 แล้ว — Docker + Portainer พร้อมใช้งาน"],
        steps: [
            {
                title: "ทำความเข้าใจ 2 Workflow",
                body: "มี workflow สองรูปแบบที่ใช้ร่วมกัน แต่ละตัวมี trigger และ use case ต่างกัน",
                code: "# Workflow 1: docker-image.yml\n# Trigger: push หรือ PR ไปที่ main\n# Use case: build และ push Docker image ทุกครั้งที่ main เปลี่ยน\n# เหมาะกับ: project ที่ push main โดยตรง หรือ merge PR\n\n# Workflow 2: auto-merge-to-main-build-docker.yml\n# Trigger: push ไปที่ dev พร้อม commit message ที่มีคำว่า 'push to main'\n# Use case: dev → merge main → build → สร้าง dev branch ใหม่ → notify\n# เหมาะกับ: workflow ที่ทำงานบน dev แล้วค่อย promote ขึ้น main",
                lang: "bash",
                note: "ใช้ทั้งสองไฟล์ในโปรเจคเดียวกันได้ — workflow 2 จะ trigger workflow 1 ต่อเนื่องอัตโนมัติหลัง merge ถึง main",
            },
            {
                title: "ตั้งค่า Secrets ใน GitHub Repository",
                body: "เพิ่ม secret ที่ workflow ทั้งสองต้องใช้ — ทำครั้งเดียวใช้ได้ทุก workflow",
                code: "# ไปที่ GitHub Repository:\n# Settings → Secrets and variables → Actions\n# กด New repository secret\n\n# Secrets ที่ต้องเพิ่ม:\n# DOCKER_HUB_USERNAME  — ชื่อ user Docker Hub\n# DOCKER_HUB_PASSWORD  — Password หรือ Access Token ของ Docker Hub\n# TELEGRAM_BOT_TOKEN   — Token จาก @BotFather\n\n# Variables (ไม่ใช่ Secret — ดูได้แต่แก้ได้):\n# Settings → Secrets and variables → Actions → Variables tab\n# TELEGRAM_CHAT_ID     — Chat ID ของ Telegram",
                lang: "bash",
                note: "แนะนำให้ใช้ Docker Hub Access Token แทน password จริง — สร้างได้ที่ hub.docker.com → Account Settings → Security → New Access Token",
            },
            {
                title: "สร้าง Telegram Bot และหา Chat ID",
                body: "สร้าง bot สำหรับรับแจ้งเตือนจาก GitHub Actions",
                code: "# 1. สร้าง Bot:\n# เปิด Telegram → ค้นหา @BotFather\n# พิมพ์ /newbot → ตั้งชื่อ → ได้ Bot Token\n\n# 2. หา Chat ID:\n# เพิ่ม bot เข้า group หรือ chat กับ bot โดยตรง\n# ส่งข้อความใดๆ ก่อน 1 ข้อความ\n# เปิด browser แล้วไปที่:\nhttps://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates\n\n# ดูค่า chat.id ในผลลัพธ์\n# Group จะเป็นตัวเลขติดลบ เช่น -4630731433\n# DM จะเป็นตัวเลขบวก\n\n# 3. ทดสอบส่งข้อความ:\ncurl -X POST \"https://api.telegram.org/bot<TOKEN>/sendMessage\" \\\n  -d \"chat_id=<CHAT_ID>\" \\\n  -d \"text=test\"",
                lang: "bash",
                note: "เก็บ Bot Token ไว้ใน GitHub Secret เสมอ — อย่าใส่ตรงๆ ในไฟล์ .yml ที่ push ขึ้น repo",
            },
            {
                title: "Workflow 1 — docker-image.yml (push main → build)",
                body: "ไฟล์นี้ทำงานเมื่อมีการ push หรือ merge PR ไปที่ main — build image และ push ขึ้น Docker Hub พร้อม tag version จาก package.json",
                code: "# .github/workflows/docker-image.yml\nname: Build and Deploy to Docker Hub\n\non:\n  push:\n    branches: [ main, master ]\n  pull_request:\n    branches: [ main, master ]\n  workflow_dispatch:  # เรียกได้จาก GitHub UI หรือ API\n\njobs:\n  build-and-push:\n    runs-on: ubuntu-latest\n        \n    steps:\n    - name: Checkout code\n      uses: actions/checkout@v4\n      \n    - name: Set up Node.js\n      uses: actions/setup-node@v4\n      with:\n        node-version: '18'\n        \n    - name: Set up Docker Buildx\n      uses: docker/setup-buildx-action@v3\n     \n    - name: Log in to Docker Hub\n      uses: docker/login-action@v3\n      with:\n        username: ${{ secrets.DOCKER_HUB_USERNAME }}\n        password: ${{ secrets.DOCKER_HUB_PASSWORD }}\n     \n    - name: Extract version from package.json\n      id: package-version\n      run: |\n        if [ -f package.json ]; then\n          VERSION=$(node -e \"console.log(require('./package.json').version)\")\n          echo \"version=$VERSION\" >> $GITHUB_OUTPUT\n        else\n          echo \"version=latest\" >> $GITHUB_OUTPUT\n        fi\n     \n    - name: Extract metadata\n      id: meta\n      uses: docker/metadata-action@v5\n      with:\n        images: ${{ secrets.DOCKER_HUB_USERNAME }}/YOUR_IMAGE_NAME\n        tags: |\n          type=raw,value=latest,enable={{is_default_branch}}\n          type=raw,value=${{ steps.package-version.outputs.version }},enable={{is_default_branch}}\n     \n    - name: Build and push Docker image\n      uses: docker/build-push-action@v5\n      with:\n        context: .\n        platforms: linux/amd64,linux/arm64\n        push: true\n        tags: ${{ steps.meta.outputs.tags }}\n        cache-from: type=gha\n        cache-to: type=gha,mode=max\n        \n    - name: Send Telegram Notification\n      if: success()\n      run: |\n        MESSAGE=\"🐳 <b>Docker Build Completed!</b>%0A%0A📂 ${{ github.repository }}%0A🏷️ Version: ${{ steps.package-version.outputs.version }}%0A✅ Pushed to Docker Hub%0A🕐 $(date '+%H:%M %d/%m/%Y')\"\n        curl -s -X POST \"https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage\" \\\n          -d \"chat_id=${{ vars.TELEGRAM_CHAT_ID }}\" \\\n          -d \"text=${MESSAGE}\" \\\n          -d \"parse_mode=HTML\"",
                lang: "yaml",
                note: "แทน YOUR_IMAGE_NAME ด้วยชื่อ image จริง เช่น myapp_api — image จะถูก push เป็น username/myapp_api:latest และ username/myapp_api:1.0.0",
            },
            {
                title: "Workflow 2 — auto-merge-to-main-build-docker.yml (dev → merge → build)",
                body: "ไฟล์นี้ทำงานเมื่อ push ขึ้น dev และ commit message มีคำว่า 'push to main' — merge dev เข้า main, สร้าง dev branch ใหม่จาก main, แล้ว build image",
                code: "# .github/workflows/auto-merge-to-main-build-docker.yml\nname: Auto Merge and Docker Build\n\non:\n  push:\n    branches: [ dev ]\n\njobs:\n  auto-merge-and-build:\n    # รันเฉพาะเมื่อ commit message มีคำว่า 'push to main'\n    if: contains(github.event.head_commit.message, 'push to main')\n    runs-on: ubuntu-latest\n    \n    permissions:\n      contents: write  # จำเป็นสำหรับ merge และ push\n    \n    steps:\n    - name: Checkout\n      uses: actions/checkout@v4\n      with:\n        fetch-depth: 0\n        token: ${{ secrets.GITHUB_TOKEN }}\n        \n    - name: Setup Git\n      run: |\n        git config --global user.name \"Auto Merge Bot\"\n        git config --global user.email \"bot@github.com\"\n        \n    - name: Merge dev to main\n      run: |\n        git checkout main\n        git pull origin main\n        git merge origin/dev --no-ff -m \"Auto merge from dev: ${{ github.event.head_commit.message }}\"\n        git push origin main\n        \n    - name: Recreate dev branch from main\n      run: |\n        # ลบ dev เดิมแล้วสร้างใหม่จาก main ล่าสุด\n        git push origin --delete dev\n        git checkout -b dev\n        git push origin dev\n        \n    # Build Docker image ต่อเนื่องหลัง merge\n    - name: Set up Docker Buildx\n      uses: docker/setup-buildx-action@v3\n     \n    - name: Log in to Docker Hub\n      uses: docker/login-action@v3\n      with:\n        username: ${{ secrets.DOCKER_HUB_USERNAME }}\n        password: ${{ secrets.DOCKER_HUB_PASSWORD }}\n\n    - name: Extract version\n      id: package-version\n      run: |\n        VERSION=$(node -e \"console.log(require('./package.json').version)\")\n        echo \"version=$VERSION\" >> $GITHUB_OUTPUT\n     \n    - name: Build and push\n      uses: docker/build-push-action@v5\n      with:\n        context: .\n        platforms: linux/amd64\n        push: true\n        tags: |\n          ${{ secrets.DOCKER_HUB_USERNAME }}/YOUR_IMAGE_NAME:latest\n          ${{ secrets.DOCKER_HUB_USERNAME }}/YOUR_IMAGE_NAME:${{ steps.package-version.outputs.version }}\n        cache-from: type=gha\n        cache-to: type=gha,mode=max\n        \n    - name: Notify success\n      if: success()\n      run: |\n        MESSAGE=\"🎉 <b>All Tasks Completed!</b>%0A%0A📂 ${{ github.repository }}%0A🌿 dev → main%0A🐳 Docker built and pushed%0A🏷️ Version: ${{ steps.package-version.outputs.version }}%0A💡 Update Portainer manually or use Watchtower%0A🕐 $(date '+%H:%M %d/%m/%Y')\"\n        curl -s -X POST \"https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage\" \\\n          -d \"chat_id=${{ vars.TELEGRAM_CHAT_ID }}\" \\\n          -d \"text=${MESSAGE}\" \\\n          -d \"parse_mode=HTML\"\n\n    - name: Notify failure\n      if: failure()\n      run: |\n        MESSAGE=\"❌ <b>Auto Process Failed!</b>%0A%0A📂 ${{ github.repository }}%0A🔗 https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}%0A🕐 $(date '+%H:%M %d/%m/%Y')\"\n        curl -s -X POST \"https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage\" \\\n          -d \"chat_id=${{ vars.TELEGRAM_CHAT_ID }}\" \\\n          -d \"text=${MESSAGE}\" \\\n          -d \"parse_mode=HTML\"",
                lang: "yaml",
                note: "trigger คือ push dev + commit message ต้องมีคำว่า 'push to main' — ถ้า commit message ไม่มีคำนี้ workflow จะ skip ให้เองโดยไม่ error",
            },
            {
                title: "วิธีใช้ Workflow 2 ในชีวิตจริง",
                body: "flow การทำงานบน dev จนถึง production",
                code: "# ทำงานบน dev ปกติ\ngit checkout dev\n# แก้ code...\ngit add .\ngit commit -m \"fix login bug\"\ngit push origin dev\n# → workflow ไม่ทำงาน เพราะ commit message ไม่มี 'push to main'\n\n# เมื่อพร้อม promote ขึ้น production:\ngit add .\ngit commit -m \"release v1.2.0 push to main\"\ngit push origin dev\n# → workflow เริ่มทำงานทันที:\n# 1. merge dev → main\n# 2. ลบ dev เดิม สร้าง dev ใหม่จาก main\n# 3. build Docker image\n# 4. push ขึ้น Docker Hub\n# 5. แจ้ง Telegram",
                lang: "bash",
                note: "คำว่า 'push to main' ในที่ไหนก็ได้ของ commit message — เช่น 'update api v2 push to main' ก็ trigger ได้",
            },
            {
                title: "Dockerfile สำหรับ NestJS",
                body: "Dockerfile แบบ multi-stage สำหรับ NestJS — แยก build stage ออกจาก production เพื่อให้ image เล็กลง",
                code: "# Dockerfile.nestjs\nFROM node:20-alpine AS builder\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm ci\n\nCOPY . .\nRUN npm run build\n\n# Production stage\nFROM node:20-alpine AS production\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm ci --only=production\n\nCOPY --from=builder /app/dist ./dist\n\n# สร้าง non-root user\nRUN addgroup -g 1001 -S nodejs && \\\n    adduser -S nestjs -u 1001\nUSER nestjs\n\nEXPOSE 3000\n\nHEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\\n  CMD wget -qO- http://localhost:3000/health || exit 1\n\nCMD [\"node\", \"dist/main\"]",
                lang: "dockerfile",
                note: "ถ้าใช้ Prisma ต้องเพิ่ม RUN npx prisma generate หลัง npm ci ใน production stage ด้วย",
            },
            {
                title: "Dockerfile สำหรับ Vite (Static Build)",
                body: "Dockerfile สำหรับ Vite — build เป็น static files แล้วเสิร์ฟด้วย Nginx",
                code: "# Dockerfile.vite\nFROM node:20-alpine AS builder\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm ci\n\nCOPY . .\nRUN npm run build\n\n# Production stage — Nginx เสิร์ฟ static files\nFROM nginx:alpine AS production\n\n# copy build output ไปที่ nginx\nCOPY --from=builder /app/dist /usr/share/nginx/html\n\n# config nginx สำหรับ SPA (react-router / vue-router)\nRUN echo 'server { \\\n  listen 80; \\\n  location / { \\\n    root /usr/share/nginx/html; \\\n    index index.html; \\\n    try_files $uri $uri/ /index.html; \\\n  } \\\n}' > /etc/nginx/conf.d/default.conf\n\nEXPOSE 80\n\nHEALTHCHECK --interval=30s --timeout=3s \\\n  CMD wget -qO- http://localhost:80 || exit 1\n\nCMD [\"nginx\", \"-g\", \"daemon off;\"]",
                lang: "dockerfile",
                note: "try_files $uri $uri/ /index.html สำคัญมากสำหรับ SPA — ถ้าไม่มีนี้ refresh หน้าจะได้ 404",
            },
            {
                title: "Dockerfile สำหรับ Elysia (Bun)",
                body: "Dockerfile สำหรับ Elysia บน Bun runtime — รัน TypeScript โดยตรงได้เลยไม่ต้อง compile",
                code: "# Dockerfile.elysia\nFROM oven/bun:1-alpine\nWORKDIR /app\n\n# ติดตั้ง dependencies ที่ต้องการ (ปรับตามโปรเจค)\nRUN apk add --no-cache \\\n    curl \\\n    tzdata\n\nCOPY package.json bun.lockb* ./\nRUN bun install --frozen-lockfile --production\n\nCOPY . .\n\n# Generate Prisma client ถ้าใช้ Prisma\n# RUN bun run generate:all\n\n# สร้าง non-root user\nRUN addgroup -g 1001 -S nodejs && \\\n    adduser -S elysia -u 1001 && \\\n    mkdir -p /app/logs && \\\n    chown -R elysia:nodejs /app\nUSER elysia\n\nEXPOSE 3000\n\nHEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\\n  CMD curl -f http://localhost:3000/health || exit 1\n\n# Bun รัน TypeScript โดยตรง ไม่ต้อง build ก่อน\nCMD [\"bun\", \"run\", \"src/index.ts\"]",
                lang: "dockerfile",
                note: "Bun รัน TypeScript ได้โดยตรง — ไม่ต้องมี build stage แยกเหมือน Node.js ทำให้ Dockerfile สั้นและ build เร็วกว่า",
            },
            {
                title: "โครงสร้าง Directory และ .dockerignore",
                body: "จัดวางไฟล์ให้ถูกที่และสร้าง .dockerignore เพื่อไม่ให้ copy ไฟล์ที่ไม่จำเป็นเข้า image",
                code: "# โครงสร้าง project:\nmy-project/\n├── .github/\n│   └── workflows/\n│       ├── docker-image.yml\n│       └── auto-merge-to-main-build-docker.yml\n├── src/\n├── Dockerfile\n├── .dockerignore\n└── package.json\n\n# สร้าง .dockerignore:\nnano .dockerignore\n\n# ใส่ข้อความนี้:\nnode_modules\n.git\n.github\n.env\n.env.*\n*.log\ndist\ncoverage\nREADME.md\n.dockerignore\nDockerfile*",
                lang: "bash",
                note: ".dockerignore ลด build time และขนาด image — node_modules สำคัญที่สุด ต้องใส่เสมอ ไม่งั้น image จะใหญ่มากและ copy ช้า",
            },
            {
                title: "อัปเดต Portainer หลัง Image ใหม่ถูก Push",
                body: "หลัง GitHub Actions push image ใหม่ขึ้น Docker Hub แล้ว ต้อง update service ใน Portainer ให้ดึง image ใหม่มาใช้",
                code: "# วิธีที่ 1: อัปเดตผ่าน Portainer UI\n# Services → เลือก service → Update\n# เปิด 'Pull latest image'\n# กด Update\n\n# วิธีที่ 2: อัปเดตจาก CLI บน server\ndocker service update \\\n  --image username/YOUR_IMAGE_NAME:latest \\\n  --with-registry-auth \\\n  stack_service\n\n# วิธีที่ 3: ใช้ Watchtower (อัตโนมัติ)\n# deploy Watchtower ไว้แล้วจะ detect image ใหม่และ update ให้เอง",
                lang: "bash",
                note: "Watchtower คือตัวเลือกที่สะดวกที่สุด — deploy ครั้งเดียวแล้วไม่ต้องแตะ Portainer ทุกครั้งที่ image อัปเดต",
            },
            {
                title: "ตรวจสอบ Workflow และ Debug",
                body: "วิธีดู log และ debug เมื่อ workflow ไม่ทำงานตามที่คาด",
                code: "# ดู workflow runs ทั้งหมด:\n# GitHub → Repository → Actions tab\n\n# ถ้า workflow ไม่ trigger:\n# - ตรวจสอบว่าไฟล์อยู่ที่ .github/workflows/ ถูกต้อง\n# - ตรวจสอบ branch name ใน on.push.branches ตรงกับ branch จริง\n# - workflow 2: ตรวจว่า commit message มีคำว่า 'push to main'\n\n# ถ้า build fail:\n# กดเข้าไปดู job → expand step ที่ fail → อ่าน error log\n\n# ถ้า Docker push fail:\n# - ตรวจ secret DOCKER_HUB_USERNAME และ DOCKER_HUB_PASSWORD ถูกต้อง\n# - ลอง login Docker Hub ด้วยมือบน local:\ndocker login -u YOUR_USERNAME\n\n# ถ้า Telegram ไม่แจ้ง:\n# - ตรวจ secret TELEGRAM_BOT_TOKEN\n# - ตรวจ variable TELEGRAM_CHAT_ID (ไม่ใช่ secret)\n# - ทดสอบส่งข้อความด้วยมือก่อน",
                lang: "bash",
                note: "สาเหตุที่พบบ่อยที่สุดคือ secret ผิด — ชื่อ secret ใน GitHub ต้องตรงกับที่ใช้ใน yml ทุกตัวอักษร รวมถึง case",
            },
        ],
    },

    {
        id: 15, slug: "oh-my-posh-powershell-setup", category: "infrastructure",
        title: "ติดตั้ง Oh My Posh + ตั้งค่า PowerShell บน Windows Terminal",
        description: "ติดตั้ง Oh My Posh, Nerd Font และ Terminal-Icons บน Windows — ตั้งค่า profile ให้มี history search, prediction และ prompt แสดง git branch พร้อมสอนเปลี่ยน theme และสร้าง custom theme ของตัวเอง",
        difficulty: "beginner", time: "25 min",
        tags: ["Oh My Posh", "PowerShell", "Windows Terminal", "Nerd Font", "Terminal-Icons", "PSReadLine"], updated: "Apr 2025",
        prerequisites: ["Windows 10/11", "Windows Terminal (ดาวน์โหลดได้จาก Microsoft Store)"],
        steps: [
            {
                title: "ติดตั้ง PowerShell 7",
                body: "Oh My Posh รองรับ PowerShell 5 แต่แนะนำ PowerShell 7 (pwsh) เพราะเร็วกว่าและ profile แยกจาก Windows PowerShell เดิม",
                code: "winget install Microsoft.PowerShell\n\n# ตรวจสอบ version หลังติดตั้ง\npwsh --version",
                lang: "powershell",
                note: "PowerShell 7 ติดตั้งแยกจาก Windows PowerShell 5 ที่มาพร้อม Windows — ใช้งานพร้อมกันได้ ไม่กระทบกัน",
            },
            {
                title: "ติดตั้ง Oh My Posh",
                body: "ติดตั้งผ่าน winget — วิธีนี้จัดการ PATH ให้อัตโนมัติและอัปเดตง่าย",
                code: "winget install JanDeDobbeleer.OhMyPosh\n\n# ปิดแล้วเปิด terminal ใหม่ จากนั้นตรวจสอบ\noh-my-posh --version\n\n# ดู path ที่เก็บ theme สำเร็จรูปทั้งหมด\necho $env:POSH_THEMES_PATH",
                lang: "powershell",
                note: "ถ้ารัน oh-my-posh แล้วขึ้น 'command not found' ให้ปิด terminal แล้วเปิดใหม่ก่อน — winget อัปเดต PATH หลังปิดเท่านั้น",
            },
            {
                title: "ติดตั้ง Nerd Font",
                body: "Nerd Font คือ font ที่มี icon พิเศษสำหรับ Oh My Posh — ถ้าไม่ติดตั้งจะเห็นกล่องสี่เหลี่ยมแทน icon ทั้งหมด นี่คือขั้นตอนที่ลืมทำบ่อยที่สุด",
                code: "# รัน PowerShell as Administrator แล้วรันคำสั่งนี้\noh-my-posh font install\n\n# จะเห็น list ให้เลือก — แนะนำ:\n# CaskaydiaCove   (Cascadia Code ของ Microsoft ดูดีบน Windows Terminal)\n# JetBrainsMono\n# Meslo\n\n# หรือติดตั้งตรงๆ\nwinget install DEVCOM.JetBrainsMonoNerdFont",
                lang: "powershell",
                note: "ต้องรัน as Administrator ถึงจะติดตั้ง font แบบ system-wide ได้ — ถ้าไม่มีสิทธิ์ font จะติดตั้งเฉพาะ user ปัจจุบัน",
            },
            {
                title: "ตั้งค่า Font ใน Windows Terminal",
                body: "หลังติดตั้ง font แล้วต้องบอก Windows Terminal ให้ใช้ — ไม่งั้น icon ยังพังอยู่",
                code: "# เปิด Windows Terminal → Ctrl+,\n# กด 'Open JSON file' มุมล่างซ้าย\n# เพิ่มใน profiles.defaults:\n\n{\n    \"profiles\": {\n        \"defaults\": {\n            \"font\": {\n                \"face\": \"CaskaydiaCove Nerd Font\",\n                \"size\": 12\n            }\n        }\n    }\n}\n\n# หรือตั้งผ่าน UI:\n# Settings → Profiles → Defaults → Appearance → Font face\n# เลือก font ที่ติดตั้งไว้",
                lang: "json",
                note: "ชื่อ font ต้องตรงทุกตัวอักษร — ถ้าพิมพ์ผิด Windows Terminal จะใช้ font เดิมโดยไม่แจ้ง error",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/omp1.png", caption: "ตั้งค่า Font ใน Windows Terminal Settings" },
                ],
            },
            {
                title: "ดูและเลือก Theme",
                body: "Oh My Posh มี theme สำเร็จรูปกว่า 100 แบบ — preview ได้ทันทีโดยไม่ต้องแก้ไฟล์",
                code: "# Preview ทุก theme ใน terminal เลื่อนดูได้\nGet-PoshThemes\n\n# ทดลอง theme ทีละตัวชั่วคราว\noh-my-posh init pwsh --config \"$env:POSH_THEMES_PATH\\paradox.omp.json\" | Invoke-Expression\n\n# Theme ที่แนะนำ:\n# paradox        — powerline สีสด แสดง git branch\n# pure           — เรียบมาก แค่ path + git\n# catppuccin_mocha — สี pastel นุ่มตา\n# tokyo          — สไตล์ tokyo night\n# quick-term     — เบาและเร็ว\n\n# ดูรูปทุก theme บนเว็บ:\n# https://ohmyposh.dev/docs/themes",
                lang: "powershell",
                note: "Get-PoshThemes ใช้เวลาสักครู่เพราะโหลดทุก theme — ถ้าอยากดูเร็วกว่าให้เปิดเว็บดูรูปแทน",
            },
            {
                title: "สร้างและแก้ไข PowerShell Profile",
                body: "ไฟล์ profile โหลดทุกครั้งที่เปิด terminal — ตั้งค่า Oh My Posh, module และ key binding ไว้ที่นี่",
                code: "# เปิดไฟล์ profile (สร้างใหม่ถ้ายังไม่มี)\nnotepad $PROFILE\n# หรือใช้ VS Code\ncode $PROFILE\n\n# ── เนื้อหา profile ──────────────────────────────\nusing namespace System.Management.Automation\nusing namespace System.Management.Automation.Language\n\n# PSReadLine\nif ($host.Name -eq 'ConsoleHost') {\n    Import-Module PSReadLine\n}\n\n# Oh My Posh — เปลี่ยน theme ได้บรรทัดนี้\noh-my-posh init pwsh --config \"$env:POSH_THEMES_PATH\\quick-term.omp.json\" | Invoke-Expression\n\n# Modules\nImport-Module -Name Terminal-Icons   # icon หน้าไฟล์/โฟลเดอร์\nImport-Module z                      # กระโดด directory ที่เคยไป\n\n# PSReadLine Options\nSet-PSReadLineOption -PredictionSource History\nSet-PSReadLineOption -PredictionViewStyle ListView\nSet-PSReadLineOption -EditMode Windows\n\n# ↑↓ ค้นหา history ตาม prefix ที่พิมพ์\nSet-PSReadLineKeyHandler -Key UpArrow   -Function HistorySearchBackward\nSet-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward\n\n# → accept suggestion ทีละคำ\nSet-PSReadLineKeyHandler -Key RightArrow -ScriptBlock {\n    param($key, $arg)\n    $line = $null; $cursor = $null\n    [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)\n    if ($cursor -lt $line.Length) {\n        [Microsoft.PowerShell.PSConsoleReadLine]::ForwardChar($key, $arg)\n    } else {\n        [Microsoft.PowerShell.PSConsoleReadLine]::AcceptNextSuggestionWord($key, $arg)\n    }\n}\n\n# F7 — ดู history ใน popup grid\nSet-PSReadLineKeyHandler -Key F7 -BriefDescription History -LongDescription 'Show command history' -ScriptBlock {\n    $pattern = $null\n    [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$pattern, [ref]$null)\n    if ($pattern) { $pattern = [regex]::Escape($pattern) }\n    $history = [System.Collections.ArrayList]@(\n        $last = ''\n        foreach ($line in [System.IO.File]::ReadLines((Get-PSReadLineOption).HistorySavePath)) {\n            if (($line -cne $last) -and (!$pattern -or ($line -match $pattern))) {\n                $last = $line; $line\n            }\n        }\n    )\n    $history.Reverse()\n    $command = $history | Out-GridView -Title History -PassThru\n    if ($command) {\n        [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()\n        [Microsoft.PowerShell.PSConsoleReadLine]::Insert(($command -join \"`n\"))\n    }\n}\n\n# Completions\nRegister-ArgumentCompleter -Native -CommandName winget -ScriptBlock {\n    param($wordToComplete, $commandAst, $cursorPosition)\n    [Console]::InputEncoding = [Console]::OutputEncoding = $OutputEncoding = [System.Text.Utf8Encoding]::new()\n    $Local:word = $wordToComplete.Replace('\"', '\"\"')\n    $Local:ast  = $commandAst.ToString().Replace('\"', '\"\"')\n    winget complete --word=\"$Local:word\" --commandline \"$Local:ast\" --position $cursorPosition | ForEach-Object {\n        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)\n    }\n}\n\nRegister-ArgumentCompleter -Native -CommandName dotnet -ScriptBlock {\n    param($commandName, $wordToComplete, $cursorPosition)\n    dotnet complete --position $cursorPosition \"$wordToComplete\" | ForEach-Object {\n        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)\n    }\n}",
                lang: "powershell",
                note: "บันทึกแล้ว reload ด้วย: . $PROFILE — ถ้า Terminal-Icons หรือ z ยังไม่ได้ติดตั้ง จะ error ตรงบรรทัด Import-Module ให้ดู step ถัดไปก่อน",
            },
            {
                title: "ติดตั้ง Terminal-Icons และ z",
                body: "สอง module นี้ต้องติดตั้งก่อนถึงจะ Import-Module ใน profile ได้",
                code: "# Terminal-Icons — icon หน้าไฟล์และโฟลเดอร์ใน ls\nInstall-Module -Name Terminal-Icons -Repository PSGallery -Force\n\n# z — กระโดด directory ที่เคยไปมาแล้ว\nInstall-Module -Name z -Repository PSGallery -Force\n\n# ทดสอบ Terminal-Icons\nImport-Module Terminal-Icons\nls   # ควรเห็น icon หน้าแต่ละไฟล์\n\n# ทดสอบ z — ต้อง cd เข้า directory ก่อนอย่างน้อยครั้งนึง\ncd C:\\Users\\yourname\\Documents\ncd ~\nz Documents   # กระโดดกลับได้เลย",
                lang: "powershell",
                note: "z จะเริ่มจำ directory หลังจาก cd เข้าไปแล้วเท่านั้น — วันแรกที่ติดตั้งให้ cd ไปหลายๆ ที่ก่อน แล้วค่อยใช้ z",
            },
            {
                title: "สร้าง Custom Theme (.omp.json)",
                body: "copy theme ที่ชอบมาเป็น base แล้วแก้ไขแค่ส่วนที่ต้องการ — ง่ายกว่าสร้างใหม่ทั้งหมด",
                code: "# copy theme มาเป็น base\ncp \"$env:POSH_THEMES_PATH\\quick-term.omp.json\" \"$HOME\\my-theme.omp.json\"\n\n# เปิดแก้ไข\ncode \"$HOME\\my-theme.omp.json\"",
                lang: "powershell",
            },
            {
                title: "โครงสร้าง .omp.json",
                body: "theme แบ่งเป็น segments — แต่ละ segment คือหนึ่งส่วนของ prompt เช่น path, git, เวลา สีใส่เป็น hex ได้เลย",
                code: '{\n  "version": 2,\n  "final_space": true,\n  "blocks": [\n    {\n      "type": "prompt",\n      "alignment": "left",\n      "segments": [\n        {\n          "type": "path",\n          "style": "powerline",\n          "powerline_symbol": "\\uE0B0",\n          "foreground": "#ffffff",\n          "background": "#61AFEF",\n          "properties": {\n            "style": "folder"\n          }\n        },\n        {\n          "type": "git",\n          "style": "powerline",\n          "powerline_symbol": "\\uE0B0",\n          "foreground": "#ffffff",\n          "background": "#98C379",\n          "background_templates": [\n            "{{ if .Working.Changed }}#E5C07B{{ end }}",\n            "{{ if .Staging.Changed }}#E06C75{{ end }}"\n          ],\n          "properties": {\n            "branch_icon": "\\uE0A0 ",\n            "fetch_status": true\n          }\n        },\n        {\n          "type": "time",\n          "style": "plain",\n          "foreground": "#565656",\n          "properties": {\n            "time_format": "15:04"\n          }\n        }\n      ]\n    }\n  ]\n}',
                lang: "json",
                note: "background_templates เปลี่ยนสีตาม git status อัตโนมัติ — สีเหลืองเมื่อมีไฟล์แก้ไข สีแดงเมื่อมีไฟล์ staged รอ commit",
            },
            {
                title: "ชี้ Profile ไปใช้ Custom Theme",
                body: "แก้บรรทัด oh-my-posh ใน profile ให้ชี้มาที่ไฟล์ theme ที่สร้างเอง",
                code: "# แก้ใน $PROFILE บรรทัดนี้:\noh-my-posh init pwsh --config \"$HOME\\my-theme.omp.json\" | Invoke-Expression\n\n# reload\n. $PROFILE\n\n# ทดสอบแก้ theme แบบ live โดยไม่ต้อง reload ทั้ง profile\noh-my-posh init pwsh --config \"$HOME\\my-theme.omp.json\" | Invoke-Expression",
                lang: "powershell",
                note: "เก็บ custom theme ไว้ใน $HOME หรือ Dropbox/OneDrive — จะได้ sync ข้ามเครื่องได้และไม่หายเมื่ออัปเดต Oh My Posh",
            },
            {
                title: "อัปเดต Oh My Posh และ Modules",
                body: "อัปเดตให้เป็น version ล่าสุดได้ทุกเมื่อ",
                code: "# อัปเดต Oh My Posh\nwinget upgrade JanDeDobbeleer.OhMyPosh\n\n# อัปเดต PowerShell modules\nUpdate-Module Terminal-Icons\nUpdate-Module z\n\n# ตรวจสอบ version ปัจจุบัน\noh-my-posh --version",
                lang: "powershell",
                note: "Oh My Posh อัปเดตบ่อยมาก — theme ใหม่และ segment ใหม่จะมาพร้อมกับ update ไม่ต้องติดตั้งอะไรเพิ่ม",
            },
        ],
    },

    {
        id: 16, slug: "windows-server-2025-initial-setup", category: "infrastructure",
        title: "Windows Server 2025 — Initial Setup",
        description: "ติดตั้ง Windows Server 2025 บนเครื่องใหม่: ตั้งค่า OS ครั้งแรก, Static IP, เปิด Remote Desktop และ WinRM เพื่อให้พร้อมสำหรับ remote management",
        difficulty: "beginner", time: "40 min",
        tags: ["Windows Server", "Static IP", "Remote Desktop", "WinRM", "PowerShell"], updated: "Apr 2025",
        prerequisites: [
            "ISO Windows Server 2025 พร้อมแล้ว (ดาวน์โหลดจาก Microsoft Evaluation Center)",
            "USB bootable หรือ DVD สำหรับติดตั้ง",
            "เครื่องที่จะติดตั้ง — RAM อย่างน้อย 4GB, Disk อย่างน้อย 60GB",
        ],
        steps: [
            {
                title: "Boot จาก USB และเริ่มติดตั้ง",
                body: "เสียบ USB bootable แล้ว boot เครื่องจาก USB — ถ้าเครื่องไม่ boot จาก USB ให้เข้า BIOS/UEFI แล้วเปลี่ยน Boot Order ก่อน",
                code: "# ขั้นตอนใน Installer:\n# 1. เลือกภาษา: English (United States)\n# 2. Time format: ปล่อยไว้ก่อน แก้ใน Windows ทีหลัง\n# 3. Keyboard: US\n# 4. กด Install now",
                lang: "bash",
                note: "เข้า BIOS ส่วนใหญ่กด F2, F10, F12 หรือ Del ระหว่าง boot — ขึ้นอยู่กับ motherboard",
            },
            {
                title: "เลือก Edition และ Installation Type",
                body: "เลือก edition ให้ถูกต้อง — Desktop Experience คือแบบมี GUI ถ้าเลือก Server Core จะไม่มีหน้าจอ Windows ให้คลิก",
                code: "# Edition ที่แนะนำสำหรับเริ่มต้น:\nWindows Server 2025 Standard (Desktop Experience)\n\n# Installation Type:\nCustom: Install Windows only (advanced)\n\n# เลือก Disk:\n# ถ้า disk ใหม่ยังไม่มี partition — กด New → Apply → OK\n# เลือก partition ที่สร้างแล้ว → Next",
                lang: "bash",
                note: "Desktop Experience ใช้ RAM มากกว่า Server Core ประมาณ 1-2GB แต่จัดการง่ายกว่ามากสำหรับเริ่มต้น",
            },
            {
                title: "ตั้ง Password Administrator และ Login ครั้งแรก",
                body: "หลัง install เสร็จ Windows จะให้ตั้ง password ของ Administrator ก่อน login — ต้องแข็งแรงพอตามเงื่อนไข Windows",
                code: "# Password ต้องมีครบ 3 ใน 4:\n# - ตัวพิมพ์ใหญ่ (A-Z)\n# - ตัวพิมพ์เล็ก (a-z)\n# - ตัวเลข (0-9)\n# - อักขระพิเศษ (!@#$...)\n# ความยาวอย่างน้อย 8 ตัว\n\n# Login:\n# กด Ctrl+Alt+Delete\n# เลือก Administrator → ใส่ password",
                lang: "bash",
                note: "จำ password นี้ไว้ให้ดี — ถ้าลืมจะต้องติดตั้งใหม่หรือใช้ recovery tool",
            },
            {
                title: "ตั้งชื่อ Computer",
                body: "ชื่อ computer เริ่มต้นจะเป็นชื่อสุ่ม — ตั้งใหม่ให้จำง่ายและสื่อความหมาย",
                code: "# เปิด PowerShell as Administrator แล้วรัน:\nRename-Computer -NewName \"MYSERVER\" -Restart\n\n# หรือผ่าน GUI:\n# คลิกขวา This PC → Properties\n# กด Rename this PC\n# ใส่ชื่อแล้ว Next → Restart now",
                lang: "powershell",
                note: "ตั้งชื่อให้สั้น ไม่มีช่องว่าง ไม่เกิน 15 ตัวอักษร — เช่น WS2025-01, FILESERVER, SQLSERVER",
            },
            {
                title: "ตั้งค่า Timezone",
                body: "ตั้ง timezone ให้ถูกต้องเพื่อให้ log และ scheduled task ตรงเวลา",
                code: "# PowerShell\nSet-TimeZone -Name \"SE Asia Standard Time\"\n\n# ตรวจสอบ\nGet-TimeZone\n\n# ซิงค์เวลากับ internet ทันที\nw32tm /resync /force",
                lang: "powershell",
                note: "SE Asia Standard Time คือ UTC+7 (Bangkok) — ค้นหา timezone อื่นได้ด้วย: Get-TimeZone -ListAvailable",
            },
            {
                title: "ตั้งค่า Static IP",
                body: "Server ต้องใช้ Static IP เสมอ — ถ้าใช้ DHCP IP อาจเปลี่ยนแล้ว remote เข้าไม่ได้",
                code: "# ดู network interface ที่มีอยู่\nGet-NetAdapter\n\n# ดู IP ปัจจุบัน\nGet-NetIPAddress -AddressFamily IPv4\n\n# ตั้ง Static IP — แทนค่าตามเครือข่ายจริง\nNew-NetIPAddress `\n    -InterfaceAlias \"Ethernet\" `\n    -IPAddress \"192.168.1.100\" `\n    -PrefixLength 24 `\n    -DefaultGateway \"192.168.1.1\"\n\n# ตั้ง DNS\nSet-DnsClientServerAddress `\n    -InterfaceAlias \"Ethernet\" `\n    -ServerAddresses \"8.8.8.8\",\"1.1.1.1\"\n\n# ตรวจสอบ\nGet-NetIPAddress -InterfaceAlias \"Ethernet\" -AddressFamily IPv4",
                lang: "powershell",
                note: "InterfaceAlias ต้องตรงกับชื่อที่เห็นจาก Get-NetAdapter — อาจเป็น 'Ethernet', 'Ethernet0' หรืออื่นขึ้นกับเครื่อง",
            },
            {
                title: "ทดสอบ Network",
                body: "ทดสอบว่า network ทำงานถูกต้องหลังตั้ง Static IP",
                code: "# ping gateway\nping 192.168.1.1\n\n# ping internet\nping 8.8.8.8\n\n# ทดสอบ DNS\nResolve-DnsName google.com\n\n# ดู routing table\nGet-NetRoute -AddressFamily IPv4",
                lang: "powershell",
                note: "ถ้า ping gateway ไม่ได้ ตรวจสอบ IP, PrefixLength และ DefaultGateway ว่าถูกต้องกับ subnet จริง",
            },
            {
                title: "Windows Update",
                body: "อัปเดต Windows ให้เป็น version ล่าสุดก่อนทำอะไรต่อ — ลด security risk ตั้งแต่เริ่ม",
                code: "# ติดตั้ง PSWindowsUpdate module\nInstall-Module PSWindowsUpdate -Force\n\n# ดู update ที่มี\nGet-WindowsUpdate\n\n# ติดตั้งทั้งหมด\nInstall-WindowsUpdate -AcceptAll -AutoReboot\n\n# หรือผ่าน GUI:\n# Settings → Windows Update → Check for updates",
                lang: "powershell",
                note: "อาจต้อง reboot หลาย reboot ถ้ามี update เยอะ — รันคำสั่งซ้ำจนไม่มี update เหลือ",
            },
            {
                title: "เปิด Remote Desktop (RDP)",
                body: "เปิด RDP เพื่อให้ remote เข้ามาจัดการ server จากเครื่องอื่นได้ — ไม่ต้องนั่งหน้าเครื่องตลอด",
                code: "# เปิด Remote Desktop\nSet-ItemProperty `\n    -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' `\n    -Name 'fDenyTSConnections' `\n    -Value 0\n\n# เปิด firewall rule สำหรับ RDP\nEnable-NetFirewallRule -DisplayGroup \"Remote Desktop\"\n\n# ตรวจสอบ\nGet-ItemProperty `\n    -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' `\n    -Name 'fDenyTSConnections'\n# ควรได้ค่า 0",
                lang: "powershell",
                note: "RDP ใช้ port 3389 — ถ้าอยู่ใน network เดียวกันเชื่อมได้เลย ถ้า remote จาก internet ให้ใช้ VPN แทนการเปิด port ตรง",
            },
            {
                title: "ทดสอบ RDP จากเครื่อง local",
                body: "ทดสอบเชื่อมต่อ RDP จากเครื่อง Windows อื่นในเครือข่ายเดียวกัน",
                code: "# รันบนเครื่อง local (Windows)\nmstsc\n\n# ใส่:\n# Computer: 192.168.1.100\n# Username: Administrator\n# กด Connect → ใส่ password\n\n# หรือจาก PowerShell\nmstsc /v:192.168.1.100",
                lang: "powershell",
                note: "ครั้งแรกจะมีเตือนเรื่อง certificate — กด Yes เพื่อเชื่อมต่อต่อ เพราะเป็น self-signed cert ที่ Windows สร้างให้เอง",
            },
            {
                title: "เปิด WinRM สำหรับ PowerShell Remoting",
                body: "WinRM ช่วยให้รัน PowerShell command บน server จากเครื่องอื่นได้ — จำเป็นสำหรับ automation และ remote management",
                code: "# เปิด WinRM\nEnable-PSRemoting -Force\n\n# ตรวจสอบสถานะ\nGet-Service WinRM\n\n# ทดสอบจากเครื่อง local — รันบนเครื่อง local\nTest-WSMan -ComputerName 192.168.1.100\n\n# เชื่อมต่อ remote session\nEnter-PSSession -ComputerName 192.168.1.100 -Credential Administrator\n\n# ออกจาก session\nExit-PSSession",
                lang: "powershell",
                note: "ถ้า Test-WSMan ไม่ผ่านจากเครื่อง local ให้ตรวจสอบว่าทั้งสองเครื่องอยู่ใน network เดียวกันและ Windows Firewall ไม่ได้บล็อก port 5985",
            },
            {
                title: "ปิด IE Enhanced Security และตั้งค่า Server Manager",
                body: "ปิด IE Enhanced Security Configuration ที่ขัดการใช้งานเว็บบน server และตั้ง Server Manager ให้ไม่ popup ทุก login",
                code: "# ปิด IE Enhanced Security Configuration\nfunction Disable-IEESC {\n    $AdminKey = 'HKLM:\\SOFTWARE\\Microsoft\\Active Setup\\Installed Components\\{A509B1A7-37EF-4b3f-8CFC-4F3A74704073}'\n    $UserKey  = 'HKLM:\\SOFTWARE\\Microsoft\\Active Setup\\Installed Components\\{A509B1A8-37EF-4b3f-8CFC-4F3A74704073}'\n    Set-ItemProperty -Path $AdminKey -Name 'IsInstalled' -Value 0\n    Set-ItemProperty -Path $UserKey  -Name 'IsInstalled' -Value 0\n}\nDisable-IEESC\n\n# ปิด Server Manager popup ตอน login\nGet-ScheduledTask -TaskName 'ServerManager' | Disable-ScheduledTask",
                lang: "powershell",
                note: "IE Enhanced Security ทำให้เปิดเว็บบน server ไม่ได้สะดวก — ปิดได้ปลอดภัยเพราะ server ไม่ควรใช้ browser ท่องเน็ตอยู่แล้ว",
            },
            {
                title: "ตรวจสอบ Windows Firewall",
                body: "ตรวจสอบว่า firewall เปิดอยู่และ rule ที่ active มีแค่ที่จำเป็น",
                code: "# ดูสถานะ firewall ทุก profile\nGet-NetFirewallProfile | Select Name, Enabled\n\n# ดู inbound rule ที่เปิดอยู่\nGet-NetFirewallRule -Direction Inbound -Enabled True | \n    Select DisplayName, Profile, Action | \n    Format-Table -AutoSize\n\n# เปิด rule เพิ่มถ้าต้องการ เช่น ping\nEnable-NetFirewallRule -DisplayName \"File and Printer Sharing (Echo Request - ICMPv4-In)\"",
                lang: "powershell",
                note: "Windows Server 2025 เปิด firewall ทุก profile ไว้เป็นค่าเริ่มต้น — ไม่ควรปิด firewall ทั้งหมด เปิดเฉพาะ rule ที่ต้องการแทน",
            },
            {
                title: "สรุป Port และ Service ที่เปิดอยู่",
                body: "ตรวจสอบ port ที่ listen อยู่ทั้งหมดก่อนเริ่มใช้งานจริง",
                code: "# ดู port ที่ listen อยู่\nnetstat -ano | findstr LISTENING\n\n# หรือดูแบบละเอียดด้วย PowerShell\nGet-NetTCPConnection -State Listen | \n    Select LocalAddress, LocalPort, OwningProcess |\n    Sort LocalPort |\n    Format-Table -AutoSize\n\n# Port ที่ควรเห็นหลัง setup นี้:\n# 3389  — RDP\n# 5985  — WinRM (HTTP)\n# 5986  — WinRM (HTTPS)",
                lang: "powershell",
                note: "ถ้าเห็น port แปลกที่ไม่ได้เปิดเองให้ตรวจสอบก่อน — อาจเป็น service ที่ติดมากับ Windows Server",
            },
        ],
    },

    {
        id: 17, slug: "sql-server-install-config", category: "infrastructure",
        title: "ติดตั้ง SQL Server + Config TCP/IP Connection",
        description: "ติดตั้ง SQL Server 2022 บน Windows Server 2025, เปิด TCP/IP, ตั้งค่า port, เปิด firewall และทดสอบเชื่อมต่อจากเครื่องอื่นด้วย SSMS",
        difficulty: "beginner", time: "35 min",
        tags: ["SQL Server", "SSMS", "TCP/IP", "Windows Server", "Firewall"], updated: "Apr 2025",
        prerequisites: [
            "ผ่าน Guide 16 แล้ว — Windows Server 2025 พร้อมใช้งาน Static IP ตั้งไว้แล้ว",
            "ISO หรือ installer SQL Server 2022 พร้อมแล้ว (ดาวน์โหลดจาก Microsoft — มี Developer Edition ฟรี)",
            "SSMS (SQL Server Management Studio) สำหรับเครื่อง client ที่จะเชื่อมต่อ",
        ],
        steps: [
            {
                title: "ดาวน์โหลด SQL Server 2022",
                body: "ใช้ Developer Edition สำหรับ lab และ dev — ฟีเจอร์ครบเหมือน Enterprise แต่ใช้ได้เฉพาะ non-production",
                code: "# ดาวน์โหลดได้ที่:\nhttps://www.microsoft.com/en-us/sql-server/sql-server-downloads\n\n# เลือก:\n# Developer — ฟรี ใช้สำหรับ dev/test\n# Express    — ฟรี ใช้ production ได้ แต่จำกัด 10GB และ 1.4GB RAM\n# Standard / Enterprise — ต้องซื้อ license",
                lang: "bash",
                note: "Developer Edition เหมาะสำหรับ guide นี้ — ได้ทดลองทุกฟีเจอร์โดยไม่เสียเงิน",
            },
            {
                title: "รัน SQL Server Installer",
                body: "เริ่ม installation และเลือก feature ที่ต้องการ",
                code: "# เปิดไฟล์ installer แล้วเลือก:\n# Installation → New SQL Server stand-alone installation\n\n# Feature Selection — เลือกอย่างน้อย:\n# ✅ Database Engine Services   ← หัวใจหลัก ต้องเลือก\n# ✅ SQL Server Replication     ← เผื่อใช้ทีหลัง\n# ⬜ Machine Learning Services  ← ไม่จำเป็นตอนนี้\n# ⬜ Full-Text Search           ← เลือกถ้าต้องการ search ข้อความ\n\n# Instance Configuration:\n# Default instance: MSSQLSERVER  ← แนะนำสำหรับเริ่มต้น\n# หรือ Named instance: SQLEXPRESS, SQLDEV ถ้ามีหลาย instance",
                lang: "bash",
                note: "Default instance เชื่อมต่อด้วย IP หรือ hostname ตรงๆ ได้เลย — Named instance ต้องระบุชื่อด้วย เช่น 192.168.1.100\\SQLDEV",
            },
            {
                title: "ตั้งค่า Authentication Mode",
                body: "เลือก Mixed Mode เพื่อให้ login ได้ทั้ง Windows Authentication และ SQL Server Authentication — จำเป็นสำหรับ app ที่เชื่อมด้วย username/password",
                code: "# ใน Database Engine Configuration:\n# Authentication Mode → Mixed Mode (SQL Server and Windows Authentication)\n\n# ตั้ง password สำหรับ account 'sa' (System Administrator)\n# sa คือ built-in admin account ของ SQL Server\n\n# Add Current User → เพิ่ม Windows user ปัจจุบันเป็น SQL Admin ด้วย\n\n# กด Next → Install → รอจนเสร็จ",
                lang: "bash",
                note: "password ของ sa ต้องแข็งแรง — เก็บไว้ให้ดี ถ้าลืมต้องแก้ผ่าน Windows Authentication แทน",
            },
            {
                title: "ตรวจสอบ SQL Server Service",
                body: "ตรวจสอบว่า SQL Server service รันอยู่และตั้งให้ start อัตโนมัติ",
                code: "# PowerShell\nGet-Service -Name 'MSSQLSERVER','SQLSERVERAGENT' | \n    Select Name, Status, StartType\n\n# ถ้ายังไม่รัน\nStart-Service -Name 'MSSQLSERVER'\n\n# ตั้งให้ start อัตโนมัติ\nSet-Service -Name 'MSSQLSERVER' -StartupType Automatic\nSet-Service -Name 'SQLSERVERAGENT' -StartupType Automatic",
                lang: "powershell",
                note: "SQLSERVERAGENT คือ service สำหรับ scheduled job — ต้องรันด้วยถ้าจะใช้ SQL Agent ใน guide ถัดไป",
            },
            {
                title: "เปิด TCP/IP ใน SQL Server Configuration Manager",
                body: "SQL Server ปิด TCP/IP ไว้เป็นค่าเริ่มต้น — ต้องเปิดเองถ้าอยากเชื่อมจากเครื่องอื่น",
                code: "# เปิด SQL Server Configuration Manager:\n# Start → SQL Server 2022 Configuration Manager\n\n# ไปที่:\n# SQL Server Network Configuration\n# → Protocols for MSSQLSERVER\n# → TCP/IP → คลิกขวา → Enable\n\n# ตั้ง Port:\n# คลิกขวา TCP/IP → Properties → IP Addresses tab\n# เลื่อนลงสุดหา IPAll\n# TCP Dynamic Ports → ลบค่าออกให้ว่าง\n# TCP Port → ใส่ 1433\n# กด Apply → OK",
                lang: "bash",
                note: "port 1433 คือ default ของ SQL Server — เปลี่ยนได้ถ้าต้องการ security ขั้นต้น แต่ต้องระบุ port ตอนเชื่อมต่อด้วย",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/sql1.png", caption: "เปิด TCP/IP ใน SQL Server Configuration Manager" },
                ],
            },
            {
                title: "Restart SQL Server Service",
                body: "การเปลี่ยน protocol จะมีผลหลัง restart service เท่านั้น",
                code: "# PowerShell\nRestart-Service -Name 'MSSQLSERVER' -Force\n\n# ตรวจสอบว่ารันขึ้นมาใหม่แล้ว\nGet-Service -Name 'MSSQLSERVER'",
                lang: "powershell",
                note: "Restart ใช้เวลา 10-30 วินาที — รอจนสถานะเป็น Running ก่อนไป step ถัดไป",
            },
            {
                title: "เปิด Firewall สำหรับ SQL Server",
                body: "เปิด port 1433 ใน Windows Firewall เพื่อให้เครื่องอื่นเชื่อมต่อได้",
                code: "# เปิด port 1433\nNew-NetFirewallRule `\n    -DisplayName \"SQL Server 1433\" `\n    -Direction Inbound `\n    -Protocol TCP `\n    -LocalPort 1433 `\n    -Action Allow\n\n# ถ้าใช้ SQL Server Browser (Named instance)\nNew-NetFirewallRule `\n    -DisplayName \"SQL Server Browser\" `\n    -Direction Inbound `\n    -Protocol UDP `\n    -LocalPort 1434 `\n    -Action Allow\n\n# ตรวจสอบ\nGet-NetFirewallRule -DisplayName \"SQL Server*\" | \n    Select DisplayName, Enabled, Direction",
                lang: "powershell",
                note: "UDP 1434 จำเป็นแค่ Named instance — ถ้าใช้ Default instance (MSSQLSERVER) เปิดแค่ TCP 1433 พอ",
            },
            {
                title: "ทดสอบเชื่อมต่อจากเครื่องเดียวกันก่อน",
                body: "ทดสอบ login ด้วย sa account บนเครื่อง server ก่อนเพื่อยืนยันว่า SQL Server และ Mixed Mode ทำงานถูกต้อง",
                code: "# PowerShell — ใช้ sqlcmd ที่ติดมากับ SQL Server\nsqlcmd -S localhost -U sa -P 'YOUR_SA_PASSWORD' -Q \"SELECT @@VERSION\"\n\n# ควรเห็น version string เช่น:\n# Microsoft SQL Server 2022 (RTM) - 16.0.xxxx...\n\n# ทดสอบสร้าง database ทดสอบ\nsqlcmd -S localhost -U sa -P 'YOUR_SA_PASSWORD' -Q \"\nCREATE DATABASE TestDB;\nSELECT name FROM sys.databases;\n\"",
                lang: "powershell",
                note: "ถ้า sqlcmd ไม่เจอ ให้ระบุ path เต็ม: C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\170\\Tools\\Binn\\sqlcmd.exe",
            },
            {
                title: "ดาวน์โหลดและติดตั้ง SSMS บนเครื่อง Client",
                body: "SSMS คือ GUI tool สำหรับจัดการ SQL Server — ติดตั้งบนเครื่องที่จะใช้งาน ไม่จำเป็นต้องติดตั้งบน server",
                code: "# ดาวน์โหลด SSMS ได้ที่:\nhttps://aka.ms/ssmsfullsetup\n\n# หรือผ่าน winget บนเครื่อง client:\nwinget install Microsoft.SQLServerManagementStudio\n\n# ติดตั้งตามปกติ → Restart เครื่อง client",
                lang: "bash",
                note: "SSMS ฟรีและไม่ต้องการ license แยก — ดาวน์โหลดได้เสมอไม่ว่าจะใช้ SQL Server edition ไหน",
            },
            {
                title: "เชื่อมต่อ SQL Server จากเครื่อง Client ด้วย SSMS",
                body: "ทดสอบเชื่อมต่อจากเครื่องอื่นในเครือข่ายเดียวกันผ่าน SSMS",
                code: "# เปิด SSMS แล้วกรอก:\n# Server type: Database Engine\n# Server name: 192.168.1.100\n#   (หรือ hostname\\instancename ถ้าเป็น Named instance)\n# Authentication: SQL Server Authentication\n# Login: sa\n# Password: YOUR_SA_PASSWORD\n# กด Connect\n\n# ถ้าเชื่อมได้จะเห็น Object Explorer ด้านซ้าย\n# แสดง Databases, Security, Server Objects",
                lang: "bash",
                note: "ถ้าเชื่อมไม่ได้ให้ตรวจสอบตามลำดับ: (1) ping server IP ได้ไหม (2) port 1433 เปิดอยู่ไหม (3) TCP/IP enabled ใน Config Manager (4) service รันอยู่ไหม",
                images: [
                    { src: "https://rvynprnlbpwbnjamexkz.supabase.co/storage/v1/object/public/portfolio/sql2.png", caption: "หน้า Connect ใน SSMS" },
                ],
            },
            {
                title: "สร้าง SQL Login แยกสำหรับ Application",
                body: "ไม่ควรให้ app เชื่อมด้วย sa — สร้าง login แยกพร้อมกำหนดสิทธิ์เฉพาะ database ที่ต้องการ",
                code: "-- รันใน SSMS หรือ sqlcmd\n-- สร้าง login ใหม่\nCREATE LOGIN appuser WITH PASSWORD = 'StrongP@ssw0rd!';\n\n-- สร้าง database สำหรับ app\nCREATE DATABASE AppDB;\nGO\n\n-- สร้าง user ใน database และให้สิทธิ์\nUSE AppDB;\nGO\nCREATE USER appuser FOR LOGIN appuser;\nGO\n\n-- ให้สิทธิ์แค่ที่จำเป็น\nALTER ROLE db_datareader ADD MEMBER appuser;\nALTER ROLE db_datawriter ADD MEMBER appuser;\nGO",
                lang: "sql",
                note: "db_datareader + db_datawriter = อ่านและเขียนได้ทุก table แต่ไม่สามารถ drop table หรือแก้ schema ได้ — เหมาะสำหรับ application ทั่วไป",
            },
            {
                title: "ทดสอบ Connection String",
                body: "ทดสอบ connection string ที่จะใช้ใน application ด้วย sqlcmd จากเครื่อง client",
                code: "# ทดสอบจากเครื่อง client\nsqlcmd -S 192.168.1.100,1433 -U appuser -P 'StrongP@ssw0rd!' -d AppDB -Q \"SELECT DB_NAME()\"\n\n# Connection string สำหรับ app ต่างๆ:\n\n# .NET / C#\n# Server=192.168.1.100,1433;Database=AppDB;User Id=appuser;Password=StrongP@ssw0rd!;\n\n# Node.js (mssql)\n# server: '192.168.1.100', port: 1433, database: 'AppDB', user: 'appuser', password: 'StrongP@ssw0rd!'\n\n# Python (pyodbc)\n# DRIVER={ODBC Driver 18 for SQL Server};SERVER=192.168.1.100,1433;DATABASE=AppDB;UID=appuser;PWD=StrongP@ssw0rd!",
                lang: "bash",
                note: "format IP,port ใช้ comma คั่น ไม่ใช่ colon — เช่น 192.168.1.100,1433 ไม่ใช่ 192.168.1.100:1433",
            },
        ],
    },

    {
        id: 18, slug: "sql-server-backup-tsql-job", category: "infrastructure",
        title: "SQL Server Backup ด้วย T-SQL + SQL Agent Job",
        description: "เขียน T-SQL สำหรับ Full, Differential และ Transaction Log backup, ตั้ง SQL Agent Job ให้รันอัตโนมัติตามตาราง, ลบ backup เก่าอัตโนมัติ และ move ไฟล์ไปยัง NAS",
        difficulty: "intermediate", time: "45 min",
        tags: ["SQL Server", "Backup", "T-SQL", "SQL Agent", "NAS", "PowerShell"], updated: "Apr 2025",
        prerequisites: [
            "ผ่าน Guide 17 แล้ว — SQL Server 2022 ติดตั้งและเชื่อมต่อได้",
            "SQL Server Agent service รันอยู่",
            "NAS หรือ network share พร้อมแล้ว — server เข้าถึงได้ผ่าน UNC path เช่น \\\\NAS\\SQLBackup",
        ],
        steps: [
            {
                title: "ทำความเข้าใจ 3 ประเภท Backup",
                body: "SQL Server มี backup 3 ประเภทที่ใช้ร่วมกัน — แต่ละประเภทมีหน้าที่ต่างกัน ต้องเข้าใจก่อนออกแบบ schedule",
                code: "-- Full Backup\n-- เก็บทั้ง database ณ เวลานั้น\n-- ใช้เวลานาน ไฟล์ใหญ่ — ทำสัปดาห์ละครั้งหรือทุกคืน\n\n-- Differential Backup  \n-- เก็บเฉพาะส่วนที่เปลี่ยนแปลงตั้งแต่ Full ครั้งล่าสุด\n-- เล็กกว่า Full มาก — ทำทุกวันหรือทุกไม่กี่ชั่วโมง\n-- Restore ต้องใช้ Full + Differential ล่าสุดเสมอ\n\n-- Transaction Log Backup\n-- เก็บ transaction ที่เกิดขึ้นตั้งแต่ Log backup ครั้งล่าสุด\n-- ไฟล์เล็กมาก — ทำทุก 15-60 นาที\n-- ช่วยให้ restore ถึงจุดใดก็ได้ (Point-in-Time Recovery)\n-- ใช้ได้เฉพาะ database ที่ Recovery Model เป็น Full เท่านั้น",
                lang: "sql",
                note: "Transaction Log backup จำเป็นต้องทำต่อเนื่อง ถ้าขาดช่วงแม้แต่ครั้งเดียว chain จะขาดและ restore ถึงจุดนั้นไม่ได้",
            },
            {
                title: "ตั้ง Recovery Model เป็น Full",
                body: "Database ต้องใช้ Recovery Model แบบ Full ถึงจะทำ Transaction Log backup ได้ — ค่า default ของ SQL Server คือ Simple ซึ่งไม่รองรับ",
                code: "-- ดู Recovery Model ของทุก database\nSELECT name, recovery_model_desc \nFROM sys.databases\nORDER BY name;\n\n-- เปลี่ยนเป็น Full\nALTER DATABASE AppDB SET RECOVERY FULL;\n\n-- ตรวจสอบ\nSELECT name, recovery_model_desc \nFROM sys.databases \nWHERE name = 'AppDB';",
                lang: "sql",
                note: "หลังเปลี่ยนเป็น Full Recovery ต้องทำ Full Backup ทันที — ไม่งั้น Log จะยังไม่ truncate และ Log file จะโตขึ้นเรื่อยๆ",
            },
            {
                title: "สร้าง Directory สำหรับเก็บ Backup",
                body: "สร้าง folder แยกตาม backup type บน local disk ก่อน — จะ move ไป NAS ใน step ถัดไป",
                code: "# PowerShell บน server\nNew-Item -ItemType Directory -Path 'D:\\SQLBackup\\Full' -Force\nNew-Item -ItemType Directory -Path 'D:\\SQLBackup\\Diff' -Force\nNew-Item -ItemType Directory -Path 'D:\\SQLBackup\\Log'  -Force\n\n# ตรวจสอบ\nGet-ChildItem 'D:\\SQLBackup'",
                lang: "powershell",
                note: "ควรเก็บ backup ไว้ใน drive แยกจาก OS และ Data — ถ้า drive เดียวกันพังจะหาย backup พร้อมกัน",
            },
            {
                title: "เขียน T-SQL สำหรับ Full Backup",
                body: "สร้าง stored procedure สำหรับ Full Backup — ตั้งชื่อไฟล์ตามวันที่อัตโนมัติ",
                code: "-- รันใน SSMS\nUSE master;\nGO\n\nCREATE OR ALTER PROCEDURE dbo.sp_BackupFull\n    @DatabaseName NVARCHAR(128),\n    @BackupPath   NVARCHAR(256) = 'D:\\SQLBackup\\Full\\'\nAS\nBEGIN\n    DECLARE @FileName  NVARCHAR(512)\n    DECLARE @Timestamp NVARCHAR(20)\n    \n    SET @Timestamp = FORMAT(GETDATE(), 'yyyyMMdd_HHmmss')\n    SET @FileName  = @BackupPath + @DatabaseName + '_FULL_' + @Timestamp + '.bak'\n    \n    BACKUP DATABASE @DatabaseName\n    TO DISK = @FileName\n    WITH \n        COMPRESSION,          -- บีบอัดไฟล์ ลดขนาดได้ 60-80%\n        CHECKSUM,             -- ตรวจสอบความถูกต้องของไฟล์\n        STATS = 10;           -- แสดง progress ทุก 10%\n    \n    PRINT 'Full backup completed: ' + @FileName;\nEND;\nGO\n\n-- ทดสอบ\nEXEC dbo.sp_BackupFull @DatabaseName = 'AppDB';",
                lang: "sql",
                note: "WITH COMPRESSION ลดขนาดไฟล์ได้มากแต่กิน CPU เพิ่ม — ถ้า server มี CPU น้อยให้ทำ backup ช่วงกลางคืนแทน",
            },
            {
                title: "เขียน T-SQL สำหรับ Differential Backup",
                body: "Stored procedure สำหรับ Differential Backup — เก็บเฉพาะส่วนที่เปลี่ยนแปลงตั้งแต่ Full ครั้งล่าสุด",
                code: "CREATE OR ALTER PROCEDURE dbo.sp_BackupDiff\n    @DatabaseName NVARCHAR(128),\n    @BackupPath   NVARCHAR(256) = 'D:\\SQLBackup\\Diff\\'\nAS\nBEGIN\n    DECLARE @FileName  NVARCHAR(512)\n    DECLARE @Timestamp NVARCHAR(20)\n    \n    SET @Timestamp = FORMAT(GETDATE(), 'yyyyMMdd_HHmmss')\n    SET @FileName  = @BackupPath + @DatabaseName + '_DIFF_' + @Timestamp + '.bak'\n    \n    BACKUP DATABASE @DatabaseName\n    TO DISK = @FileName\n    WITH \n        DIFFERENTIAL,\n        COMPRESSION,\n        CHECKSUM,\n        STATS = 10;\n    \n    PRINT 'Differential backup completed: ' + @FileName;\nEND;\nGO",
                lang: "sql",
            },
            {
                title: "เขียน T-SQL สำหรับ Transaction Log Backup",
                body: "Stored procedure สำหรับ Log Backup — ทำบ่อยที่สุดในสามประเภท",
                code: "CREATE OR ALTER PROCEDURE dbo.sp_BackupLog\n    @DatabaseName NVARCHAR(128),\n    @BackupPath   NVARCHAR(256) = 'D:\\SQLBackup\\Log\\'\nAS\nBEGIN\n    DECLARE @FileName  NVARCHAR(512)\n    DECLARE @Timestamp NVARCHAR(20)\n    \n    SET @Timestamp = FORMAT(GETDATE(), 'yyyyMMdd_HHmmss')\n    SET @FileName  = @BackupPath + @DatabaseName + '_LOG_' + @Timestamp + '.trn'\n    \n    BACKUP LOG @DatabaseName\n    TO DISK = @FileName\n    WITH \n        COMPRESSION,\n        CHECKSUM,\n        STATS = 10;\n    \n    PRINT 'Log backup completed: ' + @FileName;\nEND;\nGO",
                lang: "sql",
                note: "ไฟล์ Log backup ใช้นามสกุล .trn เพื่อแยกให้ชัดจาก .bak — ช่วยให้ restore ถูกลำดับ",
            },
            {
                title: "สร้าง SQL Agent Job — Full Backup",
                body: "สร้าง Job ใน SQL Agent ให้รัน Full Backup อัตโนมัติทุกวันอาทิตย์ 01:00",
                code: "USE msdb;\nGO\n\n-- สร้าง Job\nEXEC sp_add_job\n    @job_name = N'Backup - Full - AppDB';\n\n-- เพิ่ม Step\nEXEC sp_add_jobstep\n    @job_name   = N'Backup - Full - AppDB',\n    @step_name  = N'Run Full Backup',\n    @subsystem  = N'TSQL',\n    @command    = N'EXEC master.dbo.sp_BackupFull @DatabaseName = ''AppDB'';',\n    @database_name = N'master';\n\n-- ตั้ง Schedule — ทุกวันอาทิตย์ 01:00\nEXEC sp_add_schedule\n    @schedule_name      = N'Weekly Sunday 0100',\n    @freq_type          = 8,       -- weekly\n    @freq_interval      = 1,       -- Sunday\n    @freq_recurrence_factor = 1,\n    @active_start_time  = 010000;  -- 01:00:00\n\nEXEC sp_attach_schedule\n    @job_name      = N'Backup - Full - AppDB',\n    @schedule_name = N'Weekly Sunday 0100';\n\nEXEC sp_add_jobserver\n    @job_name = N'Backup - Full - AppDB';\nGO",
                lang: "sql",
                note: "freq_interval = 1 คือ Sunday — ค่าอื่น: 2=Monday, 4=Tuesday, 8=Wednesday, 16=Thursday, 32=Friday, 64=Saturday",
            },
            {
                title: "สร้าง SQL Agent Job — Differential และ Log Backup",
                body: "สร้าง Job สำหรับ Differential ทุกวัน 02:00 และ Log ทุกชั่วโมง",
                code: "-- Job Differential — ทุกวัน 02:00 (ยกเว้นวันอาทิตย์)\nEXEC sp_add_job @job_name = N'Backup - Diff - AppDB';\n\nEXEC sp_add_jobstep\n    @job_name  = N'Backup - Diff - AppDB',\n    @step_name = N'Run Diff Backup',\n    @subsystem = N'TSQL',\n    @command   = N'EXEC master.dbo.sp_BackupDiff @DatabaseName = ''AppDB'';',\n    @database_name = N'master';\n\nEXEC sp_add_schedule\n    @schedule_name          = N'Daily 0200 Except Sunday',\n    @freq_type              = 8,\n    @freq_interval          = 126,  -- Mon+Tue+Wed+Thu+Fri+Sat = 2+4+8+16+32+64\n    @freq_recurrence_factor = 1,\n    @active_start_time      = 020000;\n\nEXEC sp_attach_schedule\n    @job_name      = N'Backup - Diff - AppDB',\n    @schedule_name = N'Daily 0200 Except Sunday';\n\nEXEC sp_add_jobserver @job_name = N'Backup - Diff - AppDB';\nGO\n\n-- Job Log — ทุกชั่วโมง\nEXEC sp_add_job @job_name = N'Backup - Log - AppDB';\n\nEXEC sp_add_jobstep\n    @job_name  = N'Backup - Log - AppDB',\n    @step_name = N'Run Log Backup',\n    @subsystem = N'TSQL',\n    @command   = N'EXEC master.dbo.sp_BackupLog @DatabaseName = ''AppDB'';',\n    @database_name = N'master';\n\nEXEC sp_add_schedule\n    @schedule_name          = N'Hourly Log Backup',\n    @freq_type              = 4,   -- daily\n    @freq_interval          = 1,\n    @freq_subday_type       = 8,   -- hours\n    @freq_subday_interval   = 1,   -- ทุก 1 ชั่วโมง\n    @active_start_time      = 000000;\n\nEXEC sp_attach_schedule\n    @job_name      = N'Backup - Log - AppDB',\n    @schedule_name = N'Hourly Log Backup';\n\nEXEC sp_add_jobserver @job_name = N'Backup - Log - AppDB';\nGO",
                lang: "sql",
            },
            {
                title: "สร้าง Job ลบ Backup เก่าอัตโนมัติ",
                body: "ลบ backup ที่เก่าเกิน 7 วัน อัตโนมัติทุกวัน — ไม่งั้น disk จะเต็มในไม่กี่อาทิตย์",
                code: "-- PowerShell script สำหรับลบไฟล์เก่า\n-- บันทึกไว้ที่ D:\\SQLBackup\\Cleanup-OldBackups.ps1\n\n$paths = @(\n    'D:\\SQLBackup\\Full',\n    'D:\\SQLBackup\\Diff',\n    'D:\\SQLBackup\\Log'\n)\n$keepDays = 7\n$cutoff   = (Get-Date).AddDays(-$keepDays)\n\nforeach ($path in $paths) {\n    Get-ChildItem -Path $path -File | \n        Where-Object { $_.LastWriteTime -lt $cutoff } | \n        ForEach-Object {\n            Remove-Item $_.FullName -Force\n            Write-Output \"Deleted: $($_.FullName)\"\n        }\n}\n\n-- สร้าง SQL Agent Job รัน script นี้ทุกวัน 03:00\nEXEC sp_add_job @job_name = N'Cleanup - Old Backups';\n\nEXEC sp_add_jobstep\n    @job_name   = N'Cleanup - Old Backups',\n    @step_name  = N'Delete old backup files',\n    @subsystem  = N'PowerShell',\n    @command    = N'D:\\SQLBackup\\Cleanup-OldBackups.ps1';\n\nEXEC sp_add_schedule\n    @schedule_name     = N'Daily 0300',\n    @freq_type         = 4,\n    @freq_interval     = 1,\n    @active_start_time = 030000;\n\nEXEC sp_attach_schedule\n    @job_name      = N'Cleanup - Old Backups',\n    @schedule_name = N'Daily 0300';\n\nEXEC sp_add_jobserver @job_name = N'Cleanup - Old Backups';\nGO",
                lang: "sql",
                note: "Log backup สร้างไฟล์ทุกชั่วโมง = 24 ไฟล์ต่อวัน — ถ้าไม่ลบจะเต็ม disk เร็วมาก ปรับ keepDays ตามขนาด disk ที่มี",
            },
            {
                title: "Move Backup ไปยัง NAS อัตโนมัติ",
                body: "สร้าง PowerShell script ย้าย backup จาก local ไป NAS หลัง backup เสร็จ — ไฟล์เก่าบน local จะถูกลบออกหลัง copy สำเร็จ",
                code: "# บันทึกที่ D:\\SQLBackup\\Move-ToNAS.ps1\n\n$localPaths = @(\n    @{ Src = 'D:\\SQLBackup\\Full'; Dst = '\\\\NAS\\SQLBackup\\Full' },\n    @{ Src = 'D:\\SQLBackup\\Diff'; Dst = '\\\\NAS\\SQLBackup\\Diff' },\n    @{ Src = 'D:\\SQLBackup\\Log';  Dst = '\\\\NAS\\SQLBackup\\Log'  }\n)\n\nforeach ($p in $localPaths) {\n    # สร้าง destination folder ถ้ายังไม่มี\n    if (-not (Test-Path $p.Dst)) {\n        New-Item -ItemType Directory -Path $p.Dst -Force | Out-Null\n    }\n    \n    # copy ไฟล์ที่อายุเกิน 1 ชั่วโมง (ป้องกัน copy ไฟล์ที่กำลัง write)\n    $cutoff = (Get-Date).AddHours(-1)\n    Get-ChildItem -Path $p.Src -File |\n        Where-Object { $_.LastWriteTime -lt $cutoff } |\n        ForEach-Object {\n            $dest = Join-Path $p.Dst $_.Name\n            Copy-Item $_.FullName -Destination $dest -Force\n            \n            # ตรวจสอบขนาดไฟล์ก่อนลบต้นทาง\n            if ((Get-Item $dest).Length -eq $_.Length) {\n                Remove-Item $_.FullName -Force\n                Write-Output \"Moved: $($_.Name) → NAS\"\n            } else {\n                Write-Warning \"Size mismatch, keeping local: $($_.Name)\"\n            }\n        }\n}\n\n# เพิ่ม Job รัน script นี้ทุกชั่วโมง ครึ่งชั่วโมง\n# (offset จาก Log backup เพื่อให้ Log backup เสร็จก่อน)",
                lang: "powershell",
                note: "ตรวจสอบขนาดไฟล์ก่อนลบ local เสมอ — ถ้า NAS ขาดกลางคัน file จะไม่ถูกลบ ยังมีสำรองบน local",
            },
            {
                title: "ตรวจสอบ Job History และ Backup History",
                body: "ตรวจสอบว่า Job รันสำเร็จและ backup file ถูกต้อง",
                code: "-- ดู Job ทั้งหมดและสถานะล่าสุด\nSELECT \n    j.name AS JobName,\n    h.run_date,\n    h.run_time,\n    CASE h.run_status\n        WHEN 0 THEN 'Failed'\n        WHEN 1 THEN 'Succeeded'\n        WHEN 3 THEN 'Cancelled'\n    END AS Status,\n    h.message\nFROM msdb.dbo.sysjobs j\nJOIN msdb.dbo.sysjobhistory h ON j.job_id = h.job_id\nWHERE h.step_id = 0  -- 0 = job outcome\nORDER BY h.run_date DESC, h.run_time DESC;\n\n-- ดู Backup History ของ database\nSELECT TOP 20\n    database_name,\n    backup_start_date,\n    backup_finish_date,\n    CAST(backup_size/1024/1024 AS INT) AS SizeMB,\n    type,  -- D=Full, I=Diff, L=Log\n    physical_device_name\nFROM msdb.dbo.backupset bs\nJOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id\nWHERE database_name = 'AppDB'\nORDER BY backup_start_date DESC;",
                lang: "sql",
                note: "ควรตรวจ Job History ทุกเช้า — ถ้า Job ใด Failed ต้องรีบแก้ทันที backup ที่ขาดช่วงคือความเสี่ยง",
            },
            {
                title: "ทดสอบ Restore จาก Backup",
                body: "backup ที่ไม่เคย restore ทดสอบเท่ากับไม่มี — ทดสอบ restore บน database แยกเพื่อยืนยันว่าไฟล์ใช้งานได้จริง",
                code: "-- Restore Full Backup ไปยัง database ใหม่ชื่อ AppDB_Test\nRESTORE DATABASE AppDB_Test\nFROM DISK = 'D:\\SQLBackup\\Full\\AppDB_FULL_20250101_010000.bak'\nWITH \n    MOVE 'AppDB'      TO 'D:\\SQLData\\AppDB_Test.mdf',\n    MOVE 'AppDB_log'  TO 'D:\\SQLData\\AppDB_Test_log.ldf',\n    NORECOVERY,   -- เปิดรับ Differential และ Log ต่อได้\n    STATS = 10;\n\n-- ต่อด้วย Differential\nRESTORE DATABASE AppDB_Test\nFROM DISK = 'D:\\SQLBackup\\Diff\\AppDB_DIFF_20250101_020000.bak'\nWITH \n    NORECOVERY,\n    STATS = 10;\n\n-- ต่อด้วย Log backup ล่าสุด\nRESTORE LOG AppDB_Test\nFROM DISK = 'D:\\SQLBackup\\Log\\AppDB_LOG_20250101_030000.trn'\nWITH \n    RECOVERY,   -- ปิด restore chain — database พร้อมใช้งาน\n    STATS = 10;\n\n-- ตรวจสอบผลลัพธ์\nSELECT name, state_desc FROM sys.databases WHERE name = 'AppDB_Test';\n\n-- ลบ database ทดสอบหลังยืนยันแล้ว\nDROP DATABASE AppDB_Test;",
                lang: "sql",
                note: "ทดสอบ restore อย่างน้อยเดือนละครั้ง — ถ้าพบว่า restore ไม่ได้หลังเกิดเหตุจริง จะแก้ไขอะไรไม่ได้แล้ว",
            },
        ],
    },

    {
        id: 19, slug: "sql-server-maintenance-log", category: "infrastructure",
        title: "SQL Server — ตัด Transaction Log เมื่อโตเกิน",
        description: "แก้ปัญหา Transaction Log file โตไม่หยุด: ทำความเข้าใจสาเหตุ, ตรวจสอบขนาด, ตัด Log อย่างถูกวิธี และตั้ง Job ป้องกันไม่ให้โตจนเต็ม disk อีก",
        difficulty: "intermediate", time: "25 min",
        tags: ["SQL Server", "Transaction Log", "Maintenance", "T-SQL", "SQL Agent"], updated: "Apr 2025",
        prerequisites: [
            "ผ่าน Guide 18 แล้ว — SQL Agent Job และ Log Backup รันอยู่",
            "มีสิทธิ์ sysadmin บน SQL Server",
        ],
        steps: [
            {
                title: "ทำความเข้าใจสาเหตุที่ Log โต",
                body: "Log file โตเพราะ SQL Server ยังไม่ได้ reuse space — ต้องเข้าใจสาเหตุก่อนแก้ ไม่งั้นแก้แล้วก็โตอีก",
                code: "-- ตรวจสอบสาเหตุที่ Log ยังไม่ถูก reuse\nSELECT \n    name,\n    log_reuse_wait_desc  -- นี่คือสาเหตุ\nFROM sys.databases\nWHERE name = 'AppDB';\n\n-- ค่าที่พบบ่อยและความหมาย:\n-- NOTHING          → พร้อม reuse แล้ว ปกติ\n-- LOG_BACKUP       → รอ Log backup — ต้องทำ Log backup ก่อน\n-- ACTIVE_TRANSACTION → มี transaction ค้างอยู่\n-- CHECKPOINT       → รอ checkpoint — ปกติหาย เอง\n-- DATABASE_MIRRORING → ใช้ Mirroring อยู่",
                lang: "sql",
                note: "LOG_BACKUP คือสาเหตุที่พบบ่อยที่สุด — แก้ด้วยการทำ Log backup แล้ว Log จะ truncate เองอัตโนมัติ",
            },
            {
                title: "ตรวจสอบขนาด Log file ปัจจุบัน",
                body: "ดูขนาด Log file และ space ที่ใช้จริง เทียบกับขนาดไฟล์ทั้งหมด",
                code: "-- ดูขนาด Log file ทุก database\nDBCC SQLPERF(LOGSPACE);\n\n-- ดูรายละเอียด file ของ database นั้นๆ\nUSE AppDB;\nGO\n\nSELECT \n    name,\n    type_desc,\n    CAST(size * 8.0 / 1024 AS DECIMAL(10,2)) AS SizeMB,\n    CAST(FILEPROPERTY(name, 'SpaceUsed') * 8.0 / 1024 AS DECIMAL(10,2)) AS UsedMB,\n    CAST((size - FILEPROPERTY(name, 'SpaceUsed')) * 8.0 / 1024 AS DECIMAL(10,2)) AS FreeMB\nFROM sys.database_files;\n\n-- ถ้า Log size ใหญ่แต่ used น้อย = ตัดได้\n-- ถ้า Log size ใหญ่และ used เยอะ = มี transaction ค้างหรือ Log backup ไม่รัน",
                lang: "sql",
                note: "ถ้า Log file ใหญ่ 10GB แต่ used แค่ 500MB แสดงว่า truncate ได้ — space ที่เหลือคือ reusable space ที่ยังไม่ได้ shrink คืน OS",
            },
            {
                title: "ตัด Log อย่างถูกวิธี — ทำ Log Backup ก่อน",
                body: "วิธีที่ถูกต้องคือทำ Log Backup ก่อน — SQL Server จะ truncate Log อัตโนมัติหลัง backup เสร็จ ไม่ต้องทำอะไรเพิ่ม",
                code: "-- ทำ Log Backup ทันที (ไม่ต้องรอ schedule)\nBACKUP LOG AppDB\nTO DISK = 'D:\\SQLBackup\\Log\\AppDB_LOG_manual.trn'\nWITH COMPRESSION, STATS = 10;\n\n-- ตรวจสอบหลัง backup\nSELECT name, log_reuse_wait_desc\nFROM sys.databases\nWHERE name = 'AppDB';\n-- ควรเห็น NOTHING แทน LOG_BACKUP",
                lang: "sql",
                note: "ห้าม Shrink Log โดยไม่ทำ Log Backup ก่อน — ถ้า shrink ตรงๆ Log chain จะขาดและ Point-in-Time restore ทำไม่ได้",
            },
            {
                title: "Shrink Log File หลัง Backup เสร็จ",
                body: "หลัง Log backup แล้ว Log file จะ truncate แต่ขนาดไฟล์บน disk ยังใหญ่อยู่ — ต้อง shrink เพื่อคืน space กลับ OS",
                code: "USE AppDB;\nGO\n\n-- ดูชื่อ Log file ก่อน\nSELECT name, type_desc FROM sys.database_files;\n\n-- Shrink Log file — แทน 'AppDB_log' ด้วยชื่อจริง\n-- target size คือขนาดที่อยากให้เหลือ (MB)\nDBCC SHRINKFILE (AppDB_log, 512);  -- shrink เหลือ 512MB\n\n-- ตรวจสอบขนาดหลัง shrink\nSELECT \n    name,\n    CAST(size * 8.0 / 1024 AS DECIMAL(10,2)) AS SizeMB\nFROM sys.database_files\nWHERE type_desc = 'LOG';",
                lang: "sql",
                note: "อย่า shrink Log เป็น 1MB — SQL Server จะต้องขยายไฟล์ทันทีที่มี transaction ใหม่ ทำให้ performance แย่ ตั้ง target ไว้ที่ 512MB-1GB สมเหตุสมผลกว่า",
            },
            {
                title: "กรณีพิเศษ — Log โตเพราะ ACTIVE_TRANSACTION",
                body: "ถ้า log_reuse_wait_desc เป็น ACTIVE_TRANSACTION แปลว่ามี transaction ค้างอยู่ ต้องหาและจัดการก่อน",
                code: "-- หา transaction ที่ค้างนานที่สุด\nSELECT TOP 10\n    session_id,\n    transaction_id,\n    start_time,\n    DATEDIFF(MINUTE, start_time, GETDATE()) AS RunningMinutes,\n    transaction_type,\n    transaction_state\nFROM sys.dm_tran_active_transactions\nORDER BY start_time ASC;\n\n-- ดูว่า session ไหนถือ transaction นั้น\nSELECT \n    s.session_id,\n    s.login_name,\n    s.host_name,\n    s.program_name,\n    r.command,\n    r.wait_type\nFROM sys.dm_exec_sessions s\nLEFT JOIN sys.dm_exec_requests r ON s.session_id = r.session_id\nWHERE s.open_transaction_count > 0;\n\n-- ถ้าต้องการ kill session (ระวัง — rollback อาจใช้เวลานาน)\n-- KILL 55;  -- แทน 55 ด้วย session_id จริง",
                lang: "sql",
                note: "KILL session จะทำให้ transaction rollback — ถ้า transaction ใหญ่ rollback อาจใช้เวลานานกว่าตอนรัน ดู progress ด้วย: KILL 55 WITH STATUSONLY",
            },
            {
                title: "ตั้งค่า Auto Growth ให้เหมาะสม",
                body: "ป้องกัน Log โตแบบ uncontrolled ด้วยการตั้ง Auto Growth เป็น MB แทน % และกำหนด Max Size",
                code: "USE AppDB;\nGO\n\n-- ดู Auto Growth ปัจจุบัน\nSELECT \n    name,\n    is_percent_growth,\n    growth,\n    max_size\nFROM sys.database_files;\n\n-- ตั้งค่าใหม่ — ขยายทีละ 256MB และจำกัดสูงสุด 10GB\nALTER DATABASE AppDB\nMODIFY FILE (\n    NAME = AppDB_log,\n    FILEGROWTH = 256MB,\n    MAXSIZE = 10240MB\n);\n\n-- ตรวจสอบ\nSELECT name, is_percent_growth, growth, max_size\nFROM sys.database_files\nWHERE type_desc = 'LOG';",
                lang: "sql",
                note: "อย่าใช้ % growth — ถ้า Log ใหญ่อยู่แล้ว 5GB การขยาย 10% = 500MB ต่อครั้ง ทำให้ disk เต็มเร็วโดยไม่รู้ตัว",
            },
            {
                title: "สร้าง Job แจ้งเตือนเมื่อ Log โตเกิน threshold",
                body: "ตั้ง Job ตรวจสอบขนาด Log ทุกชั่วโมง — ถ้าโตเกิน 80% ของ Max Size ให้แจ้งเตือนทาง email หรือ Windows Event Log",
                code: "-- Script ตรวจสอบและแจ้งเตือน\n-- บันทึกที่ D:\\SQLBackup\\Check-LogSize.sql\n\nDECLARE @LogSizeMB    FLOAT\nDECLARE @LogUsedPct   FLOAT\nDECLARE @Threshold    FLOAT = 80.0  -- แจ้งเตือนเมื่อใช้เกิน 80%\nDECLARE @DatabaseName NVARCHAR(128) = 'AppDB'\nDECLARE @Message      NVARCHAR(500)\n\nSELECT \n    @LogSizeMB  = size * 8.0 / 1024,\n    @LogUsedPct = CAST(FILEPROPERTY(name, 'SpaceUsed') AS FLOAT) \n                  / CAST(size AS FLOAT) * 100\nFROM sys.database_files\nWHERE type_desc = 'LOG'\nAND DB_NAME() = @DatabaseName;\n\nIF @LogUsedPct > @Threshold\nBEGIN\n    SET @Message = 'WARNING: ' + @DatabaseName + \n                   ' Log file used ' + \n                   CAST(CAST(@LogUsedPct AS INT) AS VARCHAR) + \n                   '% (' + CAST(CAST(@LogSizeMB AS INT) AS VARCHAR) + ' MB)'\n    \n    -- เขียนลง Windows Event Log\n    EXEC xp_logevent 50001, @Message, 'WARNING';\n    \n    -- หรือ raise error ให้ SQL Agent จับได้\n    RAISERROR(@Message, 16, 1);\nEND\n\n-- สร้าง Job รัน script นี้ทุกชั่วโมง\n-- แล้วตั้ง Job notification ส่ง email เมื่อ Job fail",
                lang: "sql",
                note: "xp_logevent เขียนลง Windows Application Event Log — ดูได้ใน Event Viewer ซึ่งเชื่อมกับ monitoring tool ได้ง่ายกว่า email",
            },
            {
                title: "สรุป Checklist เมื่อ Log โต",
                body: "ขั้นตอนวินิจฉัยเมื่อพบ Log file โตผิดปกติ — ทำตามลำดับนี้ทุกครั้ง",
                code: "-- Step 1: ตรวจสาเหตุ\nSELECT name, log_reuse_wait_desc FROM sys.databases WHERE name = 'AppDB';\n\n-- Step 2: ตรวจ Job ว่า Log Backup รันสำเร็จไหม\nSELECT TOP 5 run_date, run_time, run_status, message\nFROM msdb.dbo.sysjobhistory h\nJOIN msdb.dbo.sysjobs j ON h.job_id = j.job_id\nWHERE j.name = 'Backup - Log - AppDB'\nAND h.step_id = 0\nORDER BY run_date DESC, run_time DESC;\n\n-- Step 3: ถ้า LOG_BACKUP → รัน Log Backup ทันที\nBACKUP LOG AppDB TO DISK = 'D:\\SQLBackup\\Log\\AppDB_LOG_emergency.trn';\n\n-- Step 4: Shrink Log\nDBCC SHRINKFILE (AppDB_log, 512);\n\n-- Step 5: ตรวจสอบผลลัพธ์\nDBCC SQLPERF(LOGSPACE);",
                lang: "sql",
                note: "ถ้าทำครบทุก step แล้ว Log ยังโตอีก แปลว่า workload เพิ่มขึ้นจริง — ต้องพิจารณาเพิ่มความถี่ Log backup หรือขยาย disk",
            },
        ],
    },

    {
        id: 20, slug: "windows-server-backup-task-scheduler", category: "infrastructure",
        title: "Windows Server Backup + Task Scheduler",
        description: "ติดตั้ง Windows Server Backup feature, ตั้งค่า Full Server Backup ไปยัง local disk และ NAS, ตั้ง schedule ด้วย Task Scheduler และทดสอบ restore",
        difficulty: "beginner", time: "35 min",
        tags: ["Windows Server", "Backup", "Task Scheduler", "NAS", "PowerShell", "wbadmin"], updated: "Apr 2025",
        prerequisites: [
            "ผ่าน Guide 16 แล้ว — Windows Server 2025 พร้อมใช้งาน",
            "มี disk สำรองสำหรับ backup หรือ NAS ที่เข้าถึงได้ผ่าน network share",
            "มีสิทธิ์ Administrator",
        ],
        steps: [
            {
                title: "ติดตั้ง Windows Server Backup Feature",
                body: "Windows Server Backup ไม่ได้ติดตั้งมาให้ — ต้องเพิ่ม feature ก่อน",
                code: "# PowerShell as Administrator\nInstall-WindowsFeature -Name Windows-Server-Backup -IncludeManagementTools\n\n# ตรวจสอบ\nGet-WindowsFeature -Name Windows-Server-Backup",
                lang: "powershell",
                note: "ติดตั้งเสร็จไม่ต้อง reboot — ใช้งานได้ทันที",
            },
            {
                title: "เตรียม Backup Destination",
                body: "เตรียม local disk และ network share สำหรับเก็บ backup — แนะนำให้มีทั้งสองเพื่อความปลอดภัย",
                code: "# ตรวจสอบ disk ที่มีอยู่\nGet-Disk | Select Number, FriendlyName, Size, PartitionStyle\n\n# ถ้ามี disk เปล่าสำหรับ backup — initialize และ format\nInitialize-Disk -Number 1 -PartitionStyle GPT\nNew-Partition -DiskNumber 1 -UseMaximumSize -AssignDriveLetter\nFormat-Volume -DriveLetter E -FileSystem NTFS -NewFileSystemLabel 'Backup'\n\n# ทดสอบเข้าถึง NAS\nTest-Path '\\\\NAS\\ServerBackup'\n\n# ถ้าต้องการ credentials สำหรับ NAS\nnet use '\\\\NAS\\ServerBackup' /user:nasuser PASSWORD /persistent:yes",
                lang: "powershell",
                note: "disk ที่ใช้เป็น backup destination ควรแยกจาก OS drive เสมอ — ถ้า OS drive พังจะยังมี backup อยู่",
            },
            {
                title: "ทดสอบ Backup ด้วย wbadmin ครั้งแรก",
                body: "ทดสอบ Full Server Backup ไปยัง local disk ก่อน — เพื่อยืนยันว่าทุกอย่างทำงานถูกต้องก่อนตั้ง schedule",
                code: "# Full Server Backup ไปยัง local disk E:\nwbadmin start backup `\n    -backupTarget:E: `\n    -allCritical `\n    -systemState `\n    -quiet\n\n# Full Server Backup ไปยัง NAS\nwbadmin start backup `\n    -backupTarget:'\\\\NAS\\ServerBackup' `\n    -allCritical `\n    -systemState `\n    -user:nasuser `\n    -password:PASSWORD `\n    -quiet\n\n# ดู backup ที่มีอยู่\nwbadmin get versions",
                lang: "powershell",
                note: "-allCritical รวม OS volume, System State และ boot files ทั้งหมด — ใช้ restore ได้ทั้ง bare metal recovery",
            },
            {
                title: "สร้าง PowerShell Script สำหรับ Backup",
                body: "สร้าง script ที่ backup ไป local และ NAS พร้อมกัน และ log ผลลัพธ์ไว้ตรวจสอบ",
                code: "# บันทึกที่ C:\\Scripts\\Run-ServerBackup.ps1\n# สร้าง folder ก่อน\nNew-Item -ItemType Directory -Path 'C:\\Scripts' -Force\nNew-Item -ItemType Directory -Path 'C:\\Scripts\\Logs' -Force\n\n# เนื้อหา script\n$LogFile = \"C:\\Scripts\\Logs\\Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').log\"\n$NASPath = '\\\\NAS\\ServerBackup'\n$NASUser = 'nasuser'\n$NASPass = 'PASSWORD'\n\nfunction Write-Log {\n    param($Message)\n    $entry = \"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $Message\"\n    Add-Content -Path $LogFile -Value $entry\n    Write-Output $entry\n}\n\nWrite-Log 'Starting Full Server Backup...'\n\n# Backup ไป Local disk\nWrite-Log 'Backing up to local disk E:'\n$result = wbadmin start backup `\n    -backupTarget:E: `\n    -allCritical `\n    -systemState `\n    -quiet 2>&1\n\nif ($LASTEXITCODE -eq 0) {\n    Write-Log 'Local backup: SUCCESS'\n} else {\n    Write-Log \"Local backup: FAILED — $result\"\n}\n\n# Backup ไป NAS\nWrite-Log 'Backing up to NAS'\n$result = wbadmin start backup `\n    -backupTarget:$NASPath `\n    -allCritical `\n    -systemState `\n    -user:$NASUser `\n    -password:$NASPass `\n    -quiet 2>&1\n\nif ($LASTEXITCODE -eq 0) {\n    Write-Log 'NAS backup: SUCCESS'\n} else {\n    Write-Log \"NAS backup: FAILED — $result\"\n}\n\n# ลบ log เก่าเกิน 30 วัน\nGet-ChildItem 'C:\\Scripts\\Logs' -Filter '*.log' |\n    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |\n    Remove-Item -Force\n\nWrite-Log 'Backup job completed.'",
                lang: "powershell",
                note: "เก็บ script ไว้ใน C:\\Scripts — อย่าเก็บใน Desktop หรือ Downloads เพราะอาจถูกลบโดยไม่ตั้งใจ",
            },
            {
                title: "ตั้ง Schedule ด้วย Task Scheduler",
                body: "ตั้ง scheduled task รัน backup script อัตโนมัติทุกคืน — ใช้ PowerShell สร้างได้เลยไม่ต้องเปิด GUI",
                code: "# สร้าง Scheduled Task\n$action = New-ScheduledTaskAction `\n    -Execute 'PowerShell.exe' `\n    -Argument '-NonInteractive -ExecutionPolicy Bypass -File C:\\Scripts\\Run-ServerBackup.ps1'\n\n# รันทุกวันตี 2\n$trigger = New-ScheduledTaskTrigger `\n    -Daily `\n    -At '02:00AM'\n\n# รันด้วยสิทธิ์ SYSTEM — ไม่ต้อง login\n$principal = New-ScheduledTaskPrincipal `\n    -UserId 'SYSTEM' `\n    -LogonType ServiceAccount `\n    -RunLevel Highest\n\n$settings = New-ScheduledTaskSettingsSet `\n    -ExecutionTimeLimit (New-TimeSpan -Hours 4) `\n    -StartWhenAvailable `\n    -DontStopOnIdleEnd\n\nRegister-ScheduledTask `\n    -TaskName 'Windows Server Backup - Nightly' `\n    -TaskPath '\\Backup' `\n    -Action $action `\n    -Trigger $trigger `\n    -Principal $principal `\n    -Settings $settings `\n    -Description 'Full Server Backup ทุกคืนตี 2'\n\n# ตรวจสอบ\nGet-ScheduledTask -TaskPath '\\Backup'",
                lang: "powershell",
                note: "StartWhenAvailable ทำให้ task รันทันทีถ้าพลาดเวลาที่ตั้งไว้ — เช่น server reboot กลางคืน task จะรันหลัง boot แทน",
            },
            {
                title: "ทดสอบรัน Task ทันที",
                body: "ทดสอบรัน scheduled task ทันทีโดยไม่ต้องรอตี 2 — เพื่อยืนยันว่า task ทำงานถูกต้อง",
                code: "# รัน task ทันที\nStart-ScheduledTask -TaskName 'Windows Server Backup - Nightly' -TaskPath '\\Backup'\n\n# ดูสถานะ\nGet-ScheduledTask -TaskName 'Windows Server Backup - Nightly' | \n    Select TaskName, State, LastRunTime, LastTaskResult\n\n# รอสักครู่แล้วตรวจ log\nGet-Content 'C:\\Scripts\\Logs\\' -Tail 20\n\n# LastTaskResult:\n# 0         = Success\n# 0x41301   = Task is currently running\n# 0x1       = Failed",
                lang: "powershell",
                note: "Full Server Backup ใช้เวลานาน 30 นาทีถึงหลายชั่วโมง ขึ้นกับขนาด data — อย่า cancel กลางคัน",
            },
            {
                title: "ตรวจสอบ Backup ที่มีอยู่",
                body: "ดูรายการ backup ที่ทำไว้ทั้งหมด พร้อม version และวันที่",
                code: "# ดู backup versions ทั้งหมด\nwbadmin get versions\n\n# ดูเฉพาะ backup ที่อยู่บน NAS\nwbadmin get versions -backupTarget:'\\\\NAS\\ServerBackup'\n\n# ตัวอย่างผลลัพธ์:\n# Backup time: 1/5/2025 2:00 AM\n# Backup target: \\\\NAS\\ServerBackup\n# Version identifier: 05/01/2025-19:00\n# Can recover: Volume(s), File(s), Application(s), Bare metal recovery, System state",
                lang: "powershell",
                note: "จด Version identifier ไว้ — ต้องใช้ตอน restore เช่น 05/01/2025-19:00",
            },
            {
                title: "ทดสอบ Restore ไฟล์จาก Backup",
                body: "ทดสอบ restore ไฟล์เดี่ยวจาก backup — ไม่ต้อง restore ทั้ง server เพื่อทดสอบ",
                code: "# ดู backup versions ก่อน\nwbadmin get versions\n\n# Restore ไฟล์เดี่ยว — แทน version identifier ด้วยค่าจริง\nwbadmin start recovery `\n    -version:'05/01/2025-19:00' `\n    -itemType:File `\n    -items:'C:\\ImportantData\\report.xlsx' `\n    -recoveryTarget:'C:\\Restored' `\n    -quiet\n\n# ตรวจสอบไฟล์ที่ restore มา\nGet-ChildItem 'C:\\Restored'",
                lang: "powershell",
                note: "ทดสอบ restore อย่างน้อยเดือนละครั้ง — backup ที่ restore ไม่ได้เท่ากับไม่มี backup",
            },
            {
                title: "ตั้ง Alert เมื่อ Backup Fail",
                body: "ตั้ง Task Scheduler ส่ง event ลง Windows Event Log เมื่อ backup fail — เพื่อให้ monitoring tool จับได้",
                code: "# เพิ่มส่วนนี้ท้าย script Run-ServerBackup.ps1\n# หลัง Write-Log 'Backup job completed.'\n\n# ตรวจสอบผลลัพธ์และเขียน Event Log\n$logContent = Get-Content $LogFile -Raw\n\nif ($logContent -match 'FAILED') {\n    # เขียน Error event\n    Write-EventLog `\n        -LogName Application `\n        -Source 'ServerBackup' `\n        -EventId 9001 `\n        -EntryType Error `\n        -Message \"Server Backup FAILED. Check log: $LogFile\"\n} else {\n    # เขียน Success event\n    Write-EventLog `\n        -LogName Application `\n        -Source 'ServerBackup' `\n        -EventId 9000 `\n        -EntryType Information `\n        -Message \"Server Backup completed successfully.\"\n}\n\n# สร้าง Event Source ก่อนใช้ครั้งแรก (รันครั้งเดียว)\nNew-EventLog -LogName Application -Source 'ServerBackup'",
                lang: "powershell",
                note: "Event ID 9001 ดูได้ใน Event Viewer → Windows Logs → Application — กรอง Source: ServerBackup เพื่อหาเร็ว",
            },
            {
                title: "สรุป Backup Schedule ที่ตั้งไว้",
                body: "ตรวจสอบภาพรวมทั้งหมดหลังตั้งค่าครบ",
                code: "# ดู scheduled tasks ทั้งหมดใน folder Backup\nGet-ScheduledTask -TaskPath '\\Backup' | \n    Select TaskName, State | \n    Format-Table -AutoSize\n\n# ดู backup versions ล่าสุด\nwbadmin get versions | Select-String 'Backup time'\n\n# ดู disk space ที่ใช้ไป\nGet-PSDrive E | Select Name, Used, Free\n\n# ตรวจ Event Log backup ล่าสุด\nGet-EventLog -LogName Application -Source ServerBackup -Newest 5 | \n    Select TimeGenerated, EntryType, Message",
                lang: "powershell",
                note: "ดู backup schedule และ log ทุกอาทิตย์ — ถ้า backup fail แล้วไม่รู้ตัวนานๆ จะไม่มีสำรองเลยเมื่อถึงเวลาต้องการจริงๆ",
            },
        ],
    },
    {
        id: 21, slug: "active-directory-basics", category: "infrastructure",
        title: "Active Directory — ติดตั้ง AD DS, User, Group, OU และ Group Policy",
        description: "ติดตั้ง AD DS และ promote เป็น Domain Controller, สร้าง OU, User, Group ตามโครงสร้างองค์กร, Join domain จากเครื่อง client และตั้ง Group Policy เบื้องต้น",
        difficulty: "intermediate", time: "60 min",
        tags: ["Active Directory", "AD DS", "Group Policy", "GPO", "Domain Controller", "Windows Server"], updated: "Apr 2025",
        prerequisites: [
            "ผ่าน Guide 16 แล้ว — Windows Server 2025 พร้อมใช้งาน Static IP ตั้งไว้แล้ว",
            "Static IP ตั้งไว้แล้ว — Domain Controller ห้ามใช้ DHCP",
            "เครื่อง client ที่จะ join domain อยู่ใน network เดียวกัน",
        ],
        steps: [
            {
                title: "วางแผน Domain Name และ IP ก่อนเริ่ม",
                body: "ตัดสินใจ domain name และ IP ให้ชัดเจนก่อน — เปลี่ยนทีหลังยากมาก",
                code: "# ข้อมูลที่ต้องกำหนดก่อน:\n\n# Domain Name: corp.local\n# (ใช้ .local สำหรับ internal — ไม่ควรใช้ชื่อเดียวกับ public domain)\n\n# Domain Controller IP: 192.168.1.10  (static)\n# DNS Server: 192.168.1.10            (ชี้มาที่ตัวเอง หลัง promote แล้ว)\n\n# ตรวจสอบ hostname และ IP ก่อน promote\nhostname\nGet-NetIPAddress -AddressFamily IPv4 | Select InterfaceAlias, IPAddress",
                lang: "powershell",
                note: "domain name เปลี่ยนไม่ได้หลัง promote — ถ้าต้องการเปลี่ยนต้องลง OS ใหม่ทั้งหมด",
            },
            {
                title: "ติดตั้ง AD DS Role",
                body: "ติดตั้ง Active Directory Domain Services feature บน Windows Server",
                code: "# ติดตั้ง AD DS และ tools\nInstall-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools\n\n# ตรวจสอบ\nGet-WindowsFeature -Name AD-Domain-Services",
                lang: "powershell",
                note: "ขั้นตอนนี้แค่ติดตั้ง feature — ยังไม่ได้สร้าง domain จริง ทำใน step ถัดไป",
            },
            {
                title: "Promote เป็น Domain Controller (สร้าง Forest ใหม่)",
                body: "สร้าง Active Directory Forest และ Domain ใหม่ — เครื่องนี้จะกลายเป็น Domain Controller ตัวแรก",
                code: "# Promote เป็น DC และสร้าง Forest ใหม่\nInstall-ADDSForest `\n    -DomainName 'corp.local' `\n    -DomainNetbiosName 'CORP' `\n    -ForestMode 'WinThreshold' `\n    -DomainMode 'WinThreshold' `\n    -InstallDns `\n    -SafeModeAdministratorPassword (ConvertTo-SecureString 'DSRM_P@ssw0rd!' -AsPlainText -Force) `\n    -Force\n\n# เครื่องจะ reboot อัตโนมัติหลัง promote เสร็จ\n# รอสักครู่แล้ว login ด้วย CORP\\Administrator",
                lang: "powershell",
                note: "SafeModeAdministratorPassword คือ DSRM password ใช้ตอน restore AD — เก็บไว้ในที่ปลอดภัย ถ้าลืมจะ restore AD ไม่ได้",
            },
            {
                title: "ตรวจสอบหลัง Promote",
                body: "หลัง reboot ตรวจสอบว่า AD DS และ DNS ทำงานถูกต้อง",
                code: "# Login ด้วย CORP\\Administrator หลัง reboot\n\n# ตรวจสอบ AD DS service\nGet-Service adws, kdc, netlogon, dns | Select Name, Status\n\n# ตรวจสอบ Domain\nGet-ADDomain | Select DNSRoot, NetBIOSName, DomainMode\n\n# ตรวจสอบ DNS\nResolve-DnsName corp.local\n\n# ดู DC ที่มีอยู่\nGet-ADDomainController -Filter * | Select Name, IPv4Address, IsGlobalCatalog",
                lang: "powershell",
                note: "ถ้า service ทุกตัว Running และ Resolve-DnsName corp.local ได้ แสดงว่า DC พร้อมใช้งาน",
            },
            {
                title: "ออกแบบและสร้าง Organizational Unit (OU)",
                body: "OU คือ folder สำหรับจัด user และ computer ในแต่ละแผนก — ออกแบบให้สะท้อนโครงสร้างองค์กรจริง",
                code: "# สร้าง OU หลักก่อน\nNew-ADOrganizationalUnit -Name 'Company' -Path 'DC=corp,DC=local'\n\n# สร้าง OU แผนก\n$ouBase = 'OU=Company,DC=corp,DC=local'\n\nNew-ADOrganizationalUnit -Name 'Users'     -Path $ouBase\nNew-ADOrganizationalUnit -Name 'Computers' -Path $ouBase\nNew-ADOrganizationalUnit -Name 'Groups'    -Path $ouBase\nNew-ADOrganizationalUnit -Name 'IT'        -Path \"OU=Users,$ouBase\"\nNew-ADOrganizationalUnit -Name 'Finance'   -Path \"OU=Users,$ouBase\"\nNew-ADOrganizationalUnit -Name 'HR'        -Path \"OU=Users,$ouBase\"\n\n# ดู OU ทั้งหมด\nGet-ADOrganizationalUnit -Filter * | Select Name, DistinguishedName",
                lang: "powershell",
                note: "ออกแบบ OU ตามแผนกจริงในองค์กร — GPO จะ apply ตาม OU ดังนั้นโครงสร้างที่ดีทำให้จัดการ policy ง่ายขึ้นมาก",
            },
            {
                title: "สร้าง User Account",
                body: "สร้าง user สำหรับพนักงานแต่ละคน — ตั้งชื่อ account ให้เป็นมาตรฐานเดียวกัน",
                code: "# สร้าง user คนเดียว\nNew-ADUser `\n    -Name 'Somchai Jaidee' `\n    -GivenName 'Somchai' `\n    -Surname 'Jaidee' `\n    -SamAccountName 'somchai.j' `\n    -UserPrincipalName 'somchai.j@corp.local' `\n    -Path 'OU=IT,OU=Users,OU=Company,DC=corp,DC=local' `\n    -AccountPassword (ConvertTo-SecureString 'Welcome@1234' -AsPlainText -Force) `\n    -ChangePasswordAtLogon $true `\n    -Enabled $true\n\n# สร้าง user หลายคนจาก array\n$users = @(\n    @{ Name='Malee Sukjai';  Sam='malee.s';   OU='Finance' },\n    @{ Name='Prasert Dee';   Sam='prasert.d'; OU='HR'      },\n    @{ Name='Napat Jinda';   Sam='napat.j';   OU='IT'      }\n)\n\nforeach ($u in $users) {\n    New-ADUser `\n        -Name $u.Name `\n        -SamAccountName $u.Sam `\n        -UserPrincipalName \"$($u.Sam)@corp.local\" `\n        -Path \"OU=$($u.OU),OU=Users,OU=Company,DC=corp,DC=local\" `\n        -AccountPassword (ConvertTo-SecureString 'Welcome@1234' -AsPlainText -Force) `\n        -ChangePasswordAtLogon $true `\n        -Enabled $true\n}\n\n# ดู user ทั้งหมด\nGet-ADUser -Filter * -SearchBase 'OU=Company,DC=corp,DC=local' | \n    Select Name, SamAccountName, Enabled",
                lang: "powershell",
                note: "ChangePasswordAtLogon $true บังคับให้ user เปลี่ยน password เอง login ครั้งแรก — ไม่ควรปล่อยให้ใช้ default password ต่อ",
            },
            {
                title: "สร้าง Security Group และเพิ่ม Member",
                body: "Security Group ใช้กำหนดสิทธิ์เข้าถึง resource — สร้างตาม role ไม่ใช่ตามแผนก จะจัดการง่ายกว่า",
                code: "# สร้าง Group\nNew-ADGroup `\n    -Name 'GRP-IT-Admin' `\n    -GroupScope Global `\n    -GroupCategory Security `\n    -Path 'OU=Groups,OU=Company,DC=corp,DC=local' `\n    -Description 'IT Administrator group'\n\nNew-ADGroup `\n    -Name 'GRP-Finance-Users' `\n    -GroupScope Global `\n    -GroupCategory Security `\n    -Path 'OU=Groups,OU=Company,DC=corp,DC=local'\n\nNew-ADGroup `\n    -Name 'GRP-VPN-Users' `\n    -GroupScope Global `\n    -GroupCategory Security `\n    -Path 'OU=Groups,OU=Company,DC=corp,DC=local' `\n    -Description 'Users allowed to connect VPN'\n\n# เพิ่ม user เข้า group\nAdd-ADGroupMember -Identity 'GRP-IT-Admin' -Members 'somchai.j','napat.j'\nAdd-ADGroupMember -Identity 'GRP-Finance-Users' -Members 'malee.s'\nAdd-ADGroupMember -Identity 'GRP-VPN-Users' -Members 'somchai.j','malee.s','prasert.d'\n\n# ตรวจสอบ member ใน group\nGet-ADGroupMember -Identity 'GRP-IT-Admin' | Select Name, SamAccountName",
                lang: "powershell",
                note: "GroupScope Global เหมาะที่สุดสำหรับ single domain — ใช้กำหนดสิทธิ์ resource ภายใน domain เดียวกัน",
            },
            {
                title: "Join Domain จากเครื่อง Client",
                body: "เชื่อม Windows client เข้า domain — ต้องชี้ DNS ของเครื่อง client มาที่ DC ก่อน",
                code: "# รันบนเครื่อง client — PowerShell as Administrator\n\n# ขั้นที่ 1: ชี้ DNS ไปที่ DC ก่อน (สำคัญมาก)\nSet-DnsClientServerAddress `\n    -InterfaceAlias 'Ethernet' `\n    -ServerAddresses '192.168.1.10'\n\n# ทดสอบว่า resolve domain ได้\nResolve-DnsName corp.local\n\n# ขั้นที่ 2: Join domain\n$credential = Get-Credential -Message 'ใส่ CORP\\Administrator'\n\nAdd-Computer `\n    -DomainName 'corp.local' `\n    -Credential $credential `\n    -OUPath 'OU=Computers,OU=Company,DC=corp,DC=local' `\n    -Restart\n\n# เครื่องจะ reboot อัตโนมัติ\n# หลัง reboot login ด้วย CORP\\somchai.j",
                lang: "powershell",
                note: "ถ้า Resolve-DnsName corp.local ไม่ได้ก่อน join จะ fail ทันที — DNS ต้องชี้มาที่ DC เสมอ",
            },
            {
                title: "ตรวจสอบ Computer ใน AD",
                body: "หลัง client join domain แล้ว ตรวจสอบจาก DC ว่าเห็น computer object ถูกต้อง",
                code: "# รันบน DC\n\n# ดู computer ที่ join domain แล้ว\nGet-ADComputer -Filter * -SearchBase 'OU=Company,DC=corp,DC=local' | \n    Select Name, DistinguishedName, LastLogonDate\n\n# ตรวจสอบว่า user login ได้\nGet-ADUser -Identity 'somchai.j' | Select Name, LastLogonDate, LockedOut, Enabled",
                lang: "powershell",
            },
            {
                title: "สร้าง Group Policy Object (GPO) เบื้องต้น",
                body: "ตั้ง GPO สำหรับ policy พื้นฐานที่ทุก domain ควรมี — Password Policy และ Desktop lockout",
                code: "# สร้าง GPO สำหรับ Password Policy\nNew-GPO -Name 'Policy-Password' -Comment 'Password and lockout policy'\n\n# ตั้งค่า Password Policy\nSet-GPRegistryValue `\n    -Name 'Policy-Password' `\n    -Key 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\Netlogon\\Parameters' `\n    -ValueName 'MaximumPasswordAge' `\n    -Type DWord -Value 90\n\n# Link GPO ไปยัง OU\nNew-GPLink `\n    -Name 'Policy-Password' `\n    -Target 'OU=Company,DC=corp,DC=local' `\n    -Enforced Yes\n\n# สร้าง GPO ล็อก screen หลัง idle 10 นาที\nNew-GPO -Name 'Policy-ScreenLock'\n\nSet-GPRegistryValue `\n    -Name 'Policy-ScreenLock' `\n    -Key 'HKCU\\Software\\Policies\\Microsoft\\Windows\\Control Panel\\Desktop' `\n    -ValueName 'ScreenSaveActive' `\n    -Type String -Value '1'\n\nSet-GPRegistryValue `\n    -Name 'Policy-ScreenLock' `\n    -Key 'HKCU\\Software\\Policies\\Microsoft\\Windows\\Control Panel\\Desktop' `\n    -ValueName 'ScreenSaverIsSecure' `\n    -Type String -Value '1'\n\nSet-GPRegistryValue `\n    -Name 'Policy-ScreenLock' `\n    -Key 'HKCU\\Software\\Policies\\Microsoft\\Windows\\Control Panel\\Desktop' `\n    -ValueName 'ScreenSaveTimeOut' `\n    -Type String -Value '600'\n\nNew-GPLink `\n    -Name 'Policy-ScreenLock' `\n    -Target 'OU=Users,OU=Company,DC=corp,DC=local'",
                lang: "powershell",
                note: "GPO link ไปที่ OU ไหน policy ก็จะ apply กับ user และ computer ทุกตัวใน OU นั้น — ระวังอย่า link ผิด OU",
            },
            {
                title: "ตั้ง Fine-Grained Password Policy แยกตาม Group",
                body: "Domain Password Policy ใช้ได้แค่นโยบายเดียวทั้ง domain — ถ้าอยากให้ IT Admin ใช้ password ที่แข็งกว่าต้องใช้ Fine-Grained",
                code: "# สร้าง Password Policy เข้มสำหรับ IT Admin\nNew-ADFineGrainedPasswordPolicy `\n    -Name 'PSO-IT-Admin' `\n    -Precedence 10 `\n    -MinPasswordLength 14 `\n    -PasswordHistoryCount 24 `\n    -MaxPasswordAge '60.00:00:00' `\n    -MinPasswordAge '1.00:00:00' `\n    -LockoutThreshold 5 `\n    -LockoutDuration '00:30:00' `\n    -LockoutObservationWindow '00:30:00' `\n    -ComplexityEnabled $true `\n    -ReversibleEncryptionEnabled $false\n\n# Apply ให้ group IT Admin\nAdd-ADFineGrainedPasswordPolicySubject `\n    -Identity 'PSO-IT-Admin' `\n    -Subjects 'GRP-IT-Admin'\n\n# ตรวจสอบ\nGet-ADFineGrainedPasswordPolicy -Filter * | Select Name, MinPasswordLength, Precedence",
                lang: "powershell",
                note: "Precedence ยิ่งน้อยยิ่งมีความสำคัญสูงกว่า — ถ้า user อยู่ใน 2 group ที่มี PSO ต่างกัน จะ apply PSO ที่ Precedence น้อยกว่า",
            },
            {
                title: "จัดการ User ที่ใช้บ่อยใน IT Support",
                body: "คำสั่งที่ IT Support ใช้บ่อยที่สุดในชีวิตประจำวัน",
                code: "# Reset password\nSet-ADAccountPassword `\n    -Identity 'somchai.j' `\n    -NewPassword (ConvertTo-SecureString 'NewP@ss123!' -AsPlainText -Force) `\n    -Reset\nSet-ADUser -Identity 'somchai.j' -ChangePasswordAtLogon $true\n\n# Unlock account ที่ถูก lock\nUnlock-ADAccount -Identity 'somchai.j'\n\n# Disable account พนักงานออก\nDisable-ADAccount -Identity 'somchai.j'\n\n# ย้าย user ไป OU อื่น\nMove-ADObject `\n    -Identity 'CN=Somchai Jaidee,OU=IT,OU=Users,OU=Company,DC=corp,DC=local' `\n    -TargetPath 'OU=Finance,OU=Users,OU=Company,DC=corp,DC=local'\n\n# ดู user ที่ถูก lock อยู่ทั้งหมด\nSearch-ADAccount -LockedOut | Select Name, SamAccountName, LockedOut\n\n# ดู user ที่ไม่ได้ login นานกว่า 90 วัน\n$cutoff = (Get-Date).AddDays(-90)\nGet-ADUser -Filter {LastLogonDate -lt $cutoff -and Enabled -eq $true} | \n    Select Name, SamAccountName, LastLogonDate",
                lang: "powershell",
                note: "Disable แทน Delete เสมอเมื่อพนักงานออก — ถ้า Delete ไปแล้วพบว่าต้องการข้อมูลทีหลังจะกู้คืนไม่ได้",
            },
            {
                title: "Force Update Group Policy บน Client",
                body: "หลังแก้ GPO ต้องรอ 90 นาทีถึงจะ apply เอง — บังคับ update ได้ทันทีด้วยคำสั่งนี้",
                code: "# รันบน client เครื่องนั้น\ngpupdate /force\n\n# รันจาก DC ไปยัง client ทุกเครื่องใน OU\nInvoke-GPUpdate `\n    -Computer (Get-ADComputer -Filter * -SearchBase 'OU=Computers,OU=Company,DC=corp,DC=local').Name `\n    -Force\n\n# ตรวจสอบ GPO ที่ apply อยู่บน client\ngpresult /r\n\n# ดูแบบละเอียดเป็น HTML\ngpresult /h C:\\gpresult.html\nStart-Process C:\\gpresult.html",
                lang: "powershell",
                note: "gpresult /r บอกว่า GPO ไหน apply อยู่จริงบนเครื่องนั้น — ใช้ debug เมื่อ policy ไม่ทำงานตามที่ตั้งไว้",
            },
        ],
    },



    // Remote Desktop Gateway
    // GPO — deploy setting ทั้ง domain
    // File Server Permission — NTFS + Share
    // Patch Management
    // BitLocker — encrypt laptop พนักงาน

    // Network / Homelab

    // Mikrotik basics — firewall, NAT, port forward
    // Port Forward จาก Mikrotik ไป Server
    // VLAN setup
    // pfSense / OPNsense setup
    // DHCP Server — IP pool, reservation
    // VPN Site-to-Site
    // Static Route ข้าม subnet

    // ปัญหาเฉพาะจากประสบการณ์จริง

    // DNS Split-horizon — เข้าจากนอกได้แต่ในไม่รู้จัก
    // ODBC setup
    // Windows Event Viewer อ่านเป็น
    // Audit Log — ใคร login, ใครลบไฟล์

    // Automation / Cross-platform

    // PowerShell Remoting
    // Task Scheduler Automation
    // Move SQL Backup ไปยัง NAS
    // Disk Space Alert — script + Telegram notify
    // Service Down Alert — detect + auto restart

    // Troubleshooting

    // Network troubleshoot — ping, tracert, nslookup, Wireshark
    // SQL Server ช้า — หา slow query + missing index
    // Windows Server ไม่ boot — debug ขั้นตอน
    // Disk เต็ม — หาต้นเหตุและแก้ไข



];
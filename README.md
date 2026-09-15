# 🚢 TugWatch — Fleet Operations OS

[![Live Production](https://img.shields.io/badge/Production-tugwatch.saarvin.in-0284c7?style=for-the-badge&logo=googlechrome&logoColor=white)](https://tugwatch.saarvin.in)
[![Firebase Backup](https://img.shields.io/badge/Cloud_Backup-tugwatch.web.app-ea580c?style=for-the-badge&logo=firebase&logoColor=white)](https://tugwatch.web.app)
[![Autonomous Agents](https://img.shields.io/badge/AI_Agents-AGENTS.md-10b981?style=for-the-badge&logo=githubactions&logoColor=white)](AGENTS.md)

**TugWatch** is an enterprise-grade, real-time Marine Fleet Operations Operating System (OS) built for marine tugboat operators, port agencies, superintendents, vessel masters, and shipping executives.

---

## 🌟 Key Features

- 🚢 **Fleet & Technical Operations**: Real-time management of active vessels, BHP/BP specs, mandatory vessel certificates, deck/engine drawings, dry-docking cycles, and defect tracking.
- 📲 **1-Click WhatsApp Fleet Morning Briefing**: Automated daily dispatch of vessel positions, fuel ROB, master on duty, and expiring certificate warnings to WhatsApp groups or port contacts.
- 🚨 **Automatic Statutory Certificate Expiry Alerts**: Real-time monitoring and 1-click WhatsApp alerts for expiring (≤30d, ≤15d, ≤7d) or overdue IRS/MMD/Class statutory certificates.
- ☁️ **1-Click Cloud Database Backups & Disaster Recovery**: Instant offline `.json` exports, Firebase cloud snapshot points, and full schema-validated disaster recovery console.
- ⛽ **HSD Fuel, Bunker & Engine Hours**: Real-time sounding logs, daily bunker consumption, running hours tracking, and Oil Record Book (ORB Part I).
- 👥 **Crew Complement & Roster**: Sign-On/Sign-Off register, STCW certificates, CDC tracking, and crew wage/salary disbursement ledger.
- 🌊 **Lunar Tide & Marine Weather Engine**: Live tide heights, lunar phases, and tidal stream calculation for key marine ports (Sikka Port, Bedi Anchorage, Jamnagar).
- 👑 **Master Governance & Multi-Role RBAC**: 48-module granular permission engine with supreme Master Admin controls, Fleet Admin roles, and shore staff KYC dossiers.

---

## 🤖 AI Agent Guidelines

For autonomous AI agents (Google Antigravity, OpenAI Codex, Claude, Cursor, Aider, GitHub Copilot), please consult **[`AGENTS.md`](AGENTS.md)** for:
- Non-destructive real-time cloud synchronization rules.
- Complete 48-module system catalog.
- Developer API and core function reference (`saveDB`, `go`, `openModal`, `audit`, etc.).
- Safe deployment and syntax validation workflow.

---

## 🚀 Live Access & Deployment

- **Primary Live Production**: [https://tugwatch.saarvin.in](https://tugwatch.saarvin.in)
- **Backup Cloud URL**: [https://tugwatch.web.app](https://tugwatch.web.app)
- **Firebase Project Console**: `https://console.firebase.google.com/project/tugwatch/overview`

```bash
# Deploy to Firebase Hosting
npx -y firebase-tools@latest deploy --only hosting
```

---
*Developed for Saarvin Marine Fleet Operations. Powered by TugWatch Engine.*

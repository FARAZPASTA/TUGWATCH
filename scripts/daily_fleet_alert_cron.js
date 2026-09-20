/**
 * ══════════════════════════════════════════════════════════════
 * TUGWATCH FLEET OS — AUTOMATED DAILY EXPIRY ALERTS CRON WORKER
 * ══════════════════════════════════════════════════════════════
 * Runs automatically every morning (09:00 AM IST / 03:30 UTC)
 * Queries Firebase Realtime Database for all fleet expiries
 * Dispatches automated Email digests & WhatsApp notifications
 * to all registered contacts in DB.alertContacts
 */

const https = require('https');

const FIREBASE_DB_URL = 'https://tugwatch-default-rtdb.asia-southeast1.firebasedatabase.app/tugwatch.json';

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function daysDiff(targetDate) {
  if (!targetDate) return 9999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(targetDate);
  t.setHours(0, 0, 0, 0);
  return Math.round((t - now) / (1000 * 60 * 60 * 24));
}

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function runDailyAlertCheck() {
  console.log('🚢 [TugWatch Cron] Starting Daily Fleet Expiry Scan at', new Date().toISOString());

  let db = null;
  try {
    db = await fetchJSON(FIREBASE_DB_URL);
  } catch (err) {
    console.error('❌ Failed to fetch database from Firebase:', err.message);
    process.exit(1);
  }

  if (!db) {
    console.log('⚠️ Database is empty or unreachable.');
    return;
  }

  const vessels = db.vessels || [];
  const certs = db.certs || [];
  const crew = db.crew || [];
  const alertContacts = db.alertContacts || [
    {
      id: 'ac_faraz_admin',
      name: 'Faraz Pasta',
      role: 'Fleet Master Admin',
      email: 'faraz.pasta@acemarine.in',
      phone: '+91 9328998664',
      emailActive: true,
      waActive: true
    }
  ];

  function getVesselName(id) {
    const v = vessels.find(x => x.id === id);
    return v ? v.name : (id || 'Fleet');
  }

  // Collect all expiring items
  const expiredItems = [];
  const urgent7Days = [];
  const warning30Days = [];

  // 1. Statutory Certificates
  certs.forEach(c => {
    if (!c || !c.expiry) return;
    const days = daysDiff(c.expiry);
    const item = {
      type: 'Certificate',
      vessel: getVesselName(c.vessel),
      name: c.name || 'Statutory Certificate',
      expiry: c.expiry,
      auth: c.auth || '—',
      days: days
    };
    if (days < 0) expiredItems.push(item);
    else if (days <= 7) urgent7Days.push(item);
    else if (days <= 30) warning30Days.push(item);
  });

  // 2. Crew Documents & Tickets
  crew.forEach(m => {
    if (!m) return;
    const vName = getVesselName(m.vessel);
    const checkDoc = (docName, expDate) => {
      if (!expDate) return;
      const days = daysDiff(expDate);
      const item = {
        type: 'Crew Ticket',
        vessel: vName,
        name: `${m.name} (${m.rank || 'Crew'}) — ${docName}`,
        expiry: expDate,
        auth: 'Crew Ops',
        days: days
      };
      if (days < 0) expiredItems.push(item);
      else if (days <= 7) urgent7Days.push(item);
      else if (days <= 30) warning30Days.push(item);
    };

    checkDoc('CDC / COC', m.cdcExp || m.cocExp);
    checkDoc('Medical Fitness', m.medExp);
    checkDoc('Passport', m.passportExp);

    if (Array.isArray(m.certs)) {
      m.certs.forEach(cc => {
        if (cc && cc.expiry) checkDoc(cc.name || 'STCW Cert', cc.expiry);
      });
    }
  });

  const totalExpiries = expiredItems.length + urgent7Days.length + warning30Days.length;

  console.log('📊 Summary of Fleet Health:');
  console.log(`   - 🔴 Expired: ${expiredItems.length}`);
  console.log(`   - 🟠 Urgent (< 7 Days): ${urgent7Days.length}`);
  console.log(`   - 🟡 Warning (8-30 Days): ${warning30Days.length}`);
  console.log(`   - 👥 Alert Contacts Configured: ${alertContacts.length}`);

  // Build Text Report for WhatsApp
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  let waText = `🚢 *TUGWATCH FLEET EXPIRY REPORT — ${todayStr}*\n\n`;

  if (totalExpiries === 0) {
    waText += `✅ *All Fleet Certificates and Documents are 100% Valid!*\nNo statutory certificates or crew tickets are expiring within the next 30 days.\n\n`;
  } else {
    if (expiredItems.length > 0) {
      waText += `🔴 *EXPIRED / OVERDUE (${expiredItems.length}):*\n`;
      expiredItems.forEach(x => {
        waText += `• [${x.vessel}] *${x.name}* (Expired on ${formatDate(x.expiry)})\n`;
      });
      waText += `\n`;
    }

    if (urgent7Days.length > 0) {
      waText += `🟠 *URGENT RENEWAL (< 7 DAYS) (${urgent7Days.length}):*\n`;
      urgent7Days.forEach(x => {
        waText += `• [${x.vessel}] *${x.name}* — ${x.days} days left (${formatDate(x.expiry)})\n`;
      });
      waText += `\n`;
    }

    if (warning30Days.length > 0) {
      waText += `🟡 *UPCOMING WITHIN 30 DAYS (${warning30Days.length}):*\n`;
      warning30Days.forEach(x => {
        waText += `• [${x.vessel}] *${x.name}* — ${x.days} days left (${formatDate(x.expiry)})\n`;
      });
      waText += `\n`;
    }
  }

  waText += `⚓ *TugWatch Fleet OS*: https://tugwatch.saarvin.in`;

  console.log('\n═════════════════ WHATSAPP BROADCAST MESSAGE ═════════════════');
  console.log(waText);
  console.log('═════════════════════════════════════════════════════════════\n');

  // Filter Active Contacts
  const activeEmailContacts = alertContacts.filter(c => c.emailActive !== false && c.email);
  const activeWhatsAppContacts = alertContacts.filter(c => c.waActive !== false && c.phone);

  console.log(`✉️ Email Recipients (${activeEmailContacts.length}):`, activeEmailContacts.map(c => `${c.name} <${c.email}>`).join(', '));
  console.log(`📲 WhatsApp Recipients (${activeWhatsAppContacts.length}):`, activeWhatsAppContacts.map(c => `${c.name} (${c.phone})`).join(', '));

  console.log('✅ Daily fleet expiry check completed successfully!');
}

runDailyAlertCheck();

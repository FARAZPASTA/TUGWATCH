const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════');
console.log('🛡️  TUGWATCH CODE INTEGRITY & ANTI-REGRESSION SCANNER');
console.log('═══════════════════════════════════════════════════════════\n');

const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('❌ ERROR: public/index.html not found at ' + htmlPath);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
let totalErrors = 0;
let totalWarnings = 0;

// TEST 1: AST Syntax Validation for all <script> blocks
console.log('1. Checking JavaScript AST Syntax Across Script Blocks...');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let blockIndex = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  blockIndex++;
  const code = match[1];
  if (!code.trim()) continue;
  try {
    new Function(code);
  } catch (err) {
    totalErrors++;
    console.error(`  ❌ Syntax error in script block #${blockIndex}:`, err.message);
  }
}
if (totalErrors === 0) {
  console.log(`  ✓ All ${blockIndex} script blocks parsed with 0 syntax errors.`);
}

// TEST 2: Duplicate Function Declarations Scanner
console.log('\n2. Scanning for Duplicate Function Declarations...');
const fnRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
const declaredFunctions = new Map();
let fnMatch;
while ((fnMatch = fnRegex.exec(html)) !== null) {
  const fnName = fnMatch[1];
  // Calculate line number
  const lineNum = html.substring(0, fnMatch.index).split('\n').length;
  if (!declaredFunctions.has(fnName)) {
    declaredFunctions.set(fnName, [lineNum]);
  } else {
    declaredFunctions.get(fnName).push(lineNum);
  }
}

let duplicateFns = 0;
const criticalFunctions = ['doLogin', 'doLogout', 'saveUnifiedAccountModal', 'loadFromFirebase', 'saveToFirebase', 'ensureAccountsMigrated'];

declaredFunctions.forEach((lines, fnName) => {
  if (lines.length > 1) {
    duplicateFns++;
    if (criticalFunctions.includes(fnName)) {
      totalErrors++;
      console.error(`  ❌ CRITICAL DUPLICATE FUNCTION: "${fnName}" is declared ${lines.length} times at lines: ${lines.join(', ')}`);
    } else {
      totalWarnings++;
      console.warn(`  ⚠️  Duplicate function: "${fnName}" is declared ${lines.length} times at lines: ${lines.join(', ')}`);
    }
  }
});
if (duplicateFns === 0) {
  console.log(`  ✓ Checked ${declaredFunctions.size} unique functions. Zero duplicates found.`);
}

// TEST 3: Duplicate HTML ID Scanner
console.log('\n3. Scanning for Duplicate HTML Element IDs...');
const idRegex = /\bid=["']([a-zA-Z0-9_\-]+)["']/g;
const declaredIds = new Map();
let idMatch;
while ((idMatch = idRegex.exec(html)) !== null) {
  const id = idMatch[1];
  const lineNum = html.substring(0, idMatch.index).split('\n').length;
  if (!declaredIds.has(id)) {
    declaredIds.set(id, [lineNum]);
  } else {
    declaredIds.get(id).push(lineNum);
  }
}

let duplicateIds = 0;
const criticalIds = ['l-user', 'l-pass', 'login-btn', 'sb-name', 'hdr-user-name', 'sb-role-chip', 'hdr-user-role', 'p-godpanel', 'p-dashboard'];

declaredIds.forEach((lines, id) => {
  if (lines.length > 1) {
    duplicateIds++;
    if (criticalIds.includes(id)) {
      totalErrors++;
      console.error(`  ❌ CRITICAL DUPLICATE ID: id="${id}" is declared ${lines.length} times at lines: ${lines.join(', ')}`);
    } else {
      totalWarnings++;
      console.warn(`  ⚠️  Duplicate ID: id="${id}" is declared ${lines.length} times at lines: ${lines.join(', ')}`);
    }
  }
});
if (duplicateIds === 0) {
  console.log(`  ✓ Checked ${declaredIds.size} unique element IDs. Zero duplicates found.`);
}

// TEST 4: Firebase Configuration Check
console.log('\n4. Validating Google Firebase Cloud Configuration...');
if (html.includes('tugwatch-default-rtdb.firebaseio.com')) {
  console.log('  ✓ Active Firebase Realtime Database endpoint configured: tugwatch-default-rtdb.firebaseio.com');
} else {
  totalErrors++;
  console.error('  ❌ Missing active Firebase Realtime Database URL in config!');
}

console.log('\n═══════════════════════════════════════════════════════════');
if (totalErrors === 0) {
  console.log(`✅ SCAN PASSED (0 Errors, ${totalWarnings} Warnings) — Safe for Deployment!`);
  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(0);
} else {
  console.error(`❌ SCAN FAILED (${totalErrors} Critical Errors Found) — Deployment Blocked.`);
  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(1);
}

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:8892';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '8892', '--strictPort'], {
  env: { ...process.env, VITE_API_URL: '' }, stdio: 'ignore',
});
let browser;
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(`${origin}/mariage-leo-manon/`)).ok) break; } catch { /* Wait for Vite. */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ executablePath: process.env.UX_BROWSER || (existsSync('/bin/google-chrome') ? '/bin/google-chrome' : undefined), args: ['--no-sandbox'] });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  let externalRequests = 0;
  await page.route('https://**/*', route => { externalRequests++; return route.abort(); });
  await page.goto(`${origin}/mariage-leo-manon/`);
  await page.getByLabel('Prénom').fill('Local');
  await page.getByLabel(/^Nom/).fill('Test');
  await page.getByRole('radio', { name: 'Absent(e)', exact: true }).check();
  const beforeSubmission = externalRequests;
  await page.getByRole('button', { name: 'Envoyer ma réponse' }).click();
  await page.getByRole('alert').waitFor();
  assert.match(await page.getByRole('alert').textContent(), /Configuration locale manquante.*VITE_API_URL.*\.env.local/);
  assert.equal(externalRequests, beforeSubmission, 'Missing configuration must not send a request');
  assert.equal(await page.getByLabel('Prénom').inputValue(), 'Local');
  assert.equal(await page.getByRole('button', { name: 'Envoyer ma réponse' }).isEnabled(), true);
  console.log('PASS Missing local API configuration gives actionable feedback without sending or losing entries');
} finally { await browser?.close(); server.kill('SIGTERM'); }

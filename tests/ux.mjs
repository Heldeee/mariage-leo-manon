import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const port = 8890;
const origin = `http://127.0.0.1:${port}`;
const url = `${origin}/mariage-leo-manon/`;
const artifacts = process.env.UX_ARTIFACTS || '/tmp/wedding-ux-results';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  env: { ...process.env, VITE_API_URL: `${origin}/__rsvp_test` }, stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
server.stdout.on('data', data => { serverOutput += data; });
server.stderr.on('data', data => { serverOutput += data; });
let browser;
async function check(name, fn) { await fn(); console.log(`PASS ${name}`); }
async function waitUntil(fn, message, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { if (await fn()) return; await new Promise(resolve => setTimeout(resolve, 50)); }
  throw new Error(message);
}
try {
  await waitUntil(async () => { try { return (await fetch(url)).ok; } catch { return false; } }, `Vite did not start: ${serverOutput}`);
  await mkdir(artifacts, { recursive: true });
  browser = await chromium.launch({ executablePath: process.env.UX_BROWSER || (existsSync('/bin/google-chrome') ? '/bin/google-chrome' : undefined), headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  // External maps are intentionally isolated: these tests never use a production endpoint.
  await context.route('https://www.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Local map fixture</p>' }));
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.goto(url);
  await check('French document, visible date, direct RSVP and distinct venue routes', async () => {
    assert.equal(await page.locator('html').getAttribute('lang'), 'fr');
    assert.equal(await page.locator('header time').textContent(), '19 juin 2027');
    assert.equal(await page.getByRole('link', { name: 'Confirmer ma présence', exact: true }).getAttribute('href'), '#rsvp');
    assert.equal(await page.getByRole('link', { name: /Itinéraire vers/ }).count(), 2);
    const civicRoute = await page.getByRole('link', { name: /Itinéraire vers Mairie du Cazalet/ }).getAttribute('href');
    assert.equal(new URL(civicRoute).searchParams.get('destination'), 'Mairie de Quartiers du secteur 3, Pessac, Château de Cazalet, Av. de Beutre, 33600 Pessac');
    const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
    assert.equal(ids.length, new Set(ids).size);
    assert.equal(await page.locator('video').count(), 0);
  });
  await check('No horizontal overflow at mobile, tablet and desktop sizes', async () => {
    for (const width of [320, 375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Overflow at ${width}px`);
      if (width === 375 || width === 390) {
        const heart = await page.locator('#countdown canvas').first().boundingBox();
        assert(heart.width >= 100, `Small mobile hearts at ${width}px`);
        const dateText = page.locator('#countdown canvas').first().locator('..').locator('div').first();
        assert.match(await dateText.evaluate(node => getComputedStyle(node).clipPath), /^url\(/);
        await page.locator('#countdown').screenshot({ path: `${artifacts}/hearts-${width}.png` });
      }
      if (width < 768) {
        const box = await page.locator('#programme h3').first().boundingBox();
        assert(box.width > 180, `Narrow programme at ${width}px`);
      }
      for (const section of ['#programme', '#lieu', '#rsvp']) {
        await page.locator(section).scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${artifacts}/page-${width}.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 375, height: 900 });
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Overflow with enlarged text');
    await page.goto(url);
  });
  await check('Keyboard skip link and date reveal', async () => {
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').textContent(), 'Aller au contenu');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Afficher la date sans gratter' }).focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#countdown time').textContent(), '19 juin 2027');
    assert.equal(await page.locator('#countdown canvas').count(), 0);
  });
  await check('Photo dialog keyboard close, focus containment and restoration', async () => {
    const trigger = page.getByRole('button', { name: 'Agrandir la photo 1 de Léo et Manon', exact: true });
    await trigger.focus(); await page.keyboard.press('Enter');
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    assert.equal(await page.locator(':focus').textContent(), 'Fermer la photo');
    await page.keyboard.press('Tab');
    assert(await page.locator(':focus').evaluate(node => !!node.closest('dialog')));
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(await trigger.evaluate(node => document.activeElement === node), true);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    await trigger.click();
    await page.getByRole('button', { name: 'Fermer la photo' }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
  });
  await check('Accessible validation and stable household identity after removal', async () => {
    await page.getByRole('button', { name: 'Envoyer ma réponse' }).click();
    assert.equal(await page.locator(':focus').getAttribute('autocomplete').then(value => value.endsWith('given-name')), true);
    assert.equal(await page.getByText('Renseignez le prénom.', { exact: true }).count(), 1);
    await page.getByLabel('Prénom', { exact: false }).fill(' Alice ');
    await page.getByLabel(/^Nom/).fill(' Martin ');
    await page.getByRole('radio', { name: 'Présent(e)', exact: true }).check();
    await page.getByLabel('Allergènes ou restrictions alimentaires (facultatif)').fill(' Noix ');
    await page.getByRole('button', { name: '+ Ajouter une personne' }).click();
    await page.getByLabel('Prénom', { exact: false }).nth(1).fill('Bob');
    await page.getByLabel(/^Nom/).nth(1).fill('Martin');
    await page.getByRole('radio', { name: 'Absent(e)', exact: true }).nth(1).check();
    await page.getByRole('button', { name: '+ Ajouter une personne' }).click();
    await page.getByLabel('Prénom', { exact: false }).nth(2).fill('Camille');
    const lastId = await page.getByLabel('Prénom', { exact: false }).nth(2).getAttribute('id');
    await page.getByRole('button', { name: 'Retirer Bob', exact: true }).click();
    assert.equal(await page.getByLabel('Prénom', { exact: false }).nth(1).inputValue(), 'Camille');
    assert.equal(await page.getByLabel('Prénom', { exact: false }).nth(1).getAttribute('id'), lastId);
    assert.equal(await page.locator(':focus').getAttribute('id'), lastId);
    await page.getByLabel(/^Nom/).nth(1).fill('Martin');
    await page.getByRole('radio', { name: 'Absent(e)', exact: true }).nth(1).check();
  });
  await check('Accessibility scan of form, date, navigation and dialog', async () => {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    assert.deepEqual(result.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) })), []);
    await page.getByRole('button', { name: 'Agrandir la photo 1 de Léo et Manon', exact: true }).click();
    const dialogResult = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    assert.deepEqual(dialogResult.violations.map(item => item.id), []);
    await page.keyboard.press('Escape');
  });
  await check('Failed submission preserves entries; retry reuses ID and locks edits', async () => {
    const payloads = [];
    let release;
    await page.route(`${origin}/__rsvp_test`, async route => {
      payloads.push(route.request().postDataJSON());
      if (payloads.length === 1) await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ status: 'error' }) });
      else { if (payloads.length === 2) await new Promise(resolve => { release = resolve; }); await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ status: 'success' }) }); }
    });
    await page.getByRole('button', { name: 'Envoyer ma réponse' }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByLabel('Prénom', { exact: false }).first().inputValue(), ' Alice ');
    await page.getByLabel(/^Nom/).first().focus();
    await page.keyboard.press('Enter');
    await waitUntil(() => !!release, 'Retry request not sent');
    assert.equal(payloads[0].requestId, payloads[1].requestId);
    assert.deepEqual(payloads[1].personnes, [
      { prenom: 'Alice', nom: 'Martin', presence: 'oui', allergenes: 'Noix' },
      { prenom: 'Camille', nom: 'Martin', presence: 'non', allergenes: '' },
    ]);
    assert.equal(await page.locator('form input:enabled, form textarea:enabled, form button:enabled').count(), 0);
    release();
    await page.locator('#rsvp-confirmation').waitFor();
    assert.equal(await page.locator(':focus').getAttribute('id'), 'rsvp-confirmation');
    assert.match(await page.getByRole('list', { name: 'Résumé de votre réponse' }).textContent(), /Alice Martin.*Noix.*Camille Martin/s);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    assert.deepEqual(result.violations.map(item => item.id), []);
  });
  await check('Absent-only confirmation avoids attendance promise', async () => {
    await page.goto(url);
    await page.getByLabel('Prénom', { exact: false }).fill('Denis');
    await page.getByLabel(/^Nom/).fill('Martin');
    await page.getByRole('radio', { name: 'Absent(e)', exact: true }).check();
    await page.getByRole('button', { name: 'Envoyer ma réponse' }).click();
    await page.locator('#rsvp-confirmation').waitFor();
    assert.equal(await page.getByText(/Nous avons hâte de célébrer/).count(), 0);
  });
  await check('Calendar download contains both locations and timezone-safe dates', async () => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Ajouter à mon calendrier' }).click();
    const download = await downloadPromise;
    const rawCalendar = await readFile(await download.path(), 'utf8');
    for (const line of rawCalendar.split('\r\n')) assert(Buffer.byteLength(line, 'utf8') <= 75);
    const calendar = rawCalendar.replace(/\r\n /g, '');
    assert.equal(calendar.match(/BEGIN:VEVENT/g).length, 2);
    assert.match(calendar, /DTSTART:20270619T120000Z\r\nLOCATION:Mairie du Cazalet/);
    assert(calendar.includes('Château de Cazalet\\, Av. de Beutre\\, 33600 Pessac'));
    assert.match(calendar, /DTSTART:20270619T140000Z/);
    assert.match(calendar, /LOCATION:Domaine Grand Piquecaillou/);
  });
  await check('Canvas scratch completion preserves other-card progress across rerender and resize', async () => {
    await page.goto(url);
    const canvases = page.locator('#countdown canvas');
    await canvases.first().scrollIntoViewIfNeeded();
    async function scratchCard(index, partial = false) {
      const box = await canvases.nth(index).boundingBox();
      await page.mouse.move(box.x + 1, box.y + 1); await page.mouse.down();
      for (let y = 4; y < (partial ? 28 : box.height); y += 8) {
        for (let x = 4; x < box.width; x += 8) await page.mouse.move(box.x + x, box.y + y);
      }
      await page.mouse.up();
    }
    const alphaCount = index => canvases.nth(index).evaluate(canvas => {
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let count = 0; for (let i = 3; i < pixels.length; i += 4) if (pixels[i]) count++;
      return count;
    });
    const original = await alphaCount(1);
    await scratchCard(1, true);
    const partial = await alphaCount(1); assert(partial < original);
    await scratchCard(0);
    await waitUntil(async () => await canvases.first().evaluate(node => node.style.pointerEvents === 'none'), 'First card not revealed');
    assert.equal(await alphaCount(1), partial);
    const oldSize = await canvases.nth(1).evaluate(canvas => canvas.width * canvas.height);
    await page.setViewportSize({ width: 390, height: 900 });
    const newSize = await canvases.nth(1).evaluate(canvas => canvas.width * canvas.height);
    assert(Math.abs((await alphaCount(1)) / newSize - partial / oldSize) < 0.05, 'Resize discarded scratch progress');
    await scratchCard(1); await scratchCard(2);
    await page.getByRole('heading', { name: 'Plus que', exact: true }).waitFor();
  });
  await check('Autoplay fallback, pause control and reduced-motion toggle', async () => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(url);
    assert.equal(await page.locator('video').count(), 1);
    await waitUntil(async () => await page.locator('video').evaluate(video => Number.isFinite(video.duration)), 'Video metadata did not load');
    assert(Math.abs(await page.locator('video').evaluate(video => video.duration) - 93.82) < 0.1, 'Hero video must retain the full original montage');
    assert.match(await page.locator('header img').getAttribute('src'), /domaine-poster/);
    await page.getByRole('button', { name: 'Mettre la vidéo en pause' }).click();
    await waitUntil(async () => (await page.locator('video').evaluate(video => video.paused)) === true, 'Video did not pause');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await waitUntil(async () => await page.locator('video').count() === 0, 'Reduced motion did not remove video');
    const fallback = await context.newPage();
    await fallback.emulateMedia({ reducedMotion: 'no-preference' });
    await fallback.route('**/*.webm', route => route.abort());
    await fallback.goto(url);
    await waitUntil(async () => await fallback.locator('header img').evaluate(image => image.complete && image.naturalWidth > 0), 'Poster did not load with blocked video');
    assert.equal(await fallback.locator('header time').isVisible(), true);
    assert.equal(await fallback.locator('video').evaluate(video => video.paused), true);
    await fallback.close();
  });
  assert.deepEqual(runtimeErrors, []);
  console.log(`Screenshots: ${artifacts}`);
} finally { await browser?.close(); server.kill('SIGTERM'); }

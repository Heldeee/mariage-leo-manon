import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function backend(initialRows = [], { mailFails = false, quota = 100, mailError = "Simulated email failure" } = {}) {
  const emails = [];
  const warnings = [];
  const rows = initialRows.map(row => [...row]);
  let locked = false;
  const sheet = {
    getLastRow: () => rows.length,
    getSheetId: () => 42,
    appendRow: row => rows.push([...row]),
    setFrozenRows: () => {},
    getRange(row, column, height = 1, width = 1) {
      return {
        getValue: () => rows[row - 1]?.[column - 1] || '',
        setValue(value) { assert(locked); rows[row - 1][column - 1] = value; },
        setValues(values) {
          assert(locked, 'Writes must hold the lock');
          assert.equal(values.length, height);
          values.forEach((value, offset) => { assert.equal(value.length, width); rows[row - 1 + offset] = [...value]; });
        },
        createTextFinder(value) { return { matchEntireCell() { return this; }, findNext: () => rows.slice(row - 1, row - 1 + height).find(item => item[column - 1] === value) || null }; },
      };
    },
  };
  let created = initialRows.length > 0;
  const context = vm.createContext({
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getUrl: () => 'https://docs.google.com/spreadsheets/d/test/edit', getSheetByName: () => created ? sheet : null, insertSheet: () => { created = true; return sheet; } }) },
    MailApp: {
      getRemainingDailyQuota: () => quota,
      sendEmail(message) {
        assert(!locked, 'Mail must be sent after releasing the sheet lock');
        assert(rows.length > 1, 'Mail must only be sent after rows are saved');
        if (mailFails) throw new Error(mailError);
        emails.push(message);
      },
    },
    console: { error: message => warnings.push(message) },
    LockService: { getScriptLock: () => ({ waitLock: () => { locked = true; }, releaseLock: () => { locked = false; } }) },
    ContentService: { MimeType: { JSON: 'application/json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) },
  });
  vm.runInContext(readFileSync('google-apps-script/Code.gs', 'utf8'), context);
  return { rows, emails, warnings, send: data => context.doPost({ postData: { contents: JSON.stringify(data) } }), isLocked: () => locked };
}
const people = [
  { nom: ' Martin ', prenom: ' Alice ', presence: 'oui', allergenes: ' Noix ' },
  { nom: 'Martin', prenom: 'Bob', presence: 'non', allergenes: 'Ignored' },
];
test('Retries after a lost success acknowledgement do not duplicate household rows', () => {
  const api = backend();
  assert.equal(api.send({ personnes: people, requestId: 'request-one' }).status, 'success');
  assert.equal(api.rows.length, 3);
  assert.equal(api.rows[1][1], 'Martin');
  assert.equal(api.rows[1][4], 'Noix');
  assert.equal(api.rows[2][4], '');
  assert.equal(api.send({ personnes: people, requestId: 'request-one' }).duplicate, true);
  assert.equal(api.rows.length, 3);
  assert.equal(api.isLocked(), false);
  api.send({ personnes: people, requestId: 'request-two' });
  assert.equal(api.rows.length, 5);
});
test('Existing five-column sheets are extended without changing existing guest rows', () => {
  const original = ['old-date', 'Old', 'Guest', 'oui', ''];
  const api = backend([['date_reponse', 'nom', 'prenom', 'presence', 'allergenes'], original]);
  api.send({ personnes: people, requestId: 'new-request' });
  assert.equal(api.rows[0][5], 'request_id');
  assert.deepEqual(api.rows[1], original);
  assert.equal(api.rows.length, 4);
});
test('Invalid and empty households are rejected without partial writes', () => {
  const api = backend();
  for (const data of [{ personnes: [] }, { personnes: [...people, { nom: '', prenom: 'X', presence: 'oui' }] }, { personnes: people, requestId: 'invalid/request' }]) {
    assert.equal(api.send(data).status, 'error');
    assert.equal(api.rows.length, 0);
  }
});


test('New household sends one email with attendance and a sheet link, without dietary details', () => {
  const api = backend();
  const result = api.send({ personnes: people, requestId: 'notify-household' });
  assert.equal(result.notificationSent, true);
  assert.equal(api.emails.length, 1);
  assert.equal(api.emails[0].to, 'leodevin24@gmail.com');
  assert.match(api.emails[0].body, /Alice Martin : Présent\(e\)/);
  assert.match(api.emails[0].body, /Bob Martin : Absent\(e\)/);
  assert.match(api.emails[0].body, /Présent\(e\)s : 1 — Absent\(e\)s : 1/);
  assert.match(api.emails[0].body, /https:\/\/docs.google.com\/spreadsheets\/d\/test\/edit#gid=42/);
  assert(!api.emails[0].body.includes('Noix'));
  api.send({ personnes: people, requestId: 'notify-household' });
  assert.equal(api.emails.length, 1, 'Duplicate retries must not send duplicate notifications');
});

test('Email failure or exhausted quota does not discard a saved RSVP or encourage duplicates', () => {
  for (const options of [{ mailFails: true }, { quota: 0 }]) {
    const api = backend([], options);
    const result = api.send({ personnes: people, requestId: 'notify-failure' });
    assert.equal(result.status, 'success');
    assert.equal(result.notificationSent, false);
    assert.equal(result.notificationError, options.quota === 0 ? "MAIL_QUOTA_EXCEEDED" : "MAIL_SEND_FAILED");
    assert.equal(api.rows.length, 3);
    assert.equal(api.emails.length, 0);
    assert.equal(api.warnings.length, 1);
    assert(!api.warnings[0].includes('Alice'));
    assert(!api.warnings[0].includes('Noix'));
    assert.equal(api.send({ personnes: people, requestId: 'notify-failure' }).duplicate, true);
    assert.equal(api.rows.length, 3);
    assert.equal(api.warnings.length, 1);
  }
});

test('Invalid submissions do not send notification emails', () => {
  const api = backend();
  assert.equal(api.send({ personnes: [], requestId: 'invalid-mail' }).status, 'error');
  assert.equal(api.emails.length, 0);
});


test('Missing mail permission reports a safe diagnostic code without exposing error details', () => {
  const api = backend([], { mailFails: true, mailError: 'You do not have permission to call MailApp.sendEmail for sensitive-account@example.com' });
  const result = api.send({ personnes: people, requestId: 'mail-permission-test' });
  assert.equal(result.status, 'success');
  assert.equal(result.notificationError, 'MAIL_AUTHORIZATION_REQUIRED');
  assert(!JSON.stringify(result).includes('sensitive-account'));
  assert(!api.warnings[0].includes('sensitive-account'));
});

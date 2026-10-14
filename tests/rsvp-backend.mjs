import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function backend(initialRows = []) {
  const rows = initialRows.map(row => [...row]);
  let locked = false;
  const sheet = {
    getLastRow: () => rows.length,
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
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => created ? sheet : null, insertSheet: () => { created = true; return sheet; } }) },
    LockService: { getScriptLock: () => ({ waitLock: () => { locked = true; }, releaseLock: () => { locked = false; } }) },
    ContentService: { MimeType: { JSON: 'application/json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) },
  });
  vm.runInContext(readFileSync('google-apps-script/Code.gs', 'utf8'), context);
  return { rows, send: data => context.doPost({ postData: { contents: JSON.stringify(data) } }), isLocked: () => locked };
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

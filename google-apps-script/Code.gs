const SHEET_REPONSES_FINALES = "Reponse Finales";
const RESPONSE_HEADERS = [
  "date_reponse",
  "nom",
  "prenom",
  "presence",
  "allergenes",
  "request_id",
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Requête vide");
    }

    const data = JSON.parse(e.postData.contents);
    if (!Array.isArray(data.personnes) || data.personnes.length === 0) {
      throw new Error("La liste des personnes est vide");
    }

    const requestId = String(data.requestId || "").trim();
    if (requestId && !/^[a-zA-Z0-9-]{1,80}$/.test(requestId)) {
      throw new Error("Identifiant de requête invalide");
    }
    const people = data.personnes.map(function (person) {
      const nom = String(person.nom || "").trim();
      const prenom = String(person.prenom || "").trim();
      const presence = String(person.presence || "").trim().toLowerCase();
      const allergenes = String(person.allergenes || "").trim();

      if (!nom || !prenom || !["oui", "non"].includes(presence)) {
        throw new Error("Nom, prénom ou présence invalide");
      }

      return [new Date(), nom, prenom, presence, presence === "oui" ? allergenes : "", requestId];
    });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getOrCreateResponseSheet_();
      if (requestId && sheet.getLastRow() > 1) {
        const existing = sheet.getRange(2, 6, sheet.getLastRow() - 1, 1)
          .createTextFinder(requestId).matchEntireCell(true).findNext();
        if (existing) return jsonResponse_({ status: "success", duplicate: true });
      }
      const firstRow = sheet.getLastRow() + 1;
      sheet.getRange(firstRow, 1, people.length, RESPONSE_HEADERS.length).setValues(people);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_({ status: "success" });
  } catch (error) {
    return jsonResponse_({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function getOrCreateResponseSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_REPONSES_FINALES);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_REPONSES_FINALES);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(RESPONSE_HEADERS);
    sheet.setFrozenRows(1);
  }

  if (sheet.getRange(1, 6).getValue() !== "request_id") {
    sheet.getRange(1, 6).setValue("request_id");
  }
  return sheet;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

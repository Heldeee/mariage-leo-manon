const SHEET_REPONSES_FINALES = "Reponse Finales";
const NOTIFICATION_EMAIL = "leodevin24@gmail.com";
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

    let responseSheet;
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getOrCreateResponseSheet_();
      responseSheet = sheet;
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

    const notification = sendRSVPNotification_(people, responseSheet);
    const result = { status: "success", notificationSent: notification.sent };
    if (notification.error) result.notificationError = notification.error;
    return jsonResponse_(result);
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


// Run once from the editor to grant mail permission, without sending a test email.
function authorizeNotifications() {
  return MailApp.getRemainingDailyQuota();
}

function sendRSVPNotification_(people, sheet) {
  try {
    if (MailApp.getRemainingDailyQuota() < 1) {
      throw new Error("Quota d’envoi épuisé");
    }
    const present = people.filter(function (person) { return person[3] === "oui"; }).length;
    const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl() + "#gid=" + sheet.getSheetId();
    const lines = [
      "Une nouvelle réponse a été enregistrée pour le mariage de Léo et Manon.",
      "",
      "Personnes : " + people.length,
      "Présent(e)s : " + present + " — Absent(e)s : " + (people.length - present),
      "",
    ];
    people.forEach(function (person) {
      lines.push("- " + person[2] + " " + person[1] + " : " + (person[3] === "oui" ? "Présent(e)" : "Absent(e)"));
    });
    lines.push("", "Consulter les réponses : " + sheetUrl);
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: "Nouvelle réponse RSVP — Mariage de Léo et Manon",
      body: lines.join("\n"),
      name: "Mariage de Léo et Manon",
    });
    return { sent: true };
  } catch (error) {
    // Saving the RSVP succeeded; a mail failure must not make the guest resubmit.
    // Keep logs free of names, dietary details and email content.
    const message = error instanceof Error ? error.message : String(error);
    const code = /permission|authorization|authoriz|autoris|scope/i.test(message)
      ? "MAIL_AUTHORIZATION_REQUIRED"
      : /quota|too many times|limit/i.test(message)
        ? "MAIL_QUOTA_EXCEEDED"
        : /recipient|invalid email|invalid argument.*to/i.test(message)
          ? "MAIL_RECIPIENT_INVALID"
          : "MAIL_SEND_FAILED";
    console.error("RSVP enregistré, mais notification email non envoyée : " + code);
    return { sent: false, error: code };
  }
}

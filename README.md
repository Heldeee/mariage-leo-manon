# TODOs

- ajouter des photos ?
- plus de decoration (vignes ? pailletes ?)

## RSVP public

Le formulaire est maintenant public et permet de renseigner plusieurs personnes dans un même envoi. Chaque personne possède son prénom, son nom, sa présence et ses allergènes.

Le script Google Apps Script se trouve dans `google-apps-script/Code.gs`. Il doit être redéployé comme application web avec un accès autorisant les utilisateurs à envoyer une requête après chaque modification. Il crée automatiquement la feuille `Reponse Finales` et ajoute une ligne par personne avec les colonnes suivantes :

`date_reponse`, `nom`, `prenom`, `presence`, `allergenes`, `request_id`

Renseigner ensuite l’URL du déploiement dans `VITE_API_URL` avant de lancer le build frontend.

## UX updates and local verification

The frontend now requires an explicit attendance choice, includes keyboard-accessible date revelation, accessible photo dialogs, routes for both venues, and response summaries. Retry attempts for the same payload reuse a request ID. The Apps Script stores this ID in column F under a script lock so an acknowledged or unacknowledged successful request is not appended twice. Existing response rows remain unchanged. **Redeploy `google-apps-script/Code.gs` before using the new retry protection in production.**

The hero uses a compressed full-length video (approximately 1 minute 34 seconds) and a WebP poster. Preserve the complete montage when optimizing media; do not trim its duration unless requested. Gallery thumbnails are generated separately; original images remain available in the photo viewer. Motion follows the device's reduced-motion preference.

Run `npm ci`, `npm run lint`, `npm run build`, and `npm run dev`. The local site is served at `http://localhost:8888/mariage-leo-manon/`. Configure `VITE_API_URL` for a test deployment to exercise real submission; local browser tests should intercept that endpoint to avoid writing guest data.

Full venue addresses, an RSVP deadline, parking/accommodation details, and invitation rules still need confirmed content from the couple. The site does not invent these details. Drafts containing dietary information are not persisted to browser storage.


### Repeatable local tests

- `npm run test:rsvp`: Apps Script behavior with an in-memory spreadsheet/lock fixture, including retries and migration of existing rows.
- `npm run test:ux`: starts an isolated Vite server on port 8890 and runs Chromium flow/accessibility checks. All RSVP requests use a local intercepted endpoint, and Google Maps uses a local fixture. No production guest rows are written.

The UX suite uses `/bin/google-chrome` when available, or Playwright Chromium otherwise (`npx playwright install chromium`). Set `UX_BROWSER` to another Chromium executable if needed. Screenshots are saved to `/tmp/wedding-ux-results`; override that location with `UX_ARTIFACTS`.


### Configure real RSVP delivery locally

Copy `.env.example` to `.env.local` and set `VITE_API_URL` to the deployed Google Apps Script web-app URL ending in `/exec`. Restart `npm run dev` after changing environment settings. `.env.local` is ignored by Git. The GitHub Actions secret is only supplied to the deployment build; it does not configure your local server. With a real endpoint configured, manual form submissions will write real rows to that endpoint's spreadsheet.


## Notifications email des réponses RSVP

`google-apps-script/Code.gs` envoie un email à `NOTIFICATION_EMAIL` (par défaut, l’adresse de contact du site) après l’enregistrement d’une nouvelle réponse du formulaire. Un envoi regroupant plusieurs personnes produit un seul email avec leurs noms, leur présence et un lien vers la feuille. Les restrictions alimentaires restent dans la feuille et ne sont pas reprises dans l’email. Une nouvelle tentative avec le même `requestId` ne renvoie pas la notification.

Pour activer cette fonctionnalité dans Google Apps Script :

1. Copier la version actuelle de `Code.gs` dans le projet associé à la feuille et vérifier `NOTIFICATION_EMAIL`.
2. Exécuter `authorizeNotifications` depuis l’éditeur et accepter l’autorisation d’envoi d’emails. Cette fonction ne transmet aucun email de test.
3. Dans **Déployer → Gérer les déploiements**, modifier le déploiement web existant, sélectionner une **Nouvelle version**, puis déployer. Conserver l’exécution en tant que propriétaire et l’accès nécessaire au formulaire public ; modifier le déploiement existant permet de garder son URL `/exec`.
4. Vérifier la réception lors de la prochaine vraie réponse. Les tests locaux utilisent un MailApp simulé et n’envoient pas d’emails réels.

Aucun déclencheur `onEdit` n’est nécessaire : l’email est envoyé depuis `doPost`, après l’écriture. Les écritures faites par Apps Script ne déclenchent pas les déclencheurs d’édition de Sheets ; les modifications manuelles de la feuille n’envoient donc pas de notification avec cette implémentation.

L’enregistrement du RSVP reste réussi si l’envoi du mail échoue (autorisation, quota, destinataire). `notificationSent` indique le résultat dans la réponse API. En cas d’échec, `notificationError` fournit un code sans données personnelles (`MAIL_AUTHORIZATION_REQUIRED`, `MAIL_QUOTA_EXCEEDED`, `MAIL_RECIPIENT_INVALID` ou `MAIL_SEND_FAILED`), également ajouté aux journaux d’exécution. Pour un problème d’autorisation, exécuter `authorizeNotifications`, accorder l’autorisation MailApp et redéployer la nouvelle version. Il n’y a pas de nouvelle tentative automatique d’envoi email. Un push GitHub ne met pas à jour ce déploiement Apps Script.

Documentation Google : [MailApp](https://developers.google.com/apps-script/reference/mail/mail-app), [autorisations](https://developers.google.com/apps-script/guides/services/authorization), [restrictions des déclencheurs](https://developers.google.com/apps-script/guides/triggers/installable).

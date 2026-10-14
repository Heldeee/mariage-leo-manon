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

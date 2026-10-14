# UX review — Léo & Manon wedding website

Reviewed: 14 October 2026.

## Overall assessment

The site has a cohesive wedding identity: warm backgrounds, sage accents, personal photos, and a clear chronological programme. Its single-page structure and household RSVP support are good foundations. The main opportunity is to make essential guest tasks easier: find the date, decide where to arrive, get directions, and submit a reliable response.

The highest-impact improvements are to expose the date immediately, add direct navigation to RSVP and practical information, simplify the mobile programme, strengthen form accessibility, and reduce the initial media burden.

## Scope and confidence

This is a source-based review of all React components, shared CSS, calendar generation, RSVP transport, Google Apps Script storage, HTML metadata, deployment configuration, and local media sizes. No application code was changed.

No browser session, screen-reader test, live RSVP submission, or performance benchmark was performed. Layout and loading consequences are reasoned from the implementation; they need device validation. Asset sizes are local disk measurements, not measured network transfers. Contrast ratios are calculated from the declared solid colors. This report does not claim a complete accessibility compliance audit.

## What already works

- Programme entries provide times, event names, and the two principal venues.
- A household can respond for several people with individual attendance and dietary information.
- Names are trimmed and checked before submission; server-side validation also checks attendance.
- Submission has a pending label, prevents another click while pending, and only shows success after the API reports success.
- The map has a title, loads lazily, and has a separate directions link.
- Gallery thumbnails load lazily. Name inputs have visible wrapping labels and autocomplete hints.
- The back-to-top button has an accessible name and a generous 48 px target.

## Prioritized findings

Priority definitions: **P1** materially affects a primary task or accessibility; **P2** adds confusion or friction; **P3** is a polish or future-state issue. Effort estimates are relative: small = localized changes; medium = changes across components or interaction states.

| Priority | Finding | Guest impact | Evidence | Recommended change | Effort |
| --- | --- | --- | --- | --- | --- |
| P1 | Date discovery requires a gesture | Sighted guests must scratch three hearts to read the date; keyboard users cannot operate the canvas | `src/components/Hero.tsx`; `src/components/Countdown.tsx:112` | Show “19 juin 2027” in the hero and keep scratching optional; add a keyboard-operable reveal button | Small |
| P1 | Main guest tasks have no direct navigation | Returning guests must scroll past decorative sections to RSVP or directions | `src/App.tsx:13`; `src/components/Hero.tsx` | Add visible links to Programme, Lieux, and RSVP, plus a primary “Confirmer ma présence” action | Small |
| P1 | Important controls use low-contrast text | White text on sage is approximately 2.12:1; sage time labels on cream are approximately 1.94:1 | `src/components/RSVP.tsx:143`; `src/components/RSVP.tsx:181`; `src/components/Timeline.tsx:41`; `src/components/Venue.tsx` | Use dark text on sage or a darker button background; make programme times dark enough to read comfortably | Small |
| P1 | RSVP lacks form and selection semantics | Enter does not use a native form submit flow; assistive technology cannot identify the selected attendance option | `src/components/RSVP.tsx:75`; `src/components/RSVP.tsx:134` | Use a `<form onSubmit>`, grouped native radios with a legend, and explicit submit-button type | Medium |
| P1 | Form labels and feedback are incomplete | Dietary textarea has no associated label; errors do not identify fields or move focus; success is not announced explicitly | `src/components/RSVP.tsx:153`; `src/components/RSVP.tsx:185`; `src/components/RSVP.tsx:57` | Associate labels with unique IDs; add inline errors and `aria-invalid`/`aria-describedby`; focus the first invalid input and announce status | Medium |
| P1 | Gallery viewer cannot be closed with the keyboard | Enter opens a photo, but there is no close control or Escape handler; focus stays outside the overlay | `src/components/Gallery.tsx:41` | Use an accessible dialog with a labeled close button, Escape handling, focus containment, focus restoration, and background scroll lock | Medium |
| P1 | Hero media has a large loading cost and no fallback | On slow connections or blocked autoplay, the first impression may be delayed or visually empty | `src/components/Hero.tsx`; `src/assets/videos/domaine.webm` | Supply a lightweight poster, compress/shorten the video, and offer a static-image path for reduced motion | Medium |
| P1 | Mobile programme retains desktop geometry | Half-width alternating columns leave very little usable width for event names on narrow phones | `src/components/Timeline.tsx:38` | Use a single column with a left-side timeline below the desktop breakpoint | Small |
| P2 | Directions omit the first arrival location | The programme starts at the mairie, but the map and route action only describe the domaine | `src/components/Timeline.tsx:11`; `src/components/Venue.tsx` | Give both venues full textual addresses and distinct route links; state the arrival time for each | Small, requires confirmed details |
| P2 | Calendar location conflicts with the programme | The event begins at 14:00 but lists the domaine, while the 14:00 ceremony is at the mairie | `src/services/ics.ts:6`; `src/components/Timeline.tsx:11` | Represent both locations explicitly, ideally with separate ceremony events; use an explicit event timezone | Medium |
| P2 | RSVP recovery is weak | A saved response followed by a lost network reply can lead to duplicate rows on retry; guests cannot review or amend after success | `src/services/guest.ts`; `google-apps-script/Code.gs`; `src/components/RSVP.tsx:57` | Add a request ID and duplicate-safe retries; show the submitted summary and a clear correction/contact path | Medium |
| P2 | Form stays editable during submission | Guests can change values after the submitted payload is captured and then receive confirmation for an earlier version | `src/components/RSVP.tsx:45`; `src/components/RSVP.tsx:178` | Disable the form controls while sending, and confirm the exact submitted values | Small |
| P2 | Attendance copy assumes acceptance | Every person starts as present, and declined responses receive “hâte de célébrer ... avec vous” | `src/components/RSVP.tsx:8`; `src/components/RSVP.tsx:68` | Require an explicit choice or make the default clear; adapt confirmation to present, absent, and mixed households | Small |
| P2 | Practical information and response deadline are missing | Guests need to contact the couple to resolve travel, attendance, or planning questions | `src/components/RSVP.tsx:84`; `src/components/Venue.tsx`; `src/components/Footer.tsx` | Add an agreed RSVP deadline and concise practical information: parking, travel between venues, accommodation, accessibility, and any invitation rules | Medium, requires content |
| P2 | Motion has no user-preference handling | Video loops indefinitely; animations and smooth scrolling continue for guests who prefer reduced motion | `src/components/Hero.tsx`; `src/index.css`; motion components | Respect reduced-motion preferences and provide a pause/stop control for ongoing video motion | Medium |
| P2 | Document language is English for French content | Screen readers can pronounce French content with the wrong language rules | `index.html:2` | Set `lang="fr"` | Small |
| P3 | Contact details require manual copying | Calling or emailing from mobile takes extra steps | `src/components/Footer.tsx` | Use `mailto:` and international-format `tel:` links with descriptive text | Small |
| P3 | Typography and sharing metadata are unfinished | Requested fonts are not loaded by the inspected code; the browser title looks like a project identifier | `src/index.css`; `index.html` | Load the intended fonts or deliberately choose installed fallbacks; add a human-readable title, description, and sharing metadata | Small |

## Interaction details worth addressing

### Scratch cards

The date values already exist as ordinary DOM text under the canvas, so they may remain available to screen readers. The problem is the inaccessible visual interaction and the unnecessary effort for sighted guests, rather than universal absence of the date.

`Countdown.tsx:198` supplies a new callback on every parent render, and the canvas effect depends on that callback at line 146. Revealing one heart updates the parent and repaints the remaining cards, discarding their partial progress. The hourly countdown update also repaints them. Resizing the window repaints the coating too. Stabilize the callbacks and preserve progress across resizing if this interaction is retained.

The progress calculation includes transparent pixels outside the heart, so the 85% threshold is not “85% of the heart scratched.” Restrict the calculation to the initial painted mask if predictable completion matters. Clamp the countdown at zero and replace it with wedding-day/post-event copy when appropriate.

`App.tsx:14` and `Countdown.tsx:190` also define the same `countdown` ID. Keep a single anchor target.

### Mobile readability

At 375 px, the programme section has about 327 px after horizontal padding. Each event wrapper is about 132 px wide before another 32 px of inner padding, leaving roughly 100 px for text. At 320 px, that falls to approximately 72 px. This follows the intended `calc(50% - 2rem)` sizing; actual compiled styling still needs browser verification. A single-column layout would make times, ceremony names, and venue names easier to scan.

The 48 px section headings have no smaller mobile size, and the hero uses `h-screen`. Check long headings at 320 px and with enlarged text, and consider `svh`-based minimum height and responsive heading sizes. The scratch-card row also needs checking: three 112 px cards plus gaps exceed narrow content widths, so flex shrinking may distort their intended proportions.

### Media and perceived performance

The hero video occupies approximately 45 MB on disk; the six photos total roughly 8.5 MB. Lazy image loading is helpful, but thumbnails still point to the original images without `srcset` or separate thumbnail assets. Eager imports register asset URLs; they do not by themselves mean every image is immediately downloaded.

Generate appropriately sized gallery thumbnails, retain larger files for the viewer, and use responsive sources. For the hero, prioritize the poster and readable text before video playback. Measure actual requests, transferred bytes, and first-screen rendering on a throttled mobile connection before setting performance targets.

### RSVP confidence and recovery

The current error keeps the entered values in React state, which supports a simple retry. However, a refresh loses the response, a request has no explicit timeout, and retry behavior is not duplicate-safe because the backend always appends rows. Consider temporary draft recovery if households are likely to enter many people, with deliberate handling of dietary details.

Adding or removing a person should move focus predictably and announce the change. Use stable person IDs instead of index keys so removing a middle person does not reuse another person's interaction identity. Make “Retirer” identify its person for assistive technology.

A short note explaining who receives the answers and how to correct them would build confidence, particularly around dietary information. Clarify whether dietary information is optional and only show it when relevant to attendance.

## Suggested implementation order

1. **Make essential information reachable:** expose the date in the hero, add RSVP/venue/programme links, and provide both arrival locations.
2. **Make core interactions accessible:** fix language and color contrast, implement proper form semantics and feedback, and repair the photo dialog.
3. **Improve mobile and loading behavior:** switch to a single-column mobile timeline, add a video poster and reduced-motion behavior, and resize media assets.
4. **Improve response confidence:** freeze controls during submission, show a person-by-person confirmation, offer a correction path, and make backend retries duplicate-safe.
5. **Finish content and polish:** confirm the deadline and practical details, fix calendar locations/timezone, and improve contact links, metadata, and font delivery.

## Validation checklist for the next iteration

- At 320, 375, 390, 768, and 1440 px, verify that date, programme, route links, and RSVP remain readable without horizontal scrolling; repeat with enlarged text.
- Complete the page using only the keyboard: skip/reveal hearts, navigate to RSVP, choose attendance, add/remove people, correct errors, and open/close photos.
- With a French screen reader configuration, verify labels, selected attendance, dynamic person changes, errors, pending state, and confirmation announcements.
- Try one present guest, one absent guest, a mixed household, empty/whitespace names, and removal of a middle person.
- Simulate offline use, a slow response, a server error, and a saved response whose acknowledgement is lost; confirm recovery without duplicate records. Use a test spreadsheet rather than production guest data.
- Confirm that displayed confirmation matches the payload when a submission is pending.
- Test the hero with autoplay unavailable, reduced motion enabled, and a throttled mobile connection.
- Import the calendar in more than one calendar client and timezone, and verify the first ceremony location and local event times.
- Ask representative guests to find the date, plan their arrival, and RSVP without guidance; record completion, confusion, and requests for help.


## Implementation follow-up — 14 October 2026

The source-review findings above describe the original implementation. The follow-up now exposes the date and RSVP links in the hero; retains optional scratch hearts with keyboard alternatives and preserved progress; switches the mobile timeline to a single column; adds both venue routes; improves contrast, labels, focus, and live feedback; implements a native photo dialog; freezes the RSVP during submission; shows a response summary and correction contacts; and fixes calendar locations with UTC timestamps. The French document language, sharing metadata, contact links, deliberate system-font fallbacks, skip link, and live reduced-motion handling are also implemented.

The new hero clip is 1,840,284 bytes (about 1.84 MB), with a 49,836-byte poster. Six WebP thumbnails total 226,692 bytes (about 227 KB). Original images remain available in the photo viewer, and the original video is retained in source but is not imported into the production bundle.

Local validation passed:

- `npm run lint` and `npm run build`.
- `npm run test:rsvp`: 3 backend fixture tests covering duplicate-safe retries, migration of a five-column sheet without modifying existing guest rows, and rejection of invalid submissions.
- `npm run test:ux`: 11 browser-check groups covering navigation and date access; layout at 320/375/390/768/1440 px and 200% base text size; keyboard date revelation; dialog focus/closing; household validation and stable removal; accessibility scans; submission failure/retry and pending-state locking; absent-only copy; calendar download contents; scratch progress across rerenders/resizing; and video pause, blocked-media fallback, and live reduced-motion changes.
- Automated accessibility scans reported no violations for the tested WCAG A/AA rules in the form, dialog, and confirmation states. This is not a complete manual screen-reader or accessibility compliance audit.
- `git diff --check` passed. Screenshots are available in `/tmp/wedding-ux-results`.

RSVP and Google Maps were isolated with local fixtures. Real Apps Script delivery, live map accuracy, and imports into actual calendar clients remain unverified. The updated Apps Script must be redeployed to enable production duplicate protection; it adds `request_id` in column F and checks it under the script lock. Full addresses, the RSVP deadline, and practical wedding details still need confirmed content. Dietary drafts are intentionally not persisted in browser storage. No production data was submitted and no deployment was performed.


### Correction de la vidéo du hero

La première optimisation avait raccourci le montage à 16 secondes. Cette coupe a été annulée : la version optimisée conserve désormais la durée originale d’environ 93,82 secondes. Les mesures de poids du clip de 16 secondes ci-dessus décrivent uniquement cette ancienne version. Une vérification navigateur de la durée complète protège cette correction. Toute future compression doit conserver le montage intégral, sauf demande explicite de modification du contenu.

# Guide des prochaines itérations

Ce fichier s’applique à tout le dépôt. Les consignes explicites de l’utilisateur priment sur ce guide. Mettre à jour ce document si les commandes, l’architecture ou les règles métier changent.

## Projet et contenu de référence

Site de mariage de **Léo et Manon**, en français, développé avec React, TypeScript, Vite et Tailwind CSS. Le frontend est publié sur GitHub Pages ; le RSVP est enregistré dans Google Sheets par une application web Google Apps Script.

Informations confirmées à préserver sauf demande de modification :

- Date : **19 juin 2027**, horaires locaux en France.
- 14h00 : célébration civile à la **Mairie du Cazalet**.
- Adresse exacte pour les cartes, itinéraires et calendrier : **Mairie de Quartiers du secteur 3, Pessac, Château de Cazalet, Av. de Beutre, 33600 Pessac**. Ne pas remplacer cette mairie par la mairie centrale de Pessac.
- 16h00 : cérémonie laïque au **Domaine Grand Piquecaillou**.
- 18h00 : vin d’honneur ; 20h00 : dîner extérieur ; 23h00 : soirée dansante.
- Les deux cartes de lieux affichent actuellement le nom et les horaires, sans adresse complète. Conserver une présentation uniforme : afficher les deux adresses seulement si elles sont toutes deux confirmées.

Ne pas inventer l’adresse du domaine, la date limite de réponse, les hébergements, les règles d’invitation ou les détails de stationnement/accessibilité. Lors d’un changement de lieu ou d’horaire, vérifier ensemble le programme, les cartes, les itinéraires, le calendrier et les tests.

## Repères dans le dépôt

| Emplacement | Rôle |
| --- | --- |
| `src/App.tsx` | Assemblage de la page et configuration des animations |
| `src/components/` | Hero, compte à rebours/cœurs, programme, galerie, lieux, RSVP, pied de page |
| `src/hooks/useReducedMotion.ts` | Préférence de mouvement réduit, y compris les changements pendant la visite |
| `src/services/guest.ts` | Transport RSVP et erreurs de configuration |
| `src/services/ics.ts` | Création et téléchargement du calendrier |
| `src/index.css` | Styles globaux, focus, lien d’évitement, mouvement réduit |
| `src/assets/images/` | Photos originales, poster et sous-dossier de miniatures |
| `src/assets/videos/` | Vidéo originale et version optimisée |
| `google-apps-script/Code.gs` | Validation et stockage des réponses |
| `tests/` | Tests navigateur, configuration locale et fixtures du backend |
| `.github/workflows/deploy.yml` | Construction et publication GitHub Pages |

Le `README.md` décrit l’installation. `UX_REPORT.md` est un audit historique accompagné de notes d’implémentation : vérifier le code actuel avant de considérer un ancien constat comme un problème encore présent.

## Installation et configuration locale

- Utiliser npm et conserver `package-lock.json` cohérent. Installer avec `npm ci`.
- `npm run dev` sert le site sur **http://localhost:8888/mariage-leo-manon/** ; le port 8888 est strict.
- Conserver la base Vite `/mariage-leo-manon` et vérifier les chemins des assets sous cette base.
- Copier `.env.example` vers `.env.local`, puis renseigner `VITE_API_URL` avec l’URL Apps Script terminée par `/exec` pour les envois réels. Ne pas écraser une configuration locale existante.
- `.env.local` est ignoré par Git. Ne pas le committer et ne pas recopier son contenu dans les logs ou la documentation.
- Redémarrer Vite après un changement d’environnement, ou vérifier son redémarrage automatique.
- Le secret GitHub Actions `VITE_API_URL` configure le build de production, **pas le serveur local**.
- Une variable `VITE_*` est intégrée au JavaScript public : ne jamais y placer de mot de passe ou de jeton confidentiel.
- Sans endpoint local, le formulaire doit afficher une erreur de configuration en développement ; ne pas simuler un succès pour masquer le problème.

## Règles d’implémentation et UX

Faire des changements ciblés en suivant les composants existants. Éviter d’ajouter une dépendance ou une abstraction sans besoin concret. Ne pas modifier des fichiers sans rapport avec la demande ni annuler des changements de l’utilisateur.

Préserver l’identité visuelle : fonds crème/blanc, texte brun foncé, touches de sauge et cœurs dorés. Le texte et les interactions destinés aux invités restent en français ; les détails techniques de configuration restent réservés au développement.

Points à préserver :

- Date visible dans le hero et accès direct au RSVP, au programme et aux lieux.
- Programme sur une colonne sur mobile ; absence de débordement horizontal, y compris avec du texte agrandi.
- Cœurs adaptés à la largeur disponible. Le texte sous la dorure reste découpé à la forme du cœur, sans dépasser au bas. Le grattage conserve sa progression après un rendu React ou un redimensionnement.
- Alternative clavier pour révéler la date sans gratter ; l’animation reste facultative.
- Contraste lisible : éviter le texte blanc sur le vert sauge clair pour les actions importantes.
- Contrôles natifs, labels associés, focus visible, erreurs annoncées et focus placé au bon endroit après ajout/suppression ou validation.
- Galerie avec fermeture au clavier, focus contenu dans le dialogue et restauré à la fermeture.
- Vidéo avec poster, commande pause/lecture et respect du mouvement réduit, y compris quand la préférence change pendant la visite.
- Optimiser la vidéo en conservant l’intégralité du montage et sa durée. Ne pas couper de séquences ou supprimer une piste audio sans demande explicite.
- Miniatures pour la galerie ; originaux pour la vue agrandie. Ne pas réintroduire la vidéo originale volumineuse dans le hero.
- Calendrier avec les deux lieux corrects, horaires non ambigus, virgules échappées, fins de ligne CRLF et lignes repliées à 75 octets UTF-8 maximum.

## RSVP et données des invités

Le contrat frontend est `{ personnes, requestId }`. Chaque personne contient `nom`, `prenom`, `presence` (`oui` ou `non`) et `allergenes`.

- Exiger une réponse explicite de présence et un nom/prénom non vides après nettoyage.
- Utiliser des identifiants stables pour les personnes ; ne pas revenir aux index comme clés des cartes éditables.
- Désactiver l’édition pendant l’envoi, garder les données en cas d’erreur et confirmer les valeurs effectivement transmises.
- Conserver le même `requestId` lors d’une nouvelle tentative avec le même contenu. Le backend vérifie cet identifiant sous verrou avant d’ajouter les lignes.
- Conserver le POST JSON avec `Content-Type: text/plain;charset=utf-8` et le suivi des redirections Apps Script. Éviter de réintroduire un preflight CORS sans vérifier les conséquences.
- Ne déclarer le succès qu’après vérification de la réponse HTTP **et** de `status: "success"`.
- La feuille `Reponse Finales` contient, dans cet ordre : `date_reponse`, `nom`, `prenom`, `presence`, `allergenes`, `request_id`. Respecter les réponses existantes lors des migrations.
- Ne pas stocker les restrictions alimentaires dans le navigateur ni les écrire dans les logs.
- Utiliser des fixtures/interceptions pour les tests. Un formulaire local configuré avec l’endpoint réel écrit de vraies lignes ; un build local réussi ne prouve pas la livraison réelle.
- Une notification MailApp est envoyée après l’enregistrement d’un nouveau RSVP, une seule fois par soumission. Préserver l’absence de notification pour les doublons et le succès de l’enregistrement si l’email échoue. Ne pas inclure les restrictions alimentaires dans les emails ou les logs.
- Un push GitHub ne déploie pas Apps Script. Toute modification de `Code.gs` nécessite une mise à jour séparée de son déploiement pour prendre effet en production.

## Validation proportionnée au changement

Pour une modification de code, exécuter `npm run lint` et `npm run build`. Choisir ensuite les vérifications pertinentes :

| Changement | Vérification |
| --- | --- |
| Mise en page, navigation, cœurs, galerie, formulaire, lieux ou calendrier | `npm run test:ux` ; inspecter les captures concernées |
| Validation/stockage Apps Script, contrat RSVP ou protection contre les doublons | `npm run test:rsvp` et les parcours RSVP de `npm run test:ux` |
| Configuration de l’endpoint ou erreur d’absence de configuration | `node tests/rsvp-config.mjs` |
| Documentation seule | Relire les chemins/commandes cités et exécuter `git diff --check` ; pas de suite navigateur nécessaire |

Les tests UX utilisent le port **8890**, les tests de configuration le **8892**. Ils configurent leur propre endpoint ; ne pas les connecter à la feuille de production.

Les tests navigateur utilisent `/bin/google-chrome` si disponible, sinon Chromium de Playwright. Installer ce dernier avec `npx playwright install chromium` si nécessaire, ou définir `UX_BROWSER`. Les captures sont écrites dans `/tmp/wedding-ux-results`, remplaçable avec `UX_ARTIFACTS`.

Vérifier les vues 320, 375, 390, 768 et 1440 px, l’agrandissement du texte et le clavier pour les changements visuels ou interactifs. Après une modification mobile, regarder une capture : un build seul ne valide pas le rendu. Les scans automatisés ne remplacent pas un contrôle manuel d’accessibilité. Ajouter un test de régression lorsqu’il protège un comportement significatif, plutôt qu’un test qui recopie seulement l’implémentation.

## Git et publication

- Examiner `git status` et le diff avant de committer ; inclure uniquement les changements de l’itération. Ne pas ajouter `.env.local`, `node_modules`, `dist` ou les captures temporaires.
- Pour une publication demandée ou déjà autorisée dans le contexte, terminer les vérifications, créer un commit clair, puis pousser sur `main`. Le push déclenche automatiquement GitHub Pages.
- Vérifier l’état distant avant le push. En cas de divergence, intégrer les changements avec soin ; ne pas forcer le push ni réinitialiser les changements de l’utilisateur.
- Après le push, vérifier le workflow du commit et le site **https://heldeee.github.io/mariage-leo-manon/**. Ne pas annoncer une publication réussie sur la seule base d’un push réussi.
- Vérifier le frontend déployé sans envoyer de fausses réponses à l’endpoint réel. Distinguer la publication Pages du déploiement Apps Script.
- Dans le compte rendu, préciser brièvement ce qui a changé, les contrôles effectués et les éventuelles limites. Dire explicitement si la modification reste locale ou a été publiée.

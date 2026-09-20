# TODOs

- Favicons
- ajouter des photos ?
- plus de decoration (vignes ? pailletes ?)
- Changer "nos moments" par un truc plus perso

## RSVP public

Le formulaire est maintenant public et permet de renseigner plusieurs personnes dans un même envoi. Chaque personne possède son prénom, son nom, sa présence et ses allergènes.

Le script Google Apps Script se trouve dans `google-apps-script/Code.gs`. Il doit être redéployé comme application web avec un accès autorisant les utilisateurs à envoyer une requête après chaque modification. Il crée automatiquement la feuille `Reponse Finales` et ajoute une ligne par personne avec les colonnes suivantes :

`date_reponse`, `nom`, `prenom`, `presence`, `allergenes`

Renseigner ensuite l’URL du déploiement dans `VITE_API_URL` avant de lancer le build frontend.
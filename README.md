# Projet React - Formulaire d'inscription

Cette application React permet a un utilisateur de s'inscrire avec un formulaire contenant :

- nom
- prenom
- email
- date de naissance
- ville
- code postal

Les donnees valides sont sauvegardees dans le `localStorage` du navigateur sous la cle `formData`.

## Regles de validation

Les controles sont centralises dans `src/module/module.js`.

- Le nom, le prenom et la ville doivent contenir uniquement des lettres, avec prise en charge des espaces, apostrophes et tirets.
- L'email doit respecter un format standard `utilisateur@domaine.extension`.
- La date de naissance doit etre une vraie date au format `YYYY-MM-DD`, `YYYY/MM/DD`, `DD/MM/YYYY` ou `DD-MM-YYYY`.
- L'utilisateur doit avoir au moins 18 ans.
- Le code postal doit correspondre a un code postal francais metropolitain ou d'outre-mer valide.

## Fonctionnement

Au chargement, l'application tente de recuperer les donnees deja sauvegardees dans le `localStorage`.

Lors de l'envoi du formulaire :

- les donnees sont lues avec `FormData` ;
- chaque champ est valide par les fonctions du module ;
- si tout est valide, les donnees sont sauvegardees dans `localStorage` ;
- un message de succes est affiche ;
- en cas d'erreur, un message explicite est affiche et rien n'est sauvegarde.

## Installation

```bash
npm install
```

## Lancement de l'application

```bash
npm start
```

## Tests et couverture

La commande de test lance Jest via `react-scripts`, avec la couverture Istanbul.

```bash
npm run test
```

Exemple de resultat console :

```text
$ npm run test

> ci-cd-formulaire-inscription@0.1.0 test
> react-scripts test --watchAll=false --coverage --collectCoverageFrom=src/**/*.{js,jsx} --collectCoverageFrom=!src/reportWebVitals.js --collectCoverageFrom=!src/index.js

 PASS  src/module/module.test.js                                                                                       
 PASS  src/App.test.js
------------|---------|----------|---------|---------|-------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------|---------|----------|---------|---------|-------------------
All files   |     100 |      100 |     100 |     100 |                   
 src        |     100 |      100 |     100 |     100 |                   
  App.js    |     100 |      100 |     100 |     100 |                   
 src/module |     100 |      100 |     100 |     100 |                   
  module.js |     100 |      100 |     100 |     100 |                  
------------|---------|----------|---------|---------|-------------------

Test Suites: 2 passed, 2 total
Tests:       66 passed, 66 total
Snapshots:   0 total
Time:        2.075 s
Ran all test suites.
```

Le script exclut `src/index.js` et `src/reportWebVitals.js` de la couverture, conformement a l'enonce.

Les tests couvrent :

- les fonctions unitaires de validation dans `src/module/module.test.js` ;
- le rendu et les interactions du composant React dans `src/App.test.js` ;
- le parcours d'integration reel du formulaire jusqu'a la sauvegarde dans `localStorage` dans `src/App.test.js`.

La couverture attendue est de 100% sur les fichiers testes.

# Projet React - Formulaire d'inscription

[![codecov](https://codecov.io/gh/sqwado/ci-cd-formulaire-inscription/graph/badge.svg)](https://codecov.io/gh/sqwado/ci-cd-formulaire-inscription)

Application React de formulaire d'inscription avec validation des champs, affichage des erreurs par champ, sauvegarde des inscriptions valides dans le `localStorage` et affichage de la liste des inscrits.

## Liens utiles

| Ressource | URL |
|-----------|-----|
| Dépôt GitHub | https://github.com/sqwado/ci-cd-formulaire-inscription |
| Application déployée | https://sqwado.github.io/ci-cd-formulaire-inscription |
| Documentation JSDoc | https://sqwado.github.io/ci-cd-formulaire-inscription/docs/index.html |
| Package npm | https://www.npmjs.com/package/ci-cd-formulaire-inscription |
| Couverture Codecov | https://codecov.io/gh/sqwado/ci-cd-formulaire-inscription |

## Prérequis

- Git
- Node.js (version 18 ou supérieure recommandée)
- npm (installé avec Node.js)

## Cloner et installer le projet

```bash
git clone https://github.com/sqwado/ci-cd-formulaire-inscription.git
cd ci-cd-formulaire-inscription
npm install
```

## Lancer l'application

```bash
npm start
```

Puis ouvrir `http://localhost:3000` dans le navigateur.

Depuis l'accueil, vous pouvez accéder à :

- **Inscription** (`/register`) : formulaire avec redirection vers la liste après succès
- **Liste** (`/list`) : consultations des inscrits
- **Documentation** : lien vers la JSDoc générée (`/docs/index.html`)

## Exécuter les tests

```bash
npm run test
```

La couverture exclut `src/index.js`, `src/reportWebVitals.js` et `src/test/**`.

### Résultat des tests

Dernière exécution locale (`npm run test`) :

```text
$ npm run test

> ci-cd-formulaire-inscription@0.4.1 test
> react-scripts test --watchAll=false --coverage --collectCoverageFrom=src/**/*.{js,jsx} --collectCoverageFrom=!src/reportWebVitals.js --collectCoverageFrom=!src/index.js --collectCoverageFrom=!src/test/**

 PASS  src/module/module.test.js                                                                                                   
 PASS  src/components/RegistrationsList/RegistrationsList.test.js
 PASS  src/hooks/useToast.test.js
 PASS  src/hooks/useRegistrationForm.test.js
 PASS  src/pages/HomePage.test.js
 PASS  src/components/Toast/Toast.test.js
 PASS  src/components/PageNavigation/PageNavigation.test.js
 PASS  src/components/FormField/FormField.test.js
 PASS  src/components/NavLink/NavLink.test.js
 PASS  src/App.test.js
 PASS  src/pages/ListPage.test.js
 PASS  src/pages/RegistrationPage.test.js
----------------------------------|---------|----------|---------|---------|-------------------
File                              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------------------|---------|----------|---------|---------|-------------------
All files                         |     100 |      100 |     100 |     100 |                   
 src                              |     100 |      100 |     100 |     100 |                   
  App.js                          |     100 |      100 |     100 |     100 |                   
 src/components/FormField         |     100 |      100 |     100 |     100 |                   
  FormField.js                    |     100 |      100 |     100 |     100 |                   
 src/components/NavLink           |     100 |      100 |     100 |     100 |                   
  NavLink.js                      |     100 |      100 |     100 |     100 |                  
 src/components/PageNavigation    |     100 |      100 |     100 |     100 |                  
  PageNavigation.js               |     100 |      100 |     100 |     100 |                  
 src/components/RegistrationForm  |     100 |      100 |     100 |     100 |                  
  RegistrationForm.js             |     100 |      100 |     100 |     100 |                  
 src/components/RegistrationsList |     100 |      100 |     100 |     100 |                  
  RegistrationsList.js            |     100 |      100 |     100 |     100 |                  
 src/components/Toast             |     100 |      100 |     100 |     100 |                  
  Toast.js                        |     100 |      100 |     100 |     100 |                  
 src/constants                    |     100 |      100 |     100 |     100 |                  
  formFields.js                   |     100 |      100 |     100 |     100 |                  
  navigation.js                   |     100 |      100 |     100 |     100 |                  
 src/hooks                        |     100 |      100 |     100 |     100 |                  
  useRegistrationForm.js          |     100 |      100 |     100 |     100 |                  
  useToast.js                     |     100 |      100 |     100 |     100 |                  
 src/module                       |     100 |      100 |     100 |     100 |                  
  module.js                       |     100 |      100 |     100 |     100 |                  
 src/pages                        |     100 |      100 |     100 |     100 |                  
  HomePage.js                     |     100 |      100 |     100 |     100 |                  
  ListPage.js                     |     100 |      100 |     100 |     100 |                  
  RegistrationPage.js             |     100 |      100 |     100 |     100 |                  
----------------------------------|---------|----------|---------|---------|-------------------

Test Suites: 12 passed, 12 total
Tests:       116 passed, 116 total
Snapshots:   0 total
Time:        6.096 s
Ran all test suites.
```

Couverture : **100 %** (statements, branches, functions, lines) sur les fichiers inclus.

## Architecture

```
src/
├── module/module.js          # Validations et accès localStorage
├── constants/formFields.js   # Définition des champs du formulaire
├── hooks/
│   ├── useRegistrationForm.js
│   └── useToast.js
├── components/
│   ├── FormField/
│   ├── NavLink/
│   ├── PageNavigation/
│   ├── RegistrationForm/
│   ├── RegistrationsList/
│   └── Toast/
└── pages/
    ├── HomePage.js
    ├── RegistrationPage.js
    ├── ListPage.js
```

## Description fonctionnelle

L'utilisateur peut s'inscrire avec :

- nom
- prénom
- email
- date de naissance
- ville
- code postal

Les données valides sont sauvegardées dans le `localStorage` sous la clé `registrations`.

### Mode router (`/register` + `/list`)

Variante avec pages séparées : après une inscription valide, redirection vers la liste avec mise en évidence de la nouvelle ligne.

## Règles de validation

Les contrôles sont centralisés dans `src/module/module.js`.

- Nom, prénom et ville : lettres Unicode (accents, tréma), espaces, apostrophes et tirets ; pas de chiffres ni caractères spéciaux arbitraires.
- Email : format `utilisateur@domaine.extension`.
- Date de naissance : `YYYY-MM-DD`, `YYYY/MM/DD`, `DD/MM/YYYY` ou `DD-MM-YYYY`, avec au moins 18 ans.
- Code postal : format français métropolitain ou DOM-TOM.

## Tests

| Type | Fichiers principaux |
|------|---------------------|
| **UT** | `src/module/module.test.js`, `src/hooks/*.test.js`, `src/components/**/*.test.js` |
| **IT** | `src/pages/RegistrationPage.test.js`, `src/pages/ListPage.test.js` |

Cas couverts au minimum :

- calcul de l'âge et majorité (`calculateAge`, `isAdult`) ;
- format du code postal français ;
- format des noms/prénoms (accents, tirets, apostrophes, rejets) ;
- format de l'email ;
- désactivation du bouton si champs incomplets ou invalides ;
- sauvegarde `localStorage`, toaster de succès et champs vidés ;
- toaster d'erreur et messages sous les champs en rouge.

## Documentation

Génération locale de la JSDoc :

```bash
npm run jsdoc
```

Les fichiers sont produits dans `public/docs/` (ignorés par git, publiés sur GitHub Pages lors du build CI).

## CI/CD

Le workflow GitHub Actions (`.github/workflows/build_test_react.yml`) sur la branche `master` :

1. installe les dépendances et exécute les tests ;
2. envoie la couverture à Codecov ;
3. publie le package npm si la version locale est nouvelle ;
4. déploie l'application sur GitHub Pages.

Les tests doivent réussir avant toute publication npm ou déploiement Pages.

## Historique des versions npm

Le pipeline publie automatiquement lorsqu'une nouvelle version est détectée dans `package.json` :

- versions **patch** : `0.1.x`, `0.2.1`, `0.3.1`…
- versions **minor** : `0.2.0`, `0.3.0`…

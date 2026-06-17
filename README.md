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

Puis ouvrir `http://localhost:3000/ci-cd-formulaire-inscription` dans le navigateur.

> Le sous-chemin `/ci-cd-formulaire-inscription` est imposé par le champ `homepage` du `package.json` (déploiement GitHub Pages). Sous Docker, l'application est servie à la racine (`http://localhost:3000`) via `PUBLIC_URL=/`.

Depuis l'accueil, vous pouvez accéder à :

- **Inscription** (`/register`) : formulaire avec redirection vers la liste après succès
- **Liste** (`/list`) : consultations des inscrits
- **Documentation** : lien vers la JSDoc générée (`/docs/index.html`)

## Exécuter les tests

### Tests unitaires et d'intégration (Jest)

```bash
npm run test
```

La couverture exclut `src/index.js`, `src/reportWebVitals.js` et `src/test/**`.

Couverture actuelle : **100 %** — **115 tests** répartis sur 12 suites.

### Tests end-to-end (Cypress)

Démarrer l'application (`npm start`), puis dans un autre terminal :

```bash
npm run cypress       # interface graphique
npm run cypress:run   # mode headless (CI)
```

La `baseUrl` Cypress est dérivée de `PUBLIC_URL` dans `cypress.config.js` (par défaut : `http://localhost:3000/ci-cd-formulaire-inscription`).

Fichiers de tests :

| Fichier | Scénario |
|---------|----------|
| `cypress/e2e/spec.cy.js` | Accueil avec 1 utilisateur dans le `localStorage` |
| `cypress/e2e/registration.cy.js` | Inscription valide et inscription avec erreurs |

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

Le compteur d'inscrits affiché dans l'en-tête provient du `localStorage` (clé `registrations`). La stack Docker (MySQL + API FastAPI) est **optionnelle** et indépendante du front React — voir [DOCKER.md](./DOCKER.md).

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
| **E2E** | `cypress/e2e/spec.cy.js`, `cypress/e2e/registration.cy.js` |

Cas couverts au minimum :

- calcul de l'âge et majorité (`calculateAge`, `isAdult`) ;
- format du code postal français ;
- format des noms/prénoms (accents, tirets, apostrophes, rejets) ;
- format de l'email ;
- désactivation du bouton si champs incomplets ou invalides ;
- sauvegarde `localStorage`, redirection et mise en évidence ;
- toaster d'erreur et messages sous les champs en rouge ;
- parcours complets d'inscription via Cypress.

## Documentation

Génération locale de la JSDoc :

```bash
npm run jsdoc
```

Les fichiers sont produits dans `public/docs/` (ignorés par git, publiés sur GitHub Pages lors du build CI).

## CI/CD

Le workflow GitHub Actions (`.github/workflows/build_test_react.yml`) sur la branche `master` :

1. installe les dépendances et exécute les tests Jest ;
2. lance les tests Cypress (`cypress-io/github-action@v6`) ;
3. envoie la couverture à Codecov ;
4. publie le package npm si la version locale est nouvelle ;
5. déploie l'application sur GitHub Pages.

Un workflow Docker séparé (`.github/workflows/docker.yml`) valide la stack MySQL + API — voir [DOCKER.md](./DOCKER.md).

Les tests doivent réussir avant toute publication npm ou déploiement Pages.

## Historique des versions npm

Le pipeline publie automatiquement lorsqu'une nouvelle version est détectée dans `package.json` :

- versions **patch** : `0.1.x`, `0.2.1`, `0.3.1`…
- versions **minor** : `0.2.0`, `0.3.0`…

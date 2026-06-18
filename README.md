# Projet React - Formulaire d'inscription

[![codecov](https://codecov.io/gh/sqwado/ci-cd-formulaire-inscription/graph/badge.svg)](https://codecov.io/gh/sqwado/ci-cd-formulaire-inscription)

Application React de formulaire d'inscription avec validation des champs, affichage des erreurs par champ, et persistance via une API REST FastAPI + MySQL (`http://localhost:8000`).

## Liens utiles

| Ressource | URL |
|-----------|-----|
| Dépôt GitHub | https://github.com/sqwado/ci-cd-formulaire-inscription |
| Application déployée (front) | https://sqwado.github.io/ci-cd-formulaire-inscription |
| API déployée (back) | https://ci-cd-formulaire-inscription.vercel.app |
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
- **Liste** (`/list`) : consultations des inscrits (nom + prénom uniquement)
- **Espace admin** (`/admin/login`) : connexion, gestion et suppression des inscrits
- **Documentation** : lien vers la JSDoc générée (`/docs/index.html`)

### URLs directes sur GitHub Pages

GitHub Pages ne connaît pas les routes React (`/list`, `/register`, `/admin/...`) : sans configuration, un lien direct renvoie une 404.

Le build copie automatiquement `index.html` vers `build/404.html` (`postbuild` → `scripts/copy-spa-404.js`). GitHub Pages sert alors cette page pour toute URL inconnue et React Router affiche la bonne vue.

Fichiers concernés :

- `public/.nojekyll` — désactive Jekyll sur GitHub Pages
- `scripts/copy-spa-404.js` — génère `build/404.html` après chaque `npm run build`

Vérification locale après build :

```bash
npm run build
# build/404.html doit exister
npx --yes serve build -l 3000
# Ouvrir http://localhost:3000/ci-cd-formulaire-inscription/list
```

> En local avec `npm start`, le dev-server gère déjà le routage. Le correctif `404.html` cible le déploiement GitHub Pages.

## Exécuter les tests

### Tests unitaires et d'intégration (Jest)

```bash
npm run test
```

La couverture exclut `src/index.js`, `src/reportWebVitals.js` et `src/test/**`.

Couverture actuelle : **100 %** — **157 tests** répartis sur 17 suites.

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
| `cypress/e2e/home.cy.js` | Accueil, compteur API, navigation vers la liste |
| `cypress/e2e/registration.cy.js` | Inscription valide, formulaire invalide, validation des champs |
| `cypress/e2e/list.cy.js` | Liste vide, affichage multiple, navigation, **URL directe `/list`** |
| `cypress/e2e/admin.cy.js` | Connexion admin, détail privé, suppression |
| `cypress/e2e/api-errors.cy.js` | Erreurs GET/POST API et toasts |

Les tests E2E interceptent les appels `GET`/`POST` vers `**/users` (commande `mockUsersApi`) pour ne pas dépendre de l'API réelle en CI.

## Architecture

```
src/
├── api/api.js                # Appels axios (countUsers, fetchRegistrations, createRegistration)
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

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `REACT_APP_API_URL` | URL de base de l'API REST | `http://localhost:8000` |
| `REACT_APP_OFFLINE_MODE` | `true` = localStorage uniquement (tests Jest des pages) | `false` |

Copier `.env.example` en `.env` pour personnaliser. Jest charge `.jest/setEnvVars.js` via `setupFiles`.

Le compteur d'inscrits affiché dans l'en-tête provient de `countUsers()` via l'API. En mode offline (`REACT_APP_OFFLINE_MODE=true`), les données sont lues/écrites dans le `localStorage`. Voir [DOCKER.md](./DOCKER.md) pour lancer la stack complète.

## Description fonctionnelle

L'utilisateur peut s'inscrire avec :

- nom
- prénom
- email
- date de naissance
- ville
- code postal

Les données valides sont envoyées à l'API (`POST /users`) et persistées en base MySQL.

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
| **UT** | `src/module/module.test.js`, `src/api/api.test.js`, `src/hooks/*.test.js`, `src/components/**/*.test.js` |
| **IT** | `src/App.test.js`, `src/pages/RegistrationPage.test.js`, `src/pages/ListPage.test.js` |
| **E2E** | `cypress/e2e/home.cy.js`, `cypress/e2e/registration.cy.js`, `cypress/e2e/list.cy.js`, `cypress/e2e/api-errors.cy.js` |

Cas couverts au minimum :

- calcul de l'âge et majorité (`calculateAge`, `isAdult`) ;
- format du code postal français ;
- format des noms/prénoms (accents, tirets, apostrophes, rejets) ;
- format de l'email ;
- désactivation du bouton si champs incomplets ou invalides ;
- appels API mockés avec `jest.mock('axios')` (succès et erreurs) ;
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
2. build l'app (`404.html` inclus) et lance les tests Cypress ;
3. envoie la couverture à Codecov ;
4. publie le package npm si la version locale est nouvelle ;
5. déploie l'application sur **GitHub Pages**.

Workflows complémentaires :

- `.github/workflows/docker.yml` — stack MySQL / Adminer / API / React + tests infra et E2E Docker ;
- `.github/workflows/production.yml` — déploiement de l'API sur **Vercel** (région `cdg1`).

Voir [DOCKER.md](./DOCKER.md) pour la stack locale.

Les tests doivent réussir avant toute publication npm ou déploiement Pages.

## Historique des versions npm

Le pipeline publie automatiquement lorsqu'une nouvelle version est détectée dans `package.json` :

- versions **patch** : `0.1.x`, `0.2.1`, `0.3.1`…
- versions **minor** : `0.2.0`, `0.3.0`…

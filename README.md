# Projet React — Formulaire d'inscription (2ᵉ projet individuel)

[![codecov](https://codecov.io/gh/sqwado/ci-cd-formulaire-inscription/graph/badge.svg)](https://codecov.io/gh/sqwado/ci-cd-formulaire-inscription)

Application React avec formulaire d'inscription, persistance **MySQL** via une API **FastAPI**, espace **admin** (JWT), stack **Docker** complète et pipelines **GitHub Actions** (tests + déploiement GitHub Pages + Vercel).

## Liens utiles

| Ressource | URL |
|-----------|-----|
| Dépôt GitHub | https://github.com/sqwado/ci-cd-formulaire-inscription |
| Application déployée (front) | https://sqwado.github.io/ci-cd-formulaire-inscription |
| API déployée (back) | https://ci-cd-formulaire-inscription.vercel.app |
| Documentation JSDoc | https://sqwado.github.io/ci-cd-formulaire-inscription/docs/index.html |
| Package npm | https://www.npmjs.com/package/ci-cd-formulaire-inscription |
| Couverture Codecov | https://codecov.io/gh/sqwado/ci-cd-formulaire-inscription |

## Conformité au sujet

| Critère (notation) | Implémentation | État |
|--------------------|----------------|------|
| Tests UT/IT + couverture (4 pts) | Jest — **177 tests**, **100 %** couverture + **14 tests** API Python | ✅ |
| Architecture Docker mysql/python/adminer/react (4 pts) | `docker-compose.yml` — 4 services healthy | ✅ |
| Tests d'infrastructure (4 pts) | `docker.yml` — healthchecks + `curl` API/login/React/Adminer | ✅ |
| Tests E2E Cypress (4 pts) | 8 specs (mock, Docker, offline, admin) | ✅ |
| Pipeline CI/CD + déploiement prod (4 pts) | Pages + Vercel + MySQL Alwaysdata | ✅ |
| Projet final Zero Touch (Master 2) | `deploy.yml` — Terraform + Ansible + AWS | ✅ |

### Fonctionnalités

- **Inscription** : formulaire validé → `POST /users` → MySQL (plus de localStorage en mode normal)
- **Liste publique** : nom + prénom uniquement (`GET /users`)
- **Admin** : login JWT, détail privé (`GET /users/{id}`), suppression (`DELETE /users/{id}`)
- **Seed admin** : `ADMIN_EMAIL` / `ADMIN_PASSWORD` au démarrage API (`loise.fenoll@ynov.com` / `PvdrTAzTeR247sDnAZBr`)

## Prérequis

- Git, Node.js 18+
- Docker + Docker Compose (stack complète)
- npm

## Installation

```bash
git clone https://github.com/sqwado/ci-cd-formulaire-inscription.git
cd ci-cd-formulaire-inscription
npm install
cp .env.example .env
```

## Lancer l'application

### Front seul (dev)

```bash
npm start
```

Ouvrir `http://localhost:3000/ci-cd-formulaire-inscription` (sous-chemin imposé par `homepage` pour GitHub Pages).

### Stack Docker complète (recommandé)

```bash
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| React | http://localhost:3000 |
| API | http://localhost:8000 |
| Adminer | http://localhost:8080 |

Voir [DOCKER.md](./DOCKER.md) pour le détail (variables, API, admin, CI Docker).

### Pages de l'application

| Route | Description |
|-------|-------------|
| `/` | Accueil, compteur d'inscrits |
| `/register` | Formulaire d'inscription |
| `/list` | Liste publique (nom + prénom) |
| `/admin/login` | Connexion administrateur |
| `/admin/users` | Gestion des inscrits |
| `/admin/users/:id` | Détail privé + suppression |
| `*` (autre) | Page 404 — « Page introuvable » |

### URLs directes sur GitHub Pages

GitHub Pages ne connaît pas les routes React. Le build copie `index.html` → `build/404.html` (`postbuild` → `scripts/copy-spa-404.js`) pour que les sous-URLs connues (`/list`, `/register`, `/admin/...`) chargent l'application.

Une fois l'app démarrée, **React Router** affiche la bonne page pour les routes gérées, ou `NotFoundPage` (message 404) pour toute URL non définie (`/page-inexistante`, `/admin`, etc.).

Fichiers : `public/.nojekyll`, `scripts/copy-spa-404.js`, `src/pages/NotFoundPage.js`.

```bash
npm run build
# build/404.html doit exister
```

## Tests

### Tests unitaires et d'intégration (Jest)

```bash
npm test
```

**177 tests** Jest, **20 suites**, **100 %** de couverture front.  
**14 tests** pytest sur l'API (`server/test_serveur.py`).  
**1 test** Node sur le script `copy-spa-404.js`.

| Type | Fichiers |
|------|----------|
| UT | `module.test.js`, `api.test.js`, `hooks/*.test.js`, `components/**/*.test.js`, `constants/navigation.test.js` |
| IT | `App.test.js` (toutes les routes + 404), `pages/*.test.js` |

```bash
npm test              # Jest + script build
npm run test:server   # pytest API
```

### Tests end-to-end (Cypress)

```bash
npm start          # terminal 1
npm run cypress    # ou npm run cypress:run
```

| Fichier | Scénario |
|---------|----------|
| `routing.cy.js` | URLs directes gérées + page 404 pour routes inconnues |
| `home.cy.js` | Accueil, compteur, navigation |
| `registration.cy.js` | Inscription valide / invalide, URL directe `/register` |
| `list.cy.js` | Liste compacte (sans email), URL directe `/list` |
| `admin.cy.js` | Garde admin, login/logout, suppression, URL directe |
| `api-errors.cy.js` | Erreurs API et toasts |
| `docker-integration.cy.js` | Stack Docker, API réelle, données privées admin |
| `offline-sync.cy.js` | Synchronisation hors-ligne |
| `offline-network.cy.js` | Réseau coupé |

> Les intercepts Cypress ciblent l'URL API exacte (`REACT_APP_API_URL`) pour ne pas confondre `/admin/users` (front) avec `/users` (API).

En CI mock (`build_test_react.yml`) : `api-errors`, `home`, `list`, `registration`, `admin`, `routing`.

## Architecture

```
src/
├── api/api.js                 # axios : users, login admin, delete
├── module/module.js           # validations (+ localStorage mode offline)
├── pages/
│   ├── HomePage.js
│   ├── RegistrationPage.js
│   ├── ListPage.js            # liste compacte (nom + prénom)
│   ├── AdminLoginPage.js
│   ├── AdminUsersPage.js
│   ├── AdminUserDetailPage.js
│   └── NotFoundPage.js        # routes inconnues
├── components/AdminRoute/     # protection routes admin
└── ...
server/serveur.py              # FastAPI + MySQL + JWT
db/migration-v00*.sql          # schéma users + admins
docker-compose.yml             # db, adminer, server, react
```

### Variables d'environnement

| Variable | Description | Défaut local |
|----------|-------------|--------------|
| `REACT_APP_API_URL` | URL API | `http://localhost:8000` |
| `REACT_APP_OFFLINE_MODE` | `true` = file d'attente mémoire (tests offline) | `false` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin API | voir sujet |
| `JWT_SECRET` | Signature JWT | à changer en prod |
| `MYSQL_*` | Connexion MySQL | voir `.env.example` |

## Règles de validation

Centralisées dans `src/module/module.js` :

- Nom, prénom, ville : lettres Unicode, espaces, apostrophes, tirets
- Email : format valide
- Date de naissance : formats acceptés, majorité (18 ans)
- Code postal : format français métropolitain / DOM-TOM

## Déploiement Zero Touch (AWS)

Projet final **Industrialisation & Automatisation** : déploiement complet sur AWS (région `eu-west-3`) sans connexion SSH humaine, orchestré par un seul workflow GitHub Actions.

Documentation détaillée : [ARCHITECTURE.md](./ARCHITECTURE.md) · livrable : [rendu.txt](./rendu.txt) · secrets : [.env.sample](./.env.sample)

### Principe

Deux EC2 distinctes sont provisionnées par **Terraform**, configurées par **Ansible**, et reliées par la pipeline :

| EC2 | Dossier | Rôle |
|-----|---------|------|
| Registry | `infra/registry/` | Registry Docker privé (Nginx HTTPS, auth htpasswd) |
| Application | `infra/app/` | Frontend, API FastAPI, MySQL, Adminer |

La pipeline construit les images (`infra/docker/`), les pousse sur le registry privé, puis déploie la stack applicative.

### Dossier `registry/` à la racine

Le dépôt contient **deux emplacements** pour le registry Docker :

| Dossier | Usage |
|---------|--------|
| [`registry/`](./registry/) | **Module autonome** (TP / phase 1) — Terraform + Ansible utilisables en local, hors pipeline, pour provisionner et configurer le registry seul |
| [`infra/registry/`](./infra/registry/) | **Version intégrée CI/CD** — utilisée par `deploy.yml`, secrets GitHub, inventaire dynamique, cloud-init, nettoyage des orphelins AWS |

Les templates Docker (Nginx, `docker-compose`) sont identiques ; la différence principale est que `infra/registry/` lit `REGISTRY_USERNAME` / `REGISTRY_PASSWORD` depuis les secrets (pas de mot de passe en dur), et expose les outputs Terraform attendus par la pipeline (`ansible_inventory`, clé SSH volatile).

> Ne pas mélanger les deux stacks sur le même compte AWS sans `terraform destroy` préalable : les noms de ressources diffèrent (`registry-key-terraform` vs `ci-inscription-registry-key`).

### Lancer le déploiement

1. Configurer les **GitHub Secrets** listés dans [`.env.sample`](./.env.sample) (AWS, registry, MySQL, admin, JWT). **Ne jamais committer les clés AWS.**
2. GitHub Actions → workflow **Deploy** → **Run workflow**
3. Choisir le scope :
   - **`full`** — registry + application + build images (premier run ou reset complet)
   - **`application`** — rebuild images + redéploiement app (registry déjà en place)

À la fin, la pipeline valide l'API, le login admin, le frontend et Adminer (`curl`), puis met à jour [`rendu.txt`](./rendu.txt) avec les IPs publiques.

### Structure infrastructure

```
registry/              # TP registry autonome (Terraform + Ansible)
infra/
├── registry/          # Registry — version pipeline
├── app/               # EC2 applicative (Terraform + Ansible)
├── docker/            # Dockerfiles production (CI)
└── scripts/           # cleanup-orphans, generate-rendu
.github/workflows/
└── deploy.yml         # workflow_dispatch — déploiement Zero Touch
```

## CI/CD

Quatre workflows sur `master` :

### `.github/workflows/build_test_react.yml`

1. Tests Jest + couverture Codecov
2. Build React (`404.html` inclus) + Cypress (mock API)
3. Publication npm si nouvelle version
4. Déploiement **GitHub Pages**

### `.github/workflows/docker.yml`

1. Build/push images Docker Hub (`frontend`, `backend`)
2. `docker compose up` — 4 services healthy
3. Tests d'infrastructure (`curl`)
4. Cypress E2E sur stack réelle + tests offline

### `.github/workflows/production.yml`

1. Tests Jest
2. Build et déploiement API sur **Vercel** (`cdg1`, MySQL Alwaysdata via secrets)

### `.github/workflows/deploy.yml` (Zero Touch)

1. Terraform → EC2 registry + EC2 application
2. Ansible → registry HTTPS (Nginx, certificat auto-signé)
3. Build & push images `backend` / `frontend` sur le registry privé
4. Ansible → pull images, `docker compose up` sur l'EC2 applicative
5. Validation `curl` + génération de `rendu.txt`

Voir la section [Déploiement Zero Touch](#déploiement-zero-touch-aws) et [`.env.sample`](./.env.sample) pour la liste complète des secrets.

### Secrets GitHub

| Secret | Workflow |
|--------|----------|
| `CODECOV_TOKEN` | Couverture |
| `NPM_TOKEN`, `USER_EMAIL`, `USER_NAME` | Publication npm |
| `REACT_APP_API_URL` | Build Pages → API prod |
| `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` | Images Docker |
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | Déploiement API |
| `AWS_*`, `REGISTRY_*`, `MYSQL_*`, `ADMIN_*`, `JWT_SECRET` | **Deploy** (Zero Touch AWS) |
| Variables MySQL/admin | Vercel dashboard + secrets |

MySQL production (Pages/Vercel) : **Alwaysdata** (variables dans Vercel, pas dans `.env` local).  
MySQL Zero Touch : instance MySQL dans le `docker-compose` de l'EC2 applicative (secrets GitHub).

## Documentation JSDoc

```bash
npm run jsdoc
```

Sortie dans `public/docs/` (publiée sur Pages lors du build CI).

## Vérification locale (état au 18/06/2026)

| Vérification | Résultat |
|--------------|----------|
| `npm test` | 177/177 Jest ✅ + script build ✅ |
| `npm run test:server` | 14/14 pytest API ✅ |
| `npm run build` | ✅, `build/404.html` généré |
| Docker `compose ps` | db, adminer, server, react — healthy ✅ |
| API locale `GET /users` + login admin | ✅ |
| API prod Vercel | ✅ |
| GitHub Pages `/` + `404.html` | ✅ |
| GitHub Pages sous-URLs (`/list`, `/admin/login`) | SPA via `404.html` ✅ |

## Historique des versions npm

Publication automatique si la version dans `package.json` est nouvelle (actuellement `0.5.0`).

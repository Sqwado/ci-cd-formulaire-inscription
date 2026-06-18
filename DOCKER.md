# Docker — stack complète

Architecture **MySQL / Adminer / API Python (FastAPI) / React** pour le 2ᵉ projet individuel Ynov.

Le front React persiste les inscriptions via l'API (`POST /users`) et affiche la liste publique (nom + prénom). L'espace admin permet de consulter les données privées et de supprimer un inscrit.

## Prérequis

- Docker et Docker Compose
- Fichier `.env` à la racine (copier depuis `.env.example`)

```bash
cp .env.example .env
```

> **Piège local :** ne pas décommenter la section Alwaysdata dans `.env`. Ces variables écraseraient `MYSQL_DATABASE=ynov_ci` et le healthcheck MySQL échouerait.

## Démarrage

```bash
docker compose build
docker compose up -d
docker compose ps          # les 4 services doivent être healthy
docker compose logs -f server
docker compose down -v     # arrêt + suppression des volumes
```

## Services

| Service | Image / build | URL | Rôle |
|---------|---------------|-----|------|
| **db** | `mysql:9.7` | interne | Base `ynov_ci`, migrations SQL au premier démarrage (`./db`) |
| **adminer** | `adminer` | http://localhost:8080 | Interface web MySQL |
| **server** | `./server/Dockerfile` | http://localhost:8000 | API REST FastAPI |
| **react** | `./react/DockerfileNodejs` | http://localhost:3000 | Front React (`PUBLIC_URL=/`) |

Connexion Adminer : système **MySQL**, serveur **db**, utilisateur **root**, mot de passe `MYSQL_ROOT_PASSWORD`, base `ynov_ci`.

## Administrateur (seed)

Au démarrage de l'API, si la table `admins` est vide, un compte est créé à partir des variables d'environnement :

| Variable | Valeur (sujet) |
|----------|----------------|
| `ADMIN_EMAIL` | `loise.fenoll@ynov.com` |
| `ADMIN_PASSWORD` | `PvdrTAzTeR247sDnAZBr` |

Migration : `db/migration-v005.sql`.

## Contrat API

### Public

**GET `/users`** — liste réduite (sans email ni données sensibles) :

```json
{ "users": [{ "id": 1, "prenom": "Jean", "nom": "Dupont" }] }
```

**POST `/users`** — création d'un inscrit (corps complet), réponse `201` avec l'utilisateur créé.

### Admin (JWT Bearer)

**POST `/auth/login`** — `{ "email", "password" }` → `{ "token", "email" }`

**GET `/users/{id}`** — détail privé (email, date de naissance, ville, code postal).

**DELETE `/users/{id}`** — suppression, réponse `204`.

### Vérification infra (locale ou CI)

```bash
curl -fsS http://localhost:8000/users | jq .
curl -fsS -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"loise.fenoll@ynov.com","password":"PvdrTAzTeR247sDnAZBr"}' | jq .
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:8080/
```

## Variables d'environnement

| Variable | Local (Docker) | Production |
|----------|------------------|------------|
| `MYSQL_ROOT_PASSWORD` | `.env` | — |
| `MYSQL_DATABASE` | `ynov_ci` | Alwaysdata |
| `MYSQL_USER` | `root` | Alwaysdata |
| `MYSQL_PASSWORD` | vide (= root) | Alwaysdata |
| `MYSQL_HOST` | `db` | Alwaysdata host |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `.env` | Vercel env vars |
| `JWT_SECRET` | `.env` | Vercel env vars |
| `REACT_APP_API_URL` | `http://localhost:8000` | URL Vercel (secret GitHub Pages) |

## Pipeline CI — `.github/workflows/docker.yml`

Sur chaque push / PR vers `master` :

1. **Build Docker Hub** (push uniquement) — images `frontend` et `backend`
2. **Docker Compose** — démarrage des 4 services
3. **Tests d'infrastructure** — healthchecks + `curl` API / React / Adminer / login admin
4. **Tests unitaires API** — `pytest server/test_serveur.py`
5. **Cypress E2E Docker** — `cypress/e2e/docker-integration.cy.js` (API réelle)
6. **Cypress offline** — `offline-sync.cy.js`, `offline-network.cy.js`

### Secrets GitHub requis

| Secret | Usage |
|--------|-------|
| `DOCKERHUB_USERNAME` | Publication des images |
| `DOCKERHUB_TOKEN` | Token Docker Hub |

## Production

| Composant | Hébergement |
|-----------|-------------|
| MySQL | **Alwaysdata** |
| API | **Vercel** (région `cdg1`, workflow `production.yml`) |
| Front | **GitHub Pages** (workflow `build_test_react.yml`) |

Secrets Vercel / GitHub : voir `.env.example` (section Alwaysdata et Vercel).

Le front en production appelle l'API via `REACT_APP_API_URL` (secret `REACT_APP_API_URL` dans GitHub Actions).

## Différences local vs production

| | Docker / `npm start` local | GitHub Pages |
|--|---------------------------|--------------|
| URL front | `http://localhost:3000` ou `/ci-cd-formulaire-inscription` | `https://sqwado.github.io/ci-cd-formulaire-inscription` |
| `PUBLIC_URL` | `/` (Docker) ou sous-chemin (CRA) | `/ci-cd-formulaire-inscription` |
| API | `http://localhost:8000` | `https://ci-cd-formulaire-inscription.vercel.app` |
| Routage SPA | dev-server ou `serve.json` (CI) | `build/404.html` (voir README) |

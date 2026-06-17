# Docker

Stack MySQL + API FastAPI + React. Le front React appelle l'API locale (`http://localhost:8000`) pour lister et créer des inscriptions.

Prérequis : fichier `.env` à la racine (voir `.env.example`).

### Secrets GitHub (pipeline Docker)

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Nom d'utilisateur Docker Hub |
| `DOCKERHUB_TOKEN` | Token d'accès créé sur [hub.docker.com](https://hub.docker.com) |

Le workflow `.github/workflows/docker.yml` publie `username/frontend` et `username/backend`, puis lance `docker compose` et vérifie que les 4 services (`db`, `adminer`, `server`, `react`) sont `healthy`.

```bash
docker compose -f docker-compose.yml build
docker compose up -d
docker compose up -d --build
docker compose ps
docker compose down -v
```

### Images (build via compose)

| Service | Dockerfile | Image | Volumes montés |
|---------|------------|-------|----------------|
| **server** | `./server/Dockerfile` | `server` | dossier `./server` monté sur `/server` |
| **react** | `./react/DockerfileNodejs` | `react` | projet monté sur `/app` (+ `node_modules` préservé) |

| Service | URL |
|---------|-----|
| React | http://localhost:3000 (`PUBLIC_URL=/`) |
| API | http://localhost:8000/users |
| Adminer | http://localhost:8080 |

### Contrat API

**GET `/users`** → `{ "users": [{ "id", "prenom", "nom", "email", "dateOfBirth", "ville", "codePostal" }] }`

**POST `/users`** → corps identique (sans `id`), réponse `201` avec l'utilisateur créé.

> Sous Docker, React est servi à la racine (`PUBLIC_URL=/`). En local via `npm start`, l'URL inclut le sous-chemin GitHub Pages (`/ci-cd-formulaire-inscription`). L'API est toujours joignable sur `http://localhost:8000` depuis le navigateur.

# Docker

Prérequis : fichier `.env` à la racine.

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
| React | http://localhost:3000 |
| API | http://localhost:8000/users |
| Adminer | http://localhost:8080 |

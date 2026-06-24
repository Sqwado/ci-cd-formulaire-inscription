# Architecture — Déploiement automatisé

## Vue d'ensemble

Le projet repose sur **deux EC2 AWS distinctes**, provisionnées par Terraform et configurées par Ansible, orchestrées par le workflow GitHub Actions `deploy.yml` (déclenchement manuel).

```mermaid
flowchart TB
    subgraph GHA["GitHub Actions — deploy.yml"]
        TF1[Terraform registry]
        AN1[Ansible registry]
        TF2[Terraform app]
        BUILD[Build images front/back]
        PUSH[Push registry :443]
        AN2[Ansible app]
        CURL[curl validation]
    end

    subgraph EC2R["EC2 Registry — t3.micro"]
        NGX[Nginx :443 SSL]
        REG[registry:2]
        UI[docker-registry-ui]
    end

    subgraph EC2A["EC2 Application — t3.micro"]
        FE[Frontend nginx :3000]
        BE[FastAPI :8000]
        DB[(MySQL)]
        ADM[Adminer :8080]
    end

    GHA --> EC2R
    GHA --> EC2A
    PUSH --> REG
    AN2 --> FE
    AN2 --> BE
    BE --> DB
    ADM --> DB
```

## EC2 Registry (`infra/registry/`)

| Composant | Rôle |
|-----------|------|
| **Terraform** | EC2 `t3.micro`, clé SSH, security group (22, 80, 443) |
| **Ansible** | Docker, certificat SSL auto-signé, Nginx, registry + UI |
| **Nginx** | Terminaison HTTPS, routage `/v2/` → registry, `/` → UI |
| **Ports publics** | 22 (SSH), 80 (redirect HTTPS), 443 (registry + UI) |
| **Port 5000** | Interne uniquement (non exposé sur internet) |

## EC2 Application (`infra/app/`)

| Composant | Rôle |
|-----------|------|
| **Terraform** | EC2 `t3.micro`, clé SSH, security group (22, 3000, 8000, 8080) |
| **Ansible** | Docker, login registry, pull images, `docker compose up` |
| **Services** | MySQL, Adminer, FastAPI, React (nginx) |
| **Images** | Tirées du registry privé (`<REGISTRY_IP>:443/inscription/...`) |

## Pipeline CI/CD (`/.github/workflows/deploy.yml`)

Déclenchement : **`workflow_dispatch`** (manuel, Zero Touch — aucune connexion SSH humaine).

| Étape | Action |
|-------|--------|
| 1 | `terraform apply` → EC2 registry |
| 2 | `terraform apply` → EC2 application |
| 3 | Génération `inventory.ini` (outputs Terraform : IP + clé SSH volatile) |
| 4 | Ansible → déploiement registry sécurisé (Nginx HTTPS, auth) |
| 5 | Build & push `backend` et `frontend` sur le registry privé |
| 6 | Ansible → login registry, pull images, `docker compose up` |
| 7 | `curl` de validation (API, auth admin, frontend, Adminer) |

> **Note :** l'ordre Build/Terraform du sujet est respecté fonctionnellement : le registry doit exister avant le `docker push`. Le state Terraform est conservé via artifacts GitHub entre les runs (évite de recréer les EC2 à chaque exécution). Un premier run `full` sans artifact recrée toute l'infrastructure.

## Sécurité

- Tous les identifiants passent par **GitHub Secrets** (voir `.env.sample`).
- Aucun mot de passe en dur dans les playbooks (variables d'environnement).
- Registry derrière **HTTPS** (certificat auto-signé).
- API registry non exposée directement (Nginx reverse proxy).

## Structure `infra/`

```
infra/
├── registry/
│   ├── main.tf
│   ├── playbook.yml
│   └── templates/
├── app/
│   ├── main.tf
│   ├── playbook.yml
│   └── templates/
└── docker/
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    └── nginx-frontend.conf
```

## Déploiement local du registry (hors CI)

Sous Windows, utiliser Ansible via Docker :

```bash
cd infra/registry
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "$(pwd -W):/ansible" -w /ansible \
  -e REGISTRY_USERNAME -e REGISTRY_PASSWORD \
  cytopia/ansible:latest \
  sh -c "apk add --no-cache openssh-client && chmod 400 registry-key-terraform.pem && ansible-playbook -i inventory.ini playbook.yml"
```

Générer `inventory.ini` après Terraform :

```bash
terraform output -raw ansible_inventory > inventory.ini
```

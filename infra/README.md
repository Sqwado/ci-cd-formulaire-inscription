# Infrastructure de déploiement

Ce dossier contient toute l'infrastructure du projet final (registry + application).

## Arborescence

- `registry/` — EC2 registry Docker privé (Terraform + Ansible)
- `app/` — EC2 applicative (Terraform + Ansible)
- `docker/` — Dockerfiles de production pour la CI

## Démarrage rapide

1. Configurer les secrets GitHub (voir [`.env.sample`](../.env.sample) à la racine).
2. Lancer le workflow **Deploy** depuis GitHub Actions (`workflow_dispatch`).

## Relation avec `registry/` à la racine

- [`../registry/`](../registry/) — module **autonome** (TP phase registry) : Terraform + Ansible exécutables en local, sans la pipeline complète.
- [`registry/`](./registry/) — même rôle, mais **branché sur `deploy.yml`** (secrets GitHub, outputs `ansible_inventory`, cloud-init).

Les deux partagent les mêmes templates Nginx / docker-compose ; seul `infra/registry/` est invoqué par la CI.

## Déploiement manuel (développement)

```bash
# Registry
cd infra/registry
terraform init && terraform apply
terraform output -raw ansible_inventory > inventory.ini
REGISTRY_USERNAME=admin REGISTRY_PASSWORD=<secret> ansible-playbook -i inventory.ini playbook.yml

# Application (après build/push des images)
cd infra/app
terraform init && terraform apply
terraform output -raw ansible_inventory > inventory.ini
# Exporter REGISTRY_HOST, REGISTRY_USERNAME, REGISTRY_PASSWORD, MYSQL_*, ADMIN_*, JWT_SECRET
ansible-playbook -i inventory.ini playbook.yml
```

Pour tester **uniquement** le registry hors pipeline :

```bash
cd registry   # à la racine du dépôt
terraform init && terraform apply
# Créer inventory.ini manuellement ou compléter les outputs Terraform
ansible-playbook -i inventory.ini playbook.yml
```

> Le playbook racine utilise des identifiants de démo (`admin` / `admin123`) — réservé au TP local. En production CI, utiliser `infra/registry/` avec les secrets GitHub.

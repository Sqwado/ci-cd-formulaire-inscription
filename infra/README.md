# Infrastructure de déploiement

Ce dossier contient toute l'infrastructure du projet final (registry + application).

## Arborescence

- `registry/` — EC2 registry Docker privé (Terraform + Ansible)
- `app/` — EC2 applicative (Terraform + Ansible)
- `docker/` — Dockerfiles de production pour la CI

## Démarrage rapide

1. Configurer les secrets GitHub (voir `.env.example` à la racine).
2. Lancer le workflow **Deploy** depuis GitHub Actions (`workflow_dispatch`).

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

> Le dossier `registry/` à la racine est l'ancienne version du TP ; la référence officielle est `infra/registry/`.

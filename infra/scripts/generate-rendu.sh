#!/usr/bin/env bash
# Génère rendu.txt à partir des IPs Terraform (app + registry).
set -euo pipefail

APP_IP="${1:?APP_IP requis}"
REGISTRY_IP="${2:?REGISTRY_IP requis}"
REPO_URL="${3:-https://github.com/Sqwado/ci-cd-formulaire-inscription}"

cat > rendu.txt <<EOF
# Livrable — Projet Final Zero Touch
# Généré automatiquement par la pipeline Deploy (ne pas éditer à la main).

Repository GitHub :
${REPO_URL}

IP publique — Application (Frontend / API / Adminer) :
http://${APP_IP}:3000
http://${APP_IP}:8000
http://${APP_IP}:8080

IP publique — Registry Docker privé (HTTPS) :
https://${REGISTRY_IP}
(UI : https://${REGISTRY_IP}/ — API registry : https://${REGISTRY_IP}:443/v2/)

# Connexion au registry Docker :
#   docker login ${REGISTRY_IP}:443
#   Utilisateur : secret GitHub REGISTRY_USERNAME (voir .env.sample)
#   Mot de passe  : secret GitHub REGISTRY_PASSWORD (voir .env.sample)
#
# NE PAS committer vos clés AWS ni vos mots de passe.
EOF

echo "rendu.txt généré (app=${APP_IP}, registry=${REGISTRY_IP})"

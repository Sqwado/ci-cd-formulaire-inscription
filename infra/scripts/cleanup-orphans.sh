#!/usr/bin/env bash
# Supprime les ressources AWS orphelines quand le state Terraform est perdu.
set -euo pipefail

TARGET="${1:-registry}"

case "$TARGET" in
  registry)
    KEY_NAME="ci-inscription-registry-key"
    SG_NAME="ci-inscription-registry-sg"
    INSTANCE_TAG="CI-Inscription-Registry-Server"
    ;;
  app)
    KEY_NAME="ci-inscription-app-key"
    SG_NAME="ci-inscription-app-sg"
    INSTANCE_TAG="CI-Inscription-App-Server"
    ;;
  *)
    echo "Usage: $0 registry|app"
    exit 1
    ;;
esac

echo "Cleaning orphaned resources for: $TARGET"

INSTANCE_IDS=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=${INSTANCE_TAG}" \
            "Name=instance-state-name,Values=pending,running,stopping,stopped" \
  --query 'Reservations[].Instances[].InstanceId' \
  --output text || true)

if [ -n "${INSTANCE_IDS}" ] && [ "${INSTANCE_IDS}" != "None" ]; then
  echo "Terminating instances: ${INSTANCE_IDS}"
  aws ec2 terminate-instances --instance-ids ${INSTANCE_IDS}
  aws ec2 wait instance-terminated --instance-ids ${INSTANCE_IDS}
fi

VPC_ID=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].VpcId' --output text)

SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=${SG_NAME}" "Name=vpc-id,Values=${VPC_ID}" \
  --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)

if [ -n "${SG_ID}" ] && [ "${SG_ID}" != "None" ]; then
  echo "Deleting security group: ${SG_ID}"
  aws ec2 delete-security-group --group-id "${SG_ID}" || true
fi

if aws ec2 describe-key-pairs --key-names "${KEY_NAME}" >/dev/null 2>&1; then
  echo "Deleting key pair: ${KEY_NAME}"
  aws ec2 delete-key-pair --key-name "${KEY_NAME}"
fi

echo "Cleanup complete for ${TARGET}"

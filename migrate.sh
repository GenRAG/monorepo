#!/bin/bash

CONTAINER_NAME="server"

RESET=false
MIGRATION_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -reset|--reset)
      RESET=true
      shift
      ;;
    -h|--help)
      echo "Usage: ./migrate.sh [-reset] <migration_name>"
      exit 0
      ;;
    -*)
      echo "Unknown option: $1"
      exit 1
      ;;
    *)
      if [ -z "$MIGRATION_NAME" ]; then
        MIGRATION_NAME="$1"
      else
        echo "Ignoring extra argument: $1"
      fi
      shift
      ;;
  esac
done

if [ -z "$MIGRATION_NAME" ]; then
  echo "Usage: ./migrate.sh [-reset] <migration_name>"
  exit 1
fi

echo "Running Prisma migration '$MIGRATION_NAME' in container '$CONTAINER_NAME'..."

if [ "$RESET" = true ]; then
  echo "Reset flag detected — resetting database before running migrations..."
  docker exec -it "$CONTAINER_NAME" sh -c "yarn prisma migrate reset --force"
fi

docker exec -it "$CONTAINER_NAME" sh -c "yarn prisma migrate dev --name \"$MIGRATION_NAME\""

echo "Migration completed."

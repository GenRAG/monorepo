#!/bin/bash

MODE=$1

if [ "$MODE" = "clean" ]; then
  echo "Full clean (containers + volumes + rebuild)"
  docker compose down -v
  docker compose build --no-cache
  docker compose up

elif [ "$MODE" = "build" ]; then
  echo "Rebuild images"
  docker compose build

elif [ "$MODE" = "rebuild" ]; then
  echo "Rebuild + restart"
  docker compose down
  docker compose up --build

elif [ "$MODE" = "deps" ]; then
  echo "Rebuild after dependency change (no cache)"
  docker compose build --no-cache
  docker compose up

elif [ "$MODE" = "e2e" ]; then
  echo "Run e2e tests"
  docker compose up -d postgres_test
  sleep 5
  docker exec server bash -lc "DATABASE_URL='postgres://admin:password@postgres_test:5432/database_test' yarn migrate:test"
  docker exec -it server bash -lc "DATABASE_URL='postgres://admin:password@postgres_test:5432/database_test' yarn test:e2e"

elif [ "$MODE" = "unit" ] || [ "$MODE" = "test:unit" ]; then
  echo "Run unit tests"
  docker compose up -d server
  docker exec -it server yarn test --runInBand

else
  echo "Simple start"
  docker compose up
fi
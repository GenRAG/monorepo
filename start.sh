#!/bin/bash

cd plateform_front || { echo "Le dossier plateform_front n'existe pas"; exit 1; }

echo "Démarrage du front..."
yarn dev &

FRONT_PID=$!

cd ..

echo "Démarrage de Docker Compose..."
docker compose up

#!/bin/bash
# Script pour créer le repo GitHub et push le code

echo "🚀 Création du repo GitHub..."

gh repo create Roullioo/x402-solana-paywall \
  --public \
  --description "Autonomous AI agent for HTTP 402 micropayments on Solana" \
  --source=. \
  --remote=origin \
  --push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Repo créé et code pushé avec succès!"
  echo "🌐 Voir le repo: https://github.com/Roullioo/x402-solana-paywall"
else
  echo ""
  echo "❌ Erreur lors de la création du repo"
  echo "💡 Assure-toi d'être authentifié: gh auth login"
fi

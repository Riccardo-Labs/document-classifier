#!/usr/bin/env bash
# Avvia backend e frontend in due terminali separati (Git Bash / macOS / Linux)

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Backend
cd "$ROOT/backend"
if [ ! -d ".venv" ]; then
  echo "[backend] Creo virtualenv..."
  python -m venv .venv
  source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate
  pip install -r requirements.txt
else
  source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate
fi

echo "[backend] Avvio su http://localhost:8000 ..."
uvicorn main:app --reload &
BACKEND_PID=$!

# Frontend
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
  echo "[frontend] Installo dipendenze npm..."
  npm install
fi

echo "[frontend] Avvio su http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "  Backend  → http://localhost:8000"
echo "  Frontend → http://localhost:5173"
echo "  API docs → http://localhost:8000/docs"
echo ""
echo "  Premi Ctrl+C per fermare entrambi."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" INT
wait

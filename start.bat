@echo off
REM Avvia backend e frontend in due finestre CMD separate (Windows)

SET ROOT=%~dp0

REM Backend
IF NOT EXIST "%ROOT%backend\.venv" (
    echo [backend] Creo virtualenv...
    cd /d "%ROOT%backend"
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
)

start "Backend - FastAPI" cmd /k "cd /d %ROOT%backend && call .venv\Scripts\activate.bat && uvicorn main:app --reload"

REM Frontend
IF NOT EXIST "%ROOT%frontend\node_modules" (
    echo [frontend] Installo dipendenze npm...
    cd /d "%ROOT%frontend"
    npm install
)

start "Frontend - Vite" cmd /k "cd /d %ROOT%frontend && npm run dev"

echo.
echo   Backend  -^> http://localhost:8000
echo   Frontend -^> http://localhost:5173
echo   API docs -^> http://localhost:8000/docs
echo.
echo   Chiudi le due finestre per fermare i server.

@echo off
title HuwiyaTech Platform
color 0B
echo.
echo  ================================================
echo    HUWIYATECH - Demarrage automatique
echo  ================================================
echo.

REM ── Verifier que l'installation a ete faite ───────────────────────────────────
if not exist "%~dp0node_modules" (
    color 0C
    echo  [ERREUR] Les dependances ne sont pas installees.
    echo  Lancez d'abord install.bat !
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0.env" (
    color 0C
    echo  [ERREUR] Fichier .env manquant.
    echo  Lancez d'abord install.bat !
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0prisma\dev.db" (
    color 0E
    echo  [!] Base de donnees non trouvee. Creation en cours...
    cd /d "%~dp0"
    call npx prisma db push --skip-generate >nul 2>&1
    echo  [OK] Base de donnees creee.
    echo.
)

REM ── Arreter l'ancien serveur sur le port 3000 ─────────────────────────────────
echo  [1/3] Arret de l'ancien serveur...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM ── Demarrer le serveur Next.js ───────────────────────────────────────────────
echo  [2/3] Demarrage du serveur Next.js...
cd /d "%~dp0"
start "HuwiyaTech - Serveur" cmd /k "color 0B && echo  Serveur HuwiyaTech en cours de demarrage... && echo. && npm run dev"

echo  Patientez pendant le demarrage ^(environ 10 secondes^)...
timeout /t 10 /nobreak >nul

REM ── Ouvrir le navigateur ──────────────────────────────────────────────────────
echo  [3/3] Ouverture du navigateur...
start "" "http://localhost:3000"

echo.
color 0A
echo  ================================================
echo   HuwiyaTech est pret !
echo.
echo   Accueil    : http://localhost:3000
echo   Dashboard  : http://localhost:3000/dashboard
echo   Admin      : http://localhost:3000/admin
echo.
echo   Pour devenir admin apres inscription :
echo   Lancez : npx prisma studio
echo   Table User ^> changez role en ADMIN
echo  ================================================
echo.
echo  Appuyez sur une touche pour fermer cette fenetre.
echo  (Le serveur continue dans l'autre fenetre)
pause >nul

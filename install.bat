@echo off
title HuwiyaTech - Installation
color 0A
echo.
echo  ========================================================
echo    HUWIYATECH - Installation automatique
echo  ========================================================
echo.

REM ── Verifier Node.js ─────────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERREUR] Node.js n'est pas installe !
    echo.
    echo  Telechargez et installez Node.js depuis :
    echo  https://nodejs.org  ^(choisir LTS^)
    echo.
    echo  Redemarrez ce script apres l'installation.
    pause
    exit /b 1
)
echo  [OK] Node.js detecte :
node --version
echo.

REM ── Installer les dependances npm ────────────────────────────────────────────
echo  [1/4] Installation des dependances npm...
cd /d "%~dp0"
call npm install --silent
if %errorlevel% neq 0 (
    color 0C
    echo  [ERREUR] npm install a echoue.
    echo  Verifiez votre connexion internet et relancez ce script.
    pause
    exit /b 1
)
echo  [OK] Dependances installees.
echo.

REM ── Creer le fichier .env si absent ──────────────────────────────────────────
echo  [2/4] Configuration de l'environnement...

if not exist "%~dp0.env" (
    echo  Creation du fichier .env...

    REM Generer un NEXTAUTH_SECRET aleatoire avec Node
    for /f "delims=" %%s in ('node -e "process.stdout.write(require('crypto').randomBytes(32).toString('base64'))"') do set GENERATED_SECRET=%%s

    (
        echo # ── Base de donnees SQLite ^(locale, aucune installation requise^)
        echo DATABASE_URL="file:./prisma/dev.db"
        echo.
        echo # ── NextAuth
        echo NEXTAUTH_URL="http://localhost:3000"
        echo NEXTAUTH_SECRET="%GENERATED_SECRET%"
        echo.
        echo # ── Google OAuth ^(optionnel^)
        echo GOOGLE_CLIENT_ID=""
        echo GOOGLE_CLIENT_SECRET=""
        echo.
        echo # ── Cloudinary ^(optionnel - pour upload photos/CV^)
        echo # Creez un compte gratuit sur cloudinary.com puis remplissez ci-dessous
        echo CLOUDINARY_CLOUD_NAME="YOUR_CLOUD_NAME"
        echo CLOUDINARY_API_KEY="YOUR_API_KEY"
        echo CLOUDINARY_API_SECRET="YOUR_API_SECRET"
        echo NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="YOUR_CLOUD_NAME"
        echo.
        echo # ── App
        echo NEXT_PUBLIC_APP_URL="http://localhost:3000"
        echo NEXT_PUBLIC_APP_NAME="HuwiyaTech"
    ) > "%~dp0.env"

    echo  [OK] Fichier .env cree avec cle secrete generee automatiquement.
) else (
    echo  [OK] Fichier .env deja present.
)
echo.

REM ── Creer la base de donnees ET regenerer le client ─────────────────────────
echo  [3/4] Creation de la base de donnees...
cd /d "%~dp0"
call npx prisma db push 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo  [ERREUR] La creation de la base de donnees a echoue.
    echo  Verifiez le fichier .env et relancez ce script.
    pause
    exit /b 1
)
echo  [OK] Base de donnees SQLite creee et client Prisma genere.
echo.

color 0B
echo  ========================================================
echo   Installation terminee avec succes !
echo.
echo   Double-cliquez sur DEMARRER.bat pour lancer la
echo   plateforme.
echo.
echo   NOTE : Les uploads de photos/CV necessitent de
echo   configurer Cloudinary dans le fichier .env
echo  ========================================================
echo.
pause

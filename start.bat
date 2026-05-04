@echo off
title HuwiyaTech - Serveur
color 0B
echo.
echo  ========================================
echo    HUWIYATECH — Demarrage
echo  ========================================
echo.

echo  Demarrage du serveur Next.js...
echo  Acces : http://localhost:3000
echo.

cd /d "%~dp0"
npm run dev

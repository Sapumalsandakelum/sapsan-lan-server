@echo off
title SapSan LAN Sync Server
cd /d "%~dp0"

if not exist node_modules (
  echo First time setup - installing required files...
  echo This only happens once, please wait...
  echo.
  call npm install
  echo.
)

echo Starting SapSan LAN Sync Server...
echo.
node server.js

echo.
echo Server stopped. Press any key to close this window.
pause >nul
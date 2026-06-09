@echo off
set "NODE=C:\Users\blueb\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "APP_DIR=%~dp0"
cd /d "%APP_DIR%"

if not exist "%NODE%" (
  echo Node runtime was not found:
  echo %NODE%
  echo.
  pause
  exit /b 1
)

echo Starting ARCS! at http://127.0.0.1:4177
echo Keep this window open while using Komga sync.
echo.
start "" "http://127.0.0.1:4177"
"%NODE%" "%APP_DIR%server.js"
echo.
echo ARCS! server stopped.
pause

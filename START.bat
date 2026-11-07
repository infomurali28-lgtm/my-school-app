@echo off
setlocal
cd /d "%~dp0"
echo ================================================
echo       THE SCHOOL - MODERN MANAGEMENT ERP
echo ================================================
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not found.
  echo Please install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)
if not exist node_modules (
  echo [INFO] Installing dependencies...
  call npm.cmd install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)
echo [INFO] Building The School ERP...
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo [ERROR] Build failed.
  pause
  exit /b 1
)
echo.
echo ================================================
echo  The School ERP is starting...
echo  Local URL: http://127.0.0.1:5173/
echo  Live URL:  https://the-school-erp.vercel.app/
echo ================================================
start "The School Server" cmd /k "python -m http.server 5173 --bind 127.0.0.1 --directory dist"
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:5173/
endlocal

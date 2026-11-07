@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo       The School ERP - GitHub Push Helper
echo ========================================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [NOTICE] Git command line is not installed on this system.
    echo.
    echo Would you like to install Git now via Windows Package Manager (winget)?
    echo Press Y to install Git, or N to cancel.
    set /p INSTALL_GIT="Install Git (Y/N)? "
    if /i "%INSTALL_GIT%"=="Y" (
        echo [INFO] Installing Git for Windows...
        winget install --id Git.Git -e --source winget
        echo.
        echo [INFO] Git installed. Please close and reopen this terminal,
        echo then run push-to-github.bat again.
        pause
        exit /b 0
    ) else (
        echo Please follow the GitHub Desktop guide in the chat.
        pause
        exit /b 1
    )
)

echo [1/4] Initializing Git repository...
if not exist ".git" (
    git init
    git branch -M main
)

echo [2/4] Staging files...
git add .

echo [3/4] Creating commit...
git commit -m "The School ERP with Role-Based Dashboards and Android App Build"

echo.
echo ========================================================
echo Enter your GitHub Repository URL (from https://github.com/new)
echo Example: https://github.com/your-username/my-school-erp.git
echo ========================================================
set /p REPO_URL="Repository URL: "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Aborted.
    pause
    exit /b 1
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo [4/4] Pushing to GitHub main branch...
git push -u origin main

if errorlevel 0 (
    echo.
    echo ========================================================
    echo  SUCCESSFULLY PUSHED TO GITHUB!
    echo.
    echo  Your Android APK is now building automatically!
    echo  1. Open your repository on GitHub in browser
    echo  2. Click the 'Actions' tab at the top
    echo  3. Wait ~2 minutes for the green checkmark
    echo  4. Click the workflow run and download 'The-School-ERP-Debug-APK'
    echo ========================================================
) else (
    echo.
    echo [ERROR] Push failed. Make sure you are logged in to GitHub.
)

pause
endlocal

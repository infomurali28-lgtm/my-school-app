@echo off
setlocal
cd /d "%~dp0"

set "PATH=C:\Program Files\Git\cmd;%PATH%"

echo ========================================================
echo       Pushing All Folders to GitHub
echo       Repository: infomurali28-lgtm/my-school-app
echo ========================================================
echo.
echo [1/3] Adding all files and folders (.github, android, src, public)...
git add -A

echo [2/3] Committing complete Android app and workflows...
git commit -m "Upload complete project including android and github workflows" 2>nul

echo [3/3] Pushing to GitHub (A browser window may open to sign in)...
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! ALL FOLDERS PUSHED TO GITHUB!
    echo.
    echo  Now go to your browser:
    echo  1. Open: https://github.com/infomurali28-lgtm/my-school-app
    echo  2. Click the 'Actions' tab at the top
    echo  3. In 2 minutes, download your 'The-School-ERP-Debug-APK'!
    echo ========================================================
) else (
    echo.
    echo [ERROR] Push failed. If prompted, please sign in with your GitHub account.
)

pause
endlocal

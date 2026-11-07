@echo off
echo ========================================================
echo     The School ERP - Android APK Builder
echo ========================================================
echo.

cd /d "%~dp0android"

if not exist "gradlew.bat" (
    echo [INFO] Generating Gradle wrapper...
    gradle wrapper --gradle-version 8.2
)

echo [INFO] Building Android Debug APK...
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Your APK is ready:
    echo  Location: android\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================================
) else (
    echo.
    echo [ERROR] Build failed. Please ensure Java 17 and Android SDK are configured,
    echo or push to GitHub to build the APK automatically via GitHub Actions!
)

pause

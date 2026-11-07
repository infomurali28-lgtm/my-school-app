@echo off
echo Opening The School Android Project in Android Studio...
start "" "%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe" "%~dp0android" 2>nul
if %ERRORLEVEL% NEQ 0 (
    start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe" "%~dp0android" 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo If Android Studio didn't launch automatically, please open Android Studio manually
    echo and select: "Open an existing project" -> Choose the 'android' folder in this directory.
)

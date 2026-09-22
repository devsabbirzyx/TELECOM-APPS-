@echo off
echo ===================================================
echo       Mobixa / OfferHut - Android APK Builder
echo ===================================================
cd /d "%~dp0"

echo [1/2] Checking EAS CLI login status...
call npx eas-cli whoami
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Please log in to your Expo account (Sign up for free at https://expo.dev):
    call npx eas-cli login
)

echo.
echo [2/2] Starting Android APK Build (Profile: preview)...
echo Expo cloud will compile your APK. You will get a direct download link at the end!
echo.
call npx eas-cli build -p android --profile preview

pause

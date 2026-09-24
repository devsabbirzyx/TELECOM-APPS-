@echo off
title Mobixa - Android APK Builder
echo ===================================================
echo       Mobixa / OfferHut - Android APK Builder
echo ===================================================
cd /d "%~dp0mobile"

echo [1/2] Checking EAS CLI login status...
call npx eas whoami
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ----------------------------------------------------------------------
    echo  Please log in to your Expo account (Sign up free at https://expo.dev)
    echo ----------------------------------------------------------------------
    echo.
    call npx eas login
)

echo.
echo [2/2] Starting Android APK Build (Profile: preview)...
echo Expo cloud will build your APK.
echo When complete, you will receive a direct download link and QR code!
echo.
call npx eas build -p android --profile preview

echo.
echo ===================================================
echo Build process finished. Press any key to exit.
echo ===================================================
pause

@echo off
echo ==========================================
echo    OfferHut / Mobixa - GitHub Push
echo ==========================================
cd /d "%~dp0"
echo Pushing your code to https://github.com/devsabbirzyx/TELECOM-APPS- ...
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Apnar code GitHub-e successfully upload hoye geche!
) else (
    echo [ERROR] Push fail hoyeche. Browser-e login pop-up ashle Authorize korun.
)
pause

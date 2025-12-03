@echo off
echo ========================================
echo   Deploy Firebase Rules and Indexes
echo ========================================
echo.

echo Checking Firebase CLI...
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Firebase CLI not found!
    echo Please install: npm install -g firebase-tools
    pause
    exit /b 1
)

echo.
echo Deploying Firestore Rules...
firebase deploy --only firestore:rules

echo.
echo Deploying Firestore Indexes...
firebase deploy --only firestore:indexes

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
pause

@echo off
REM Quick Start Script for VF-TryOn App (Windows)
REM This script starts both backend and frontend servers

echo.
echo 🚀 Starting VF-TryOn Application...
echo.

REM Check if backend is already running
echo 📡 Checking backend status...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Backend is already running on port 5000
) else (
    echo ⚙️  Starting backend server...
    start "VF-TryOn Backend" cmd /k "cd backend && node server.js"
    timeout /t 3 >nul
    echo ✓ Backend started
)

echo.

REM Check if frontend is already running
echo 🎨 Checking frontend status...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Frontend is already running on port 3000
    goto :ready
)

curl -s http://localhost:3001 >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Frontend is already running on port 3001
    goto :ready
)

echo ⚙️  Starting frontend server...
start "VF-TryOn Frontend" cmd /k "npm start"
timeout /t 3 >nul
echo ✓ Frontend started

:ready
echo.
echo ✅ VF-TryOn Application is ready!
echo.
echo 📍 URLs:
echo    • Frontend: http://localhost:3001
echo    • Backend:  http://localhost:5000
echo    • API Status: http://localhost:3001/api-status
echo    • Health Check: http://localhost:5000/health
echo.
echo 🎯 Quick Links:
echo    • Body Analysis: http://localhost:3001/ai/body-analysis
echo    • Outfit Recommendations: http://localhost:3001/ai/outfit-recommendations
echo    • Admin Dashboard: http://localhost:3001/admin
echo.
echo Press any key to open API Status Dashboard...
pause >nul
start http://localhost:3001/api-status

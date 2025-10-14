@echo off
echo ========================================
echo Starting Resume & Cover Letter Generator
echo ========================================

REM Start Next.js Frontend
echo Starting Next.js frontend...
cd /d "C:\Users\DELL\OneDrive\Desktop\writer2"
start cmd /k "npm run dev"
timeout /t 5

REM Start Resume API (port 8000)
echo Starting Resume API on port 8000...
cd /d "C:\Users\DELL\OneDrive\Desktop\writer2\app"
start cmd /k "python main.py"
timeout /t 3

REM Start Cover Letter API (port 8001)
echo Starting Cover Letter API on port 8001...
cd /d "C:\Users\DELL\OneDrive\Desktop\writer2\app\letter"
start cmd /k "python main.py"
timeout /t 2

REM Start Report API (port 8002)
echo Starting Report API on port 8002...
cd /d "C:\Users\DELL\OneDrive\Desktop\writer2\app\report"
start cmd /k "python main.py"
timeout /t 2

REM Open VS Code
echo Opening VS Code...
cd /d "C:\Users\DELL\OneDrive\Desktop\writer2"
start code .

echo ========================================
echo All services started!
echo Resume API: http://127.0.0.1:8000
echo Cover Letter API: http://127.0.0.1:8001
echo Report API: http://127.0.0.1:8001
echo Frontend: http://localhost:3000
echo ========================================
pause
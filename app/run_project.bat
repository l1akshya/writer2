@echo off
cd /d "C:\Users\DELL\OneDrive\Desktop\writer\app\page.tsx"
start cmd /k "npm run dev"

timeout /t 5

cd /d "C:\path\to\your\fastapi\backend"
start cmd /k "uvicorn main:app --reload"

timeout /t 2


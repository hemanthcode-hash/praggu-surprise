@echo off
cd /d "%~dp0"
copy /Y "C:\Users\Hemanth Pelluru\.gemini\antigravity\brain\e994a276-962b-4bbe-ac65-e1d556465630\.user_uploaded\media_1790878102678.jpg" "dist\memory-new-year.jpeg" >nul 2>&1
copy /Y "C:\Users\Hemanth Pelluru\.gemini\antigravity\brain\e994a276-962b-4bbe-ac65-e1d556465630\.user_uploaded\media_1790960959674.jpg" "dist\memory-celebration.jpeg" >nul 2>&1
echo Starting Birthday Surprise server...
echo Open your browser at: http://localhost:4173
echo.
node server.cjs
pause

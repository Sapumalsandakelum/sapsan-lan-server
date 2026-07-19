@echo off
:: Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process -FilePath '%0' -Verb RunAs"
    exit /b
)

title SapSan LAN Sync Server - Uninstall Auto-Start
cd /d "%~dp0"

echo ==========================================================
echo   SapSan LAN Sync Server - Remove Auto-Start Task
echo ==========================================================
echo.

echo Removing Windows Task Scheduler task...
schtasks /delete /tn "SapSan_LAN_Sync_Server" /f >nul 2>&1
echo Startup task deleted successfully.
echo.

echo Removing Windows Firewall rule...
netsh advfirewall firewall delete rule name="SapSan POS LAN Sync" >nul 2>&1
echo Firewall rule deleted successfully.
echo.

echo ==========================================================
echo [SUCCESS] Auto-Start has been removed.
echo ==========================================================
echo.
echo Press any key to exit.
pause >nul

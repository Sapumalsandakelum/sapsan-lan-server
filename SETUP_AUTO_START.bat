@echo off
:: Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process -FilePath '%0' -Verb RunAs"
    exit /b
)

title SapSan LAN Sync Server - Auto-Start Setup
cd /d "%~dp0"

echo ==========================================================
echo   SapSan LAN Sync Server - Auto-Start Setup
echo ==========================================================
echo.

:: 1. Install Node modules first to make sure everything is ready
echo [1/3] Checking Node modules...
if not exist node_modules (
    echo Node modules not found. Installing now...
    call npm install
) else (
    echo Node modules already installed.
)
echo.

:: 2. Configure Windows Firewall to allow incoming connections on port 3001
echo [2/3] Configuring Windows Defender Firewall...
netsh advfirewall firewall delete rule name="SapSan POS LAN Sync" >nul 2>&1
netsh advfirewall firewall add rule name="SapSan POS LAN Sync" dir=in action=allow protocol=TCP localport=3001
echo Windows Firewall configured successfully to allow connections on port 3001.
echo.

:: 3. Create Windows Task Scheduler task to run the server automatically on system startup
echo [3/3] Creating Windows Scheduler Task...
:: Delete old task if exists
schtasks /delete /tn "SapSan_LAN_Sync_Server" /f >nul 2>&1

:: Create new task using PowerShell (robust escaping and sets working directory)
powershell -NoProfile -ExecutionPolicy Bypass -Command "$scriptDir = '%~dp0'.TrimEnd('\'); $nodePath = (Get-Command node.exe -ErrorAction SilentlyContinue).Source; if (-not $nodePath) { $nodePath = 'node' }; $Action = New-ScheduledTaskAction -Execute $nodePath -Argument 'server.js' -WorkingDirectory $scriptDir; $Trigger = New-ScheduledTaskTrigger -AtStartup; $Principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest; $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries; Register-ScheduledTask -TaskName 'SapSan_LAN_Sync_Server' -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Force"

if %errorLevel% equ 0 (
    echo.
    echo ==========================================================
    echo [SUCCESS] Auto-Start Setup Completed Successfully!
    echo ==========================================================
    echo.
    echo 1. The server is configured as a background system task.
    echo 2. It will start automatically whenever this PC turns on.
    echo    No user needs to log in, and no window will clutter your screen.
    echo 3. The Windows Firewall has been configured to allow port 3001.
    echo.
    echo Starting the background server task now...
    schtasks /run /tn "SapSan_LAN_Sync_Server" >nul 2>&1
    echo.
    echo Server is now running silently in the background!
    echo.
    echo ==========================================================
    echo   ON OTHER PCs, enter one of these as the Server Address:
    echo ==========================================================
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceAlias -notlike '*Virtual*' -and $_.InterfaceAlias -notlike '*vEthernet*' } | ForEach-Object { Write-Host '  http://' $_.IPAddress ':3001' }"
    echo ==========================================================
) else (
    echo.
    echo [ERROR] Failed to create the startup task.
    echo Please make sure you are running as Administrator and your Windows account has permission.
)

echo.
echo Press any key to exit this installer.
pause >nul

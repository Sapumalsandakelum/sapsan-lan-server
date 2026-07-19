' START_SERVER_HIDDEN.vbs
' Silently starts the SapSan LAN Sync Server with NO visible window — designed
' to be placed in the Windows Startup folder so it runs automatically every
' time this PC turns on, with zero action needed from anyone.
'
' IMPORTANT: Run START_SERVER.bat manually at least ONCE first (to install
' the required files), before setting this up. After that, this hidden
' version can take over for daily automatic startup.

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Automatically finds its own folder, wherever you placed sapsan-lan-server
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' 0 = hidden window, False = don't wait for it to finish (runs in background)
WshShell.Run "cmd /c node server.js", 0, False
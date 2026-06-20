@echo off
setlocal

REM Get the absolute path to the folder this batch file is in
set "SCRIPT_DIR=%~dp0"

REM Resolve the project root as one directory above this batch file
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

REM Resolve public directory and router file
set "PUBLIC_DIR=%PROJECT_ROOT%\public"
set "ROUTER=%PUBLIC_DIR%\index.php"

REM Sanity checks, because Windows batch files enjoy pain
where php >nul 2>nul
if errorlevel 1 (
    echo PHP was not found in PATH.
    echo Make sure php.exe is installed and available from the command line.
    pause
    exit /b 1
)

if not exist "%ROUTER%" (
    echo Could not find router:
    echo "%ROUTER%"
    pause
    exit /b 1
)

echo Starting PHP development server...
echo.
echo Project root: %PROJECT_ROOT%
echo Public dir:   %PUBLIC_DIR%
echo Router:       %ROUTER%
echo.
echo Open: http://127.0.0.1:8000
echo Press Ctrl+C to stop.
echo.

php -S 0.0.0.0:8000 -t "%PUBLIC_DIR%" "%ROUTER%"

endlocal

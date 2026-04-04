@echo off
cd /d "%~dp0"
node screenshot.js > screenshots\log.txt 2>&1
echo Done.

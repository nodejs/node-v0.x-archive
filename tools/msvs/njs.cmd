@echo off
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION
set script=%1
for %%p in (%1) do set prefix=%%~dp$PATH:p
node !prefix!\%*
endlocal

@echo off
@rem Build the solution using the vs 2010 msbuild.exe
@rem Check for visual studio tools if not already loaded
if defined VCINSTALLDIR goto BuildSolution
@rem Ensure that visual studio is available
if not defined VS100COMNTOOLS goto msbuild-not-found
if not exist "%VS100COMNTOOLS%..\..\vc\vcvarsall.bat" goto msbuild-not-found
call "%VS100COMNTOOLS%..\..\vc\vcvarsall.bat"
@rem Check that vs is properly loaded
if not defined VCINSTALLDIR goto msbuild-not-found
:BuildSolution
set generatedslnfile=%~p1%~n1.sln
echo Compiling %generatedslnfile%
if not exist %generatedslnfile% goto solutions-file-not-found
@rem call msbuild to build the sln file
msbuild.exe %generatedslnfile%
if errorlevel 1 exit /B 1
exit /B 0
:msbuild-not-found
echo Visual studio tools were not found! Please check the VS100COMNTOOLS path variable
exit /B 1

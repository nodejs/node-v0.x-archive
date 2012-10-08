:: Created by npm, please don't edit manually.
@IF EXIST "%~dp0node.exe" (
  "%~dp0node.exe" "%~dp0node_modules\npm\bin\npm-cli.js" %*
) ELSE (
  node "%~dp0node_modules\npm\bin\npm-cli.js" %*
)

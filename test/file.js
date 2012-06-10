// Test if a file exists
var fs = require('fs');
if (fs.existsSync('./test/file.js')) {
  console.log('File does in fact exist');
} else {
  console.log("I shouldn't see this");
  console.log(typeof fs.exists('./test/file.js'));
}

if (!fs.existsSync('./test/somefilethatdoesnotexists.dontcreateme')) {
  console.log("Non existing files don't exist.");
} else {
  console.log("wtf mate?");
}
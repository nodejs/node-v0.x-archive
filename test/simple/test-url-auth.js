/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
/*global unescape*/
(function () {
  "use strict";
  
  var url = require('url')
    , assert = require('assert')
    , i = 100
      // two known non-working strings
    , passphrases = [
          "F}v{c~x?J,jOqNRnQ^vR\"TolMm]Ib]2YJf/(&?zDj}VgL19&!mfLzo!z$$b;]X(|I-S\")@E2*x~{PzN(Xj-M%GIWO-Ir-7\\VF0H>l[Yu773pvGw3W^Qkj:('~3_l9ea#x"
        , "(M+YzjVapJ T/mPReBT_/MxG7=8Sa5s**Edz+i e?|a7LNBUrT9hqm>U{|{B`rzSXH\\kyC{!>iGk\\h%K? [Q&Ob^bK?~%')Na|^h#SQ])Ozpv{0^7rleZZh$|Hz~cDFa<"
      ]
    ;

  function randomString(len) {
    var i
      , chars = ""
      , str = ""
      , char
      , rnd
      ;

    // 32-126 are valid ASCII non-control chars
    for (i = 32; i <= 126; i += 1) {
      chars += String.fromCharCode(i);
    } 

    if (isNaN(len)) {
      len = 8;
    }

    for (i = 0; i <= len; i += 1) {
      rnd = Math.floor(Math.random() * chars.length);
      str += chars[rnd];
    }
    return str;
  }

  // Create a bunch of random strings in case the two test cases aren't enough
  while (i > 0) {
    passphrases.push(randomString(128));
    i -= 1;
  }

  // For each passpharse encode and decode using url
  passphrases.forEach(function (auth) {
    var auth2 = url.parse(url.format({
            "protocol": "http:"
          , "auth": 'username:' + auth
          , "host": "example.com"
          , "pathname": "/session"
        })).auth
      ;

    // check a bunch of different ways to see if any yield equality
    try {
      if (auth2 !== auth) {
        if (decodeURIComponent(auth2) !== auth) {
          if (unescape(auth2) !== auth) {
            throw new Error('auth !== url.parse(url.format(urlObj)).auth');
          }
        }
      }
    } catch(e) {
      console.error('[Expected] ' + auth);
      console.error('[Actual] ' + auth2);
      assert.ok(false, e);
    }
  });
}());

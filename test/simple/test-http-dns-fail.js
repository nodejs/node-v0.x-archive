/* 
 * Repeated requests for a domain that fails to resolve
 * should trigger the error event after each attempt.
 */

var common = require('../common');
var assert = require('assert');
var http = require('http');


var res_despite_error = false
var had_error = 0

function httpreq(count) {
  if( 1 < count ) {
    return
  }

  var req = http.request({
    host:'not-a-real-domain-name-at-all-at-all.nobody-would-register-this-as-a-tld-would-they-now',
    port:80,
    path:'/',
    method:'GET'
  }, function(res){
    res_despite_error = true
  })

  req.on('error', function(e){
    console.log(e.message);
    had_error++
    httpreq(count+1)
  })

  req.end()
}

httpreq(0)


process.on('exit', function() {
  assert.equal(false, res_despite_error);
  assert.equal(2, had_error);
});

var assert = require("assert")
  , log = require("npmlog")
  , retry = require("retry")
  , npm = require("../npm.js")
  , fetch = require("../utils/fetch.js")
  , inflight = require("inflight")
  , remoteOptions = require('./remote-options.js')

module.exports = checkRemoteTarball

// Check if a HTTP tar is outdated using the HEAD request
function checkRemoteTarball(url, opts, cb) {
  assert(typeof url === "string", "must have module URL")
  assert(typeof cb === "function", "must have callback")

  if (opts && opts.url == url) {
    log.verbose("checkRemoteTarball", [url, opts])
    checkRemoteTarball_(url, opts, cb)
  }
  else {
    // Nothing to do, missing _remote cached data
    log.verbose("missing _remote cached data", [url, opts])
    return cb(null, false)
  }
}

// Returns cb(err, res), where res is 'true' if successfully checked that the ETAG changed, 'false' otherwise (conservative approach)
function checkRemoteTarball_(url, opts, cb) {
  // Tuned to spread 3 attempts over about a minute.
  // See formula at <https://github.com/tim-kos/node-retry>.
  var operation = retry.operation
    ( { retries: npm.config.get("fetch-retries")
      , factor: npm.config.get("fetch-retry-factor")
      , minTimeout: npm.config.get("fetch-retry-mintimeout")
      , maxTimeout: npm.config.get("fetch-retry-maxtimeout") })

  operation.attempt(function (currentAttempt) {
    log.info("retry", "fetch attempt " + currentAttempt + " at " + (new Date()).toLocaleTimeString())
    makeOptionsCall(url, opts, function (er, response) {
      // Only retry on 408, 5xx or no `response`.
      var sc = response && response.statusCode
      var statusRetry = !sc || (sc === 408 || sc >= 500)
      if (er && statusRetry && operation.retry(er)) {
        log.info("retry", "will retry, error on last attempt: " + er)
        return
      }
      // Check other fails
      if (er) {
        log.info("OPTIONS fetch failed", url)
        return cb(er, false)
      }
      // Check against etag
      cb(null, sc == 200) // Otherwise a 304 (Not Modified) will be returned
    })
  })
}

function makeOptionsCall(url, opts, cb) {
  var headers = remoteOptions.headers(opts);
  // Make an OPTIONS call using the fetch without a valid local file specified
  fetch(url, null, headers, cb);
}

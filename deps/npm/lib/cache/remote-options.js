module.exports = {
  save: save,
  headers: headers
}

// Save a GET response headers down in the package data
// to check if outdated later
function save(headers, url) {
  return headers ? { etag: headers.etag, lastModified: headers["last-modified"], url: url } : {}
}

// Calculate the headers to send in a OPTIONS request
function headers(opts) {
  if (opts) {
    if (opts.lastModified) {
      return { "If-Modified-Since": opts.lastModified }
    }
    if (opts.etag) {
      return { "If-None-Match": opts.etag }
    }
  }
  return {}
}

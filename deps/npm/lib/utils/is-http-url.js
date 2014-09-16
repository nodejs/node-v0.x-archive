module.exports = isHttpUrl

function isHttpUrl (url) {
  switch (url.protocol) {
    case "http:":
    case "https:":
      return true
  }
}

binding = process.binding("os")
exports.hostname = binding.getHostname
exports.loadavg = binding.getLoadAvg
exports.uptime = binding.getUptime
exports.freemem = binding.getFreeMem
exports.totalmem = binding.getTotalMem
exports.cpus = binding.getCPUs
exports.type = binding.getOSType
exports.release = binding.getOSRelease
exports.networkInterfaces = binding.getInterfaceAddresses
exports.arch = ->
  process.arch

exports.platform = ->
  process.platform

exports.getNetworkInterfaces = ->
  require("util")._deprecationWarning "os", "os.getNetworkInterfaces() is deprecated - use os.networkInterfaces()"
  exports.networkInterfaces()

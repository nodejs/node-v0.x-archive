module.exports = {
  oncomplete: function oncomplete(name, hrtime, args) {
    var t = hrtime[0] * 1e3 + hrtime[1] / 1e6;
    name += ': ';
    while (name.length < args[1] + 2)
      name += ' ';
    console.log('%s%s ops/ms', name, Math.floor(args[0] / t));
  }
}

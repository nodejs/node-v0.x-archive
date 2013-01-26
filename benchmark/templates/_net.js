var rates = [];

var cli = {
  onend: function() {
    process.stdout.write(printComplete().join('   '));
    process.stdout.write('\n');
  },
  oninterval:function(name, hrtime, counter) {
    var elapsed = hrtime[0] + hrtime[1] / 1e9;
    var bits = counter * 8;
    var gbits = bits / 0x40000000;
    var rate = gbits / elapsed;
    rates.push(rate);
    var str = rate.toFixed(2) + ' Gb/sec ' +
                 ~~(bits / 1024) + ' kb / ' +
                 ~~(elapsed * 1e6) + ' \u00b5s\n';
    process.stdout.write(str);
  }
};

var make = {
  onend: function(name) {
    var r = printComplete();
    for (var i = 0; i < r.length; i++)
      process.stdout.write(name + '-' + r[i] + ' Gb/sec\n');
  },
  oninterval: function(name, hrtime, counter) {
    var elapsed = hrtime[0] + hrtime[1] / 1e9;
    var bits = counter * 8;
    var gbits = bits / 0x40000000;
    var rate = gbits / elapsed;
    rates.push(rate);
  }
};

function printComplete() {
  rates.sort();
  var min = rates[0];
  var max = rates[rates.length - 1];
  var median = rates[rates.length >> 1];
  var avg = 0;
  rates.forEach(function(rate) { avg += rate });
  avg /= rates.length;
  return ['min: ' + min.toPrecision(5),
          'avg: ' + avg.toPrecision(5),
          'max: ' + max.toPrecision(5),
          'med: ' + median.toPrecision(5)]
}




module.exports = {
  cli: cli,
  make: make
};

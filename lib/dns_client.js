// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE

'use strict';

var ipaddr = require('dns_ipaddr'),
    net = require('net'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    PendingRequests = require('dns_pending'),
    consts = require('dns_consts'),
    types = require('dns_types'),
    Packet = require('dns_packet').Packet,
    Question = require('dns_message').Question,
    utils = require('dns_utils'),
    platform = require('dns_platform');

var Request = exports.Request = function(opts) {
  if (!(this instanceof Request)) return new Request(opts);

  this.question = opts.question;
  this.server = opts.server;

  if (typeof(this.server) === 'string' || this.server instanceof String)
    this.server = { address: this.server, port: 53, type: 'udp'};

  if (!this.server || !this.server.address || !net.isIP(this.server.address))
    throw new Error('Server object must be supplied with at least address');

  if (!this.server.type || ['udp', 'tcp'].indexOf(this.server.type) === -1)
    this.server.type = 'udp';

  if (!this.server.port)
    this.server.port = 53;

  this.timeout = opts.timeout || 4 * 1000;
  this.try_edns = opts.try_edns || false;

  this.fired = false;
  this.id = undefined;
};
util.inherits(Request, EventEmitter);

Request.prototype.handle = function(err, answer) {
  if (!this.fired) {
    this.emit('message', err, answer);
    this.done();
  }
};

Request.prototype.done = function() {
  this.fired = true;
  clearTimeout(this.timer_);
  PendingRequests.remove(this);
  this.emit('end');
  this.id = undefined;
};

Request.prototype.handleTimeout = function() {
  if (!this.fired) {
    this.emit('timeout');
    this.done();
  }
};

Request.prototype.error = function(err) {
  if (!this.fired) {
    this.emit('error', err);
    this.done();
  }
};

Request.prototype.send = function() {
  var self = this;

  this.timer_ = setTimeout(function() {
    self.handleTimeout();
  }, this.timeout);

  PendingRequests.send(this);
};

Request.prototype.cancel = function() {
  this.emit('cancelled');
  this.done();
};

var _queue = [];

var sendQueued = function() {
  _queue.forEach(function(request) {
    request.start();
  });
  _queue = [];
};

platform.on('ready', function() {
  sendQueued();
});

if (platform.ready) {
  sendQueued();
}

var Resolve = function(opts, callback) {
  this.domain = opts.domain;
  this.rrtype = opts.rrtype;
  this.check_hosts = opts.check_hosts;
  this.callback = callback;

  this.buildQuestion(this.domain);

  this.started = false;
  this.current_server = undefined;
  this.server_list = [];

  this.request = undefined;

  if (!platform.ready) {
    _queue.push(this);
  } else {
    this.start();
  }
};

Resolve.prototype.cancel = function() {
  if (this.request) {
    this.request.cancel();
  }
};

Resolve.prototype.buildQuestion = function(name) {
  this.question = new Question();
  this.question.type = this.rrtype;
  this.question.class = consts.NAME_TO_QCLASS.IN;
  this.question.name = name;
};

Resolve.prototype.isInHosts = function() {
  var results;
  if (platform.hosts[this.question.name]) {
    results = platform.hosts[this.question.name];
    this.callback(null, results);
    return true;
  } else {
    return false;
  }
};

Resolve.prototype.start = function() {
  var tries = 0, s, t, u, slist,
      self = this;

  if (!this.started) {
    this.started = true;
    this.try_edns = platform.edns;
    this.search_path = platform.search_path.slice(0);

    slist = platform.name_servers;

    while (this.server_list.length < platform.attempts) {
      s = slist[tries % slist.length];
      u = {
        address: s.address,
        port: s.port,
        type: 'udp'
      };
      t = {
        address: s.address,
        port: s.port,
        type: 'tcp'
      };
      this.server_list.push(u);
      this.server_list.push(t);
      tries += 1;
    }
    this.server_list.reverse();
  }

  if (this.check_hosts && this.isInHosts()) {
    return;
  }

  if (this.server_list.length === 0) {
    this.handleTimeout();
  } else {
    this.current_server = this.server_list.pop();
    this.request = Request({
      question: this.question,
      server: this.current_server,
      timeout: platform.timeout,
      try_edns: this.try_edns
    });

    this.request.on('timeout', function() {
      self.handleTimeout();
    });

    this.request.on('message', function(err, answer) {
      self.handle(err, answer);
    });

    this.request.on('error', function(err) {
      self.handle(err, undefined);
    });

    this.request.send();
  }
};

Resolve.prototype.handle = function(err, answer) {
  var rcode, errno;

  if (answer) {
    rcode = answer.rcode;
  }

  switch (rcode) {
    case consts.NAME_TO_RCODE.NOERROR:
      break;
    case consts.NAME_TO_RCODE.NOTFOUND:
      if (this.server_list.length > 0 && this.search_path.length > 0) {
        this.buildQuestion([this.domain, this.search_path.pop()].join('.'));
      } else {
        errno = consts.NOTFOUND;
      }
      answer = undefined;
      break;
    case consts.NAME_TO_RCODE.FORMERR:
      if (this.try_edns) {
        this.try_edns = false;
        this.server_list.splice(0, 1, this.current_server);
      } else {
        errno = consts.FORMERR;
      }
      answer = undefined;
      break;
    default:
      if (!err) {
        errno = consts.RCODE_TO_NAME[rcode];
        answer = undefined;
      } else {
        errno = consts.NOTFOUND;
      }
      break;
  }

  if (errno || answer) {
    if (errno) {
      err = new Error('getHostByName ' + errno);
      err.errno = err.code = errno;
    }
    this.callback(err, answer);
  } else {
    this.start();
  }
};

Resolve.prototype.handleTimeout = function() {
  var err;

  if (this.server_list.length === 0) {
    err = new Error('getHostByName ' + consts.TIMEOUT);
    err.errno = consts.TIMEOUT;
    err.request = this;
    this.callback(err, undefined);
  } else {
    this.start();
  }
};

var resolve = function(domain) {
  var rrtype = consts.NAME_TO_QTYPE.A,
      callback = arguments[arguments.length - 1];

  if (arguments.length >= 3) {
    rrtype = consts.NAME_TO_QTYPE[arguments[1]];
  }

  if (rrtype === consts.NAME_TO_QTYPE.PTR) {
    return reverse(domain, callback);
  }

  var opts = {
    domain: domain,
    rrtype: rrtype,
    check_hosts: false
  };

  return new Resolve(opts, function(err, response) {
    var ret = [], i, a;

    if (err) {
      callback(err, response);
      return;
    }

    for (i = 0; i < response.answer.length; i++) {
      a = response.answer[i];
      if (a.type === rrtype) {
        switch (rrtype) {
          case consts.NAME_TO_QTYPE.A:
          case consts.NAME_TO_QTYPE.AAAA:
            ret.push(a.address);
            break;
          case consts.NAME_TO_QTYPE.MX:
            ret.push({
              priority: a.priority,
              exchange: a.exchange
            });
            break;
          case consts.NAME_TO_QTYPE.TXT:
          case consts.NAME_TO_QTYPE.NS:
          case consts.NAME_TO_QTYPE.CNAME:
          case consts.NAME_TO_QTYPE.PTR:
            ret.push(a.data);
            break;
          case consts.NAME_TO_QTYPE.SRV:
            ret.push({
              priority: a.priority,
              weight: a.weight,
              port: a.port,
              name: a.target
            });
            break;
        }
      }
    }

    if (ret.length === 0) {
      err = consts.NODATA;
      ret = undefined;
    }
    callback(err, ret);
  });
};
exports.resolve = resolve;

var resolve4 = function(domain, callback) {
  return resolve(domain, 'A', function(err, results) {
    callback(err, results);
  });
};
exports.resolve4 = resolve4;

var resolve6 = function(domain, callback) {
  return resolve(domain, 'AAAA', function(err, results) {
    callback(err, results);
  });
};
exports.resolve6 = resolve6;

var resolveMx = function(domain, callback) {
  return resolve(domain, 'MX', function(err, results) {
    callback(err, results);
  });
};
exports.resolveMx = resolveMx;

var resolveTxt = function(domain, callback) {
  return resolve(domain, 'TXT', function(err, results) {
    callback(err, results);
  });
};
exports.resolveTxt = resolveTxt;

var resolveSrv = function(domain, callback) {
  return resolve(domain, 'SRV', function(err, results) {
    callback(err, results);
  });
};
exports.resolveSrv = resolveSrv;

var resolveNs = function(domain, callback) {
  return resolve(domain, 'NS', function(err, results) {
    callback(err, results);
  });
};
exports.resolveNs = resolveNs;

var resolveCname = function(domain, callback) {
  return resolve(domain, 'CNAME', function(err, results) {
    callback(err, results);
  });
};
exports.resolveCname = resolveCname;

var reverse = function(ip, callback) {
  var error, opts;

  if (!net.isIP(ip)) {
    error = new Error('getHostByAddr ENOTIMP');
    error.errno = error.code = 'ENOTIMP';
    throw error;
  }

  opts = {
    domain: utils.reverseIP(ip),
    rrtype: consts.NAME_TO_QTYPE.PTR,
    check_hosts: true
  };

  return new Resolve(opts, function(err, response) {
    var results = [];

    if (response instanceof Packet && response.answer.length) {
      response.answer.forEach(function(a) {
        if (a.type === consts.NAME_TO_QTYPE.PTR) {
          results.push(a.data);
        }
      });
    } else if (response) {
      results = response;
    }

    if (results.length === 0) {
      err = consts.NODATA;
      results = undefined;
    }

    callback(err, results);
  });
};
exports.reverse = reverse;

var lookup = function(domain) {
  var callback = arguments[arguments.length - 1],
      family,
      rrtype;

  family = net.isIP(domain);

  if (family === 4 || family === 6) {
    callback(null, domain, family);
    return {};
  }

  family = 4;

  if (domain === null) {
    callback(null, null, family);
    return {};
  }

  if (arguments.length === 3) {
    family = arguments['1'];
  }

  rrtype = consts.FAMILY_TO_QTYPE[family];
  //} else {
  //  rrtype = consts.NAME_TO_QTYPE.ANY;
  //}

  var opts = {
    domain: domain,
    rrtype: rrtype,
    check_hosts: true
  };

  return new Resolve(opts, function(err, response) {
    var i, afamily, address, a, all;

    if (err) {
      callback(err, null, 4);
      return;
    }

    if (response instanceof Packet) {
      all = response.answer;

      //if (rrtype === consts.NAME_TO_QTYPE.ANY) {
      all = all.concat(response.additional);
      //}

      all.forEach(function(a) {
        if (afamily && address) {
          return;
        }
        switch (a.type) {
          case consts.NAME_TO_QTYPE.A:
          case consts.NAME_TO_QTYPE.AAAA:
            afamily = consts.QTYPE_TO_FAMILY[a.type];
            address = a.address;
            break;
        }
      });
    } else {
      afamily = net.isIP(response[0]);
      address = response[0];
    }
    callback(err, address, afamily);
  });
};
exports.lookup = lookup;


var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');
var marked = require('marked');

var formatMembers = function (docs) {
  return function (member) {
    var module = member.memberof.substr(7);
    var path = member.longname.substr(7);
    var anchor = [module, module, member.name];

    if (member.kind === 'function') {
      var params = member.params.map(function (param) {
        var signature = param.name + (param.variable ? ' ...' : '');
        if (param.optional)
          signature = '[' + signature + ']';
        return signature;
      });
      member.signature = path + '(' + params.join(', ') + ')';
    } else {
      member.signature = path;
    }

    var doc = docs[member.signature];
    if (doc) {
      member.anchor = doc.anchor;
      member.description = doc.description;
    } else {
      member.anchor = anchor.join('_');
    }

    return member;
  };
};

var parseDocs = function (module) {
  // @TODO: fix
  var file = path.resolve(__dirname, '../../../../../../doc/api',
    module + '.markdown');

  if (!fs.existsSync(file))
    return false;

  var markdown = marked(fs.readFileSync(file).toString());

  var docs = {};
  markdown.split('<h2').slice(1).forEach(function (raw) {
    var parsed = raw.match(/\s+id="(.*)">(.*)<\/h2>\n((.|\n)*)/);

    docs[parsed[2]] = {
      signature: parsed[2],
      anchor: parsed[1],
      description: parsed[3]
    }
  });

  return docs;
};

exports.publish = function(data, opts) {
  var format = opts.query.format || 'html';

  data({ undocumented: true }).remove();

  // Get module list
  var modules = data({ kind: 'module' }).get();

  if (format === 'html') {
    // Get templates
    var templateFile = fs.readFileSync(__dirname + '/api.html');
    var template = handlebars.compile(templateFile.toString());
  }

  modules.forEach(function (module) {
    // Format
    module.title = module.name.replace(/^[a-z]/, function (match) {
      return match.toUpperCase();
    });
    module.anchor = [module.name, module.name].join('_');

    var members = data({ memberof: 'module:' + module.name }).get();

    var stability = 0;
    (module.tags || []).some(function (tag) {
      if (tag.title === 'stability') {
        stability = tag.value;
        return true;
      }
    });

    var docs = parseDocs(module.name);

    switch (format) {
      case 'html':
        var output = template({
          version: process.version,
          stability: {
            index: stability,
            title: ['Deprecated', 'Experimental', 'Unstable', 'Stable',
            'API Frozen', 'Locked'][stability]
          },
          module: module,
          members: members.map(formatMembers(docs))
        });
        break;

      case 'json':
        var output = { todo: true };
        break;

      default:
        throw new Error('Invalid format: ' + format);
    }

    console.log(output);
  });
}

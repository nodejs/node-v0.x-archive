require("colors");

var argv = require("optimist").argv,
    ndoc = require("./build/ndoc/bin/ndoc"),
    fs = require('fs'),
    md2html = require('marked'),
    jade = require('jade');

var version = argv._[0];
var versions = [];
var jadeTemplateFile = "resources/landing/layout.jade";
var jadeTemplate = fs.readFileSync(jadeTemplateFile);

//var outDir = "out/nodejs_dev_guide";

console.log("GENERATING DOCUMENTATION".green);

fs.readdir("./src", function(err, files) {
    if ("latest" == version) {
        versions.push("latest");
    }
    else if (/[\d]\.[\d]\.[\d]/.test(version)) {         
        versions.push("v" + version);
    }
    else {
        versions = files;
        versions = versions.filter(function (value) {
            return (value === '' || value == "index.md" || value.match(/^\./)) ? 0 : 1;
        });
    }

    versions.forEach(function(element, index, array) {
        makeNodeJSRefDocs(element);
    });
});

function makeNodeJSRefDocs(element) {
    ndoc.main(["--path=./src/" + element + "/nodejs_ref_guide", "-e", "md", "-o", "./out/" + element + "/nodejs_ref_guide/", "-t", "Node.js Reference", "--skin", "./resources/nodejs_ref_guide/skins"], function(err) {
        if (err) {
            console.error(err);
            process.exit(-1);
        }
    });
}

// helpers

function markdown(text) {
    return md2html(text);
}

function extend(o, plus) {
    var r = {},
        i;
    for (i in o) {
        if (o.hasOwnProperty(i)) {
            r[i] = o[i];
        }
    }
    if (plus) {
        for (i in plus) {
            if (plus.hasOwnProperty(i)) {
                r[i] = plus[i];
            }
        }
    }

    return r;
}
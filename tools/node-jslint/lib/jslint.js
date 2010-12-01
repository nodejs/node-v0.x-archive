/**
 * jslint wrapper for nodejs
 * 
 * @author Oleg Slobodskoi aka Kof
 */
var fs = require( "fs" ),
    util = require( "util" ),
    Script = process.binding( "evals" ).Script;

var jslintPath = __dirname + "/../deps/fulljslint.js",
    script = new Script.runInThisContext( fs.readFileSync( jslintPath ), jslintPath ),
    jslint = global.JSLINT;

// remove global JSLINT namespace
delete global.JSLINT;
    
exports.options = {
    "bitwise": true,
    "browser": false,
    "cap": false,
    "debug": false,
    "devel": false,
    "eqeqeq": true,
    "es5": true,
    "evil": false,
    "forin": true,
    "fragment": false,
    "immed": true,
    "indent": 2,
    "laxbreak": false,
    "maxlen": 90,
    "nomen": false,
    "newcap": true,
    "on": false,
    "onevar": true,
    "passfail": true,
    "plusplus": false,
    "predef": ["global", "process", "require", "__dirname", "__filename", "module", "exports"],
    "regexp": true,
    "rhino": false,
    "safe": false,
    "strict": false,
    "sub": false,
    "undef": true,
    "white": false,
    "windows": false        
};

function merge( target, src ) {
   for ( var key in src ) {
       target[key] = src[key];
   }
   return target; 
}

exports.check = function( path ) {

    var code = fs.readFileSync( path, "utf-8" ).toString().trim(),
        err;
        
    if ( code && jslint( code, exports.options ) === false ) {
        err = "jslint error in file " + path + ":\n";
        err += exports.options.format === "html" ? 
            jslint.report(true) 
            : 
            util.inspect( jslint.data().errors );
        return err;   
    }
    
    return null;
};

exports.setup = function( options ) {
    merge( exports.options, options );
};

// expose all jslint functions
merge( exports, merge );  
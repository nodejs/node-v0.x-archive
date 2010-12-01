var fs = require( "fs" ),
    util = require( "util" ), 
    path = require( "path" ),
    jslint = require( __dirname + "/../lib/jslint" ),
    target = process.argv[2];

function error() {
    throw new Error( "argument should be a path to dir or file" );
}

if ( target ) {
    target = path.join( process.ENV.PWD, target );
} else {
    error();
}

var stats = fs.statSync(target);

function check( path ) {
    var err;
    if ( err = jslint.check( path ) ) {
        util.print( err );    
    }    
}

if ( stats.isFile() ) {
    check( target );    
} else if ( stats.isDirectory() ) {
    fs.readdirSync( target ).forEach( function( file ) {
        check( target + "/" + file );    
    });
} else {
    error();
}



// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var common = require('../common');
var assert = require('assert');

var enablei18n = process.config.variables.v8_enable_i18n_support;
if (enablei18n === undefined) {
    enablei18n = false;
}

var haveIntl = ( global.Intl != undefined );

function haveLocale(loc) {
    var locs = process.config.variables.icu_locales.split(',');
    if ( locs.indexOf(loc) !== -1 ) {
	return true;
    } else {
	return false;
    }
}

if (!haveIntl) {
    assert.equal(enablei18n, false, '"Intl" object is NOT present but v8_enable_i18n_support is ' + enablei18n);
    console.log('Skipping Intl tests because Intl object not present.');
} else {
    assert.equal(enablei18n, true, '"Intl" object is present but v8_enable_i18n_support is ' + enablei18n + '. Is this test out of date?');

    // check with a Formatter
    var date0 = new Date(0);
    var GMT = 'Etc/GMT';
    var optsGMT = {timeZone: GMT};
    var expectString0 = '1/1/1970, 12:00:00 AM';  // epoch

    var dtf = new Intl.DateTimeFormat(['en'], {timeZone: GMT, month: 'short', year: '2-digit'});

    if ( !process.config.variables.icu_locales  // if no list specified or..
	 || haveLocale('en') ) {                // list contains 'en' then continue

	// Check with toLocaleString
	var localeString1 = dtf.format(date0);
	assert.equal(localeString1, 'Jan 70');
	
	var localeString0 = date0.toLocaleString(['en'], optsGMT);
	assert.equal(localeString0, expectString0);
	
	// number format
	assert.equal(new Intl.NumberFormat(['en']).format(12345.67890), '12,345.679');
	
	var coll = new Intl.Collator(['en'],{sensitivity:'base',ignorePunctuation:true});
	
	assert.equal(coll.compare('blackbird', 'black-bird'), 0, 'ignore punctuation failed');
	
	assert.equal(coll.compare('blackbird', 'red-bird'), -1, 'compare less failed');
	assert.equal(coll.compare('bluebird', 'blackbird'), 1, 'compare greater failed');
	assert.equal(coll.compare('Bluebird', 'bluebird'), 0, 'ignore case failed');
	assert.equal(coll.compare('\ufb03', 'ffi'), 0, 'ffi ligature (contraction) failed');
    } else {
	console.log('Skipping detailed Intl tests because English is not listed as supported.');
    }
}

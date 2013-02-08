/* Run test with the following:
 *
 * --hex 0xf --float 1e3 --decimal 1.3 --dual a 2 --bool
 *
 */

var assert = require('assert');
var Timer = require('../lib/bench-timer');
var params = Timer.parse(process.argv);
var expected = {
                hex: 15,
                float: 1000,
                decimal: 1.3,
                dual: ['a', 2],
                bool: true
               };

console.log('test passed parameters');

assert.deepEqual(params, expected);

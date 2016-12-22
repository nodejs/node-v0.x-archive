
## class os

This provides a way to retrieve various information about the underlaying operating system. Add `require('os')` in your code to access this module.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/os/os.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>


  

## os.arch() -> String

Returns the operating system CPU architecture.

 




## os.cpus() -> Array

Returns an array of objects containing information about each CPU/core installed: the model, speed (in MHz), and times (an object containing the number of CPU ticks spent in: user, nice, sys, idle, and irq).

#### Example

Example inspection of os.cpus:

    [ { model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
        speed: 2926,
        times:
         { user: 252020,
           nice: 0,
           sys: 30340,
           idle: 1070356870,
           irq: 0 } },
      { model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
        speed: 2926,
        times:
         { user: 306960,
           nice: 0,
           sys: 26980,
           idle: 1071569080,
           irq: 0 } },
      { model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
        speed: 2926,
       times:
       { user: 248450,
        nice: 0,
         sys: 21750,
         idle: 1070919370,
         irq: 0 } },
    { model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
      speed: 2926,
      times:
       { user: 256880,
         nice: 0,
         sys: 19430,
         idle: 1070905480,
         irq: 20 } },
    { model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
      speed: 2926,
      times:
       { user: 511580,
         nice: 20,
         sys: 40900,
         idle: 1070842510,
         irq: 0 } },
    { model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
      speed: 2926,
      times:
       { user: 291660,
         nice: 0,
         sys: 34360,
         idle: 1070888000,
         irq: 10 } },
    { model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
      speed: 2926,
      times:
       { user: 308260,
         nice: 0,
         sys: 55410,
         idle: 1071129970,
         irq: 880 } },
    { model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
      speed: 2926,
      times:
       { user: 266450,
         nice: 1480,
         sys: 34920,
         idle: 1072572010,
         irq: 30 } } ]


           

## os.freemem() -> Number


Returns the amount of free system memory in bytes.

 



## os.hostname() -> String


Returns the hostname of the operating system.

 



## os.networkInterfaces() -> Object


Returns a list of network interfaces.

#### Example

    { lo0: 
       [ { address: '::1', family: 'IPv6', internal: true },
         { address: 'fe80::1', family: 'IPv6', internal: true },
         { address: '127.0.0.1', family: 'IPv4', internal: true } ],
      en1: 
       [ { address: 'fe80::cabc:c8ff:feef:f996', family: 'IPv6',
           internal: false },
         { address: '10.0.1.123', family: 'IPv4', internal: false } ],
      vmnet1: [ { address: '10.99.99.254', family: 'IPv4', internal: false } ],
      vmnet8: [ { address: '10.88.88.1', family: 'IPv4', internal: false } ],
      ppp0: [ { address: '10.2.0.231', family: 'IPv4', internal: false } ] }


 



## os.loadavg() -> Array


Returns an array containing the 1, 5, and 15 minute load averages.

 



## os.platform() -> String

 
Returns the operating system platform.

 



## os.release() -> String

 
Returns the operating system release.

 



## os.totalmem() -> Number

Returns the total amount of system memory in bytes.

 



## os.type() -> String

Returns the operating system name.

 



## os.uptime() -> Number


Returns the system uptime in seconds.
 


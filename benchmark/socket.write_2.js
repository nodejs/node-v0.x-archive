var a= 'a';
var kMaxLength= 8192;
do a= [a,a].join(''); while (a.length < kMaxLength);

var i= 1e4;
while (i--) console.log(a);

a= null;

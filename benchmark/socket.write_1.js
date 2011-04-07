var a= 'a';
var kMaxLength= Math.pow(2,27);

do {
  
  a= [a,a].join('');
  console.log("*** BEGIN -> " + a.length);
  console.log(a);
  console.log("*** END -> " + a.length);

} while (a.length < kMaxLength);

a= null;

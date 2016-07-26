var i = 0;
while (i < 5) {
  i++;
  someFn();
}

global.someFn = someFn;
someFn();
someFn()
function someFn() {
  return 'I need food!';
}

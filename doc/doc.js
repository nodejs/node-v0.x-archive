
var nodes = document.getElementsByTagName('pre');

for (var i=0 ; i< nodes.length ; ++i) {
    var element = nodes.item(i);
    if (element.innerHTML.indexOf('Stability: 0') >= 0) {
        element.className += 'api_stability_0';
    }
}


# portnoy.js
Impress your friends with fancy your 17/16 sizzlin' beats.
This is just a shameless ripoff of the functionality of zya's [beet.js](https://github.com/zya/beet.js)
Just wanted to code a version from scratch for fun and terseness.

## Usage
````javascript
var ctx = new AudioContext();
var portnoy = new Portnoy({context: ctx, tempo: 120});
var n = null;

var p1 = portnoy.pattern(4, 4);
var p2 = portnoy.pattern(3, 4);

var layer = portnoy.layer(p1, beep);
var layer2 = portnoy.layer(p2, boop);

var beep = blip.bind(n, 440);
var boop = blip.bind(n, 220);
var remove = portnoy.remove.bind(null, layer2);

portnoy.add(layer);
portnoy.add(layer2);
portnoy.start();
setTimeout(remove, 5000);

function remove () {
    portnoy.remove(layer2);
}
function blip (freq, time, step) {
    var osc = k.createOscillator();
    osc.connect(k.destination);
    osc.frequency.value = freq;
    osc.start(a);
    osc.stop(a + 0.1);
}
````


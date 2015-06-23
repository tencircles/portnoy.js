(function (g) {
    if (typeof module !== "undefined") {
        module.exports = Portnoy;
    } else if (typeof define === "function") {
        g.define(Portnoy);
    } else {
        g.Portnoy = Portnoy;
    }

    function Portnoy (settings) {
        var context = settings.context;
        var tempo = settings.tempo;
        var sPerBeat = 60 / settings.tempo;
        var startTime = -1;
        var timeout = null;
        var layers = [];

        this.add = add;
        function add (layer) {
            if (layer instanceof Layer) {
                layers.push(layer);
            } else {
                throw new Error("That's not a layer, dummy!");
            }
        }
        this.remove = remove;
        function remove (layer) {
            var index = layers.indexOf(layer);
            if (index > -1) {
                layers.splice(index, 1);
            }
        }
        this.start = start;
        function start () {
            startTime = context.currentTime;
            for (var i = 0, ii = layers.length; i < ii; i++) {
                layers[i].start(startTime);
            }
            schedule();
        }

        this.pattern = Pattern;
        function Pattern (pulses, steps) {
            if (!(this instanceof Pattern)) {
                return new Pattern(pulses, steps);
            }

            this.steps = steps;
            this.pulses = pulses;
            this.totalTime = sPerBeat * steps;
            this.pulseTime = this.totalTime / pulses;
            this.startTime = -1;
            this.events = [];

            for (var i = 0; i < pulses; i++) {
                this.events[i] = {
                    time: i * this.pulseTime,
                    beat: parseInt((i * this.pulseTime) / sPerBeat) + 1
                };
            }
        }
        this.layer = Layer;
        function Layer (pattern, callback) {
            if (!(this instanceof Layer)) {
                return new Layer(pattern, callback);
            }
            var totalTime = pattern.totalTime;
            var events = pattern.events;
            var layerStartTime = -1;
            var loops = 0;
            var on = false;
            var index = 0;

            this.start = start;
            function start (time) {
                if (!on) {
                    on = true;
                    layerStartTime = time;
                }
            }
            this.next = next;
            function next (t1) {
                if (index === events.length) {
                    index = 0;
                    loops++;
                }
                for (var t2, i = index, ii = events.length; i < ii; i++) {
                    t2 = layerStartTime + (loops * totalTime) + events[i].time;
                    if (t2 >= t1) {
                        return new Pulse(i + 1, t2, execute);
                    }
                }
                throw new Error("Could not calc next event");
                function execute (a, b) {
                    index = i + 1;
                    callback(a, b);
                }
            }
        }
        function Pulse (beat, scheduledTime, callback) {
            this.beat = beat;
            this.time = scheduledTime;
            this.callback = callback;
        }

        // schedule stuff
        function schedule () {
            var now = context.currentTime;
            var next = layers.map(getPulse).reduce(getSoonest);

            var fromNow = (next.time - 0.03 - now) * 1000;
            if (fromNow <= 0) {
                execute();
            } else {
                timeout = setTimeout(execute, fromNow);
            }
            function execute () {
                next.callback(next.time, next.beat);
                schedule();
            }
        }
        function getPulse (layer) {
            return layer.next(context.currentTime);
        }
        function getSoonest (acc, curr) {
            return acc ? curr.time < acc.time ? curr : acc : curr;
        }
    }
})(this);

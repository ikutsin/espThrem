var Program = (function () {
    function Program() {
    }
    Program.prototype.main = function () {
        console.log("Starting program");
        this.registerThermElement();
    };
    Program.prototype.registerThermElement = function () {
        var el = d3.select("body").append("p").node();
        var listener = new WebSockets.EspSocketListener(el, "ws://192.168.1.106:81/therm");
        d3.json('http://192.168.1.106:80/data.json', function (data) {
            console.log(data);
            var chart = new Charting.DataFrame(data);
            el.addEventListener("onSocketData", function (d) {
                var json = {};
                try {
                    json = JSON.parse(d.data);
                }
                catch (error) { }
                if (json.time) {
                    chart.nextElement(json.time);
                }
            });
            listener.start();
        });
    };
    return Program;
}());
var program = new Program();
program.main();

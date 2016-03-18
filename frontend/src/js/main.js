var Program = (function () {
    function Program() {
    }
    Program.prototype.main = function () {
        console.log("Starting program");
        var windowManagerContainer = d3.select("body").append("div")
            .attr("id", "windowManager")
            .classed("window-manager", true)
            .node();
        var thremContext = new ThremNavigation.ThremContext();
        var windowManager = new ThremNavigation.WindowManager(thremContext, windowManagerContainer, new PageBuilders.IndexBuilder(), new PageBuilders.NotFoundBuilder());
        windowManager.addOrUpdateRoute("test", new PageBuilders.AnalyzeBuilder());
        windowManager.updateLocation();
    };
    Program.prototype.registerThermElement = function () {
        //Promise.resolve("Success").then(function(value) {
        //    console.log(value); // "Success"
        //}, function(value) {
        //    // not called
        //});
        //var listener = new WebSockets.EspSocketListener(el, "ws://192.168.1.106:81/threm");
        //d3.json('http://192.168.1.106:80/data.json', data => {
        //    console.log(data);
        //    var chart = new Charting.StreamingLineChart(data);
        //    el.addEventListener('onSocketData', d => {
        //        var json: any = {};
        //        try {
        //            json = JSON.parse((<any>d).data);
        //        } catch (error) {
        //        }
        //        if (json.time) {
        //            chart.notifyNewItem(json.time);
        //        }
        //    });
        //    listener.start();
        //});
    };
    return Program;
})();
var program = new Program();
program.main();
//# sourceMappingURL=main.js.map
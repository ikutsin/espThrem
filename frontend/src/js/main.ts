class Program {
    main() {
        console.log("Starting program");

        var windowManagerContainer = <HTMLElement>d3.select("div.window-manager").node();
        var menuContainer = <HTMLElement>d3.select("#limenu").node();
        var thremContext = new ThremNavigation.ThremContext();
        var notFoundBuilder = new PageBuilders.NotFoundBuilder();
        var indexBuilder = new PageBuilders.IndexBuilder();
        var windowManager = new ThremNavigation.WindowManager(
            thremContext,
            windowManagerContainer,
            menuContainer,
            new Charting.Loader(<HTMLElement>d3.select(".overlay-loader").node()),
            indexBuilder,
            notFoundBuilder);

        windowManager.addOrUpdateRoute("setup", "Setup", new PageBuilders.SetupBuilder());
        windowManager.addOrUpdateRoute("test", "Test", new PageBuilders.AnalyzeBuilder());
        windowManager.addOrUpdateRoute("notFoundBuilder", "notFoundBuilder", notFoundBuilder);
        windowManager.start();

        var bg = new Charting.Background(<HTMLElement>d3.select(".overlay-background").node());
    }

    private registerThermElement() {




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
    }
}

var program = new Program();
program.main();

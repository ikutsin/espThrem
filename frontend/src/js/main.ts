class Program {
    main() {
        console.log("Starting program");


        var windowManagerContainer = <HTMLElement>d3.select("div.window-manager").node();
        var thremContext = new ThremNavigation.ThremContext();
        var windowManager = new ThremNavigation.WindowManager(thremContext, windowManagerContainer, new PageBuilders.IndexBuilder(), new PageBuilders.NotFoundBuilder());

        windowManager.addOrUpdateRoute("test", new PageBuilders.AnalyzeBuilder());
        windowManager.updateLocation();

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

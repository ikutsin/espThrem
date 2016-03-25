class Program {
    main() {
        console.log("Starting program");

        var windowManagerContainer = <HTMLElement>d3.select("div.window-manager").node();
        var menuContainer = <HTMLElement>d3.select("#limenu").node();

        var thremContext = new Threm.ThremContext();
        var notFoundBuilder = new PageBuilders.NotFoundBuilder();
        var indexBuilder = new PageBuilders.IndexBuilder();

        var windowManager = new ThremNavigation.WindowManager(
            thremContext,
            windowManagerContainer,
            menuContainer,
            new Charting.Loader(<HTMLElement>d3.select(".overlay-loader").node()),
            indexBuilder,
            notFoundBuilder);

        windowManager.addOrUpdateRoute("wifisetup", "Wifi setup", new PageBuilders.WifisetupBuilder());
        windowManager.addOrUpdateRoute("analyze", "Info", new PageBuilders.AnalyzeBuilder());

        //test
        windowManager.addOrUpdateRoute("lipsum", "Lipsum", new PageBuilders.StaticTemplateBuilder("test", "lipsum", {}));
        windowManager.addOrUpdateRoute("setup", "Setup", new PageBuilders.StaticTemplateBuilder("test", "form", {}));
        windowManager.addOrUpdateRoute("test", "Test", new PageBuilders.StaticTemplateBuilder("test", "test", {}));
        windowManager.addOrUpdateRoute("notFoundBuilder", "notFoundBuilder", notFoundBuilder);

        thremContext.addPlugin(new ThremPlugins.AcknowledgePlugin(12)); //diag
        thremContext.addPlugin(new ThremPlugins.AcknowledgePlugin(1)); //wifi
        thremContext.addPlugin(new ThremPlugins.AcknowledgePlugin(3)); //captive
        //thremContext.addPlugin(new ThremPlugins.AcknowledgePlugin(13)); //websocket
        thremContext.addPlugin(new ThremPlugins.AcknowledgePlugin(6)); //spiffs
        thremContext.addPlugin(new ThremPlugins.AcknowledgePlugin(21)); //ssdp
        thremContext.addPlugin(new ThremPlugins.AcknowledgePlugin(31)); //core api
        thremContext.addPlugin(new ThremPlugins.AcknowledgePlugin(32)); //info api

        thremContext.promiseStart()
            .then(p => new Promise<any>((c, d) => {
                windowManager.start();

                thremContext.triggerRestartRerquired();

                thremContext.notifications.addNotification(new ThremNotification.ThremNotificaiton("Copyright @ ikutsin"));
                c();
            }))
            .catch(p => {
                thremContext.onPromiseError(p);
            });
        var bg = new Charting.Background(<HTMLElement>d3.select(".overlay-background").node());
    }

    private registerThermElement() {
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

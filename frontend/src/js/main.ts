class Program {
    main() {
        console.log("Starting program");

        var thremContext = new Threm.ThremContext(
            new Charting.Loader(<HTMLElement>d3.select(".overlay-loader").node()),
            <HTMLElement>d3.select(".footer").node());

        var rootMenu = new ThremNavigation.TabsManager(
            thremContext,
            <HTMLElement>d3.select("ul#root-menu").node(),
            <HTMLElement>d3.select("div#root-content").node());

        thremContext.plugins.registerPlugin(new ThremPlugins.AcknowledgePlugin(12)); //diag
        thremContext.plugins.registerPlugin(new ThremPlugins.AcknowledgePlugin(1)); //wifi
        thremContext.plugins.registerPlugin(new ThremPlugins.AcknowledgePlugin(3)); //captive
        //thremContext.registerPlugin(new ThremPlugins.AcknowledgePlugin(13)); //websocket
        thremContext.plugins.registerPlugin(new ThremPlugins.AcknowledgePlugin(6)); //spiffs
        thremContext.plugins.registerPlugin(new ThremPlugins.AcknowledgePlugin(21)); //ssdp
        thremContext.plugins.registerPlugin(new ThremPlugins.AcknowledgePlugin(31)); //core api
        thremContext.plugins.registerPlugin(new ThremPlugins.AcknowledgePlugin(32)); //info api


        setInterval(() => {
            thremContext.busPublishNotifiable(new DataRepository.DataStreamElement(new DataRepository.DataStreamProvider("random"), Math.random()));
        }, 1000);

        var randomBuffer = new DataRepository.DataStreamBuffer("random", thremContext);
        

        var randomNumber = new PageBuilders.LastNumberWidgetBuilder("random", "Random", c => c);
        var randomNumberSparkline = new PageBuilders.SparklineWidgetBuilder(randomBuffer, "Random");
        
        ////should move to plugins
        var dashboard = new PageBuilders.DashboardPageBuilder(() => new Promise<ThremNavigation.IContentBuilder[]>((c, d) => {
            c([
                randomNumber,
                randomNumberSparkline
                //new PageBuilders.StaticTemplateBuilder("test", "widget", { text: 88 }),
                //new PageBuilders.StaticTemplateBuilder("test", "widget", { text: 883, widgetType: "x2" }),
                //new PageBuilders.StaticTemplateBuilder("test", "widget", { text: 88888 }),
            ]);
        }));
        rootMenu.addOrUpdateElement("index", "Home", dashboard);
        rootMenu.addOrUpdateElement("setup", "Setup", new PageBuilders.TabsBuilder("setup",
            t => new Promise((c, d) => {
                t.addOrUpdateElement("wifi", "Wifi setup", new PageBuilders.WifisetupBuilder());
                t.addOrUpdateElement("index", "Plugins", new PageBuilders.PluginSetupBuilder());
                c();
            })));
        rootMenu.addOrUpdateElement("info", "Analyze", new PageBuilders.TabsBuilder("info",
            t => new Promise((c, d) => {
                t.addOrUpdateElement("status", "Status", new PageBuilders.StatusInfoBuilder());
                t.addOrUpdateElement("chip", "Chip", new PageBuilders.ChipInfoBuilder());
                t.addOrUpdateElement("wifi", "Wifi", new PageBuilders.WifiInfoBuilder());
                t.addOrUpdateElement("files", "Files", new PageBuilders.FileListBuilder());
                c();
            })));

        thremContext.promiseStart()
            .then(p => new Promise<any>((c, d) => {
                ((bus) => {
                })(thremContext.bus);
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

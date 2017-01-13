///<reference path="../../Scripts/typings/es6-promise/es6-promise.d.ts"/>
class Program {
    main() {
        console.log("Starting program");

        var thremContext = new Threm.ThremContext();

        thremContext.plugins.addPlugin(new ThremPlugins.CoreApiPlugin()); //core api=31
        thremContext.plugins.addPlugin(new ThremPlugins.WifiPlugin()); //wifi=1
        thremContext.plugins.addPlugin(new ThremPlugins.SpiffsPlugin()); //spiffs=6
        thremContext.plugins.addPlugin(new ThremPlugins.SsdpPlugin()); //ssdp=21
        thremContext.plugins.addPlugin(new ThremPlugins.AcknowledgePlugin(3)); //captive

        thremContext.plugins.addPlugin(new ThremPlugins.ThermPlugin(0)); //therm=40
        thremContext.plugins.addPlugin(new ThremPlugins.InfoApiPlugin(1)); //info api=32

        thremContext.plugins.addPlugin(new ThremPlugins.BufferPlugin("Therm", 0)); //ThermBuffer
        thremContext.plugins.addPlugin(new ThremPlugins.BufferPlugin("Diag", 1)); //DiagBuffer
        thremContext.plugins.addPlugin(new ThremPlugins.MqttPlugin()); //mqtt=14

        thremContext.plugins.addPlugin(new ThremPlugins.DiagPlugin()); //diag=12

        //thremContext.plugins.addPlugin(new ThremPlugins.WebSocketPlugin()); //websocket=13
        //thremContext.plugins.addPlugin(new ThremPlugins.AcknowledgePlugin(2)); //led

        thremContext.loader.show();
        thremContext.promiseStart()
            .then(p => new Promise<any>((c, d) => {
                ((bus) => {
	                console.log("thremStarted");
                    thremContext.loader.hide();
                })(thremContext.bus);
            }))
            .catch(p => {
                thremContext.onPromiseError(p);
            });
        var bg = new Charting.Background(<HTMLElement>d3.select(".overlay-background").node());
    }
}

var program = new Program();
program.main();

///<reference path="../../Scripts/typings/es6-promise/es6-promise.d.ts"/>
class Program {
    main() {
        console.log("Starting program");

        var thremContext = new Threm.ThremContext();

        thremContext.plugins.addPlugin(new ThremPlugins.WifiPlugin()); //wifi=1
        thremContext.plugins.addPlugin(new ThremPlugins.CoreApiPlugin()); //core api=31
        thremContext.plugins.addPlugin(new ThremPlugins.DiagPlugin()); //diag=12
        thremContext.plugins.addPlugin(new ThremPlugins.InfoApiPlugin()); //info api=32
        thremContext.plugins.addPlugin(new ThremPlugins.SpiffsPlugin()); //spiffs=6
        thremContext.plugins.addPlugin(new ThremPlugins.SsdpPlugin()); //ssdp=21

        thremContext.plugins.addPlugin(new ThremPlugins.AcknowledgePlugin(3)); //captive
        //thremContext.registerPlugin(new ThremPlugins.WebSocketPlugin()); //websocket=13

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
}

var program = new Program();
program.main();

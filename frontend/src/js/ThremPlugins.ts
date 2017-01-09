///<reference path="../../Scripts/typings/es6-promise/es6-promise.d.ts"/>
module ThremPlugins {
    export interface IThremPlugin {
        id: number;
        data: IThremPluginData;
        register(context: Threm.ThremContext): Promise<ThremPluginRegistration>;
    }

    export interface IThremPluginData {
        id: number;
        name: number;
        running: number;
        config: any;
    }

    export class ThremPluginRoute {
        constructor(public route: string, public title: string, public builder: ThremNavigation.IContentBuilder) {

        }
    }

    export class ThremPluginRegistration {
        routes: ThremPluginRoute[] = [];
        widgets: ThremNavigation.IContentBuilder[] = [];
    }

    export class PluginManager {
        public plugins: IThremPlugin[] = [];
        private isStarted: boolean = false;

        constructor(public context: Threm.ThremContext) {

        }

        promiseInitialize(): Promise<any> {
            this.isStarted = true;
            return this.context.communication.getJson("/info/threm.json")
                .then(p => new Promise((c, d) => {
                    let result = <IThremPluginData[]>p;
                    for (var api of this.plugins) {
                        var item1 = result.filter(conf => conf.id == api.id)[0];
                        if (!item1) {
                            d({ error: "Plugin not found on device:" + api.id });
                            return;
                        }
                        api.data = item1;
                    }
                    for (var conf of result) {
                        var item2 = this.plugins.filter(api => conf.id == api.id)[0];
                        if (!item2) {
                            d({ error: "Plugin not found on frontend:" + conf.id + " " + conf.name });
                            return;
                        }
                    }

                    let registrationPromises = this.plugins.map(api => {
                        if (~~api.data.config.off) {
                            console.log("Skip", api);
                            return undefined;
                        }
                        console.log("Registering", api);
                        return api.register(this.context);
                    });

                    Promise.all(registrationPromises)
                        .then(p => {
                            let registrations: ThremPluginRegistration[] = p;
                            let widgetz: ThremNavigation.IContentBuilder[] = [];
                            let routes: ThremPluginRoute[] = [];


                            for (let i in registrations) {
                                if (!(registrations[i])) continue;
                                if (registrations[i].widgets) {
                                    for (let iw in registrations[i].widgets) {
                                        widgetz.push(registrations[i].widgets[iw]);
                                    }
                                }
                                if (registrations[i].routes) {
                                    for (let ir in registrations[i].routes) {
                                        routes.push(registrations[i].routes[ir]);
                                    }
                                }
                            }

                            //add widgets
                            var dashboard = new PageBuilders.DashboardPageBuilder(this.context, () => new Promise<ThremNavigation.IContentBuilder[]>((c, d) => {
                                c(widgetz);
                            }));
                            this.context.tabManager.addElement(new ThremNavigation.TabElement("index", "Home", dashboard));


                            let namesMap = {
                                setup: "Setup",
                                info: "Info",
                            }
                            //add routes
                            var submenus: any = {};
                            for (let route of routes) {
                                let tabManager = this.context.tabManager;
                                let rourteArr = route.route.split(".");
                                for (let ri in rourteArr) {
                                    if (~~ri + 1 === rourteArr.length) {
                                        tabManager.addElement(new ThremNavigation.TabElement(rourteArr[ri], route.title, route.builder));
                                    } else {
                                        let key = rourteArr[ri] + ri;
                                        if (!submenus.hasOwnProperty(key)) {
                                            submenus[key] = new PageBuilders.TabsBuilder(this.context, rourteArr[ri]);
                                            let title = namesMap[rourteArr[ri]] ? namesMap[rourteArr[ri]] : rourteArr[ri];
                                            tabManager.addElement(new ThremNavigation.TabElement(rourteArr[ri], title, submenus[key]));

                                        }
                                        tabManager = submenus[key];
                                    }
                                }
                            }
                            c();
                        }).catch(p => this.context.onPromiseError(p));
                }));
        }

        getPlugin<T extends IThremPlugin>(id: number): T {
            return <T>this.plugins.filter(a => a.id == id)[0];
        }

        isPluginRunning(id: number): boolean {
            return this.getPlugin(id).data.running > 0;
        }

        addPlugin(plugin: IThremPlugin) {
            if (this.isStarted) {
                console.log("Plugin NOT added:", plugin);
                return;
            }
            console.log("Plugin added:", plugin);
            this.plugins.push(plugin);
        }

        bindConfigForm(id: number, element: HTMLElement) {
            var data = this.getPlugin(id).data.config;
            var forma = <HTMLElement>d3.select(element).datum(data).select("form").node();
            this.context.mixer.formFromJson(forma, data);
            d3.select(forma).on("submit", (d, a, e) => {
                var form = <HTMLElement>d3.select(element).select("form").node();
                var result = this.context.mixer.formToJson(form);

                this.context.loader.show();
                this.postConfiguration(id, result)
                    .then(p => {
                        this.context.loader.hide();
                        this.context.triggerRestartRerquired();
                    })
                    .catch(p => {
                        this.context.onPromiseError(p);
                    });
                (<any>d3.event).preventDefault();
                return false;
            });
        }

        postConfiguration(id: number, config: any): Promise<any> {
            console.log("postConfiguration", id, config);
            return this.context.communication.postText("/configure", { id: id, data: JSON.stringify(config) });
        }
    }


    export class AcknowledgePlugin implements IThremPlugin {
        id: number;
        data: IThremPluginData;
        constructor(id: number) {
            this.id = id;
        }

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            return Promise.resolve(<ThremPluginRegistration>undefined);
        }
    }

    export class WifiPlugin implements IThremPlugin {
        id: number = 1;
        data: IThremPluginData;

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            let registration: ThremPluginRegistration = new ThremPluginRegistration();

            registration.routes.push(new ThremPluginRoute("setup.wifi", "Wifi Setup", new PageBuilders.WifiSetupBuilder(context)));
            registration.routes.push(new ThremPluginRoute("info.wifi", "Wifi", new PageBuilders.WifiInfoBuilder(context)));
            return Promise.resolve(registration);
        }
    }

    export class CoreApiPlugin implements IThremPlugin {
        id: number = 31;
        data: IThremPluginData;

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            let registration: ThremPluginRegistration = new ThremPluginRegistration();

            registration.routes.push(new ThremPluginRoute("setup.index", "Plugins", new PageBuilders.PluginSetupBuilder(context)));
            registration.routes.push(new ThremPluginRoute("setup.restart", "Restart", new PageBuilders.RestartBuilder(context)));
            return Promise.resolve(registration);
        }

        restartDevice(communication: DataRepository.Communication): Promise<string> {
            return communication.postText("/restart", {});
        }
        resetDevice(communication: DataRepository.Communication): Promise<string> {
            return communication.postText("/reset", {});
        }
    }

    export class DiagPlugin implements IThremPlugin {
        id: number = 12;
        data: IThremPluginData;

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            setInterval(() => {
                context.busPublishNotifiable(new DataRepository.DataStreamElement(new DataRepository.DataStreamProvider("random"), Math.random() * 1));
            }, 500);
            var randomBuffer = new DataRepository.DataStreamBuffer("random", context);

            let registration: ThremPluginRegistration = new ThremPluginRegistration();
            registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, "random", "Random", c => "" + Math.round(c * 1000)));
            registration.widgets.push(new PageBuilders.SparklineWidgetBuilder(context, randomBuffer, "Random", 1));
            return Promise.resolve(registration);
        }
    }

    export class InfoApiPlugin implements IThremPlugin {
        id: number = 32;
        data: IThremPluginData;

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            let registration: ThremPluginRegistration = new ThremPluginRegistration();

            registration.routes.push(new ThremPluginRoute("info.status", "Status", new PageBuilders.StatusInfoBuilder(context)));
            registration.routes.push(new ThremPluginRoute("info.chip", "Chip", new PageBuilders.ChipInfoBuilder(context)));
            return Promise.resolve(registration);
        }
    }

    export class SpiffsPlugin implements IThremPlugin {
        id: number = 6;
        data: IThremPluginData;

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            let registration: ThremPluginRegistration = new ThremPluginRegistration();

            registration.routes.push(new ThremPluginRoute("info.files", "Files", new PageBuilders.FileListBuilder(context)));
            return Promise.resolve(registration);
        }
    }

    export class SsdpPlugin implements IThremPlugin {
        id: number = 21;
        data: IThremPluginData;

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            let registration: ThremPluginRegistration = new ThremPluginRegistration();

            registration.routes.push(new ThremPluginRoute("setup.ssdp", "SSDP", new PageBuilders.SsdpSetupBuilder(context)));
            return Promise.resolve(registration);
        }
    }


    export class ThermPlugin implements IThremPlugin {
        id: number = 40;
        data: IThremPluginData;

        constructor(private bufferindex: number) {

        }

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            let registration: ThremPluginRegistration = new ThremPluginRegistration();

            registration.routes.push(new ThremPluginRoute("setup.therm", "Thermometer", new PageBuilders.SetupThermBuilder(context)));
            registration.routes.push(new ThremPluginRoute("info.therm", "Thermometer", new PageBuilders.ThermInfoBuilder(context)));

            //widget
            let isLastWasHandled = true;
            let intervalThermId;

            let hProvider = new DataRepository.DataStreamProvider("thermH")
            let cProvider = new DataRepository.DataStreamProvider("thermC")
            let tProvider = new DataRepository.DataStreamProvider("thermT")

            let startThermWidgetsUpdate = () => {
                let dpThermUpdate = () => {
                    if (!isLastWasHandled) {
                        console.log("isLastWasHandled return. newver should happen")
                        return;
                    }
                    isLastWasHandled = false;
                    context.communication.getJson("/therm.json")
                        .then(p => {
                            isLastWasHandled = true;
                            let items = context.mixer.makeArray(p)

                            context.busPublishNotifiable(new DataRepository.DataStreamElement(hProvider, p["h"]));
                            context.busPublishNotifiable(new DataRepository.DataStreamElement(tProvider, p["hic"]));
                            context.busPublishNotifiable(new DataRepository.DataStreamElement(cProvider, p["t"]));
                        });
                }
                clearInterval(intervalThermId);
                dpThermUpdate();
                intervalThermId = setInterval(dpThermUpdate, 15*1000);
            }


            //read all and prefill buffer
            var thermHBuffer = new DataRepository.DataStreamBuffer(hProvider.name, context);
            var thermTBuffer = new DataRepository.DataStreamBuffer(tProvider.name, context);
            var thermCBuffer = new DataRepository.DataStreamBuffer(cProvider.name, context);


            var promise = context.communication.getJson("/buffer/" + this.bufferindex + ".json")
                .then(data => context.mixer.makeArray(data))
                .then(data => {
                   
                    for (var item of data) {
                        console.log("--", item.value);
                        switch (item.value.type) {
                            case 1:
                                thermCBuffer.addItem(new DataRepository.DataStreamElement(cProvider, item.value.value));
                                break;
                            case 2:
                                thermHBuffer.addItem(new DataRepository.DataStreamElement(hProvider, item.value.value));
                                break;
                            case 3:
                                thermTBuffer.addItem(new DataRepository.DataStreamElement(tProvider, item.value.value));
                                break;
                        }
                    }

                    startThermWidgetsUpdate();
                }).catch(p => {
                    context.onPromiseError(p);
                });
            

            //todo: if all good init interval
            setTimeout(startThermWidgetsUpdate, 30*1000);


            registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, hProvider.name, "Humidity", c => c));
            registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, tProvider.name, "Feel", c => c));
            registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, cProvider.name, "Celsius", c => c));

            registration.widgets.push(new PageBuilders.SparklineWidgetBuilder(context, thermTBuffer, "Feel", 40, -20));
            registration.widgets.push(new PageBuilders.SparklineWidgetBuilder(context, thermHBuffer, "Humidity", 80));
            registration.widgets.push(new PageBuilders.SparklineWidgetBuilder(context, thermCBuffer, "Celsius", 40, -20));

            return Promise.resolve(registration);
        }
    }

    export class MqttPlugin implements IThremPlugin {
        id: number = 14;
        data: IThremPluginData;

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            let registration: ThremPluginRegistration = new ThremPluginRegistration();

            registration.routes.push(new ThremPluginRoute("setup.mqtt", "MQTT", new PageBuilders.SetupMqttBuilder(context)));
            return Promise.resolve(registration);
        }
    }

    export class BufferPlugin implements IThremPlugin {
        id: number;
        data: IThremPluginData;

        constructor(public name:string, public bufferIndex: number) {
            this.id = 100 + bufferIndex;
        }

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            let registration: ThremPluginRegistration = new ThremPluginRegistration();

            registration.routes.push(new ThremPluginRoute("info.buffer-" + this.name.toLowerCase(), this.name + " Buffer",
                new PageBuilders.InfoBufferBuilder(context, this.name, this.bufferIndex)));

            registration.routes.push(new ThremPluginRoute("setup.buffer-" + this.name.toLowerCase(), this.name + " Buffer",
                new PageBuilders.SetupBufferBuilder(context, this.name, this.bufferIndex)));
            return Promise.resolve(registration);
        }
    }
} 
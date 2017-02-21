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
                            var err = "Plugin not found on device:" + api.id;
                            //d({ error: err });
                            //return;
                            alert(err);

                        }
                        api.data = item1;
                    }
                    for (var conf of result) {
                        var item2 = this.plugins.filter(api => conf.id == api.id)[0];
                        if (!item2) {
                            var err = "Plugin not found on frontend:" + conf.id + " " + conf.name
                            //d({ error: err });
                            //return;
                            alert(err);
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
							var dashboard = new PageBuilders.DashboardPageBuilder(this.context,
								() => new Promise<ThremNavigation.IContentBuilder[]>((c, d) => {
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
            var randomBuffer = new DataRepository.ListeningDataStreamBuffer("random", context);

            let registration: ThremPluginRegistration = new ThremPluginRegistration();
            registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, "random", "Random", c => "" + Math.round(c * 1000)));
            registration.widgets.push(new PageBuilders.SparklineWidgetBuilder(context, randomBuffer, "Random", 1));
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

	export class InfoApiPlugin implements IThremPlugin {
        id: number = 32;
        data: IThremPluginData;
		context: Threm.ThremContext;

		infoHeapProvider = new DataRepository.DataStreamProvider("infoHeap");
		infoTimeProvider = new DataRepository.DataStreamProvider("infoTime");

		heapBuffer: DataRepository.SimpleDataStreamBuffer;

		constructor(private bufferindex: number) {
        }

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            let registration: ThremPluginRegistration = new ThremPluginRegistration();
			this.context = context;

            registration.routes.push(new ThremPluginRoute("info.status", "Status", new PageBuilders.StatusInfoBuilder(context)));
            registration.routes.push(new ThremPluginRoute("info.chip", "Chip", new PageBuilders.ChipInfoBuilder(context)));

			this.heapBuffer = new DataRepository.SimpleDataStreamBuffer(this.infoHeapProvider.name, context);

			registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, this.infoHeapProvider.name, "Heap size", c => c));
			registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, this.infoTimeProvider.name, "Alive sec", c => `${Number(c) / 1000}`));
			registration.widgets.push(new PageBuilders.SparklineWidgetBuilder(context, this.heapBuffer, "Heap size", 40 * 1024));

			this.updateWidgetData();
			return Promise.resolve(registration);
        }

		updateWidgetData() {
			this.context.communication.getJson("/buffer/" + this.bufferindex + ".json")
                .then(data => this.context.mixer.makeArray(data))
                .then(data => {
					console.log("updateInfoBuffer");

					let millisVarr: any[] = [];
					let heapVarr: any[] = [];

					for (var item of data) {
                        switch (item.value.type) {
                            case 1:
								millisVarr.push(item.value.value);
                                break;
                            case 2:
								heapVarr.push(item.value.value);
                                break;
                        }
                    }

					this.heapBuffer.setItems(heapVarr.map(v => new DataRepository.DataStreamElement(this.infoHeapProvider, v)));
					this.context.busPublishNotifiable(new DataRepository.DataStreamElement(this.infoHeapProvider, heapVarr.pop()));
					this.context.busPublishNotifiable(new DataRepository.DataStreamElement(this.infoTimeProvider, millisVarr.pop()));

					setTimeout(() => this.updateWidgetData(), 10 * 1000);
				}).catch(p => {
					this.context.onPromiseError(p);
				});
		}
    }

    export class ThermPlugin implements IThremPlugin {
        id: number = 40;
        data: IThremPluginData;

		context: Threm.ThremContext;

		hProvider = new DataRepository.DataStreamProvider("thermH");
		cProvider = new DataRepository.DataStreamProvider("thermC");
		tProvider = new DataRepository.DataStreamProvider("thermT");

		thermHBuffer: DataRepository.SimpleDataStreamBuffer;
		thermTBuffer: DataRepository.SimpleDataStreamBuffer;
		thermCBuffer: DataRepository.SimpleDataStreamBuffer;

        constructor(private bufferindex: number) {
        }

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            let registration: ThremPluginRegistration = new ThremPluginRegistration();

            registration.routes.push(new ThremPluginRoute("setup.therm", "Thermometer", new PageBuilders.SetupThermBuilder(context)));
            registration.routes.push(new ThremPluginRoute("info.therm", "Thermometer", new PageBuilders.ThermInfoBuilder(context)));

			this.context = context;

			this.thermHBuffer = new DataRepository.SimpleDataStreamBuffer(this.hProvider.name, context);
            this.thermTBuffer = new DataRepository.SimpleDataStreamBuffer(this.tProvider.name, context);
            this.thermCBuffer = new DataRepository.SimpleDataStreamBuffer(this.cProvider.name, context);

			registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, this.hProvider.name, "Humidity", c => c));
            registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, this.tProvider.name, "Feel", c => c));
            registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, this.cProvider.name, "Celsius", c => c));

            registration.widgets.push(new PageBuilders.SparklineWidgetBuilder(context, this.thermTBuffer, "Feel", 40, -20));
            registration.widgets.push(new PageBuilders.SparklineWidgetBuilder(context, this.thermHBuffer, "Humidity", 80));
            registration.widgets.push(new PageBuilders.SparklineWidgetBuilder(context, this.thermCBuffer, "Celsius", 40, -20));

			this.updateWidgetData();
            return Promise.resolve(registration);
        }

		updateWidgetData() {
			this.context.communication.getJson("/buffer/" + this.bufferindex + ".json")
                .then(data => this.context.mixer.makeArray(data))
                .then(data => {
					console.log("updateTermBuffer");
					let thermCvarr: any[] = [];
					let thermHvarr: any[] = [];
					let thermTvarr: any[] = [];

                    for (var item of data) {
                        switch (item.value.type) {
                            case 1:
								thermCvarr.push(item.value.value);
                                break;
                            case 2:
								thermHvarr.push(item.value.value);
                                break;
                            case 3:
								thermTvarr.push(item.value.value);
                                break;
                        }
                    }

					this.thermCBuffer.setItems(thermCvarr.map(v => new DataRepository.DataStreamElement(this.cProvider, v)));
					this.thermHBuffer.setItems(thermHvarr.map(v => new DataRepository.DataStreamElement(this.hProvider, v)));
					this.thermTBuffer.setItems(thermTvarr.map(v => new DataRepository.DataStreamElement(this.tProvider, v)));

					this.context.busPublishNotifiable(new DataRepository.DataStreamElement(this.hProvider, thermHvarr.pop()));
					this.context.busPublishNotifiable(new DataRepository.DataStreamElement(this.tProvider, thermTvarr.pop()));
					this.context.busPublishNotifiable(new DataRepository.DataStreamElement(this.cProvider, thermCvarr.pop()));

					setTimeout(() => this.updateWidgetData(), 15 * 1000);
				}).catch(p => {
                    this.context.onPromiseError(p);
                });
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

        constructor(public name: string, public bufferIndex: number) {
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

    export class RoutePlugin implements IThremPlugin {
        id: number;
        data: IThremPluginData;

        constructor(public name: string, public routeIndex: number) {
            this.id = 200 + routeIndex;
        }

        register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
            return Promise.resolve(<ThremPluginRegistration>undefined);
        }
    }
} 
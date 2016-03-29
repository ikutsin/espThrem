module ThremPlugins {

    export interface IThremPlugin {
        id: number;
        data: IThremPluginData;
    }

    export interface IThremPluginData {
        id: number;
        name: number;
        running: number;
        config: any;
    }

    export class PluginManager {
        public plugins: IThremPlugin[] = [];
        private isStarted:boolean = false;

        constructor(public context: Threm.ThremContext) {
            
        }

        promiseInitialize(): Promise<any> {
            this.isStarted = true;
            return this.context.communication.getJson("/info/threm.json")
                .then(p => new Promise((c, d) => {
                    var result = <IThremPluginData[]>p;
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
                    c();
                }));
        }

        getPlugin<T extends IThremPlugin>(id: number): T {
            return <T>this.plugins.filter(a => a.id == id)[0];
        }

        isPluginRunning(id: number): boolean {
            return this.getPlugin(id).data.running > 0;
        }

        registerPlugin(plugin: IThremPlugin) {
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
    }
} 
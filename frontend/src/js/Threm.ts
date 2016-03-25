///<reference path="../../Scripts/typings/d3/d3.d.ts" />
module Threm {

    export interface IThremPlugin {
        id: number;
        data: IThremPluginData;
    }

    export interface IThremPluginData {
        id: number;
        name: number;
        running: boolean;
        config: any;
    }

    export class ThremContext {
        public doT: ThremNavigation.DoTWrapper;
        public apis: Array<IThremPlugin>;
        public communication: DataRepository.Communication;

        notifications: ThremNotification.NotificationsManager;

        constructor() {
            this.doT = new ThremNavigation.DoTWrapper();
            this.communication = new DataRepository.Communication();
            this.apis = [];
            this.notifications = new ThremNotification.NotificationsManager(this, <HTMLElement>d3.select(".footer").node())
        }

        promiseStart(): Promise<any> {
            return this.communication.getJson("/info/threm.json")
                .then(p => new Promise((c, d) => {
                    var result = <Array<IThremPluginData>>p;
                    for (let api of this.apis) {
                        let item = result.filter(conf => conf.id == api.id)[0];
                        if (!item) {
                            d({ error: "Plugin not found on device:" + api.id });
                            return;
                        }
                        api.data = item;
                    }
                    for (let conf of result) {
                        let item = this.apis.filter(api => conf.id == api.id)[0];
                        if (!item) {
                            d({ error: "Plugin not found on frontend:" + conf.id + " " + conf.name });
                            return;
                        }
                    }
                    c();
                }));
        }

        GetPlugin<T extends IThremPlugin>(id: number): T {
            return <T>this.apis.filter(a => a.id == id)[0];
        }

        IsPluginRunning(id: number): boolean {
            return this.GetPlugin(id).data.running;
        }

        triggerRestartRerquired() {
            this.notifications.addNotification(new ThremNotification.ThremNotificaiton(
                "hello",
                "button",
                d => {
                    this.reloadFrontend();
                }));
        }

        reloadFrontend() {
            console.log("reload");
            location.reload(true);
            //history.go(0);
        }

        addPlugin(plugin: IThremPlugin) {
            console.log("Plugin added:", plugin);
            this.apis.push(plugin);
        }

        onPromiseError(p: any) {
            console.log(p);
            alert(p.error);
        }
    }

}
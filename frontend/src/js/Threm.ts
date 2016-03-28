///<reference path="../../Scripts/typings/d3/d3.d.ts" />
module Threm {

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

    export class ThremContext {
        public doT: ThremNavigation.DoTWrapper;
        public apis: Array<IThremPlugin>;
        public communication: DataRepository.Communication;

        notifications: ThremNotification.NotificationsManager;

        constructor(public loader: Charting.Loader) {
            this.doT = new ThremNavigation.DoTWrapper();
            this.communication = new DataRepository.Communication();
            this.apis = []; 
            this.notifications = new ThremNotification.NotificationsManager(this, <HTMLElement>d3.select(".footer").node());
        }

        promiseStart(): Promise<any> {
            return this.communication.getJson("/info/threm.json")
                .then(p => new Promise((c, d) => {
                    var result = <Array<IThremPluginData>>p;
                    for (var api of this.apis) {
                        var item1 = result.filter(conf => conf.id == api.id)[0];
                        if (!item1) {
                            d({ error: "Plugin not found on device:" + api.id });
                            return;
                        }
                        api.data = item1;
                    }
                    for (var conf of result) {
                        var item2 = this.apis.filter(api => conf.id == api.id)[0];
                        if (!item2) {
                            d({ error: "Plugin not found on frontend:" + conf.id + " " + conf.name });
                            return;
                        }
                    }
                    c();
                }));
        }

        getPlugin<T extends IThremPlugin>(id: number): T {
            return <T>this.apis.filter(a => a.id == id)[0];
        }

        isPluginRunning(id: number): boolean {
            return this.getPlugin(id).data.running>0;
        }

        triggerRestartRerquired() {
            this.notifications.addNotification(new ThremNotification.ThremNotificaiton(
                "Device has to be restarted to get new changes.",
                "Restart",
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
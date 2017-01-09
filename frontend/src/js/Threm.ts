///<reference path="../../Scripts/typings/d3/d3.d.ts" />
///<reference path="../../Scripts/typings/es6-promise/es6-promise.d.ts"/>
module Threm {
    export interface INotifiable {
        getMessageName(): string;
    }
    export class ThremContext {
        public doT: ThremNavigation.DoTWrapper = new ThremNavigation.DoTWrapper();
        public communication: DataRepository.Communication = new DataRepository.Communication();
        public mixer: DataRepository.Mixer = new DataRepository.Mixer();
        public notifications: ThremNotification.NotificationsManager;
        public plugins: ThremPlugins.PluginManager;
        public bus: EventAggregator.EventManager;
        public loader: Charting.Loader;
        public tabManager: ThremNavigation.ITabManager;

        private routeManager: ThremNavigation.RouteManager;
        private notificationsElement: HTMLElement;

        constructor() {
            this.loader = new Charting.Loader(<HTMLElement>d3.select(".overlay-loader").node());
            this.notificationsElement = <HTMLElement>d3.select(".footer").node();

            this.notifications = new ThremNotification.NotificationsManager(this, this.notificationsElement);
            this.plugins = new ThremPlugins.PluginManager(this);
            this.routeManager = new ThremNavigation.RouteManager(this);
            this.bus = new EventAggregator.EventManager();

            this.tabManager = new ThremNavigation.TabsManager(this, <HTMLElement>d3.select("ul#root-menu").node(), <HTMLElement>d3.select("div#root-content").node());
        }

        triggerRestartRerquired() {
            this.notifications.addNotification(new ThremNotification.ThremNotificaiton(
                "Device has to be restarted to get new changes.",
                "Restart",
                d => {
                    this.reloadAll();
                }));
        }

        busPublishNotifiable(notifiable: INotifiable) {
            this.bus.publish(notifiable.getMessageName(), notifiable);
        }

        reloadAll(isReset = false) {
            this.loader.show();
            var corePlugin = this.plugins.getPlugin<ThremPlugins.CoreApiPlugin>(31);

            var promise: Promise<any>;

            if (isReset) {
                promise = corePlugin.resetDevice(this.communication)
                    .then(p => this.notifications.addNotification(new ThremNotification.ThremNotificaiton("Reset done. Will reload soon.")));
            } else {
                promise = corePlugin.restartDevice(this.communication)
                    .then(p => this.notifications.addNotification(new ThremNotification.ThremNotificaiton("Restart done. Will reload soon.")));
            }
            promise = promise.then(p => {
                setTimeout(() => {
                    this.reloadFrontend();
                }, 10000);
            });
            promise.catch(p => this.onPromiseError(p));
        }

        reloadFrontend() {
            this.loader.show();
            location.reload(true);
        }

        onPromiseError(p: any) {
            let ptype = {}.toString.apply(p);
            console.log(ptype, p);
            if (p.error) {
                this.notifications.addNotification(new ThremNotification.ThremNotificaiton("ERROR:" + p.error));
            } else if (ptype === "[object XMLHttpRequest]") {
                this.notifications.addNotification(new ThremNotification.ThremNotificaiton("ERROR in request:" + p.responseURL + " " + p.status + " " + p.statusText));
            } else if (ptype === "[object Exception]" || ptype === "[object Error]") {
                this.notifications.addNotification(new ThremNotification.ThremNotificaiton("Exception:" + p));
            } else {
                this.notifications.addNotification(new ThremNotification.ThremNotificaiton("UNKNOWN ERROR: of type" + ptype));
            }
            if (window.location.hash != "#setup.restart") {
                window.location.hash = "#setup.restart";
            } else {
                this.loader.hide();
            }
        }

        promiseStart(): Promise<any> {
            return this.plugins.promiseInitialize()
                .then(p => {
                    //this.notifications.addNotification(new ThremNotification.ThremNotificaiton("done by Ikutsin"));
                    this.routeManager.start();
                });
        }
    }
}
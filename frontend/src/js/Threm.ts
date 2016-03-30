///<reference path="../../Scripts/typings/d3/d3.d.ts" />
module Threm {
    export interface INotifiable {
        getMessageName():string;
    }
    export class ThremContext {
        public doT: ThremNavigation.DoTWrapper = new ThremNavigation.DoTWrapper();
        public communication: DataRepository.Communication = new DataRepository.Communication();
        public mixer: DataRepository.Mixer = new DataRepository.Mixer();
        public notifications: ThremNotification.NotificationsManager;
        public plugins: ThremPlugins.PluginManager;
        public bus:EventAggregator.EventManager;

        private routeManager: ThremNavigation.RouteManager;

        constructor(public loader: Charting.Loader, notificationsElement: HTMLElement) {
            this.notifications = new ThremNotification.NotificationsManager(this, notificationsElement);
            this.plugins = new ThremPlugins.PluginManager(this);
            this.routeManager = new ThremNavigation.RouteManager(this);
            this.bus = new EventAggregator.EventManager();
        }

        triggerRestartRerquired() {
            this.notifications.addNotification(new ThremNotification.ThremNotificaiton(
                "Device has to be restarted to get new changes.",
                "Restart",
                d => {
                    this.reloadFrontend();
                }));
        }

        busPublishNotifiable(notifiable: INotifiable) {
            this.bus.publish(notifiable.getMessageName(), notifiable);
        }

        reloadFrontend() {
            console.log("reload");
            location.reload(true);
            //history.go(0);
        }

        onPromiseError(p: any) {
            console.log(p);
            alert(p.error);
        }

        promiseStart(): Promise<any> {
            return this.plugins.promiseInitialize()
                .then(p => {
                    this.notifications.addNotification(new ThremNotification.ThremNotificaiton("Copyright @ ikutsin"));
                    this.routeManager.start();
                });
        }
    }
}
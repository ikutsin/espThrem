module ThremNotification {
    export class ThremNotificaiton {
        public key: string;
        constructor(
            public text: string,
            public button?: string,
            public clickAction?: (any) => void) {
            this.key = text;
        }
    }

    export class NotificationsManager {
        private notifications: Array<ThremNotificaiton> = [];
        notificationTemplate: (any) => string;
        constructor(
            private context: Threm.ThremContext,
            private element: HTMLElement) {
            this.context.doT.getTemplate("global", "notification")
                .then(p => {
                    this.notificationTemplate = p;
                    this.render();
                })
                .catch(context.onPromiseError);
        }

        addNotification(notification: ThremNotificaiton) {
            if (this.notifications.filter(n => n.key == notification.key).length) return;
            console.log("Add notificaiton", notification);
            this.notifications.push(notification);
            this.render();
        }

        private render() {

            if (!this.notificationTemplate) {
                return;
            }

            var data = d3.select(this.element).selectAll("div.notification")
                .data(this.notifications, d => d.text);

            var height = "40px";

            data.exit()
                .style("height", height)
                .transition()
                .style("height", "1px").remove();

            var containerEnter = data.enter()
                .append("div")
                .classed("notification", true);

            containerEnter
                .style("height", "1px")
                .transition()
                .style("height", height);

            var template = containerEnter.html(d=> this.notificationTemplate(d));
            template.select("button.action")
                .on('click', (d, i) => this.notifications[i].clickAction(d));

            template.select("button.close")
                .on('click', (d, i) => {
                    this.notifications.splice(i, 1);
                    this.render();
                });
        }
    }
} 
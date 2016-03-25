module ThremNotification {
    export class ThremNotificaiton {
        constructor(
            public text: string,
            public button?: string,
            public clickAction?: (any) => void) {

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
            this.notifications.push(notification);
            this.render();
        }
        ensureNotification(notification: ThremNotificaiton) {
            this.notifications.push(notification);
            this.render();
        }

        private render() {
            var data = d3.select(this.element).selectAll("div.notification")
                .data(this.notifications);

            data.exit().remove();

            var template = data.enter()
                .append("div")
                .classed("notification", true)
                .html(d=> this.notificationTemplate(d));

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
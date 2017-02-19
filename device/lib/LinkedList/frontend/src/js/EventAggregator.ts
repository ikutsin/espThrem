// Module //source: http://csharperimage.jeremylikness.com/2012/11/building-javascript-event-aggregator.html

module EventAggregator {

    class Subscription {
        constructor(
            public id: number,
            public callback: (payload?: any) => void) {
        }
    }

    interface IMessage {
        subscribe(callback: (payload?: any) => void): number;
        unSubscribe(id: number): void;
        notify(payload?: any): void;
    }

    class Message implements IMessage {

        private subscriptions: Subscription[];
        private nextId: number;

        constructor(public message: string) {
            this.subscriptions = [];
            this.nextId = 0;
        }

        public subscribe(callback: (payload?: any) => void) {
            var subscription = new Subscription(this.nextId++, callback);
            this.subscriptions[subscription.id] = subscription;
            return subscription.id;
        }

        public unSubscribe(id: number) {
            this.subscriptions[id] = undefined;
        }

        public notify(payload?: any) {
            var index;
            for (index = 0; index < this.subscriptions.length; index++) {
                if (this.subscriptions[index]) {
                    this.subscriptions[index].callback(payload);
                }
            }
        }
    }

    // Class
    export class EventManager {

        private _messages: any;

        constructor() {
            this._messages = {};
        }

        subscribe(message: string, callback: (payload?: any) => void): number {
            var msg: IMessage;
            msg = this._messages[message] ||
                <IMessage>(this._messages[message] = new Message(message));

            return msg.subscribe(callback);
        }

        unSubscribe(message: string, token: number) {
            if (this._messages[message]) {
                (<IMessage>(this._messages[message])).unSubscribe(token);
            }
        }

        publish(message: string, payload?: any) {
            if (this._messages[message]) {
                (<IMessage>(this._messages[message])).notify(payload);
            }
        }
    }
}

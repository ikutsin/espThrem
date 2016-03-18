module WebSockets {
    export class EspSocketListener {
        private socket: ReconnectingWebSocket;
        private listenElement: HTMLElement;
        private wsAddress: string;

        constructor(listenElement: HTMLElement, wsAddress: string) {
            this.listenElement = listenElement;
            this.wsAddress = wsAddress;
        }

        start() {
            this.stop();
            this.socket = new ReconnectingWebSocket(this.wsAddress);

            this.socket.onopen = () => {
                console.log("socket open.");
            };

            this.socket.onclose = event => {
                if (event.wasClean) {
                    console.log('socket close. code: ' + event.code + ' reason: ' + event.reason + ' wasClean: ' + event.wasClean);
                };
            };

            var el = this.listenElement;
            this.socket.onmessage = event => {
                console.log("got message. " + event.data);

                var ev = <any>new CustomEvent("onSocketData");
                ev.data = event.data;
                el.dispatchEvent(ev);
            };

            this.socket.onerror = (error: any) => {
                console.log("error ", error);
            };
        }

        stop() {
            if (this.socket) {
                this.socket.close();
            }
        }
    }

    class ReconnectingWebSocket {
        //Time to wait before attempting reconnect (after close)
        public reconnectInterval: number = 1000;
        //Time to wait for WebSocket to open (before aborting and retrying)
        public timeoutInterval: number = 2000;

        //Should only be used to read WebSocket readyState
        public readyState: number;

        //Whether WebSocket was forced to close by this client
        private forcedClose: boolean = false;
        //Whether WebSocket opening timed out
        private timedOut: boolean = false;

        //List of WebSocket sub-protocols
        private protocols: string[] = [];

        //The underlying WebSocket
        private ws: WebSocket;
        private url: string;

        //Set up the default 'noop' event handlers
        public onopen: (ev: Event) => void = (event: Event) => { };
        public onclose: (ev: CloseEvent) => void = (event: CloseEvent) => { };
        public onconnecting: () => void = () => { };
        public onmessage: (ev: MessageEvent) => void = (event: MessageEvent) => { };
        public onerror: (ev: ErrorEvent) => void = (event: ErrorEvent) => { };

        constructor(url: string, protocols: string[] = []) {
            this.url = url;
            this.protocols = protocols;
            this.readyState = WebSocket.CONNECTING;
            this.connect(false);
        }

        public connect(reconnectAttempt: boolean) {
            this.ws = new WebSocket(this.url, this.protocols);

            this.onconnecting();
            console.log('ReconnectingWebSocket', 'attempt-connect', this.url);

            var localWs = this.ws;
            var timeout = setTimeout(() => {
                console.log('ReconnectingWebSocket', 'connection-timeout', this.url);
                this.timedOut = true;
                localWs.close();
                this.timedOut = false;
            }, this.timeoutInterval);

            this.ws.onopen = (event: Event) => {
                clearTimeout(timeout);
                console.log('ReconnectingWebSocket', 'onopen', this.url);
                this.readyState = WebSocket.OPEN;
                reconnectAttempt = false;
                this.onopen(event);
            };

            this.ws.onclose = (event: CloseEvent) => {
                clearTimeout(timeout);
                this.ws = null;
                if (this.forcedClose) {
                    this.readyState = WebSocket.CLOSED;
                    this.onclose(event);
                } else {
                    this.readyState = WebSocket.CONNECTING;
                    this.onconnecting();
                    if (!reconnectAttempt && !this.timedOut) {
                        console.log('ReconnectingWebSocket', 'onclose', this.url);
                        this.onclose(event);
                    }
                    setTimeout(() => {
                        this.connect(true);
                    }, this.reconnectInterval);
                }
            };
            this.ws.onmessage = (event) => {
                console.log('ReconnectingWebSocket', 'onmessage', this.url, event.data);
                this.onmessage(event);
            };
            this.ws.onerror = (event: ErrorEvent) => {
                console.log('ReconnectingWebSocket', 'onerror', this.url, event);
                this.onerror(event);
            };
        }

        public send(data: any) {
            if (this.ws) {
                console.log('ReconnectingWebSocket', 'send', this.url, data);
                return this.ws.send(data);
            } else {
                throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
            }
        }

        /**
         * Returns boolean, whether websocket was FORCEFULLY closed.
         */
        public close(): boolean {
            if (this.ws) {
                this.forcedClose = true;
                this.ws.close();
                return true;
            }
            return false;
        }

        /**
         * Additional public API method to refresh the connection if still open (close, re-open).
         * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
         *
         * Returns boolean, whether websocket was closed.
         */
        public refresh(): boolean {
            if (this.ws) {
                this.ws.close();
                return true;
            }
            return false;
        }
    }
}

var WebSockets;
(function (WebSockets) {
    var EspSocketListener = (function () {
        function EspSocketListener(listenElement, wsAddress) {
            this.listenElement = listenElement;
            this.wsAddress = wsAddress;
        }
        EspSocketListener.prototype.start = function () {
            this.stop();
            this.socket = new ReconnectingWebSocket(this.wsAddress);
            this.socket.onopen = function () {
                console.log("socket open.");
            };
            this.socket.onclose = function (event) {
                if (event.wasClean) {
                    console.log('socket close. code: ' + event.code + ' reason: ' + event.reason + ' wasClean: ' + event.wasClean);
                }
                ;
            };
            var el = this.listenElement;
            this.socket.onmessage = function (event) {
                console.log("got message. " + event.data);
                var ev = new CustomEvent("onSocketData");
                ev.data = event.data;
                el.dispatchEvent(ev);
            };
            this.socket.onerror = function (error) {
                console.log("error ", error);
            };
        };
        EspSocketListener.prototype.stop = function () {
            if (this.socket) {
                this.socket.close();
            }
        };
        return EspSocketListener;
    })();
    WebSockets.EspSocketListener = EspSocketListener;
    var ReconnectingWebSocket = (function () {
        function ReconnectingWebSocket(url, protocols) {
            if (protocols === void 0) { protocols = []; }
            //Time to wait before attempting reconnect (after close)
            this.reconnectInterval = 1000;
            //Time to wait for WebSocket to open (before aborting and retrying)
            this.timeoutInterval = 2000;
            //Whether WebSocket was forced to close by this client
            this.forcedClose = false;
            //Whether WebSocket opening timed out
            this.timedOut = false;
            //List of WebSocket sub-protocols
            this.protocols = [];
            //Set up the default 'noop' event handlers
            this.onopen = function (event) { };
            this.onclose = function (event) { };
            this.onconnecting = function () { };
            this.onmessage = function (event) { };
            this.onerror = function (event) { };
            this.url = url;
            this.protocols = protocols;
            this.readyState = WebSocket.CONNECTING;
            this.connect(false);
        }
        ReconnectingWebSocket.prototype.connect = function (reconnectAttempt) {
            var _this = this;
            this.ws = new WebSocket(this.url, this.protocols);
            this.onconnecting();
            console.log('ReconnectingWebSocket', 'attempt-connect', this.url);
            var localWs = this.ws;
            var timeout = setTimeout(function () {
                console.log('ReconnectingWebSocket', 'connection-timeout', _this.url);
                _this.timedOut = true;
                localWs.close();
                _this.timedOut = false;
            }, this.timeoutInterval);
            this.ws.onopen = function (event) {
                clearTimeout(timeout);
                console.log('ReconnectingWebSocket', 'onopen', _this.url);
                _this.readyState = WebSocket.OPEN;
                reconnectAttempt = false;
                _this.onopen(event);
            };
            this.ws.onclose = function (event) {
                clearTimeout(timeout);
                _this.ws = null;
                if (_this.forcedClose) {
                    _this.readyState = WebSocket.CLOSED;
                    _this.onclose(event);
                }
                else {
                    _this.readyState = WebSocket.CONNECTING;
                    _this.onconnecting();
                    if (!reconnectAttempt && !_this.timedOut) {
                        console.log('ReconnectingWebSocket', 'onclose', _this.url);
                        _this.onclose(event);
                    }
                    setTimeout(function () {
                        _this.connect(true);
                    }, _this.reconnectInterval);
                }
            };
            this.ws.onmessage = function (event) {
                console.log('ReconnectingWebSocket', 'onmessage', _this.url, event.data);
                _this.onmessage(event);
            };
            this.ws.onerror = function (event) {
                console.log('ReconnectingWebSocket', 'onerror', _this.url, event);
                _this.onerror(event);
            };
        };
        ReconnectingWebSocket.prototype.send = function (data) {
            if (this.ws) {
                console.log('ReconnectingWebSocket', 'send', this.url, data);
                return this.ws.send(data);
            }
            else {
                throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
            }
        };
        /**
         * Returns boolean, whether websocket was FORCEFULLY closed.
         */
        ReconnectingWebSocket.prototype.close = function () {
            if (this.ws) {
                this.forcedClose = true;
                this.ws.close();
                return true;
            }
            return false;
        };
        /**
         * Additional public API method to refresh the connection if still open (close, re-open).
         * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
         *
         * Returns boolean, whether websocket was closed.
         */
        ReconnectingWebSocket.prototype.refresh = function () {
            if (this.ws) {
                this.ws.close();
                return true;
            }
            return false;
        };
        return ReconnectingWebSocket;
    })();
})(WebSockets || (WebSockets = {}));
//# sourceMappingURL=WebSockets.js.map
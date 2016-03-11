var WebSockets;
(function (WebSockets) {
    var EspSocketListener = (function () {
        function EspSocketListener(listenElement, wsAddress) {
            this.listenElement = listenElement;
            this.wsAddress = wsAddress;
        }
        EspSocketListener.prototype.start = function () {
            this.stop();
            this.socket = new WebSocket(this.wsAddress);
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
    }());
    WebSockets.EspSocketListener = EspSocketListener;
})(WebSockets || (WebSockets = {}));

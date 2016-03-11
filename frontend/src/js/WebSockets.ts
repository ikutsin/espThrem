//or something like: https://github.com/daviddoran/typescript-reconnecting-websocket/blob/master/reconnecting-websocket.ts

module WebSockets {

  export class EspSocketListener {
    socket: WebSocket;
    listenElement: HTMLElement;
    wsAddress: string;

    constructor(listenElement: HTMLElement, wsAddress: string) {
      this.listenElement = listenElement;
      this.wsAddress = wsAddress;
    }

    start() {
      this.stop();
      this.socket = new WebSocket(this.wsAddress); //"ws://192.168.1.106:81/ws");

      this.socket.onopen = function() {
        console.log("socket open.");
      };

      this.socket.onclose = function(event) {
        if (event.wasClean) {
          console.log('socket close. code: ' + event.code + ' reason: ' + event.reason + ' wasClean: ' + event.wasClean);
        };
      };

      var el = this.listenElement;
      this.socket.onmessage = function(event) {
        console.log("got message. " + event.data );

        var ev = <any>new CustomEvent("onSocketData");
        ev.data =  event.data
        el.dispatchEvent(ev);
      };

      this.socket.onerror = function(error:any) {
        console.log("error ", error);
      };
    }

    stop() {
      if (this.socket) {
        this.socket.close();
      }
    }
  }
}

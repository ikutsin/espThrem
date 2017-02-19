export class WebSocketPlugin implements IThremPlugin {
    id: number = 13;
    data: IThremPluginData;

    private messagesRate = 0;

    register(context: Threm.ThremContext): Promise<ThremPluginRegistration> {
        return new Promise<ThremPluginRegistration>((c, d) => {
            let el = <HTMLElement>d3.select("body").node();
            var listener = new WebSockets.EspSocketListener(el, "ws://" + context.communication.ip + ":81/threm");
            el.addEventListener('onSocketData', d => {
                this.messagesRate++;
                try {
                    var json = JSON.parse((<any>d).data);
                    var n = new DataRepository.DataStreamElement(new DataRepository.DataStreamProvider(json.senderId + "_" + json.type), json.value);
                    context.busPublishNotifiable(n);
                } catch (error) {
                    console.log("WS skip:", d);
                }
            });
            setInterval(() => {
                context.busPublishNotifiable(new DataRepository.DataStreamElement(new DataRepository.DataStreamProvider("messageRate"), this.messagesRate));
                this.messagesRate = 0;
                console.log("interval");
            }, 10000);
            listener.start();

            let registration: ThremPluginRegistration = new ThremPluginRegistration();

            registration.widgets.push(new PageBuilders.LastNumberWidgetBuilder(context, "messageRate", "Message rate", c => c));
            c(registration);
        });
    }
}

module ThremPlugins {
    export class AcknowledgePlugin implements Threm.IThremPlugin {
        id: number;
        data: Threm.IThremPluginData;
        constructor(id: number) {
            this.id = id;
        }
    }
} 
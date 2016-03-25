///<reference path="../../Scripts/typings/Custom.d.ts"/>

module PageBuilders {

    import PageBuilder = ThremNavigation.IPageBuilder;

    export class NotFoundBuilder implements PageBuilder {
        spawn(element: HTMLElement, context: Threm.ThremContext): Promise<any> {
            var data = {};
            return context.doT.renderTo(element, "global", "notFound", data);
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }

    export class StaticTemplateBuilder implements PageBuilder {
        constructor(private tn: string, private name: string, private data: any) {
        }
        spawn(element: HTMLElement, context: Threm.ThremContext): Promise<any> {
            return context.doT.renderTo(element, this.tn, this.name, this.data);
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }

    export class IndexBuilder implements PageBuilder {
        spawn(element: HTMLElement, context: Threm.ThremContext):Promise<any> {
            var data = { apis:context.apis };
            return context.doT.renderTo(element, "basic", "index", data);
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }

    export class WifisetupBuilder implements PageBuilder {
        spawn(element: HTMLElement, context: Threm.ThremContext): Promise<any> {
            var data = { apis: context.apis };
            return context.doT.renderTo(element, "basic", "wifiSetup", data);
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }

    export class AnalyzeBuilder implements PageBuilder {
        spawn(element: HTMLElement, context: Threm.ThremContext): Promise<any> {
            var data = {};
            return context.doT.renderTo(element, "basic", "analyze", data);
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }   
}

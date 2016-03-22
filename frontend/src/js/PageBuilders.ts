///<reference path="../../Scripts/typings/Custom.d.ts"/>

module PageBuilders {

    import PageBuilder = ThremNavigation.IPageBuilder;

    export class NotFoundBuilder implements PageBuilder {
        spawn(element: HTMLElement, context: ThremNavigation.ThremContext): Promise<any> {
            var data = {};
            return context.doT.renderTo(element, "global", "notFound", data);
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }

    export class IndexBuilder implements PageBuilder {
        spawn(element:HTMLElement, context: ThremNavigation.ThremContext):Promise<any> {
            var data = { name: "namaaaa" };
            return context.doT.renderTo(element, "basic", "index", data);
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }

    export class SetupBuilder implements PageBuilder {
        spawn(element: HTMLElement, context: ThremNavigation.ThremContext): Promise<any> {
            var data = {};
            return context.doT.renderTo(element, "basic", "setup", data);
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }   

    export class AnalyzeBuilder implements PageBuilder {
        spawn(element:HTMLElement, context: ThremNavigation.ThremContext): Promise<any> {
            var data = {};
            return context.doT.renderTo(element, "test", "test", data);
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }   
}

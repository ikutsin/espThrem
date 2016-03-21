///<reference path="../../Scripts/typings/Custom.d.ts"/>

module PageBuilders {

    import PageBuilder = ThremNavigation.IPageBuilder;
    export class IndexBuilder implements PageBuilder {
        spawn(element:HTMLElement, context: ThremNavigation.ThremContext):Promise<any> {
            console.log("Spawn index");

            var data = { name: "namaaaa" };
            return context.doT.renderTo(element, "pageBuildersTemplates", "index", data);
        }

        die(): Promise<any> {
            console.log("Die index");
            return Promise.resolve({});
        }
    }

    export class NotFoundBuilder implements PageBuilder {
        spawn(element:HTMLElement, context: ThremNavigation.ThremContext): Promise<any> {
            var data = {};
            return context.doT.renderTo(element, "pageBuildersTemplates", "notFound", data);
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }   

    export class AnalyzeBuilder implements PageBuilder {
        spawn(element:HTMLElement, context: ThremNavigation.ThremContext): Promise<any> {
            console.log("Spawn AnalyzeBuilder");
            var result = new Promise<any>((resolve, reject)=> {
                setTimeout(() => resolve(), 2000);
            });

            return result;
        }

        die(): Promise<any> {
            console.log("Die AnalyzeBuilder");
            return Promise.resolve({});
        }
    }   
}

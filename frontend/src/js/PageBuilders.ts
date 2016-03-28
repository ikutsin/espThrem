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
        element: HTMLElement;
        context: Threm.ThremContext;

        spawn(element: HTMLElement, context: Threm.ThremContext): Promise<any> {
            this.element = element;
            this.context = context;
            var data = { apis:context.apis };
            return context.doT.renderTo(element, "basic", "index", data)
                .then(p => this.d3bind());
        }

        private d3bind() {
            var selection = d3.select(this.element).selectAll(".index-api").data(this.context.apis);
            selection.style("color", d => (!~~d.data.running) ? "red" : undefined);

            selection.select(".toggle-on-off")
                .text(d => ~~d.data.config.off ? "OFF" : "ON")
                .on('click', d => {
                    this.context.loader.show();
                    d.data.config.off = ~~d.data.config.off > 0 ? 0 : 1;

                    this.context.communication.postConfiguration(d.id, d.data.config)
                        .then(p => {
                            this.context.loader.hide();
                            this.d3bind();
                            this.context.triggerRestartRerquired();
                        })
                        .catch(p => {
                            this.context.onPromiseError(p);
                        });
                });
        }

        die(): Promise<any> {
            return Promise.resolve({});
        }
    }

    export class WifisetupBuilder implements PageBuilder {
        element: HTMLElement;
        context: Threm.ThremContext;
        scanTemplate: (any) => string;

        spawn(element: HTMLElement, context: Threm.ThremContext): Promise<any> {
            this.element = element;
            this.context = context;
            var data = {};

            return this.context.doT.getTemplate("basic", "wifiScan")
                .then(p => { this.scanTemplate = p; })
                .then(p => context.doT.renderTo(element, "basic", "wifiSetup", data))
                .then(p => this.d3bind());
        }

        private d3bind():Promise<any> {
            var data = this.context.getPlugin(1).data.config;
            var form = <HTMLElement>d3.select(this.element).datum(data).select("form").node();

            d3.select(this.element).select(".wifi-scan-btn").on('click', d => { this.scan(); });
            d3.select(form).on("submit", (d,a,e) => {
                this.onSubmit();
                (<any>d3.event).preventDefault();
                return false;
            });

            
            return this.scan();
        }

        private scan(): Promise<any> {
            return this.context.communication.getJson("/scan.json")
                .then(p => {
                    var data = d3.select(this.element).select(".wifi-scan").selectAll("div").data(p, (dd:any) => dd.ssid);
                    var div = data.enter().append("div");
                    div.html(d => this.scanTemplate(d)).style("opacity", "0").transition().duration(1000).style("opacity", "1");
                    div.on("click", d => this.setSsid(d.ssid));
                    data.exit().transition().duration(1000).style("opacity", "0").remove();
                });
        }

        private onSubmit() {
            var form = <HTMLElement>d3.select(this.element).select("form").node();
            var result = this.context.communication.formToJson(form);

            console.log(result);

            return false;
        }

        private setSsid(d) {
            d3.select(this.element).select("form").selectAll("input[name='ssid']").attr('value', dd=> d);
            (<HTMLElement>d3.select(this.element).select("form").selectAll("input[name='pwd']").node()).focus();
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

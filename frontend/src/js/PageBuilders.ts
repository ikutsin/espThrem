///<reference path="../../Scripts/typings/Custom.d.ts"/>
///<reference path="../../Scripts/typings/es6-promise/es6-promise.d.ts"/>
module PageBuilders {

    import PageBuilder = ThremNavigation.IContentBuilder;

    export class DashboardPageBuilder implements PageBuilder {
        constructor(private context: Threm.ThremContext, private widgets: () => Promise<PageBuilder[]>) {

        }
        spawn(element: HTMLElement): Promise<any> {
            var data = {};
            return this.context.doT.renderTo(element, "basic", "index", data)
                .then(p => this.widgets())
                .then(p => {
                    this.d3bind(p, element);
                });
        }
        private d3bind(w: PageBuilder[], element: HTMLElement) {
            let data = d3.select(element).select(".dashboard").selectAll("div.dashboard-item").data(w);
            data.enter().append("div").attr("class", d => "dashboard-item" + ((<any>d).data && (<any>d).data.widgetType ? " " + (<any>d).data.widgetType : ""));
            
            //bind manually because of the promise
            let renderedSelection = d3.select(element).select(".dashboard").selectAll("div.dashboard-item");
            let promiseChain = Promise.resolve();
            renderedSelection.each((d, i, g) => {
                promiseChain = promiseChain.then(() => d.spawn(renderedSelection[g][i], this.context));
            });
        }
    }

    export class StaticTemplateBuilder implements PageBuilder {
        constructor(private ns: string, private name: string, private data: any, private context: Threm.ThremContext) {
        }
        spawn(element: HTMLElement): Promise<any> {
            return this.context.doT.renderTo(element, this.ns, this.name, this.data);
        }
    }

    export class TabsBuilder implements PageBuilder, ThremNavigation.ITabManager {
        private tabElements: ThremNavigation.TabElement[] = [];
        constructor(private context: Threm.ThremContext, public prefix: string) {
        }

        addElement(tabElements: ThremNavigation.TabElement) {
            this.tabElements.push(tabElements);
        }

        spawn(element: HTMLElement): Promise<any> {
            let promise = this.context.doT.renderTo(element, "global", "tabPage", {})
                .then(p => {
                    let contentElement = d3.select(element).select("div.tab-content").node();
                    let menuElement = d3.select(element).select("ul.tab-navigation").node();
                    let tabManager = new ThremNavigation.TabsManager(this.context, <HTMLElement>menuElement, <HTMLElement>contentElement, this.prefix);
                    for (let ite in this.tabElements) {
                        tabManager.addElement(this.tabElements[ite]);
                    }
                });
            return promise;
        }
    }

    export class PluginSetupBuilder implements PageBuilder {
        constructor(private context: Threm.ThremContext) {

        }

        spawn(element: HTMLElement): Promise<any> {
            var data = { apis: this.context.plugins.plugins };
            return this.context.doT.renderTo(element, "setup", "plugins", data)
                .then(p => this.d3bind(element));
        }

        private d3bind(element: HTMLElement) {
            var selection = d3.select(element).selectAll(".index-api").data(this.context.plugins.plugins);
            selection.style("color", d => (!~~d.data.running) ? "red" : undefined);

            selection.select(".toggle-on-off")
                .text(d => ~~d.data.config.off ? "OFF" : "ON")
                .on('click', d => {
                    this.context.loader.show();
                    d.data.config.off = ~~d.data.config.off > 0 ? 0 : 1;

                    this.context.plugins.postConfiguration(d.id, d.data.config)
                        .then(p => {
                            this.context.loader.hide();
                            this.d3bind(element);
                            this.context.triggerRestartRerquired();
                        })
                        .catch(p => {
                            this.context.onPromiseError(p);
                        });
                });
        }
    }

    export class RestartBuilder implements PageBuilder {
        constructor(private context: Threm.ThremContext) {

        }
        spawn(element: HTMLElement): Promise<any> {
            var data = { apis: this.context.plugins.plugins };
            return this.context.doT.renderTo(element, "setup", "restart", data)
                .then(p => {
                    var selection = d3.select(element);
                    selection.select(".core-restart").on('click', d => { this.context.reloadAll(); });
                    selection.select(".core-reset").on('click', d => { this.context.reloadAll(true); });
                    selection.select(".core-reload").on('click', d => { this.context.reloadFrontend(); });
                });
        }
    }

    export class SsdpSetupBuilder implements PageBuilder {
        constructor(private context: Threm.ThremContext) { }
        spawn(element: HTMLElement): Promise<any> {
            var data = {};
            return this.context.doT.renderTo(element, "setup", "ssdp", data)
                .then(p => this.context.plugins.bindConfigForm(21/*ID_SSDP*/, element));
        }
    }

    export class WifiSetupBuilder implements PageBuilder {
        private scanTemplate: (any) => string;
        private element: HTMLElement;
        constructor(private context: Threm.ThremContext) { }


        spawn(element: HTMLElement): Promise<any> {
            var data = {};
            this.element = element;
            return this.context.doT.getTemplate("setup", "scan")
                .then(p => { this.scanTemplate = p; })
                .then(p => this.context.doT.renderTo(element, "setup", "wifi", data))
                .then(p => this.d3bind());
        }

        private d3bind(): Promise<any> {
            //bind to form
            this.context.plugins.bindConfigForm(1/*ID_WIFI*/, this.element);

            //bind to scan
            d3.select(this.element).select(".wifi-scan-btn").on("click", d => {
                console.log("Scan");
                this.scan();
                (<any>d3.event).preventDefault();
            });
            return this.scan();
        }

        private scan(): Promise<any> {
            return this.context.communication.getJson("/scan.json")
                .then(p => {
                    var data = d3.select(this.element).select(".wifi-scan").selectAll("div").data(p, (dd: any) => dd.ssid);
                    var div = data.enter().append("div");
                    div.html(d => this.scanTemplate(d)).style("opacity", "0").transition().duration(1000).style("opacity", "1");
                    div.on("click", d => this.setSsid(d.ssid));
                    data.exit().transition().duration(1000).style("opacity", "0").remove();
                });
        }

        private setSsid(d) {
            d3.select(this.element).select("form").selectAll("input[name='ssid']").attr('value', dd=> d);
            (<HTMLElement>d3.select(this.element).select("form").selectAll("input[name='pwd']").node()).focus();
        }
    }

    export class StatusInfoBuilder implements PageBuilder {
        constructor(private context: Threm.ThremContext) { }
        spawn(element: HTMLElement): Promise<any> {
            return this.context.communication.getJson("/info/status.json")
                .then(p => {
                    return { items: this.context.mixer.makeArray(p) };
                })
                .then(p => this.context.doT.renderTo(element, "basic", "infoStatus", p));
        }
    }

    export class ChipInfoBuilder implements PageBuilder {
        constructor(private context: Threm.ThremContext) { }
        spawn(element: HTMLElement): Promise<any> {
            return this.context.communication.getJson("/info/chip.json")
                .then(p => {
                    return { items: this.context.mixer.makeArray(p) };
                })
                .then(p => this.context.doT.renderTo(element, "basic", "infoChip", p));
        }
    }

    export class WifiInfoBuilder implements PageBuilder {
        constructor(private context: Threm.ThremContext) { }
        spawn(element: HTMLElement): Promise<any> {
            return this.context.communication.getJson("/info/wifi.json")
                .then(p => {
                    return { items: this.context.mixer.makeArray(p) };
                })
                .then(p => this.context.doT.renderTo(element, "basic", "infoWifi", p));
        }
    }

    export class FileListBuilder implements PageBuilder {
        constructor(private context: Threm.ThremContext) { }
        spawn(element: HTMLElement): Promise<any> {
            //return context.communication.getJson("/list", { dir: "/" })
            return this.context.communication.getJson("/listRoot.json")
                .then(p => {
                    return { items: p };
                })
                .then(p => this.context.doT.renderTo(element, "basic", "infoFiles", p));
        }
    }

    /*
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    *  Widgets
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    */

    export class LastNumberWidgetBuilder implements PageBuilder {
        element: HTMLElement;
        data: any = {};
        template: (any) => string;
        subscribtionId: number;
        constructor(private context: Threm.ThremContext, private ownerName: string, title: string, private formatter: (vstring) => string) {
            this.data.title = title;
            this.data.value = '-';
        }
        spawn(element: HTMLElement): Promise<any> {
            this.element = element;

            this.subscribtionId = this.context.bus.subscribe(this.ownerName, p => {
                this.data.value = this.formatter(p.value);
                if (document.body.contains(this.element)) {
                    this.render();
                } else {
                    console.log("LastNumberWidgetBuilder dead");
                    this.context.bus.unSubscribe(this.ownerName, this.subscribtionId);
                }
            });

            return this.context.doT.getTemplate("widget", "lastNumber")
                .then(p => {
                    this.template = p;
                    this.render();
                });
        }
        private render() {
            if (!this.template || !this.element) {
                console.log("failed to update widget");
                return;
            }
            this.element.innerHTML = this.template(this.data);
        }
    }
    export class SparklineWidgetBuilder implements PageBuilder {
        data: any = {};
        template: (any) => string;
        subscribtionId: number;
        chart: Charting.StreamingLineChart;

        constructor(private context: Threm.ThremContext, private initialBuffer: DataRepository.DataStreamBuffer, title: string, private chartMax: number = 1, private chartMin: number = 0, private size: number = 60) {
            this.data.title = title;
            this.data.widgetType = "x2";
        }
        spawn(element: HTMLElement): Promise<any> {
            this.subscribtionId = this.context.bus.subscribe(this.initialBuffer.getMessageName(), p => {
                if (document.body.contains(element)) {
                    if (!this.chart) {
                        console.log("failed to update widget");
                        return;
                    }
                    this.chart.update(p);
                } else {
                    console.log("SparklineWidgetBuilder dead");
                    this.context.bus.unSubscribe(this.initialBuffer.getMessageName(), this.subscribtionId);
                }
            });

            return this.context.doT.renderTo(element, "widget", "sparkline", this.data)
                .then(p => {
                    var chartElement = <HTMLElement>d3.select(element).selectAll(".sparkline").node();
                    this.chart = new Charting.StreamingLineChart(chartElement, this.initialBuffer, this.chartMax, this.chartMin, this.size);
                });
        }
    }
}

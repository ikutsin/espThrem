﻿///<reference path="../../Scripts/typings/d3/d3.d.ts" />
///<reference path="../../Scripts/typings/dot/dot.d.ts" />
///<reference path="../../Scripts/typings/es6-promise/es6-promise.d.ts"/>

module ThremNavigation {
    //https://github.com/olado/doT/blob/master/examples/browsersample.html
    //https://github.com/olado/doT/blob/master/examples/advancedsnippet.txt
    //http://olado.github.io/doT/index.html
    export class DoTWrapper {
        private templateRepo = {};

        renderTo(element: HTMLElement, namespace: string, name: string, data: any): Promise<string> {
            return this.render(namespace, name, data)
                .then(p => {
                    element.innerHTML = p;
                    return p;
                });
        }

        render(namespace: string, name: string, data: any): Promise<string> {
            return this.getTemplate(namespace, name)
                .then(p => new Promise<string>((resolve) => {
                    resolve(<string>p(data));
                }));
        }

        getTemplate(namespace: string, name: string): Promise<(any) => string> {
            return this.ensureNamespace(namespace)
                .then(p => new Promise<Function>((resolve, reject) => {
                    if (!this.templateRepo[namespace + "_" + name]) {
                        var namespaceSelector = d3.select("body").select(`div.templates.${namespace}`);
                        var defs = {};

                        console.log("Compiling template:", namespace, name);

                        //first put global
                        d3.select("body").select("div.templates").selectAll("script.def-global")[0].forEach(v => {
                            if (!v) return;
                            var element = (<HTMLElement>v);
                            console.log("Add global def:", element.id);
                            defs[element.id] = element.innerHTML;
                        });

                        //so it can be overriden inside namespace
                        namespaceSelector.selectAll("script.def")[0].forEach(v => {
                            var element = (<HTMLElement>v);
                            console.log("Add def:", element.id);
                            defs[element.id] = element.innerHTML;
                        });

                        var templtaHtml = namespaceSelector.select("#" + name);
                        if (!templtaHtml.empty()) {
                            var tempFn = doT.template(templtaHtml.html(), undefined, defs);
                            this.templateRepo[namespace+"_"+name] = tempFn;
                        }
                    }
                    if (!this.templateRepo[namespace + "_" + name]) {
                        reject({ error: `Template not found: ${namespace}.${name}` });
                        return;
                    }
                    resolve(this.templateRepo[namespace + "_" + name]);
                }));
        }

        private ensureNamespace(namespace: string): Promise<any> {
            return new Promise<any>((resolve, reject) => {
                if (d3.select("body").select(".templates." + namespace).empty()) {
                    let url = "templates/" + namespace + ".html";
                    console.log("Loading", url);
                    d3.html(url, data => {
                        if (!data) {
                            reject({ error: "Unable to load tmplates uri:" + url });
                            return;
                        }
                        var namespaceElement = d3.select("body").append("div").classed("templates", true).classed(namespace, true);
                        namespaceElement.node().appendChild(data);
                        resolve({});
                    });
                } else {
                    resolve({});
                }
            });
        }
    }

    export interface IContentBuilder {
        spawn(element: HTMLElement): Promise<any>;
    }

    export interface ITabManager {
        prefix:string;
        addElement(element: TabElement);
    }

    //should be internal
    export class TabElement {
        isActive: boolean = false;
        public prefix: string;
        constructor(public hashPart: string, public header: string, public page: IContentBuilder) {
        }
    }

    export class TabsManager implements ITabManager {
        private tabTemplate: (any) => string;
        private tabElements: TabElement[] = [];
        private activeTab: TabElement;

        constructor(private context: Threm.ThremContext, private tabsElement: HTMLElement, private contentElement: HTMLElement, public prefix: string = "") {
            this.context.doT.getTemplate("global", "tabitem")
                .then(p => {
                    this.tabTemplate = p;
                    this.d3bind();
                })
                .catch(context.onPromiseError);

            d3.select(this.tabsElement).classed("tab-navigation", true).datum(this);
            d3.select(this.contentElement).classed("tab-content", true).datum(this);
        }

        addElement(element: TabElement) {
            console.log("Tab added (" + this.prefix + "):", element.header);
            element.prefix = this.prefix;
            this.tabElements.push(element);
            this.d3bind();
        }

        add(hashPart: string, header: string, page: IContentBuilder) {
            this.addElement(new TabElement(hashPart, header, page));
        }

        handleCrumbs(crumbs: string[]): Promise<any> {
            let currentLevelCrumb = crumbs.shift();
            let selectedElements = currentLevelCrumb ? this.tabElements.filter(e => e.hashPart === currentLevelCrumb) : this.tabElements;

			console.log("crumbs", currentLevelCrumb, crumbs);

            if (!selectedElements.length) {
                return Promise.reject({ error: "Page not found '" + this.prefix + "." + currentLevelCrumb + "'" });
            }


            let tabElement = selectedElements[0];
            for (let i in this.tabElements) this.tabElements[i].isActive = false;

            //hangle next element
            let result: Promise<any> = Promise.resolve();
            if (!this.activeTab || this.activeTab.hashPart !== tabElement.hashPart) {
                this.activeTab = undefined;
	            result = result
		            .then(p => this.handleNextPage(tabElement.page))
		            .then(p =>
			            new Promise((c, d) => {
				            this.activeTab = tabElement;
				            this.activeTab.isActive = true;
				            this.d3bind();
				            c(p);
			            }));
            }
            //check for subpages
            return result.then(p => new Promise((c, d) => {
                let menu = d3.select(this.contentElement).selectAll(".tab-navigation");
                if (!menu.empty()) {
                    menu.datum().handleCrumbs(crumbs)
                        .then(p => c())
                        .catch(p => d(p));
                } else if (crumbs.length) {
                    console.log("unhandled crumbs:", crumbs);
                    d({ error: "Unhandled crumbs" });
                } else {
                    c();
                }
            }));
        }

        handleNextPage(page: IContentBuilder): Promise<any> {
            let currentElement = d3.select(this.contentElement).selectAll("div.page");
            let newElement = <HTMLElement>d3.select(this.contentElement).append("div").classed("page", true)
                .style('opacity', 0)
                .transition()
                .duration(500)
                .style('opacity', 1)
                .node();

	        console.log(page);

            return page.spawn(newElement)
                .then(p => new Promise<any>((c, d) => {
                    if (currentElement.empty()) {
                        c();
                    } else {
                        currentElement
                            .transition()
                            .duration(500)
                            .style('opacity', 0)
                            .remove().each("end", (dd, i) => {
                                c();
                            });
                    }
                }))
                .catch(p => this.context.onPromiseError(p));
        }

        private d3bind() {
            if (!this.tabTemplate) return;
            var data = d3.select(this.tabsElement).selectAll("li").data(this.tabElements);
            data.enter().append("li").html(d => this.tabTemplate(d));
            data.exit().remove();
            data.attr("class", d => {
                return (d.isActive ? "active" : "inactive");
            });
        }
    }

    export class RouteManager {
        constructor(private context: Threm.ThremContext) { }

        start() {
            //window.onhashchange = (ev: HashChangeEvent) => { this.updateLocation(); };
            d3.select(window).on('hashchange', this.updateLocation.bind(this));
            this.updateLocation();
        }

        private updateLocation() {
            this.context.loader.show();
            let hash = location.hash.trim().substr(1);
            var crumbs = hash.split(".");
            if (crumbs[0] === "") crumbs = [];
            console.log("handle location change", crumbs);

            var menu = <TabsManager>d3.select(".tab-navigation").datum();
            menu.handleCrumbs(crumbs)
                .then(p => this.context.loader.hide())
                .catch(p => this.context.onPromiseError(p));

        }
    }
}
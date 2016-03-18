///<reference path="../../Scripts/typings/d3/d3.d.ts" />
module ThremNavigation {
    export class ThremContext {
        public doT: DoTWrapper;
        constructor() {
            this.doT = new DoTWrapper();
        }
    }

    //documenation
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
            return new Promise<string>((resolve, reject) => {
                this.getTemplate(namespace, name)
                    .then(p => {
                        resolve(<string>p(data));
                    })
                    .catch(p => reject(p));
            });
        }

        private getTemplate(namespace: string, name: string): Promise<Function> {
            return new Promise<Function>((resolve, reject) => {
                this.ensureNamespace(namespace)
                    .then(p => {
                        if (!this.templateRepo[name]) {
                            var namespaceSelector = d3.select("body").select(`div.templates.${namespace}`);
                            var defs = {};

                            //first put global
                            d3.select("body").select("div.templates").select("script.def-global")[0].forEach(v => {
                                if (!v) return;
                                var element = (<HTMLElement>v);
                                console.log(v);
                                defs[element.id] = element.innerHTML;
                            });

                            //so it can be overriden inside namespace
                            namespaceSelector.select("script.def")[0].forEach(v => {
                                var element = (<HTMLElement>v);
                                defs[element.id] = element.innerHTML;
                            });

                            var templtaHtml = namespaceSelector.select("#" + name);
                            if (!templtaHtml.empty()) {
                                var tempFn = doT.template(templtaHtml.html(), undefined, defs);
                                this.templateRepo[name] = tempFn;
                            }
                        }
                        if (!this.templateRepo[name]) {
                            reject({ error: `Template not found: ${namespace}.${name}` });
                            return;
                        }
                        resolve(this.templateRepo[name]);
                    })
                    .catch(p => reject(p));
            });
        }

        private ensureNamespace(namespace: string): Promise<any> {
            return new Promise<any>((resolve, reject) => {
                if (d3.select("body").select("div.templates." + namespace).empty()) {
                    let url = namespace + ".html";
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

    export interface IPageBuilder {
        spawn(element: HTMLElement, context: ThremContext): Promise<any>;
        die(): Promise<any>;
    }

    export class WindowManager {
        private notfoundPage: IPageBuilder;
        private indexPage: IPageBuilder;
        private routes: any = {};
        private currentPage: IPageBuilder;
        private currentPageElement: HTMLElement;
        private containerElement: HTMLElement;
        context: ThremContext;

        constructor(context: ThremContext, element: HTMLElement, indexPage: IPageBuilder, notfoundPage: IPageBuilder) {
            this.notfoundPage = notfoundPage;
            this.indexPage = indexPage;
            this.context = context;
            this.containerElement = element;

            window.onhashchange = (ev: HashChangeEvent) => { this.updateLocation() };
        }

        addOrUpdateRoute(hashStart: string, page: IPageBuilder) {
            console.log("Route added:", hashStart);
            this.routes[hashStart] = page;
        }

        updateLocation() {
            let hash = location.hash.trim().substr(1);
            console.log("handle location change: '", hash, "'");

            if (!hash) {
                this.handleNextPage(this.indexPage);
                return;
            }

            for (let key in this.routes) {
                if ((<any>hash).startsWith(key)) {
                    this.handleNextPage(this.routes[key]);
                    return;
                }
            }
            this.handleNextPage(this.notfoundPage);
        }

        private handleNextPage(nextPage: IPageBuilder): Promise<any> {

            let newElement = <HTMLElement>d3.select(this.containerElement).append("div").classed("page", true)
                .style('opacity', 0)
                .transition()
                .duration(500)
                .style('opacity', 1)
                .node();
            return nextPage.spawn(newElement, this.context)
                .then(p => {
                    if (this.currentPage) {
                        return this.currentPage.die();
                    } else {
                        return Promise.resolve();
                    }
                })
                .then(p => {
                    if (this.currentPageElement) {
                        d3.select(this.currentPageElement)
                            .transition()
                            .duration(500)
                            .style('opacity', 0)
                            .remove();
                    }
                    this.currentPageElement = newElement;
                    this.currentPage = nextPage;
                })
                .catch(this.onPromiseError);
        }

        private onPromiseError(p: any) {
            console.log(p);
            alert(p.error);
        }
    }
}
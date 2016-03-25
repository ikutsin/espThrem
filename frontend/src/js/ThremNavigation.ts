///<reference path="../../Scripts/typings/d3/d3.d.ts" />
///<reference path="../../Scripts/typings/dot/dot.d.ts" />

module ThremNavigation {
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
            return this.getTemplate(namespace, name)
                .then(p => new Promise<string>((resolve) => {
                    resolve(<string>p(data));
                }));
        }

        getTemplate(namespace: string, name: string): Promise<(any)=>string> {
            return this.ensureNamespace(namespace)
                .then(p => new Promise<Function>((resolve, reject) => {
                    if (!this.templateRepo[name]) {
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
                            this.templateRepo[name] = tempFn;
                        }
                    }
                    if (!this.templateRepo[name]) {
                        reject({ error: `Template not found: ${namespace}.${name}` });
                        return;
                    }
                    resolve(this.templateRepo[name]);
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

    export interface IPageBuilder {
        spawn(element: HTMLElement, context: Threm.ThremContext): Promise<any>;
        die(): Promise<any>;
    }

    class RouteElement {
        hash: string;
        header: string;
        page: IPageBuilder;
        isActive: boolean = false;
        constructor(hashStart: string, header: string, page: IPageBuilder) {
            this.hash = hashStart;
            this.header = header;
            this.page = page;
        }
    }

    export class WindowManager {
        private notfoundPage: RouteElement;
        private indexPage: RouteElement;
        private routes: any = {};
        private builtMenuItems: Array<RouteElement>;
        private currentPage: RouteElement;
        private currentPageElement: HTMLElement;
        private containerElement: HTMLElement;
        private menuElement: HTMLElement;
        private loader: Charting.Loader;
        context: Threm.ThremContext;

        constructor(context: Threm.ThremContext, element: HTMLElement, menuElement: HTMLElement, loader: Charting.Loader, indexPage: IPageBuilder, notfoundPage: IPageBuilder) {
            this.notfoundPage = new RouteElement(undefined, undefined, notfoundPage);
            this.indexPage = new RouteElement("", "Home", indexPage);
            this.routes["index"] = this.indexPage;
            this.context = context;
            this.containerElement = element;
            this.menuElement = menuElement;
            this.loader = loader;
        }

        addOrUpdateRoute(hashStart: string, header: string, page: IPageBuilder) {
            console.log("Route added:", hashStart);
            this.routes[hashStart] = new RouteElement(hashStart, header, page);
        }

        start() {
            window.onhashchange = (ev: HashChangeEvent) => { this.updateLocation(); };
            this.loader.show();

            //build menu
            this.builtMenuItems = Object.keys(this.routes).map(key => this.routes[key]);

            var chain = <any>Promise.resolve({});

            for (var index in this.builtMenuItems) {
                ((i)=> {
                    chain = chain
                        .then(p=> this.context.doT.render("global", "menuitem", this.builtMenuItems[i]))
                        .then(p=> new Promise<any>((c, d)=> {
                            this.menuElement.innerHTML += p;
                            c();
                        }));
                })(index);
            }

            chain.then(p => {
                console.log("all done");
                this.updateLocation();
            });
        }

        updateLocation() {
            this.loader.show();

            let hash = location.hash.trim().substr(1);
            console.log(`handle location change: ${hash}`);

            var handleNextPagePromise: Promise<any>;

            if (!hash) hash = "index";

            if (this.currentPage) {
                this.currentPage.isActive = false;
            }

            for (let key in this.routes) {
                if ((<any>hash).startsWith(key)) {
                    handleNextPagePromise = this.handleNextPage(<RouteElement>this.routes[key]);
                    break;
                }
            }

            if (!handleNextPagePromise) handleNextPagePromise = this.handleNextPage(this.notfoundPage);

            handleNextPagePromise
                .then(p => {
                    d3.select(this.menuElement).selectAll("li")
                        .data(this.builtMenuItems)
                        .attr("class", d => {
                            return (d.isActive ? "active" : "inactive");
                        });
                    this.loader.hide();
                })
                .catch(p => {
                    this.context.onPromiseError(p);
                    this.loader.hide();
                });
        }

        private handleNextPage(nextRoute: RouteElement): Promise<any> {

            let newElement = <HTMLElement>d3.select(this.containerElement).append("div").classed("page", true)
                .style('opacity', 0)
                .transition()
                .duration(500)
                .style('opacity', 1)
                .node();
            return nextRoute.page.spawn(newElement, this.context)
                .then(p => {
                    if (this.currentPage) {
                        return this.currentPage.page.die();
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
                    this.currentPage = nextRoute;
                    this.currentPage.isActive = true;
                });
        }
    }
}
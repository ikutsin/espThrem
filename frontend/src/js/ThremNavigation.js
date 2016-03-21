///<reference path="../../Scripts/typings/d3/d3.d.ts" />
var ThremNavigation;
(function (ThremNavigation) {
    var ThremContext = (function () {
        function ThremContext() {
            this.doT = new DoTWrapper();
        }
        return ThremContext;
    }());
    ThremNavigation.ThremContext = ThremContext;
    //documenation
    //https://github.com/olado/doT/blob/master/examples/browsersample.html
    //https://github.com/olado/doT/blob/master/examples/advancedsnippet.txt
    //http://olado.github.io/doT/index.html
    var DoTWrapper = (function () {
        function DoTWrapper() {
            this.templateRepo = {};
        }
        DoTWrapper.prototype.renderTo = function (element, namespace, name, data) {
            return this.render(namespace, name, data)
                .then(function (p) {
                element.innerHTML = p;
                return p;
            });
        };
        DoTWrapper.prototype.render = function (namespace, name, data) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.getTemplate(namespace, name)
                    .then(function (p) {
                    resolve(p(data));
                })
                    .catch(function (p) { return reject(p); });
            });
        };
        DoTWrapper.prototype.getTemplate = function (namespace, name) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.ensureNamespace(namespace)
                    .then(function (p) {
                    if (!_this.templateRepo[name]) {
                        var namespaceSelector = d3.select("body").select("div.templates." + namespace);
                        var defs = {};
                        console.log("Compiling template:", namespace, name);
                        //first put global
                        d3.select("body").select("div.templates").selectAll("script.def-global")[0].forEach(function (v) {
                            if (!v)
                                return;
                            var element = v;
                            console.log("Add global def:", element.id);
                            defs[element.id] = element.innerHTML;
                        });
                        //so it can be overriden inside namespace
                        namespaceSelector.selectAll("script.def")[0].forEach(function (v) {
                            var element = v;
                            console.log("Add def:", element.id);
                            defs[element.id] = element.innerHTML;
                        });
                        var templtaHtml = namespaceSelector.select("#" + name);
                        if (!templtaHtml.empty()) {
                            var tempFn = doT.template(templtaHtml.html(), undefined, defs);
                            _this.templateRepo[name] = tempFn;
                        }
                    }
                    if (!_this.templateRepo[name]) {
                        reject({ error: "Template not found: " + namespace + "." + name });
                        return;
                    }
                    resolve(_this.templateRepo[name]);
                })
                    .catch(function (p) { return reject(p); });
            });
        };
        DoTWrapper.prototype.ensureNamespace = function (namespace) {
            return new Promise(function (resolve, reject) {
                if (d3.select("body").select("div.templates." + namespace).empty()) {
                    var url_1 = namespace + ".html";
                    console.log("Loading", url_1);
                    d3.html(url_1, function (data) {
                        if (!data) {
                            reject({ error: "Unable to load tmplates uri:" + url_1 });
                            return;
                        }
                        var namespaceElement = d3.select("body").append("div").classed("templates", true).classed(namespace, true);
                        namespaceElement.node().appendChild(data);
                        resolve({});
                    });
                }
                else {
                    resolve({});
                }
            });
        };
        return DoTWrapper;
    }());
    ThremNavigation.DoTWrapper = DoTWrapper;
    var RouteElement = (function () {
        function RouteElement(hashStart, header, page) {
            this.isActive = false;
            this.hash = hashStart;
            this.header = header;
            this.page = page;
        }
        return RouteElement;
    }());
    var WindowManager = (function () {
        function WindowManager(context, element, menuElement, loader, indexPage, notfoundPage) {
            var _this = this;
            this.routes = {};
            this.notfoundPage = new RouteElement(undefined, undefined, notfoundPage);
            this.indexPage = new RouteElement("", "Home", indexPage);
            this.routes["index"] = this.indexPage;
            this.context = context;
            this.containerElement = element;
            this.menuElement = menuElement;
            this.loader = loader;
            window.onhashchange = function (ev) { _this.updateLocation(); };
            //build menu
        }
        WindowManager.prototype.addOrUpdateRoute = function (hashStart, header, page) {
            console.log("Route added:", hashStart);
            this.routes[hashStart] = new RouteElement(hashStart, header, page);
        };
        WindowManager.prototype.start = function () {
            var _this = this;
            this.loader.hide();
            //build menu
            this.builtMenuItems = Object.keys(this.routes).map(function (key) { return _this.routes[key]; });
            var renderers = this.builtMenuItems.map(function (d) {
                return _this.context.doT.render("global", "menuitem", d)
                    .then(function (dd) {
                    _this.menuElement.innerHTML = dd + _this.menuElement.innerHTML;
                    return d;
                });
            });
            Promise.all(renderers).then(function (p) {
                _this.updateLocation();
            });
        };
        WindowManager.prototype.updateLocation = function () {
            var _this = this;
            this.loader.show();
            var hash = location.hash.trim().substr(1);
            console.log("handle location change: " + hash);
            var handleNextPagePromise;
            if (!hash)
                hash = "index";
            if (this.currentPage) {
                this.currentPage.isActive = false;
            }
            for (var key in this.routes) {
                if (hash.startsWith(key)) {
                    handleNextPagePromise = this.handleNextPage(this.routes[key]);
                    break;
                }
            }
            if (!handleNextPagePromise)
                handleNextPagePromise = this.handleNextPage(this.notfoundPage);
            handleNextPagePromise
                .then(function (p) {
                d3.select(_this.menuElement).selectAll("li")
                    .data(_this.builtMenuItems)
                    .attr("class", function (d) {
                    return (d.isActive ? "active" : "inactive");
                });
                _this.loader.hide();
            })
                .catch(function (p) {
                _this.onPromiseError(p);
                _this.loader.hide();
            });
        };
        WindowManager.prototype.handleNextPage = function (nextRoute) {
            var _this = this;
            var newElement = d3.select(this.containerElement).append("div").classed("page", true)
                .style('opacity', 0)
                .transition()
                .duration(500)
                .style('opacity', 1)
                .node();
            return nextRoute.page.spawn(newElement, this.context)
                .then(function (p) {
                if (_this.currentPage) {
                    return _this.currentPage.page.die();
                }
                else {
                    return Promise.resolve();
                }
            })
                .then(function (p) {
                if (_this.currentPageElement) {
                    d3.select(_this.currentPageElement)
                        .transition()
                        .duration(500)
                        .style('opacity', 0)
                        .remove();
                }
                _this.currentPageElement = newElement;
                _this.currentPage = nextRoute;
                _this.currentPage.isActive = true;
            });
        };
        WindowManager.prototype.onPromiseError = function (p) {
            console.log(p);
            alert(p.error);
        };
        return WindowManager;
    }());
    ThremNavigation.WindowManager = WindowManager;
})(ThremNavigation || (ThremNavigation = {}));
//# sourceMappingURL=ThremNavigation.js.map
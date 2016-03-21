///<reference path="../../Scripts/typings/d3/d3.d.ts" />
var ThremNavigation;
(function (ThremNavigation) {
    var ThremContext = (function () {
        function ThremContext() {
            this.doT = new DoTWrapper();
        }
        return ThremContext;
    })();
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
                    var url = namespace + ".html";
                    console.log("Loading", url);
                    d3.html(url, function (data) {
                        if (!data) {
                            reject({ error: "Unable to load tmplates uri:" + url });
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
    })();
    ThremNavigation.DoTWrapper = DoTWrapper;
    var WindowManager = (function () {
        function WindowManager(context, element, indexPage, notfoundPage) {
            var _this = this;
            this.routes = {};
            this.notfoundPage = notfoundPage;
            this.indexPage = indexPage;
            this.context = context;
            this.containerElement = element;
            window.onhashchange = function (ev) { _this.updateLocation(); };
        }
        WindowManager.prototype.addOrUpdateRoute = function (hashStart, page) {
            console.log("Route added:", hashStart);
            this.routes[hashStart] = page;
        };
        WindowManager.prototype.updateLocation = function () {
            var hash = location.hash.trim().substr(1);
            console.log("handle location change: '", hash, "'");
            if (!hash) {
                this.handleNextPage(this.indexPage);
                return;
            }
            for (var key in this.routes) {
                if (hash.startsWith(key)) {
                    this.handleNextPage(this.routes[key]);
                    return;
                }
            }
            this.handleNextPage(this.notfoundPage);
        };
        WindowManager.prototype.handleNextPage = function (nextPage) {
            var _this = this;
            var newElement = d3.select(this.containerElement).append("div").classed("page", true)
                .style('opacity', 0)
                .transition()
                .duration(500)
                .style('opacity', 1)
                .node();
            return nextPage.spawn(newElement, this.context)
                .then(function (p) {
                if (_this.currentPage) {
                    return _this.currentPage.die();
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
                _this.currentPage = nextPage;
            })
                .catch(this.onPromiseError);
        };
        WindowManager.prototype.onPromiseError = function (p) {
            console.log(p);
            alert(p.error);
        };
        return WindowManager;
    })();
    ThremNavigation.WindowManager = WindowManager;
})(ThremNavigation || (ThremNavigation = {}));
//# sourceMappingURL=ThremNavigation.js.map
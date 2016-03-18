///<reference path="../../Scripts/typings/Custom.d.ts"/>
var PageBuilders;
(function (PageBuilders) {
    var IndexBuilder = (function () {
        function IndexBuilder() {
        }
        IndexBuilder.prototype.spawn = function (element, context) {
            console.log("Spawn index");
            var data = { name: "namaaaa" };
            return context.doT.renderTo(element, "pageBuildersTemplates", "index", data);
        };
        IndexBuilder.prototype.die = function () {
            console.log("Die index");
            return Promise.resolve({});
        };
        return IndexBuilder;
    })();
    PageBuilders.IndexBuilder = IndexBuilder;
    var NotFoundBuilder = (function () {
        function NotFoundBuilder() {
        }
        NotFoundBuilder.prototype.spawn = function (element, context) {
            var data = {};
            console.log("spawn NotFoundBuilder");
            return context.doT.renderTo(element, "pageBuildersTemplates", "notFound", data);
        };
        NotFoundBuilder.prototype.die = function () {
            console.log("Die NotFoundBuilder");
            return Promise.resolve({});
        };
        return NotFoundBuilder;
    })();
    PageBuilders.NotFoundBuilder = NotFoundBuilder;
    var AnalyzeBuilder = (function () {
        function AnalyzeBuilder() {
        }
        AnalyzeBuilder.prototype.spawn = function (element, context) {
            console.log("Spawn AnalyzeBuilder");
            return Promise.resolve({});
        };
        AnalyzeBuilder.prototype.die = function () {
            console.log("Die AnalyzeBuilder");
            return Promise.resolve({});
        };
        return AnalyzeBuilder;
    })();
    PageBuilders.AnalyzeBuilder = AnalyzeBuilder;
})(PageBuilders || (PageBuilders = {}));
//# sourceMappingURL=PageBuilders.js.map
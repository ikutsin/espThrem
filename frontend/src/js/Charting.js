///<reference path="../../Scripts/typings/d3/d3.d.ts" />
var Charting;
(function (Charting) {
    var DataStreamElement = DataRepository.DataStreamElement;
    //http://bl.ocks.org/Mattwoelk/6132258
    var Loader = (function () {
        function Loader(element) {
            this.width = 100;
            this.height = 100;
            this.element = element;
            var radius = Math.min(this.width, this.height) / 2;
            var tau = 2 * Math.PI;
            var arc = d3.svg.arc()
                .innerRadius(radius * 0.5)
                .outerRadius(radius * 0.9)
                .startAngle(0);
            var svg = d3.select(this.element).append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g")
                .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
            var background = svg.append("path")
                .datum({ endAngle: 0.33 * tau })
                .style("fill", "#4D4D4D")
                .attr("d", arc)
                .call(this.spin.bind(this), 1500);
        }
        Loader.prototype.show = function () {
            d3.select(this.element).style("display", "block");
        };
        Loader.prototype.hide = function () {
            console.log("hide loader");
            d3.select(this.element).style("display", "none");
        };
        Loader.prototype.spin = function (selection, duration) {
            var _this = this;
            selection.transition()
                .ease("linear")
                .duration(duration)
                .attrTween("transform", function () { return d3.interpolateString("rotate(0)", "rotate(360)"); });
            setTimeout(function () { _this.spin(selection, duration); }, duration);
        };
        return Loader;
    }());
    Charting.Loader = Loader;
    var StreamingLineChart = (function () {
        function StreamingLineChart(provider) {
            this.size = 60;
            this.data = d3.range(this.size).map(function (v, i, a) {
                return new DataStreamElement(provider, 0);
            });
            this.provider = provider;
            this.prepareChart();
        }
        // https://bost.ocks.org/mike/path/
        StreamingLineChart.prototype.prepareChart = function () {
            var _this = this;
            var margin = { top: 20, right: 20, bottom: 20, left: 40 }, width = 800 - margin.left - margin.right, height = 300 - margin.top - margin.bottom;
            this.x = d3.scale.linear()
                .domain([0, this.size - 1])
                .range([0, width]);
            this.y = d3.scale.linear()
                .domain([d3.min(this.data, function (i) { return i.value; }) - 5, d3.max(this.data, function (i) { return i.value; }) + 5])
                .range([height, 0]);
            this.line = d3.svg.line()
                .x(function (d, i) { return _this.x(i); })
                .y(function (d, i) { return _this.y(d.value); });
            var svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this.y(0) + ")")
                .call(d3.svg.axis().scale(this.x).orient("bottom"));
            svg.append("g")
                .attr("class", "y axis")
                .call(d3.svg.axis().scale(this.y).orient("left"));
            this.path = svg.append("g")
                .attr("clip-path", "url(#clip)")
                .append("path")
                .datum(this.data)
                .attr("class", "line")
                .attr("d", this.line)
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("fill", "none");
        };
        StreamingLineChart.prototype.notifyNewItems = function (item) {
            for (var _i = 0, item_1 = item; _i < item_1.length; _i++) {
                var i = item_1[_i];
                this.notifyNewItem(i);
            }
        };
        StreamingLineChart.prototype.notifyNewItem = function (item) {
            if (item.owner.name !== this.provider.name) {
                //not our provider
                return;
            }
            // push a new data point onto the back
            this.data.push(item);
            // redraw the line, and slide it to the left
            this.path
                .attr("d", this.line)
                .attr("transform", null)
                .transition()
                .duration(500)
                .ease("linear")
                .attr("transform", "translate(" + this.x(-1) + ",0)");
            // pop the old data point off the front
            this.data.shift();
        };
        return StreamingLineChart;
    }());
    Charting.StreamingLineChart = StreamingLineChart;
    //http://bl.ocks.org/mbostock/4060954
    var Background = (function () {
        function Background(element) {
            var _this = this;
            this.n = 20; // number of layers
            this.m = 200; // number of samples per layer
            this.element = element;
            console.log("constructing background");
            var stack = d3.layout.stack().offset("wiggle");
            this.layers0 = stack(d3.range(this.n).map(function () { return _this.bumpLayer(_this.m); }));
            this.layers1 = stack(d3.range(this.n).map(function () { return _this.bumpLayer(_this.m); }));
            var width = parseInt(d3.select(this.element).style("width"), 10), height = parseInt(d3.select(this.element).style("height"), 10);
            this.x = d3.scale.linear()
                .domain([0, this.m - 1])
                .range([0, 200]);
            this.y = d3.scale.linear()
                .domain([0, d3.max(this.layers0.concat(this.layers1), function (layer) { return d3.max(layer, function (d) { return (d.y0 + d.y); }); })])
                .range([0, 200]);
            var color = d3.scale.linear().range(['#aad', '#556']);
            this.area = d3.svg.area();
            this.area.x(function (d) { return _this.x(d.x); })
                .y0(function (d) { return _this.y(d.y0); })
                .y1(function (d) { return _this.y(d.y0 + d.y); });
            this.svg = d3.select(this.element).append("svg")
                .attr("opacity", 0.2)
                .attr("width", width)
                .attr("height", height)
                .attr('viewBox', '0 0 200 200')
                .attr('preserveAspectRatio', 'none');
            this.svg.selectAll("path")
                .data(this.layers0)
                .enter().append("path")
                .attr("d", this.area)
                .style("fill", function () { return color(Math.random() + ""); });
            d3.select(window).on('resize', this.resize.bind(this));
            this.transition();
        }
        Background.prototype.resize = function () {
            var width = parseInt(d3.select(this.element).style("width"), 10), height = parseInt(d3.select(this.element).style("height"), 10);
            console.log("resize:", width, height);
            this.svg.attr("width", width).attr("height", height);
        };
        Background.prototype.transition = function () {
            var _this = this;
            console.log("transition:");
            d3.selectAll("path")
                .data(function () {
                var d = _this.layers1;
                _this.layers1 = _this.layers0;
                var stack = d3.layout.stack().offset("wiggle");
                _this.layers1 = stack(d3.range(_this.n).map(function () { return _this.bumpLayer(_this.m); }));
                return _this.layers0 = d;
            })
                .transition()
                .duration(5000)
                .attr("d", this.area)
                .call(this.endAll, function () {
                _this.transition();
            });
        };
        Background.prototype.endAll = function (transition, callback) {
            var n = 0;
            transition.each(function () { ++n; })
                .each('end', function () {
                if (!--n)
                    callback.apply(this, arguments);
            });
        };
        // Inspired by Lee Byron's test data generator.
        Background.prototype.bumpLayer = function (n) {
            function bump(a) {
                var x = 1 / (.1 + Math.random()), y = 2 * Math.random() - .5, z = 10 / (.1 + Math.random());
                for (var i = 0; i < n; i++) {
                    var w = (i / n - y) * z;
                    a[i] += x * Math.exp(-w * w);
                }
            }
            var a = [], i;
            for (i = 0; i < n; ++i)
                a[i] = 0;
            for (i = 0; i < 5; ++i)
                bump(a);
            return a.map(function (d, i) { return { x: i, y: Math.max(0, d) }; });
        };
        return Background;
    }());
    Charting.Background = Background;
})(Charting || (Charting = {}));
//# sourceMappingURL=Charting.js.map
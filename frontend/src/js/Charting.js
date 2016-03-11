var Charting;
(function (Charting) {
    var DataFrame = (function () {
        function DataFrame(items) {
            if (items === void 0) { items = null; }
            this.size = 60;
            this.data = d3.range(this.size).map(function (v, i, a) {
                return { val: 0 };
            });
            if (items) {
                for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                    var item = items_1[_i];
                    this.data.push({ val: item });
                    this.data.shift();
                }
                this.prepareChart();
            }
        }
        DataFrame.prototype.prepareChart = function () {
            var _this = this;
            var margin = { top: 20, right: 20, bottom: 20, left: 40 }, width = 800 - margin.left - margin.right, height = 300 - margin.top - margin.bottom;
            this.x = d3.scale.linear()
                .domain([0, this.size - 1])
                .range([0, width]);
            var y = d3.scale.linear()
                .domain([d3.min(this.data, function (i) { return i.val; }) - 5, d3.max(this.data, function (i) { return i.val; }) + 5])
                .range([height, 0]);
            this.line = d3.svg.line()
                .x(function (d, i) { return _this.x(i); })
                .y(function (d, i) { return y(d.val); });
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
                .attr("transform", "translate(0," + y(0) + ")")
                .call(d3.svg.axis().scale(this.x).orient("bottom"));
            svg.append("g")
                .attr("class", "y axis")
                .call(d3.svg.axis().scale(y).orient("left"));
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
        DataFrame.prototype.nextElement = function (item) {
            this.nextItem({ val: item });
        };
        DataFrame.prototype.nextItem = function (item) {
            this.data.push(item);
            this.path
                .attr("d", this.line)
                .attr("transform", null)
                .transition()
                .duration(500)
                .ease("linear")
                .attr("transform", "translate(" + this.x(-1) + ",0)");
            this.data.shift();
        };
        return DataFrame;
    }());
    Charting.DataFrame = DataFrame;
})(Charting || (Charting = {}));

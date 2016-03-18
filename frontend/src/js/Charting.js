///<reference path="../../Scripts/typings/d3/d3.d.ts" />
var Charting;
(function (Charting) {
    var DataStreamElement = DataRepository.DataStreamElement;
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
            for (var _i = 0; _i < item.length; _i++) {
                var i = item[_i];
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
    })();
    Charting.StreamingLineChart = StreamingLineChart;
})(Charting || (Charting = {}));
//# sourceMappingURL=Charting.js.map
///<reference path="../../Scripts/typings/d3/d3.d.ts" />

module Charting {
    import DataStreamElement = DataRepository.DataStreamElement;
    import DataStreamProvider = DataRepository.IDataStreamProvider;

    //http://bl.ocks.org/Mattwoelk/6132258
    export class Loader {
        element: HTMLElement;

        width = 100;
        height = 100;

        constructor(element: HTMLElement) {
            this.element = element;

            var radius = Math.min(this.width, this.height) / 2;
            var tau = 2 * Math.PI;

            var arc = d3.svg.arc()
                .innerRadius(radius * 0.5)
                .outerRadius(radius * 0.9)
                .startAngle(0);

            var svg = d3.select(this.element).append("svg")
                //.attr("id", config.id)
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
        show() {
            d3.select(this.element).style("display", "block");
        }
        hide() {
            d3.select(this.element).style("display", "none");
        }

        private spin(selection, duration) {
            selection.transition()
                .ease("linear")
                .duration(duration)
                .attrTween("transform", () => d3.interpolateString("rotate(0)", "rotate(360)"));

            setTimeout(() => { this.spin(selection, duration); }, duration);
        }
    }

    export class StreamingLineChart {
        size: number = 60;
        private provider: DataStreamProvider;

        private data: Array<DataStreamElement>;

        private path: any;
        private line: any;
        private x: any;
        private y: any;

        constructor(provider: DataStreamProvider) {
            this.data = d3.range(this.size).map<DataStreamElement>((v, i, a) => {
                return new DataStreamElement(provider, 0);
            });

            this.provider = provider;
            this.prepareChart();
        }

        // https://bost.ocks.org/mike/path/
        private prepareChart() {
            var margin = { top: 20, right: 20, bottom: 20, left: 40 },
                width = 800 - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            this.x = d3.scale.linear()
                .domain([0, this.size - 1])
                .range([0, width]);

            this.y = d3.scale.linear()
                .domain([d3.min(this.data, i => i.value) - 5, d3.max(this.data, i => i.value) + 5])
                .range([height, 0]);

            this.line = d3.svg.line<DataStreamElement>()
                .x((d, i) => this.x(i))
                .y((d, i) => this.y(d.value));

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
        }

        public notifyNewItems(item: DataStreamElement[]) {
            for (let i of item) {
                this.notifyNewItem(i);
            }
        }

        public notifyNewItem(item: DataStreamElement) {

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
        }
    }

    //http://bl.ocks.org/mbostock/4060954
    export class Background {
        private element: HTMLElement;

        layers0: any;
        layers1: any;
        area: any;
        svg: any;
        x: any;
        y: any;

        n = 18; // number of layers
        m = 20; // number of samples per layer

        constructor(element: HTMLElement) {
            this.element = element;

            console.log("constructing background");


            var stack = d3.layout.stack().offset("wiggle");
            this.layers0 = stack(d3.range(this.n).map(() => this.bumpLayer(this.m)));
            this.layers1 = stack(d3.range(this.n).map(() => this.bumpLayer(this.m)));

            var width = parseInt(d3.select(this.element).style("width"), 10),
                height = parseInt(d3.select(this.element).style("height"), 10);

            this.x = d3.scale.linear()
                .domain([0, this.m - 1])
                .range([0, 200]);

            this.y = d3.scale.linear()
                .domain([0, d3.max(this.layers0.concat(this.layers1), layer => d3.max(<any[]>layer, d => (d.y0 + d.y)))])
                .range([0, 200]);

            var color = (<any>d3.scale.linear()).range(['#aad', '#556']);
            //var color = d3.scale.ordinal().range(['#aad', '#556']);

            this.area = d3.svg.area().interpolate("basis");
            this.area.x(d => this.x(d.x))
                .y0(d => this.y(d.y0))
                .y1(d => this.y(d.y0 + d.y));

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
                .style("fill", () => color("" + Math.random()));

            d3.select(window).on('resize', this.resize.bind(this));
            this.transition();
        }

        resize() {
            var width = parseInt(d3.select(this.element).style("width"), 10),
                height = parseInt(d3.select(this.element).style("height"), 10);

            console.log("resize:", width, height);
            this.svg.attr("width", width).attr("height", height);

        }

        transition(): void {

            console.log("BG transition");

            d3.selectAll("path")
                .data(() => {
                    var d = this.layers1;
                    this.layers1 = this.layers0;

                    var stack = d3.layout.stack().offset("wiggle");
                    this.layers1 = stack(d3.range(this.n).map(() => this.bumpLayer(this.m)));

                    return this.layers0 = d;
                })
                .transition()
                .duration(100000)
                .ease("exp-in-out")
                .attr("d", this.area)
                .call(this.endAll, () => {
                    this.transition();
                });
        }

        endAll(transition, callback) {
            var n = 0;
            transition.each(() => { ++n; })
                .each('end', function () {
                    if (!--n) callback.apply(this, arguments);
                });
        }

        // Inspired by Lee Byron's test data generator.
        bumpLayer(n): any {

            function bump(a) {
                var x = 1 / (.1 + Math.random()),
                    y = 2 * Math.random() - .5,
                    z = 10 / (.1 + Math.random());
                for (var i = 0; i < n; i++) {
                    var w = (i / n - y) * z;
                    a[i] += x * Math.exp(-w * w);
                }
            }

            var a = [], i;
            for (i = 0; i < n; ++i) a[i] = 0;
            for (i = 0; i < 5; ++i) bump(a);
            return a.map((d, i) => { return { x: i, y: Math.max(0, d) }; });
        }
    }
}

///<reference path="../../Scripts/typings/d3/d3.d.ts" />

module Charting {
    import DataStreamElement = DataRepository.DataStreamElement;
    import DataStreamProvider = DataRepository.IDataStreamProvider;

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
                .domain([d3.min(this.data, i=> i.value) - 5, d3.max(this.data, i=> i.value) + 5])
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
}

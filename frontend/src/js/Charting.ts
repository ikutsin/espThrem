///<reference path="../../typings/d3/d3.d.ts" />

module Charting {
  interface IThermData {
    val: number;
  }

  export class DataFrame {
    size: number = 60;
    data: Array<IThermData>;

    path: any;
    line: any;
    x: any;

    constructor(items: Array<number> = null) {
      this.data = d3.range(this.size).map<IThermData>((v, i, a) => {
        return <IThermData>{ val: 0 };
      });

      if (items) {
        for (var item of items) {
          this.data.push(<IThermData>{ val: item });
          this.data.shift();
        }

        this.prepareChart();
      }
    }

    // https://bost.ocks.org/mike/path/


    prepareChart() {
      var margin = { top: 20, right: 20, bottom: 20, left: 40 },
        width = 800 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

      this.x = d3.scale.linear()
        .domain([0, this.size - 1])
        .range([0, width]);

      var y = d3.scale.linear()
        .domain([ d3.min(this.data, i=>i.val)-5, d3.max(this.data, i=>i.val)+5])
        .range([height, 0]);

      this.line = d3.svg.line<IThermData>()
        .x((d, i) => this.x(i))
        .y((d, i) => y(d.val));


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
    }

    nextElement(item: number) {
      this.nextItem(<IThermData>{ val: item });
    }

    nextItem(item: IThermData) {
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

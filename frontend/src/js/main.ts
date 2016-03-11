/// <reference path="./WebSockets.ts"/>
/// <reference path="./Charting.ts"/>
/// <reference path="./../../Typings/d3/d3.d.ts"/>

class Program {
  main() {
    console.log("Starting program");
    this.registerThermElement();
  }

  registerThermElement() {
    var el = <HTMLElement>d3.select("body").append("p").node();
    var listener = new WebSockets.EspSocketListener(el, "ws://192.168.1.106:81/therm");

    //TODO: promise
    d3.json('http://192.168.1.106:80/data.json', function(data) {
      console.log(data);

      var chart = new Charting.DataFrame(data);
      el.addEventListener("onSocketData", d=>{
        var json:any = {};
        try{
          json = JSON.parse((<any>d).data);
        } catch(error) {}

        if(json.time) {
          chart.nextElement(json.time)
        }
      })
      listener.start();
    });
  }
}

var program = new Program();
program.main();

// var user = new Student("Jane", "M.", "User");
// document.body.innerHTML = greeter(user);

//
//
// document.body.addEventListener("test", ea=>{console.log("body-test");}, false);
//
// var em = new EventAggregator.EventManager();
//
// em.subscribe("heartbeat", function(payload) {
//     console.log("subscribe-heartbeat");
// });
//




// setInterval(function() {
//     console.log("interval");
//   var ev = new CustomEvent("test");
//   body.dispatchEvent(ev);
// },1000);

///<reference path="../../Scripts/typings/es6-promise/es6-promise.d.ts"/>
module DataRepository {

    export class DataStreamProvider {
        constructor(public name: string) { }
    }

    export class DataStreamElement implements Threm.INotifiable {

        constructor(private owner: DataStreamProvider, public value: number) {
        }

        getMessageName() {
            return this.owner.name;
        }
    }

	export interface IDataStreamBuffer extends Threm.INotifiable {
		elements: DataStreamElement[];
	}

	export class SimpleDataStreamBuffer implements IDataStreamBuffer {
		constructor(private listeningMessage: string, private context: Threm.ThremContext) {
			
		}
		getMessageName() {
            return this.listeningMessage + "Buffer";
        }

		setItems(elements: DataStreamElement[]) {
			this.elements = elements;
            this.context.busPublishNotifiable(this);
        }

		elements: DataStreamElement[];
	}

	export class ListeningDataStreamBuffer implements IDataStreamBuffer {
        elements: DataStreamElement[];
        constructor(private listeningMessage: string, private context: Threm.ThremContext, public maxSize: number = 1000, prefillZeroes: boolean = true) {
            if (prefillZeroes) {
                this.elements = d3.range(this.maxSize).map<DataStreamElement>((v, i, a) => {
                    return new DataStreamElement(new DataStreamProvider(""), 0);
                });
            }
            context.bus.subscribe(listeningMessage, p => this.addItem(p));
        }

        addItem(element: DataStreamElement) {
            this.elements.push(element);
            while (this.elements.length > this.maxSize) this.elements.shift();
            this.context.busPublishNotifiable(this);
        }

        getMessageName() {
            return this.listeningMessage + "Buffer";
        }
    }

    export class Mixer {
        formFromJson(form: HTMLElement, data: any) {
            var inputs = form.getElementsByTagName("input");
            for (var i = 0; i < inputs.length; ++i) {
                var item = inputs[i];
                if (item.name && data.hasOwnProperty(item.name)) {

                    item.value = data[item.name];
                }
            }
        }
        formToJson(form: HTMLElement): any {
            var result = {};

            var inputs = form.getElementsByTagName("input");
            for (var i = 0; i < inputs.length; ++i) {
                var item = inputs[i];
                if (item.name && item.type !== "submit") {
                    result[item.name] = item.value;
                }

            }
            return result;
        }

        //http://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
        //http://es6-features.org/#ObjectPropertyAssignment
        extend() {

            // Variables
            var extended = {};
            var deep = false;
            var i = 0;
            var length = arguments.length;

            // Check if a deep merge
            if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
                deep = arguments[0];
                i++;
            }

            // Merge the object into the extended object
            var merge = function (obj) {
                for (var prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                        // If deep merge and property is an object, merge properties
                        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                            extended[prop] = this.extend(true, extended[prop], obj[prop]);
                        } else {
                            extended[prop] = obj[prop];
                        }
                    }
                }
            };

            // Loop through each object and conduct a merge
            for (; i < length; i++) {
                var obj = arguments[i];
                merge(obj);
            }

            return extended;
        }

        translate(obj: any, tranalations: any): any {
            var result = {};
            for (var prop in obj) {
                if (tranalations.prototype.hasOwnProperty(prop)) {
                    result[tranalations[prop]] = obj[prop];
                }
            }
            return result;
        }

        makeArray(obj: any): any[] {
            var result = []
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) result.push({ key: prop, value: obj[prop] });
            }
            return result;
        }
    }

    export class Communication {
        //ip: string = "192.168.4.1";
        ip: string = "192.168.1.107";
        //ip: string = "localhost";
        //ip: string = window.location.hostname;

        //httpBase: string = "";
        httpBase: string = "http://"+this.ip+":80";
        //httpBase: string = "http://" + this.ip + ":8080/src/mocks";
        //httpBase: string = "http://"+this.ip+":56609/src/mocks";

        buildAddres(path: string, query: any) {
            var p = this.httpBase + path;
            if (query) p += "?" + this.toQueryString(query);
            return p;
        }
        // http://stackoverflow.com/questions/5505085/flatten-a-javascript-object-to-pass-as-querystring
        toQueryString(obj) {
            var parts = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
                }
            }
            return parts.join("&");
        }

        postText(path: string, data: any): Promise<string> {
            return new Promise<string>((c, d) => {
                d3.text(this.buildAddres(path, null))
                    .header("Content-type", "application/x-www-form-urlencoded")
                    .post(this.toQueryString(data), (err, text) => {
                        if (err) d(err);
                        else c(text);
                    });
            });
        }

        getJson(path: string, query: any = null): Promise<any> {
            var addr = this.buildAddres(path, query);
            return new Promise<string>((c, d) => {
	            console.log("getJson", addr);
                d3.text(addr, (err, data) => {
                    if (err) d(err);
                    else {
                        var data2 = data.replace(/(:nan)([\},]+)/g, ':"--NAN--"$2');
                        console.log(data2);
                        c(JSON.parse(data2));
                    }
                });
            });
        }
    }
}
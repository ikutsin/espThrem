module DataRepository {

    export interface IDataStreamProvider {
        name: string;

    }

    export class DataStreamElement {
        value: number;
        owner: IDataStreamProvider;

        constructor(owner: IDataStreamProvider, value: number) {
            this.value = value;
            this.owner = owner;
        }

    }

    export class Communication {
        //baseAddr: string = "192.168.1.104";
        baseAddr: string = "localhost:56609/src/mocks";

        buildAddres(path: string, query: any) {
            var p = "http://" + this.baseAddr + path;
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
            return new Promise<string>((c, d)=> {
                d3.text(this.buildAddres(path, null))
                    .header("Content-type", "application/x-www-form-urlencoded")
                    .post(this.toQueryString(data), (err, text)=> {
                        if (err) d(err);
                        else c(text);
                    });
            });
        }

        getJson(path: string, query: any = null): Promise<any> {
            var addr = this.buildAddres(path, query);
            return new Promise<string>((c, d) => {
                d3.json(addr, (err, data) => {
                    if (err) d(err);
                    else c(data);
                });
            });
        }
    }
}
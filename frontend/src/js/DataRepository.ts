module DataRepository {

    export interface IDataStreamProvider {
        name: string;

    }

    export class DataStreamElement {
        value: number;
        owner: IDataStreamProvider;

        constructor(owner: IDataStreamProvider, value:number) {
            this.value = value;
            this.owner = owner;
        }
    }
}
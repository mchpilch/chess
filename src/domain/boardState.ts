import { Field } from "./field";

export class BoardState {

    constructor(private readonly fields: Field[][]) {

    }

    public getFields(): Field[][] {
        return this.fields;
    }

    public getFieldById(id: number): Field { // also in moveGenerator

        return this.fields[7 - Math.floor(id / 8)][id % 8];
    }

    public getRowById(id: number): number {

        return (Math.floor(id / 8))
    }

    public getFileById(id: number): number {

        return (id % 8)
    }
}
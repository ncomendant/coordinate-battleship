import { CoordinatePair } from "./coordinate-pair";

export class Ship {
    public horizontal:boolean;
    public origin:CoordinatePair;
    public health:number;
    public constructor(public name:string, public length:number){
        this.horizontal = null;
        this.origin = new CoordinatePair();
        this.health = length;
    }
}
import { Ship } from "../shared/ship"; 

export class Match {
    public userA:any;
    public userB:any;

    public hitMapA:boolean[][];
    public hitMapB:boolean[][];

    public started:boolean;
    public turnA:boolean;

    public constructor(public id:string, public fleetA:Ship[], public fleetB:Ship[]) {
        this.userA = null;
        this.userB = null;

        this.hitMapA = new Array(11).fill(new Array(11).fill(false));
        this.hitMapB = this.hitMapA.slice(0);

        this.started = false;
        this.turnA = true;
    }
}
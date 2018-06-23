import { Ship } from "../battleship-shared/ship"; 

export class Match {
    public userA:any;
    public userB:any;

    public hitMapA:boolean[][];
    public hitMapB:boolean[][];

    public active:boolean;
    public turnA:boolean;

    public constructor(public id:string, public fleetA:Ship[], public fleetB:Ship[]) {
        this.userA = null;
        this.userB = null;

        this.hitMapA = new Array(11);
        this.hitMapB = new Array(this.hitMapA.length);
        for (let i = 0; i < 11; i++) {
            this.hitMapA[i] = new Array(this.hitMapA.length).fill(false);
            this.hitMapB[i] = new Array(this.hitMapB.length).fill(false);
        }

        this.active = false;
        this.turnA = true;
    }
}
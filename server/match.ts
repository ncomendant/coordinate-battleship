import { Ship } from "../shared/ship"; 

export class Match {
    public userA:any;
    public userB:any;

    public aHitMap:boolean[][];
    public bHitMap:boolean[][];

    public started:boolean;
    public aTurn:boolean;

    public constructor(public aBoard:Ship[], public bBoard:Ship[]) {
        this.userA = null;
        this.userB = null;

        this.aHitMap = new Array(11).fill(new Array(11).fill(false));
        this.bHitMap = this.aHitMap.slice(0);

        this.started = false;
        this.aTurn = true;
    }
}
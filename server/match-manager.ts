import { Match } from "./match";
import { Ship } from "../shared/ship";
import { IoEvent } from "../shared/IoEvent";

declare function require(moduleName:string):any;

let crypto:any = require("crypto");

export class MatchManager {

    private static readonly BOT:string = "bot";

    private matches:Map<string, Match>;
    private openMatchId:string;

    public constructor() {
        this.matches = new Map();
        this.openMatchId = null;
    }

    public joinOpenMatch(user:any):void {
        if (this.openMatchId == null) {
            this.openMatchId = this.setupMatch(user).id;
        } else {
            let match:Match = this.matches[this.openMatchId];
            this.openMatchId = null;
            this.startMatch(match, user);
        }
    }

    public createPrivateMatch(user:any):void {
        let matchId:string =this.setupMatch(user).id;
        user.emit(IoEvent.CREATE_PRIVATE, {matchId:matchId});
    }

    public joinPrivateMatch(user:any, matchId:string):void {
        let match:Match = this.matches[matchId.toLowerCase()];

        let err:string = null;
        if (match == null) err = "Match with ID not found";
        else if (match.started) err = "Match already started.";

        if (err == null) this.startMatch(match, user);
        else user.emit(IoEvent.START_MATCH, {err:err});
    }

    public playAI(user:any):void {
        let match:Match = this.setupMatch(user);
        this.startMatch(match, MatchManager.BOT);
    }

    private setupMatch(userA:any):Match {
        let id:string = this.getUniqueId();
        let match:Match = new Match(id, this.setupFleet(), this.setupFleet());
        this.matches[id] = match;
        match.userA = userA;
        userA.data['matchId'] = id;
        return match;
    }

    private startMatch(match:Match, userB:any):void {
        match.userB = userB;
        match.started = true;

        match.userA.emit(IoEvent.START_MATCH, {fleet:match.fleetA});
        match.userA.emit(IoEvent.START_TURN);

        if (userB !== MatchManager.BOT) {
            userB.data['matchId'] = match.id;
            match.userB.emit(IoEvent.START_MATCH, {fleet:match.fleetB});
        }
    }

    private intersects(ship:Ship, x:number, y:number):boolean {
        if (ship.horizontal) {
            if (y !== ship.origin.y) return false; //cannot intersect if not same row
            return x >= ship.origin.x && x < ship.origin.x+ship.length;
        } else {
            if (x !== ship.origin.x) return false; //cannot intersect if not same row
            return y >= ship.origin.y && y < ship.origin.y+ship.length;
        }
    }

    private shipsIntersects(a:Ship, b:Ship):boolean {
        if (a.horizontal) {
            let y = a.origin.y;
            for (let x:number = a.origin.x; x < a.origin.x+a.length; x++) {
                if (this.intersects(b, x, y)) return true;
            }
        } else {
            let x = a.origin.x;
            for (let y:number = a.origin.y; y < a.origin.y+a.length; y++) {
                if (this.intersects(b, x, y)) return true;
            }
        }
        return false;
    }

    private validShip(ship:Ship, fleet:Ship[]):boolean {
        for (let existingShip of fleet) {
            if (this.shipsIntersects(ship, existingShip)) return false;
        }
        return true;
    }

    private getUniqueId():string {
        let id:string = null;
        do {
            id = crypto.randomBytes(64).toString('hex').slice(0, 6);
        } while (this.matches.has(id));
        return id;
    }

    private setupFleet():Ship[] {
        let fleet:Ship[] = [];
        this.placeShip("Frigate", 2, fleet);
        this.placeShip("Destroyer", 3, fleet);
        this.placeShip("Cruiser", 4, fleet);
        this.placeShip("Carrier", 5, fleet);
        return fleet;
    }

    private placeShip(name:string, length:number, fleet:Ship[]):void {
        let ship:Ship = new Ship(name, length);
        do {
            ship.horizontal = Math.random() < 0.5;
            ship.origin.x = (ship.horizontal) ? this.randNum(0, 10-length) : this.randNum(0, 10);
            ship.origin.y = (ship.horizontal) ? this.randNum(0, 10) : this.randNum(0, 10-length);
        } while (!this.validShip(ship, fleet));
        fleet.push(ship);
    }

    private randNum(min:number, max:number):number {
        let gap:number = max-min+1;
        return Math.floor(Math.random()*gap) + min;
    }
}
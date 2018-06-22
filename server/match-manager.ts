import { Match } from "./match";
import { Ship } from "../shared/ship";
import { IoEvent } from "../shared/IoEvent";

declare var crypto;

export class MatchManager {
    private matches:Map<string, Match>;
    private openMatch:Match;

    public constructor() {
        this.matches = new Map();
        this.openMatch = null;
    }

    public joinOpenMatch(user:any):void {
        if (this.openMatch === null) {
            this.openMatch = new Match(this.setupBoard(), this.setupBoard());
            this.openMatch.userA = user;
            user.data['matchId'] = 'open';
        } else {
            let id:string = this.getUniqueId();
            let match:Match = this.openMatch;
            match.userB = user;
            match.userA.data['matchId'] = id;
            match.userA.data['matchId'] = id;
            this.matches[id] = match;
            this.openMatch = null;
            this.startMatch(match);
        }
    }

    public temp():Ship[] {
        return this.setupBoard();
    }

    public createPrivateMatch(user:any):any {
        let id:string = this.getUniqueId();
        let match:Match = new Match(this.setupBoard(), this.setupBoard());
        match.userA = user;
        user.data['matchId'] = id;
        this.matches[id] = match;
    }

    public joinPrivateMatch(user:any, gameId:string):string { //returns error as string, null if successful
        let match:Match = this.matches[gameId.toLowerCase()];
        if (match === null) return("Match with ID not found");
        else if (match.started) return("Match already started.");
        else {
            match.userB = user;
            this.startMatch(match);
        }
    }

    private startMatch(match:Match):void {
        match.started = true;
        match.userA.emit(IoEvent.START_GAME, match.boardA);
        match.userB.emit(IoEvent.START_GAME, match.boardB);
        match.userA.emit(IoEvent.START_TURN);
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

    private validShip(ship:Ship, board:Ship[]):boolean {
        for (let existingShip of board) {
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

    private setupBoard():Ship[] {
        let board:Ship[] = [];
        this.placeShip("Frigate", 2, board);
        this.placeShip("Destroyer", 3, board);
        this.placeShip("Cruiser", 4, board);
        this.placeShip("Carrier", 5, board);
        return board;
    }

    private placeShip(name:string, length:number, board:Ship[]):void {
        let ship:Ship = new Ship(name, length);
        do {
            ship.horizontal = Math.random() < 0.5;
            ship.origin.x = (ship.horizontal) ? this.randNum(0, 10-length) : this.randNum(0, 10);
            ship.origin.y = (ship.horizontal) ? this.randNum(0, 10) : this.randNum(0, 10-length);
        } while (!this.validShip(ship, board));
        board.push(ship);
    }

    private randNum(min:number, max:number):number {
        let gap:number = max-min+1;
        return Math.floor(Math.random()*gap) + min;
    }
}
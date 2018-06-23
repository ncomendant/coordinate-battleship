import { Match } from "./match";
import { Ship } from "../shared/ship";
import { IoEvent } from "../shared/IoEvent";
import { CoordinatePair } from "../shared/coordinate-pair";
import { MatchUtil } from "./matchutil";

declare function require(moduleName:string):any;

let crypto:any = require("crypto");

export class MatchManager {
    private static readonly BOT:string = "bot";
    private static readonly BOT_RESPONSE_TIME:number = 2000;

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

    public removeUser(user:any):void {
        let match:Match = this.matches[user.data['matchId']];
        user.data['matchId'] = null;
        if (match == null) return;

        if (match.active) { // match is underway
            if (match.userA === user) {
                match.userA = null;
                if (this.realUser(match.userB)) match.userB.emit(IoEvent.ENEMY_FLED);
            } else if (match.userB === user) {
                match.userB = null;
                if (this.realUser(match.userA)) match.userA.emit(IoEvent.ENEMY_FLED);
            }
            this.endMatch(match);
        } else { // match is pending or completed
            match.userA = null;
            match.userB = null;
            this.endMatch(match);
        }
    }

    public attack(user:any, coords:CoordinatePair):void {
        let match:Match = this.matches[user.data.matchId];

        //Make sure match can be found and it's this user's turn
        if (match == null || !match.active) return;
        if (match.turnA && match.userA !== user) return;
        if (!match.turnA && match.userB !== user) return;
        
        this.completeAttack(coords, match);
    }

    private botAttack(match:Match):void { // dumb AI always picks random spot to attack
        setTimeout(() => { //delay bot's reponse time
            let coords:CoordinatePair = new CoordinatePair(MatchUtil.randNum(0,10), MatchUtil.randNum(0,10));
            this.completeAttack(coords, match);
        }, MatchManager.BOT_RESPONSE_TIME);
    }

    private completeAttack(coords:CoordinatePair, match:Match):void {
        let matchOver:boolean = null;
        if (match.turnA)  {
            matchOver = this.processAttack(coords, match.userA, match.userB, match.hitMapB, match.fleetB);
        } else {
            matchOver = this.processAttack(coords, match.userB, match.userA, match.hitMapA, match.fleetA);
        }

        if (matchOver) {
            this.endMatch(match);
        } else {
            match.turnA = !match.turnA;
            let currentUser:any = (match.turnA) ? match.userA : match.userB;
            if (currentUser === MatchManager.BOT) this.botAttack(match);
        }
    }

    private endMatch(match:Match):void {
        if (this.realUser(match.userA)) {
            match.userA.emit(IoEvent.ENEMY_FLEET, {fleet:match.fleetB});
            match.userA.data['matchId'] = null;
        }
        if (this.realUser(match.userB)) {
            match.userB.emit(IoEvent.ENEMY_FLEET, {fleet:match.fleetA});
            match.userB.data['matchId'] = null;
        }
        if (match.id === this.openMatchId) this.openMatchId = null;
        match.active = false;
        delete this.matches[match.id];
    }

    private processAttack(coords:CoordinatePair, attacker:any, attacked:any, hitMap:boolean[][], fleet:Ship[]):boolean { //returns true if all ships destroyed
        let realAttacker:boolean = this.realUser(attacker);
        let realAttacked:boolean = this.realUser(attacked);
        
        if (hitMap[coords.x][coords.y]) { //spot already attacked
            if (realAttacker) attacker.emit(IoEvent.ALREADY_ATTACKED, {myBoard:false});
            if (realAttacked) attacked.emit(IoEvent.ALREADY_ATTACKED, {myBoard:true});
        } else { //spot not attacked before
            hitMap[coords.x][coords.y] = true;
            let ship:Ship = this.checkForHit(coords, hitMap, fleet);
            if (ship != null) { //ship was hit
                let shipSunk:boolean = ship.health === 0;
                let matchOver:boolean = shipSunk && !this.alive(fleet);
                if (realAttacker) attacker.emit(IoEvent.HIT, {myBoard:false, coords:coords, shipName:ship.name, shipSunk:shipSunk, matchOver:matchOver}); 
                if (realAttacked) attacked.emit(IoEvent.HIT, {myBoard:true, coords:coords, shipName:ship.name, shipSunk:shipSunk, matchOver:matchOver}); 
                if (matchOver) return true;
            } else { //attack missed
                if (realAttacker) attacker.emit(IoEvent.MISS, {myBoard:false, coords:coords}); 
                if (realAttacked) attacked.emit(IoEvent.MISS, {myBoard:true, coords:coords}); 
            }
        }
    }

    private alive(fleet:Ship[]):boolean {
        for (let ship of fleet) {
            if (ship.health > 0) return true;
        }
        return false;
    }

    private realUser(user:any):boolean {
        return user != null && user !== MatchManager.BOT;
    }

    private checkForHit(coords:CoordinatePair, hitmap:boolean[][], fleet:Ship[]):Ship {
        hitmap[coords.x][coords.y] = true;
        for (let ship of fleet) {
            if (ship.health === 0) continue;
            if (this.intersects(ship, coords.x, coords.y)) {
                ship.health--;
                return ship;
            }
        }
        return null;
    }

    public createPrivateMatch(user:any):void {

        let matchId:string = this.setupMatch(user).id;
        user.emit(IoEvent.CREATE_PRIVATE, {matchId:matchId});
    }

    public joinPrivateMatch(user:any, matchId:string):void {
        let match:Match = this.matches[matchId.toLowerCase()];

        let err:string = null;
        if (match == null) err = "Match with ID not found";
        else if (match.active) err = "Match already started.";

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
        match.active = true;

        match.userA.emit(IoEvent.START_MATCH, {fleet:match.fleetA, starting:true});

        if (this.realUser(userB)) { //second player might be bot
            userB.data['matchId'] = match.id;
            match.userB.emit(IoEvent.START_MATCH, {fleet:match.fleetB, starting:false});
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

    private setupFleet():Ship[] {
        let fleet:Ship[] = [];
        this.placeShip("Frigate", 2, fleet);
        this.placeShip("Destroyer", 3, fleet);
        this.placeShip("Cruiser", 4, fleet);
        this.placeShip("Carrier", 5, fleet);
        return fleet;
    }

    private getUniqueId():string {
        let id = null;
        do {
            id = MatchUtil.generateId();
        } while (this.matches.has(id));
        return id;
    }

    private placeShip(name:string, length:number, fleet:Ship[]):void {
        let ship:Ship = new Ship(name, length);
        do {
            ship.horizontal = Math.random() < 0.5;
            ship.origin.x = (ship.horizontal) ? MatchUtil.randNum(0, 10-length) : MatchUtil.randNum(0, 10);
            ship.origin.y = (ship.horizontal) ? MatchUtil.randNum(0, 10) : MatchUtil.randNum(0, 10-length);
        } while (!this.validShip(ship, fleet));
        fleet.push(ship);
    }
}
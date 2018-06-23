import { Screen } from "./screen";
import { Ship } from "../../../battleship-shared/ship";
import { App } from "../app";
import { IoEvent } from "../../../battleship-shared/io-event";
import { CoordinatePair } from "../../../battleship-shared/coordinate-pair";

export class PlayScreen extends Screen {
    private static readonly BOARD_SIZE:number = 400;
    private static readonly BOARD_Y:number = 100;
    private static readonly TILE_SIZE:number = PlayScreen.BOARD_SIZE/12;

    private shipOverlay:any;
    private markOverlay:any;
    private textOverlay:any;

    private shipLab:any;
    private enemyShipLab:any;
    private notificationLab:any;

    private shipsRemaining:number;
    private enemyShipsRemaining:number;

    public constructor(app:App) {
        super(app);

        this.setupBoards();
        this.setupText();

        this.shipOverlay = this.makeGroup(true);
        this.markOverlay = this.makeGroup(true);
        this.textOverlay = this.makeGroup(true);
    }

    public init(fleet:Ship[], starting:boolean):void {
        this.shipsRemaining = fleet.length;
        this.enemyShipsRemaining = fleet.length;
        this.updateShipLabels();

        for (let ship of fleet) {
            this.placeShip(ship, true);
        }
        this.show();

        if (starting) this.startTurn();

        this.app.io.on(IoEvent.HIT, (data:any) => {
            let myBoard:boolean = data['myBoard'];
            let coords:CoordinatePair = data['coords'];
            let shipName:string = data['shipName'];
            let shipSunk:boolean = data['shipSunk'];

            this.app.playSound("explosion");
            this.placeTileSprite("explosion", myBoard, coords.x, coords.y, this.markOverlay);
            let message:string = (myBoard) ? "Your " : "Enemy ";
            message += shipName.toLowerCase() + " was ";
            message += (shipSunk) ? "sunk!" : "hit.";

            this.notify(message);

            let matchOver:boolean = false;
            if (shipSunk) {
                if (myBoard && --this.shipsRemaining === 0) matchOver = true;
                if (!myBoard && --this.enemyShipsRemaining === 0) matchOver = true;
                this.updateShipLabels();
            }

            if (matchOver) {
                let message:string = (myBoard) ? "Defeat!<br />Your fleet was destroyed!" : "Victory!<br />The enemy fleet has been destroyed!";
                this.app.ui.alert(message, () => {
                    window.location.reload(true);
                });
            } else if (myBoard) {
                this.startTurn();
            }
        });

        this.app.io.on(IoEvent.MISS, (data:any) => {
            let myBoard:boolean = data['myBoard'];
            let coords:CoordinatePair = data['coords'];

            this.app.playSound("miss");
            this.placeTileSprite("miss", myBoard, coords.x, coords.y, this.markOverlay);

            let message:string = (myBoard) ? "Enemy attack missed." : "Your attack missed.";
            this.notify(message);

            if (myBoard) this.startTurn();
        });

        this.app.io.on(IoEvent.ALREADY_ATTACKED, (data:any) => {
            let myBoard:boolean = data['myBoard'];

            this.app.playSound("miss");

            let message:string = (myBoard) ? "Enemy already attacked that location." : "You already attacked that location.";
            this.notify(message);

            if (myBoard) this.startTurn();
        });

        this.app.io.on(IoEvent.ENEMY_FLEET, (data:any) => {
            let fleet:Ship[] = data['fleet'];
            for (let ship of fleet) {
                this.placeShip(ship, false);
            }
        });

        this.app.io.on(IoEvent.ENEMY_FLED, (data:any) => {
            let message:string = "Victory!<br />The enemy has fled.";
            this.app.ui.alert(message, () => {
                window.location.reload(true);
            });
        });
    }

    private setupBoards():void {
        let boardA:any = this.makeSprite("board", 0, PlayScreen.BOARD_Y);
        let boardB:any = this.makeSprite("board", PlayScreen.BOARD_SIZE, PlayScreen.BOARD_Y);
        
        boardA.anchor.setTo(0, 0);
        boardB.anchor.setTo(0, 0);

        boardA.width = boardA.height = boardB.width = boardB.height = PlayScreen.BOARD_SIZE;
    }

    private setupText():void {
        this.shipLab = this.makeLabel("", PlayScreen.BOARD_SIZE/2, PlayScreen.BOARD_Y, 12, this.textOverlay);
        this.enemyShipLab = this.makeLabel("", PlayScreen.BOARD_SIZE + PlayScreen.BOARD_SIZE/2, PlayScreen.BOARD_Y, 12, this.textOverlay);

        this.notificationLab = this.makeLabel("", this.centerX, PlayScreen.BOARD_Y-30, 24, this.textOverlay);
    }

    private updateShipLabels():void {
        this.shipLab.text = "Your Ships: " + this.shipsRemaining;
        this.enemyShipLab.text = "Enemy Ships: " + this.enemyShipsRemaining;
    }

    private notify(message:string):void {
        this.notificationLab.text = message;
    }

    private startTurn(previousInp:string = null):void {
        this.app.ui.prompt("Enter the coordinates to attack. Example: (-3,5)", previousInp, (text:string) => {
            let result:any = this.processInput(text);
            if (typeof result === "string") {
                this.app.ui.alert(result, () => {
                    this.startTurn(text);
                });
            } else {
                this.app.io.emit(IoEvent.ATTACK, {coords:result});
            }
        });
    }

    private processInput(text:string):any {
        text = text.replace(/\s/g,''); //remove all whitespace

        if (text.length === 0) return "Input cannot be empty.";
        if (!text.startsWith("(") || !text.endsWith(")")) return "Does not start and end with parentheses.";

        text = text.slice(1, text.length-1); //remove parentheses

        let chunks:string[] = text.split(",");
        if (chunks.length !== 2) return "Incorrect comma use.";

        let intRegEx:any = /^[-+]?\d+$/;
        if (!intRegEx.test(chunks[0]) || !intRegEx.test(chunks[1])) return "Invalid numbers for coordiantes.";

        let x:number = parseInt(chunks[0]);
        let y:number = parseInt(chunks[1]);

        // if (isNaN(x) || isNaN(y)) return "Invalid numbers for coordiantes.";
        if (x < -5) return "x-coordinate cannot be less than -5."
        if (y < -5) return "y-coordinate cannot be less than -5."
        if (x > 5) return "x-coordinate cannot be greater than 5."
        if (y > 5) return "y-coordinate cannot be greater than 5."

        return new CoordinatePair(x, y);
    }

    private placeShip(ship:Ship, firstBoard:boolean):void {
        if (ship.horizontal) {
            for (let x = ship.origin.x; x < ship.origin.x+ship.length; x++) {
                this.placeTileSprite("ship-piece", firstBoard, x, ship.origin.y, this.shipOverlay);
            }
        } else {
            for (let y = ship.origin.y; y < ship.origin.y+ship.length; y++) {
                this.placeTileSprite("ship-piece", firstBoard, ship.origin.x, y, this.shipOverlay);
            }
        }
    }

    private placeTileSprite(name:string, firstBoard:boolean, x:number, y:number, group:any):void {
        let screenY:number = PlayScreen.BOARD_Y + PlayScreen.BOARD_SIZE - PlayScreen.TILE_SIZE; //start from bottom of board
        screenY -= y*PlayScreen.TILE_SIZE;

        let screenX:number = (x+1)*PlayScreen.TILE_SIZE;
        if (!firstBoard) screenX += PlayScreen.BOARD_SIZE;
        
        let sprite:any = this.makeSprite(name, screenX, screenY, group);
        sprite.width = sprite.height = PlayScreen.TILE_SIZE;
    }
}
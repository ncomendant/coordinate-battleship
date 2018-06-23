import { Screen } from "./screen";
import { Ship } from "../../../shared/ship";
import { App } from "../app";
import { IoEvent } from "../../../shared/IoEvent";
import { CoordinatePair } from "../../../shared/coordinate-pair";

export class PlayScreen extends Screen {

    private static readonly BOARD_SIZE:number = 400;
    private static readonly BOARD_Y:number = 100;
    private static readonly TILE_SIZE:number = PlayScreen.BOARD_SIZE/12;

    private shipOverlay:any;
    private markOverlay:any;

    public constructor(app:App) {
        super(app);

        this.setupBoards();

        this.shipOverlay = this.makeGroup(true);
        this.markOverlay = this.makeGroup(true);
    }

    private setupBoards():void {
        let boardA:any = this.makeSprite("board", 0, PlayScreen.BOARD_Y);
        let boardB:any = this.makeSprite("board", PlayScreen.BOARD_SIZE, PlayScreen.BOARD_Y);
        
        boardA.anchor.setTo(0, 0);
        boardB.anchor.setTo(0, 0);

        boardA.width = boardA.height = boardB.width = boardB.height = PlayScreen.BOARD_SIZE;
    }

    public init(fleet:Ship[], starting:boolean):void {
        for (let ship of fleet) {
            this.placeShip(ship);
        }
        this.show();

        if (starting) this.startTurn();

        this.app.io.on(IoEvent.HIT, (data:any) => {
            let myBoard:boolean = data['myBoard'];
            let gameOver:boolean = data['gameOver'];
            let coords:CoordinatePair = data['coords'];
            let shipName:string = data['shipName'];
            let shipSunk:boolean = data['shipSunk'];

            this.playSound("explosion-sound");
            this.placeTileSprite("explosion", myBoard, coords.x, coords.y, this.markOverlay);
            let message:string = (myBoard) ? "Your " : "Enemy ";
            message += shipName.toLowerCase() + " was ";
            message += (shipSunk) ? "sunk!" : "hit.";
            this.notify(message);

            if (gameOver) {
                let message:string = (myBoard) ? "Your fleet was defeated!" : "Your fleet was victorious!";
                this.app.ui.alert(message, () => {
                    window.location.reload(true);
                });
            } else if (myBoard) {
                this.startTurn();
            }
        });

        this.app.io.on(IoEvent.MISS, (data:any) => { //myBoard:boolean, coords:CoordinatePair
            let myBoard:boolean = data['myBoard'];
            let coords:CoordinatePair = data['coords'];

            this.playSound("miss-sound");
            this.placeTileSprite("miss", myBoard, coords.x, coords.y, this.markOverlay);

            let message:string = (myBoard) ? "Enemy attack missed." : "Your attacked missed.";
            this.notify(message);

            if (myBoard) this.startTurn();
        });

        this.app.io.on(IoEvent.ALREADY_ATTACKED, (data:any) => { //myBoard:boolean
            let myBoard:boolean = data['myBoard'];

            this.playSound("miss-sound");

            let message:string = (myBoard) ? "Enemy already attacked that location." : "You already attacked that location.";
            this.notify(message);

            if (myBoard) this.startTurn();
        });
    }

    private playSound(soundName:string):void {
        //TODO
    }

    private notify(message:string):void {
        //TODO
        console.log(message);
    }

    private startTurn():void {
        this.app.ui.prompt("Enter the coordinates to attack. Example: (-3,5)", (text:string) => {
            let result:any = this.processInput(text);
            if (typeof result === "string") {
                this.app.ui.alert(result, () => {
                    this.startTurn();
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

        let x:number = parseInt(chunks[0]);
        let y:number = parseInt(chunks[1]);

        if (isNaN(x) || isNaN(y)) return "Invalid numbers for coordiantes.";
        if (x < -5) return "x-coordinate cannot be less than -5."
        if (y < -5) return "y-coordinate cannot be less than -5."
        if (x > 5) return "x-coordinate cannot be greater than 5."
        if (y > 5) return "y-coordinate cannot be greater than 5."

        return new CoordinatePair(x, y);
    }

    private placeShip(ship:Ship):void {
        if (ship.horizontal) {
            for (let x = ship.origin.x; x < ship.origin.x+ship.length; x++) {
                this.placeTileSprite("ship-piece", true, x, ship.origin.y, this.shipOverlay);
            }
        } else {
            for (let y = ship.origin.y; y < ship.origin.y+ship.length; y++) {
                this.placeTileSprite("ship-piece", true, ship.origin.x, y, this.shipOverlay);
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
import { Screen } from "./screen";
import { Ship } from "../../../shared/ship";
import { App } from "../app";

export class PlayScreen extends Screen {

    private static readonly BOARD_SIZE:number = 400;
    private static readonly BOARD_Y:number = 100;
    private static readonly TILE_SIZE:number = PlayScreen.BOARD_SIZE/12;

    private shipOverlay:any;
    private markOverlay:any;

    public constructor(app:App) {
        super(app);

        this.setupBoards();

        this.shipOverlay = this.makeGroup();
        this.markOverlay = this.makeGroup();
    }

    private setupBoards():void {
        let boardA:any = this.makeSprite("board", 0, PlayScreen.BOARD_Y);
        let boardB:any = this.makeSprite("board", PlayScreen.BOARD_SIZE, PlayScreen.BOARD_Y);
        
        boardA.anchor.setTo(0, 0);
        boardB.anchor.setTo(0, 0);

        boardA.width = boardA.height = boardB.width = boardB.height = PlayScreen.BOARD_SIZE;
    }

    public init(ships:Ship[]):void {
        for (let ship of ships) {
            this.placeShip(ship);
        }
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
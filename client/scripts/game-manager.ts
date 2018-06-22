import { StateManager } from "../../shared/state-manager";
import { EventManager } from "./event-manager";
import { Ship } from "../../shared/ship";

declare var Phaser;

class MenuScreen implements StateManager {

    public constructor(private manager:GameManager, private eventManager:EventManager) {}

    public init():void {
        //this.manager.game.add.sprite(0, 0, "logo");
        // scoreText = this.game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000000' });
    }

    public dispose():void {

    }
}

class PlayScreen implements StateManager  {
    private static readonly TILE_SIZE:number = 25;
    public constructor(private manager:GameManager, private eventManager:EventManager) {}

    public init():void {
        this.manager.game.add.sprite(0, 0, "board");
        this.manager.game.add.sprite(300, 0, "board");
    }

    public setupBoard(board:Ship[]):void {
        console.log(board);
        for (let ship of board) {
            this.placeShip(ship);
        }
    }

    private placeShip(ship:Ship):void {
        if (ship.horizontal) {
            for (let x = ship.origin.x; x < ship.origin.x+ship.length; x++) {
                this.placeShipPiece(x, ship.origin.y);
            }
        } else {
            for (let y = ship.origin.y; y < ship.origin.y+ship.length; y++) {
                this.placeShipPiece(ship.origin.x, y);
            }
        }
    }

    private placeShipPiece(x:number, y:number):void {
        let screenX:number = (x+1)*PlayScreen.TILE_SIZE - PlayScreen.TILE_SIZE/2;
        let screenY:number = 300 - ((y+1)*PlayScreen.TILE_SIZE - PlayScreen.TILE_SIZE/2);
        this.manager.game.add.sprite(screenX, screenY, "ship-piece");
    }

    public dispose():void {

    }

}

export class GameManager {

    private _game:any;
    private _eventManager:EventManager;
    private menuScreen:MenuScreen;
    private playScreen:PlayScreen;



    public constructor(eventManager:EventManager,  callback:() => void) {

        this._eventManager = eventManager;

        this.menuScreen = new MenuScreen(this, eventManager);
        this.playScreen = new PlayScreen(this, eventManager);

        this._game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
            preload : () => {
                this.game.load.image('logo', 'rsc/logo.png');
                this.game.load.image('explosion', 'rsc/explosion.png');
                this.game.load.image('miss', 'rsc/miss.png');
                this.game.load.image('board', 'rsc/small-board.png');
                this.game.load.image('ship-piece', 'rsc/ship-piece.png');
            },
            create : () => {
                this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.menuScreen.init();
                callback();
            },
            update : () => {}
        });
    }

    public get game():any {
        return this._game;
    }

    public get eventManager():EventManager {
        return this._eventManager;
    }

    public switchToPlay(board:Ship[]):void {
        this.menuScreen.dispose();
        this.playScreen.init();
        this.playScreen.setupBoard(board);
    }
}
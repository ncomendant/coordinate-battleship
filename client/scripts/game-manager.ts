import { StateManager } from "../../shared/state-manager";
import { EventManager } from "./event-manager";
import { Ship } from "../../shared/ship";

declare var Phaser;

class MenuScreen implements StateManager {

    private group:any;

    public constructor(private manager:GameManager, private eventManager:EventManager) {}
    

    public init():void {
        this.group = this.manager.game.add.group();
        this.group.inputEnableChildren = true;

        let centerX:number = this.manager.game.world.centerX;

        let logo:any = this.manager.game.add.sprite(centerX, 20, "logo");
        logo.anchor.setTo(0.5, 0);

        this.makeBtn('Play vs Random Opponent', 150, () => {

        });

        this.makeBtn('Play vs AI', 250, () => {

        });

        this.makeBtn('Create Private Match', 350, () => {

        });

        this.makeBtn('Join Private Match', 450, () => {

        });
    }

    private makeBtn(text:string, y:number, onClick:() => void):any {
        let btn:any = this.manager.game.add.text(this.manager.game.world.centerX, y, text, { fontSize: '38px', fill: '#000000' }, this.group);
        btn.anchor.setTo(0.5, 0);

        console.log(btn.events);

        btn.events.onInputOver.add(()=>{
            btn.addColor('#ff9400', 0);
        }, this);

        btn.events.onInputOut.add(()=>{
            btn.addColor('#000000', 0);
        }, this);

        btn.events.onInputDown.add(()=>{
            onClick();
        }, this);
        return btn;
    }

    public dispose():void {
        this.group.destroy();
        this.group = null;
    }
}

class PlayScreen implements StateManager  {
    private static readonly BOARD_SIZE:number = 400;
    private static readonly BOARD_Y:number = 100;
    private static readonly TILE_SIZE:number = PlayScreen.BOARD_SIZE/12;
    public constructor(private manager:GameManager, private eventManager:EventManager) {}

    public init():void {
        let logo:any = this.manager.game.add.sprite(this.manager.game.world.centerX, 20, "logo");
        logo.anchor.setTo(0.5, 0);
        let boardA:any = this.manager.game.add.sprite(0, PlayScreen.BOARD_Y, "board");
        let boardB:any = this.manager.game.add.sprite(PlayScreen.BOARD_SIZE, PlayScreen.BOARD_Y, "board");
        boardA.width = boardA.height = boardB.width = boardB.height = PlayScreen.BOARD_SIZE;
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
                this.placeSprite("ship-piece", x, ship.origin.y);
            }
        } else {
            for (let y = ship.origin.y; y < ship.origin.y+ship.length; y++) {
                this.placeSprite("ship-piece", ship.origin.x, y);
            }
        }
    }

    private placeSprite(name:string, x:number, y:number):void { //TODO - support placing sprites for second board too
        let screenY:number = PlayScreen.BOARD_Y + PlayScreen.BOARD_SIZE - PlayScreen.TILE_SIZE; //start from bottom of board
        let screenX:number = (x+1)*PlayScreen.TILE_SIZE;
        screenY -= y*PlayScreen.TILE_SIZE;
        let sprite:any = this.manager.game.add.sprite(screenX, screenY, name);
        sprite.width = sprite.height = PlayScreen.TILE_SIZE;
        sprite.anchor.setTo(0.5);
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
                this.game.stage.backgroundColor = "#FFFFFF";
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
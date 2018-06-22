import { MenuScreen } from "./screens/menu-screen";
import { PlayScreen } from "./screens/play-screen";

declare var Phaser;

export class App {
    private _game:any;
    private _io:any;

    private _menuScreen:MenuScreen;
    private _playScreen:PlayScreen;

    public constructor(serverUrl:string) {
        this.loadGame(() => {
            this.connectToServer(serverUrl, () => {
                this._menuScreen = new MenuScreen(this);
                this._playScreen = new PlayScreen(this);
                this.menuScreen.show();
            });
        });
    }

    private connectToServer(serverUrl:string, callback:() => void):void {
        this._io = window['io'](serverUrl);
        this.io.on("connect", () => {
            this.io.on("disconnect", function(){
                window.location.reload(true);
            });
            callback();
        });
    }

    private loadGame(callback:() => void):void {
        this._game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
            preload : () => {
                this.game.load.image('logo', 'rsc/logo.png');
                this.game.load.image('explosion', 'rsc/explosion.png');
                this.game.load.image('miss', 'rsc/miss.png');
                this.game.load.image('board', 'rsc/small-board.png');
                this.game.load.image('ship-piece', 'rsc/ship-piece.png');
                this.game.load.image('background', 'rsc/bg.png');
            },
            create : () => {
                this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

                this.game.add.sprite(0, 0, "background");

                let logo:any = this.game.add.sprite(this.game.world.centerX, 20, "logo");
                logo.anchor.setTo(0.5, 0);

                callback();
            },
            update : () => {}
        });
    }

    public get game():any {
        return this._game;
    }

    public get io():any {
        return this._io;
    }

    public get menuScreen():MenuScreen {
        return this._menuScreen;
    }

    public get playScreen():PlayScreen {
        return this._playScreen;
    }
}

new App("http://127.0.0.1:3001");
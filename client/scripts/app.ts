import { MenuScreen } from "./screens/menu-screen";
import { PlayScreen } from "./screens/play-screen";
import { UiManager } from "./ui-manager";

declare var Phaser, $;

export class App {
    private _game:any;
    private _io:any;

    private _menuScreen:MenuScreen;
    private _playScreen:PlayScreen;

    private _ui:UiManager;

    private soundMap:Map<string, any>;

    public constructor(serverUrl:string) {
        this._ui = new UiManager();

        let $connecting:any = $("#connecting");
        
        this.connectToServer(serverUrl, () => {
                this.loadGame(() => {
                    $connecting.hide();
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
        this.soundMap = new Map();

        this._game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
            preload : () => {
                this.game.load.image('logo', 'rsc/logo.png');
                this.game.load.image('explosion', 'rsc/explosion.png');
                this.game.load.image('miss', 'rsc/miss.png');
                this.game.load.image('board', 'rsc/small-board.png');
                this.game.load.image('ship-piece', 'rsc/ship-piece.png');
                this.game.load.image('background', 'rsc/bg.png');
                this.game.load.audio('explosion','rsc/explosion.mp3');
                this.game.load.audio('miss','rsc/miss.mp3');
            },
            create : () => {
                this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

                this.soundMap['explosion'] = this.game.add.audio('explosion');
                this.soundMap['miss'] = this.game.add.audio('miss');

                this.game.add.sprite(0, 0, "background");

                let logo:any = this.game.add.sprite(this.game.world.centerX, 20, "logo");
                logo.anchor.setTo(0.5, 0);

                callback();
            },
            update : () => {}
        });
    }

    public playSound(key:string, volume:number = 1):void {
        this.soundMap[key].play("", 0, volume, false, true);
    }

    public get game():any {
        return this._game;
    }

    public get ui():UiManager {
        return this._ui;
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
import { MenuScreen } from "./screens/menu-screen";
import { PlayScreen } from "./screens/play-screen";

declare var Phaser, $;

export class App {
    private _game:any;
    private _io:any;

    private _menuScreen:MenuScreen;
    private _playScreen:PlayScreen;

    private uiHandler:any;

    public constructor(serverUrl:string) {
        this.setupUi();
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

    private setupUi():void {
        let $ui:any = $("#ui");
        let $uiForm:any = $("#uiForm");
        let $uiInp:any = $("#uiInp");

        this.uiHandler = null;
        $uiForm.on("submit", (event:any) => {
            event.preventDefault();
            if ($uiInp.is(":visible")) { //is prompt
                let value = $("#uiInp").val().trim();
                if (value.length > 0) {
                    $ui.hide();
                    this.uiHandler(value);
                    this.uiHandler = null;
                }
            } else { //is alert
                $ui.hide();
                if (this.uiHandler !== null) {
                    this.uiHandler();
                    this.uiHandler = null;
                }
            }
        });
    }
    
    public prompt(message:string, callback:(text:string) => void):void {
        this.showUi(message, callback, true);
    }

    public alert(message:string, callback:() => void = null):void {
        this.showUi(message, callback, false);
    }

    private showUi(message:string, callback:any, showPrompt:boolean):void {
        let $ui:any = $("#ui");
        let $uiForm:any = $("#uiForm");
        let $uiText:any = $("#uiText");
        let $uiInp:any = $("#uiInp");

        this.uiHandler = callback;

        $uiForm.hide();

        if (showPrompt) {
            $uiInp.show();
            $uiInp.val('');
        }
        else $uiInp.hide();

        $uiText.html(message);

        $ui.show();
        
        $uiForm.fadeIn(500, () => {
            if (showPrompt) $uiInp.focus();
            else $ui.focus();
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
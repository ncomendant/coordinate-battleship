import { Screen } from "./screen";
import { App } from "../app";
import { IoEvent } from "../../../shared/IoEvent";

export class MenuScreen extends Screen {

    private menuGroup:any;
    private waitGroup:any;
    private waitLab:any;

    public constructor(app:App) {
        super(app, true);

        this.setupMenuGroup();
        this.setupWaitGroup();
        this.showMenu();
    }

    public show():void {
        super.show();
        this.showMenu();
    }

    private setupMenuGroup():void {
        this.menuGroup = this.makeGroup();

        this.makeButton('Play vs Random Opponent', this.centerX, 150, this.menuGroup, () => {
            this.showWaitMessage("Waiting for opponent...");
            this.app.io.emit(IoEvent.PLAY_RANDOM);
            this.awaitGameStart();
        });

        this.makeButton('Play vs AI', this.centerX, 250, this.menuGroup, () => {
            this.showWaitMessage("Loading match...");
            this.app.io.emit(IoEvent.PLAY_AI);
            this.awaitGameStart();
        });

        this.makeButton('Create Private Match', this.centerX, 350, this.menuGroup, () => {
            this.showWaitMessage("Creating lobby...");
            this.app.io.emit(IoEvent.CREATE_PRIVATE);
            this.app.io.once(IoEvent.CREATE_PRIVATE, (data:any) => {
                if (data.err != null) {
                    this.app.ui.alert(data.err);
                    this.showMenu();
                } else {
                    this.showWaitMessage("Match ID for opponent to join:\n" + data.matchId);
                    this.awaitGameStart();
                }
            });
        });

        this.makeButton('Join Private Match', this.centerX, 450, this.menuGroup, () => {
            this.app.ui.prompt("Enter the match ID:", null, (matchId:string) => {
                if (matchId == null) return;
                let trimmedMatchId:string = matchId.trim();
                if (trimmedMatchId.length === 0 || trimmedMatchId.length > 100) return;
                this.app.io.emit(IoEvent.JOIN_PRIVATE, {matchId:trimmedMatchId});
                this.showWaitMessage("Locating match...");
                this.awaitGameStart();
            });
        });
    }

    private awaitGameStart():void {
        this.app.io.once(IoEvent.START_MATCH, (data:any) => {
            if (data.err != null) {
                this.app.ui.alert(data.err);
                this.showMenu();
            } else {
                this.app.ui.close();
                this.hide();
                this.app.playScreen.init(data.fleet, data.starting);
            }
        });
        this.app.ui.alert("Click OK to cancel.", function(){
            window.location.reload();
        });
    }

    private setupWaitGroup():void {
        this.waitGroup = this.makeGroup();
        this.waitLab = this.makeLabel("Please wait...", this.centerX, this.centerY-30, this.waitGroup);
        this.waitGroup.visible = false;
    }

    private showWaitMessage(text:string):void {
        this.waitLab.text = text;
        this.menuGroup.visible = false;
        this.waitGroup.visible = true;
    }

    private showMenu():void {
        this.waitGroup.visible = false;
        this.menuGroup.visible = true;
    }

}
import { App } from "../app";

export abstract class Screen {
    
    private _app:App;
    private stage:any;

    public constructor(app:App, private inputEnabled:boolean = false) {
        this._app = app;
        this.stage = this.app.game.add.group();
        this.stage.inputEnableChildren = inputEnabled;
        this.hide();
    }

    protected makeGroup(visible:boolean = false):any {
        let group:any = this.app.game.add.group();
        group.inputEnableChildren = this.inputEnabled;
        this.stage.add(group);
        group.visible = visible;
        return group;
    }

    protected makeButton(text:string, x:number, y:number, group:any, onClick:() => void):any {
        if (group == null) group = this.stage;
        let btn:any = this.app.game.add.text(x, y, text,  { fontSize: '38px', fill: '#000000' }, group);
        btn.anchor.setTo(0.5, 0);

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

    protected prompt():void {

    }

    protected makeSprite(name:string, x:number, y:number, group:any = null):any {
        if (group == null) group = this.stage;
        let sprite:any = this.app.game.add.sprite(x, y, name);
        group.add(sprite);
        sprite.anchor.setTo(0.5);
        return sprite;
    }

    protected makeLabel(text:string, x:number, y:number, group:any = null):any {
        if (group == null) group = this.stage;
        let label:any = this.app.game.add.text(x, y, text,  { fontSize: '38px', fill: '#000000' }, group);
        label.anchor.setTo(0.5, 0);
        return label;
    }

    protected get centerX():number {
        return this.app.game.world.centerX;
    }

    protected get centerY():number {
        return this.app.game.world.centerY;
    }

    protected get app():App {
        return this._app;
    }

    public show():void {
        this.stage.visible = true;
    }

    public hide():void {
        this.stage.visible = false;
    }

}
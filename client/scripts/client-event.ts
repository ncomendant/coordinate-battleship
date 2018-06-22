export class ClientEvent {
    public static readonly START_WAIT = "start wait"; //gameId:string
    public static readonly START_MENU = "start menu";
    public static readonly START_PLAY = "start play"; //layout:Ship[]
    public static readonly PLAYER_HIT = "player hit"; //x:number, y:number, shipSunkName:string
    public static readonly SWITCHING_STATE = "switching state"; //name:string
    public static readonly VICTORY = "victory";
    public static readonly DEFEAT = "defeat";
    private constructor(){}
}
export class ClientEvent {
    public static readonly JOIN_PRIVATE:string = "join private";
    public static readonly CREATE_PRIVATE:string = "create private";
    public static readonly PLAY_AI:string = "play ai";
    public static readonly PLAY_RANDOM:string = "play random";
    public static readonly START_PLAY:string = "start play"; //layout:Ship[]
    public static readonly PLAYER_HIT:string = "player hit"; //x:number, y:number, shipSunkName:string
    public static readonly SWITCHING_STATE:string = "switching state"; //name:string
    public static readonly VICTORY:string = "victory";
    public static readonly DEFEAT:string = "defeat";
    private constructor(){}
}
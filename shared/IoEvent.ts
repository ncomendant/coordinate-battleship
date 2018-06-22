export class IoEvent {
    //Menu State
    public static readonly PLAY_RANDOM:string ="play random";
    public static readonly PLAY_AI:string ="play ai";
    public static readonly CREATE_PRIVATE:string ="create private";
    public static readonly JOIN_PRIVATE:string ="join private";
    public static readonly START_MATCH:string = "start match";

    //Play State
    public static readonly START_TURN:string = "start turn";
    public static readonly ATTACK:string = "attack";
    public static readonly ENEMY_FLED:string = "enemy fled";
    public static readonly VICTORY:string = "victory";
    public static readonly DEFEAT:string = "defeat";
    
    private constructor(){}
}
export class IoEvent {
    //Menu State
    public static readonly PLAY_RANDOM:string ="play random";
    public static readonly PLAY_AI:string ="play ai";
    public static readonly CREATE_PRIVATE:string ="create private";
    public static readonly JOIN_PRIVATE:string ="join private";
    public static readonly START_MATCH:string = "start match";

    //Play State
    public static readonly ATTACK:string = "attack";
    public static readonly ENEMY_FLED:string = "enemy fled";
    public static readonly ENEMY_FLEET:string = "enemy fleet";

    public static readonly HIT:string = "hit"; //myBoard:boolean, gameOver:boolean, coords:CoordinatePair, shipName:string, shipSunk:boolean
    public static readonly MISS:string = "miss"; //myBoard:boolean, coords:CoordinatePair
    public static readonly ALREADY_ATTACKED:string = "already attacked"; //myBoard:boolean
    
    private constructor(){}
}
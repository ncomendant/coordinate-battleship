import { GameManager } from "./game-manager";
import { EventManager } from "./event-manager";
import { IoEvent } from "../../shared/IoEvent";
import { Ship } from "../../shared/ship";

export class App {
    private gameManager:GameManager;

    public constructor(serverUrl:string) {
        let eventManager:EventManager = new EventManager();
        this.gameManager = new GameManager(eventManager, () => {
            let io = window['io'](serverUrl);
            io.on("connect", () => {
                io.on(IoEvent.START_GAME, (board:Ship[]) => {
                    this.gameManager.switchToPlay(board);
                });
            });
        });
    }
}

new App("http://127.0.0.1:3001");
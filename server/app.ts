import { MatchManager } from "./match-manager";
import { IoEvent } from "../shared/IoEvent";

declare function require(moduleName:string):any;

export class App {

    public constructor(port:number) {

        let matchManager:MatchManager = new MatchManager();

        let server = require('http').createServer();
        var io = require('socket.io')(server);
        io.on('connection', (user:any) => {
            user.data = {};

            user.on(IoEvent.PLAY_AI, () => {
                if (user.data == null || user.data['matchId'] != null) return;
                matchManager.playAI(user);
            });

            user.on(IoEvent.PLAY_RANDOM, () => {
                if (user.data == null || user.data['matchId'] != null) return;
                matchManager.joinOpenMatch(user);
            });

            user.on(IoEvent.CREATE_PRIVATE, () => {
                if (user.data == null || user.data['matchId'] != null) return;
                matchManager.createPrivateMatch(user);
            });

            user.on(IoEvent.JOIN_PRIVATE, (data:any) => {
                if (user.data == null || user.data['matchId'] != null) return;
                let matchId = data['matchId'];
                if (matchId != null && typeof(matchId) === "string") {
                    matchManager.joinPrivateMatch(user, matchId);
                }
            });

            user.on('disconnect', function(){
                //TODO - remove from match (if applicable)
            });
        });
        server.listen(port);
    }

}

new App(3001);
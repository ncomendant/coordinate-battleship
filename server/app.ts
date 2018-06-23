import { MatchManager } from "./match-manager";
import { IoEvent } from "../battleship-shared/io-event";

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

            user.on(IoEvent.ATTACK, (data:any) => {
                //Abort on invalid user state
                if (user.data == null || user.data['matchId'] == null) return;

                //Abort on invalid data
                if (data.coords == null) return;
                if (typeof data.coords['x'] !== "number") return;
                if (typeof data.coords['y'] !== "number") return;
                if (data.coords['x']%1 !== 0 || data.coords['y']%1 !== 0) return;
                if (data.coords['x'] < -5 || data.coords['y'] > 5) return;
                if (data.coords['y'] < -5 || data.coords['y'] > 5) return;

                //convert coords to array indicies
                data.coords.x += 5;
                data.coords.y += 5;

                //Process
                matchManager.attack(user, data.coords);
            });

            user.on('disconnect', function(){
                //ignore users who are not in a match
                if (user.data == null || user.data['matchId'] == null) return;
                matchManager.removeUser(user);
            });
        });
        server.listen(port);
    }

}

new App(3001);
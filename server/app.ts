import { MatchManager } from "./match-manager";
import { IoEvent } from "../shared/IoEvent";

declare function require(moduleName:string):any;

export class App {

    private matchManager:MatchManager;

    public constructor(port:number) {

        this.matchManager = new MatchManager();

        let server = require('http').createServer();
        var io = require('socket.io')(server);
        io.on('connection', (user:any) => {
            user.data = {};
            
            // user.on('event', function(data){

            // });
            
            // user.on('disconnect', function(){

            // });
        });
        server.listen(port);
    }

}

new App(3001);
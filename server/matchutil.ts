declare function require(moduleName:string):any;

declare var __dirname;

let fs:any = require("fs");

export class MatchUtil {
    private static readonly ADJECTIVES:string[] = fs.readFileSync(__dirname+'/adjectives.txt', 'utf8').split("\r\n");
    private static readonly NOUNS:string[] = fs.readFileSync(__dirname + '/nouns.txt', 'utf8').split("\r\n");

    public static generateId():string {
        let id:string = this.ADJECTIVES[Math.floor(Math.random()*this.ADJECTIVES.length)]
            + this.NOUNS[Math.floor(Math.random()*this.NOUNS.length)]
            + this.randNum(0, 99);

        return  id.toLowerCase();
    }
    


    public static randNum(min:number, max:number):number {
        let gap:number = max-min+1;
        return Math.floor(Math.random()*gap) + min;
    }

    private constructor() {}
}
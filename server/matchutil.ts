declare function require(moduleName:string):any;

let fs:any = require("fs");

export class MatchUtil {
    private static readonly ADJECTIVES:string[] = fs.readFileSync('./adjectives.txt', 'utf8').split("\r\n");
    private static readonly NOUNS:string[] = fs.readFileSync('./nouns.txt', 'utf8').split("\r\n");

    public static generateId():string {
        let id:string = this.ADJECTIVES[Math.floor(Math.random()*this.ADJECTIVES.length)]
            + this.NOUNS[Math.floor(Math.random()*this.NOUNS.length)]
            + this.randNum(0, 99);

        return  id;
    }
    


    public static randNum(min:number, max:number):number {
        let gap:number = max-min+1;
        return Math.floor(Math.random()*gap) + min;
    }

    private constructor() {}
}
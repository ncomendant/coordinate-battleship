export class EventManager {

    private eventHandlers:Map<string,((data:any) => void)[]>; 

    public constructor() {
        this.eventHandlers = new Map();
    }

    public on(eventName:string, handler:(data:any) => void):void {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(handler);
    }

    public off(eventName:string, handler:(data:any) => void):void {
        if (this.eventHandlers.has(eventName)) {
            let index = this.eventHandlers[eventName].indexOf(handler);
            this.eventHandlers[eventName].splice(index, 1);
        }
    }

    public emit(eventName:string, data:any):void {
        if (this.eventHandlers.has(eventName)) {
            for (let handler of this.eventHandlers[eventName]) {
                handler(data);
            }
        }
    }
}
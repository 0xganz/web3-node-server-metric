import { subProcessMessage } from "./workerMessageUtils";

export abstract class BaseWorker {
    optins:WorkerOptions;

    constructor(optins:WorkerOptions){
        this.optins = optins;
    }

    running():void {
        subProcessMessage((msg)=>{
            this.optins.filterMinGasPrice = msg.value;
        })
        this.work();
    }

    abstract work():void;
}

export interface WorkerOptions {
    provider: string; 
    reportDirPath: string;
    providerName: string; 
    startTime: string; 
    filterMinGasPrice: string;
}
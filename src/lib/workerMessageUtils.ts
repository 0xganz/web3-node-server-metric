import type { IpcMessage } from "./model";

export function subProcessMessage(callback:(msg:IpcMessage)=>void){
    process.on('message',(data)=>{
        try {
            callback(data);
        } catch(e) {
            console.error(process.pid, e, data);
        }
    })
}
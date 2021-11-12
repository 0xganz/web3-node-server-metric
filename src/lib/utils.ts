import fs from "fs";
import path from "path";
import { getGasFeeInfo } from "./blockNativeApi";



export function gererateReportFs(reportDirPath:string, providerName:string, startTime:string){

    const reportLogFilePath = path.join(reportDirPath, 'log_' + providerName + "_" + startTime + ".csv")

    const logs_ws = fs.createWriteStream(reportLogFilePath, { encoding: 'utf-8' })
    const reportPendingFilePath = path.join(reportDirPath, 'pending_' + providerName + "_" + startTime + ".csv")

    const pending_ws = fs.createWriteStream(reportPendingFilePath, { encoding: 'utf-8' })

    logs_ws.write('time' + ',' + 'blockNumber' + ',' + 'txhash' + "\n")
    pending_ws.write('time' + ',' + 'txhash' + "\n")
    return {logs_ws, pending_ws}
}


export async function fetchFilterMinGasPriceAsync() {
    const gasFeeInfo = await getGasFeeInfo();

    const minGasPrice = gasFeeInfo.maxPrice * 10 ** 9 + '';

    return minGasPrice;
}
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import fs from "fs";
import path from "path";


export function alchemy_worker(provider: string, reportDirPath: string, providerName: string, startTime: string) {

    const reportLogFilePath = path.join(reportDirPath, 'log_' + providerName + "_" + startTime + ".csv");

    const logs_ws = fs.createWriteStream(reportLogFilePath, { encoding: 'utf-8' });
    logs_ws.write('time' + ',' + 'blockNumber' + ',' + 'txhash' + "\n");
    const reportPendingFilePath = path.join(reportDirPath, 'pending_' + providerName + "_" + startTime + ".csv");

    const pending_ws = fs.createWriteStream(reportPendingFilePath, { encoding: 'utf-8' });

    pending_ws.write('time' + ',' + 'txhash' + "\n");

    const web3 = createAlchemyWeb3(provider);


    web3.eth.subscribe('newBlockHeaders', (err, tx) => {
        if (err) {
            console.error(err)
            return;
        }
        console.log(providerName, 'new block', Date.now())
        const content = [Date.now(), tx.number, tx.hash].join(',') + "\n";
        logs_ws.write(content);
    });


    web3.eth.subscribe('alchemy_fullPendingTransactions',(err,tx)=>{
        if (err) {
            return;
        }
        console.log(providerName, ((parseInt(tx.gasPrice) -0) * tx.gas/100000000000000).toFixed(2), tx)
    })
}
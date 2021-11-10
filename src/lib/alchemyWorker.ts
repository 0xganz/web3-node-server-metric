import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import fs from "fs";
import path from "path";

const GWEIUnit = 10 ** 9;

export function alchemy_worker(provider: string, reportDirPath: string, providerName: string, startTime: string, filterMinGasPrice: string) {

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
    const fixMinPrice = parseInt(filterMinGasPrice) - 0;

    console.log('fix price', fixMinPrice / GWEIUnit)

    let pendingData = ''
    let pendingDataCount = 0;

    web3.eth.subscribe('alchemy_fullPendingTransactions', (err, tx) => {
        if (err) {
            console.error(err)
            return;
        }
        const txPrice = (parseInt(tx.gasPrice) - 0);
        if (txPrice <= fixMinPrice) return;
        // console.log('alchemy p ', tx.hash, txPrice, fixMinPrice)

        pendingDataCount++;
        pendingData += Date.now() + ',' + tx.hash + "\n"
        // pending_ws.write(Date.now() + ',' + tx + "\n")
        if (pendingDataCount >= 50) {
            pending_ws.write(pendingData, () => { })
            pendingDataCount = 0;
            pendingData = '';
        }

    })


    process.on('beforeExit', () => {
        if (pendingDataCount > 0) {
            pending_ws.write(pendingData)
            pendingDataCount = 0;
            pendingData = '';
            pending_ws.close()
        }
    })

    process.on('uncaughtException', (e) => {
        console.log('uncaughtException', e)
    })

    process.on('unhandledRejection', (e) => {
        console.log('unhandledRejection', e)
    })
}
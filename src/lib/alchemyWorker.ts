import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { gererateReportFs } from "./utils";
import { subProcessMessage } from "./workerMessageUtils";

const GWEIUnit = 10 ** 9;

export function alchemy_worker(provider: string, reportDirPath: string, providerName: string, startTime: string, filterMinGasPrice: string, filterPrecent: number) {

    const { logs_ws, pending_ws } = gererateReportFs(reportDirPath, providerName, startTime);

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
    
    let fixMinPrice = parseInt(filterMinGasPrice) * filterPrecent - 0;

    subProcessMessage((msg) => {
        console.log(providerName, 'recieve ipc msg', msg)
        fixMinPrice = parseInt(msg.value) * filterPrecent - 0;
    })

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
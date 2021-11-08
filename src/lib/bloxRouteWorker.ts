import Web3 from 'web3';
import fs from "fs";
import path from "path";

import WebSocket from 'ws';
// import account_json from './config/account.json';


// const factory_address = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

// const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
// const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
// const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
// const CONTRACT_WETH_USDT = '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852';

// const ws_profossional_url = 'wss://api.blxrbdn.com/ws';


export function blox_router_worker(provider: string, reportDirPath: string, providerName: string, startTime: string) {

    const reportLogFilePath = path.join(reportDirPath, 'log_' + providerName + "_" + startTime + ".csv")

    const logs_ws = fs.createWriteStream(reportLogFilePath, { encoding: 'utf-8' })
    logs_ws.write('time' + ',' + 'blockNumber' + ',' + 'txhash' + "\n")
    const reportPendingFilePath = path.join(reportDirPath, 'pending_' + providerName + "_" + startTime + ".csv")

    const pending_ws = fs.createWriteStream(reportPendingFilePath, { encoding: 'utf-8' })

    pending_ws.write('time' + ',' + 'txhash' + "\n")

    const ws = new WebSocket(provider, {
        headers: { "Authorization": 'YjJjZGNmMGMtZTJiMS00YzBmLWE4M2YtMDM1NDIyNTFlNTBmOmQ2ZWNlZGNiNGYzN2FmYTkyNTQyN2JmNjcyNjNhY2M1' },
        rejectUnauthorized: false,
        checkServerIdentity: () => true
    });

    ws.on('open', function open() {
        console.log('open')
        ws.send(`{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["pendingTxs", {"include": ["tx_hash"]}]}`)
        ws.send(`{"jsonrpc": "2.0", "id": 2, "method": "subscribe", "params": ["newBlocks", {"include": ["header","hash"]}]}`)
    });

    const subscribeMap = {
        'pendingTxs': '',
        'newBlocks': ''
    }

    let evetReturn = (data: any) => {
        if (!data.id) return;
        if (data.id == 1) {
            subscribeMap.pendingTxs = data.result;
        }

        if (data.id == 2) {
            subscribeMap.newBlocks = data.result;
            handler = receiveData
        }

    }

    let receiveData = (msg: any) => {
        if (msg.params.subscription === subscribeMap.pendingTxs) {
            pendingDataCount++;
            pendingData += Date.now() + ',' + msg.params.result.txHash + "\n"
            // pending_ws.write(Date.now() + ',' + tx + "\n")
            if (pendingDataCount >= 100) {
                pending_ws.write(pendingData)
                pendingDataCount = 0;
                pendingData = '';
            }
        } else {
            console.log('new block', msg.params.result.hash)
            console.log(providerName, 'new block', Date.now())
            const content = Date.now() + ',' + (msg.params.result.header.number - 0) + ',' + msg.params.result.hash + "\n";
            logs_ws.write(content);
        }
    }

    let handler = evetReturn

    ws.on('message', (data: any) => {
        handler(JSON.parse(data));
    });

    ws.on('error', (err) => {
        console.log(err);
    })


    let pendingData = ''
    let pendingDataCount = 0;

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
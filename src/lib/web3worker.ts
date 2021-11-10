import Web3 from 'web3';
import fs from "fs";
import path from "path";

// import account_json from './config/account.json';


// const factory_address = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

// const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
// const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
// const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const CONTRACT_WETH_USDT = '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852';

export function web3_worker(provider: string, reportDirPath: string, providerName: string, startTime: string, filterMinGasPrice:string) {

    const reportLogFilePath = path.join(reportDirPath, 'log_' + providerName + "_" + startTime + ".csv")

    const logs_ws = fs.createWriteStream(reportLogFilePath, { encoding: 'utf-8' })
    logs_ws.write('time' + ',' + 'blockNumber' + ',' + 'txhash' + "\n")
    const reportPendingFilePath = path.join(reportDirPath, 'pending_' + providerName + "_" + startTime + ".csv")

    const pending_ws = fs.createWriteStream(reportPendingFilePath, { encoding: 'utf-8' })

    pending_ws.write('time' + ',' + 'txhash' + "\n")

    const web3 = new Web3(
        // Replace YOUR-PROJECT-ID with a Project ID from your Infura Dashboard
        new Web3.providers.WebsocketProvider(provider)
    );

    const defaultAccount = web3.eth.defaultAccount;
    if (!defaultAccount) {
        // const acc = web3.eth.accounts.privateKeyToAccount(account_prvkey_hex);
        // web3.eth.defaultAccount = acc.address;
        // web3.eth.accounts.wallet.add(acc);
    }


    let pendingData = ''
    let pendingDataCount = 0;
    setTimeout(() => {

        web3.eth.subscribe('pendingTransactions', (err, tx) => {
            if (err) {
                console.error(err)
                return;
            }
            pendingDataCount++;
            pendingData+=Date.now() + ',' + tx + "\n"
            // pending_ws.write(Date.now() + ',' + tx + "\n")
            if (pendingDataCount>=50){
                pending_ws.write(pendingData,()=>{})
                pendingDataCount = 0;
                pendingData ='';
            }
        });

        // web3.eth.subscribe('logs', { address: CONTRACT_WETH_USDT }, (err, tx) => {
        //     if (err) {
        //         console.error(err)
        //         return;
        //     }
        //     console.log(providerName, 'logs', Date.now())
        //     const content = [Date.now(), tx.blockNumber, tx.transactionIndex, tx.logIndex, tx.transactionHash].join(',') + "\n";
        //     logs_ws.write(content);
        // });

        web3.eth.subscribe('newBlockHeaders', (err, tx) => {
            if (err) {
                console.error(err)
                return;
            }
            console.log(providerName, 'new block', Date.now())
            const content = [Date.now(), tx.number, tx.hash].join(',') + "\n";
            logs_ws.write(content);
        });
    }, 5000)

    process.on('beforeExit', ()=> {
        if (pendingDataCount >0) {
            pending_ws.write(pendingData)
            pendingDataCount = 0;
            pendingData ='';
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
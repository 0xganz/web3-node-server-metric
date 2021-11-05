import Web3 from 'web3';
import fs from "fs";
import path from "path";

// import account_json from './config/account.json';


// const factory_address = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

// const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
// const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
// const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const CONTRACT_WETH_USDT = '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852';

// const account_address = account_json.pubkey;
// const account_prvkey_hex = account_json.prvkey;

function log_data_info(provider: string, reportDirPath: string, providerName: string, startTime: string) {

    const reportLogFilePath = path.join(reportDirPath, 'log_' + providerName + "_" + startTime + ".csv")

    const logs_ws = fs.createWriteStream(reportLogFilePath, { encoding: 'utf-8' })
    logs_ws.write('time' + ',' + 'blockNumber' + ',' + 'transactionIndex' + ',' + 'logIndex' + ',' + 'txhash' + "\n")
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

    setTimeout(() => {

        web3.eth.subscribe('pendingTransactions', (err, tx) => {
            if (err) {
                console.error(err)
                return;
            }
            pending_ws.write(Date.now() + ',' + tx + "\n")
        });

        web3.eth.subscribe('logs', { address: CONTRACT_WETH_USDT }, (err, tx) => {
            if (err) {
                console.error(err)
                return;
            }
            console.log(providerName, 'logs', Date.now())
            const content = [Date.now(), tx.blockNumber, tx.transactionIndex, tx.logIndex, tx.transactionHash].join(',') + "\n";
            logs_ws.write(content);
        });
    }, 5000)
}

console.log(process.pid, 'args', process.argv)

log_data_info(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);


process.on('uncaughtException', (e) => {
    console.log('uncaughtException', e)
})

process.on('unhandledRejection', (e) => {
    console.log('unhandledRejection', e)
})

import { web3_worker } from './lib/web3Worker'
import { blox_router_worker } from './lib/bloxRouteWorker';
import { alchemy_worker } from './lib/alchemyWorker';



// import account_json from './config/account.json';


// const factory_address = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

// const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
// const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
// const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const workerMap = new Map();

workerMap.set('infura', web3_worker)
workerMap.set('alchemy', alchemy_worker)
workerMap.set('bloxRouter', blox_router_worker)
workerMap.set('bloxRouter-gateway', blox_router_worker)


// const account_address = account_json.pubkey;
// const account_prvkey_hex = account_json.prvkey;

function start_woker(provider: string, reportDirPath: string, providerName: string, startTime: string, minGasPrice:string) {
    const worker = workerMap.get(providerName);
    if (!worker) {
        console.error('not find worker of ', providerName)
        return;
    }

    worker(provider, reportDirPath, providerName, startTime, minGasPrice);

}

console.log(process.pid, 'args', process.argv)

start_woker(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6]);



import path from "path";
import { ChildProcess, fork } from 'child_process';
import provider_config from './config/provider.json'
import { getGasFeeInfo } from "./lib/blockNativeApi";
import { start_data_analys } from "./dataAnalys";
import type { IpcMessage } from "./lib/model";
import { fetchFilterMinGasPriceAsync } from "./lib/utils";


const reportPath = path.join(__dirname, '../report').toString();

// const ws = fs.createWriteStream(reportFilePath, { encoding: 'utf-8' })
// const infura_provider = "wss://mainnet.infura.io/ws/v3/4f159235487c47d5a92d1ad212c0853a";
// const alchemy_provider = 'wss://eth-mainnet.alchemyapi.io/v2/ZjBad3Dq8qMtn4_fcbWpBnVI3XxOIx2m';


const providers = provider_config;

const [, , isCollect, time, runtimes] = process.argv
const is_start_collect = !isCollect || isCollect === '1';

let times = 0
if (runtimes && is_start_collect) {
    times = parseInt(runtimes)

    console.log('args', process.pid, is_start_collect, time);

    if (is_start_collect) {
        start_collect()
    }
} else {
    start_analys(time);
}

/**
 * 启动多个进程 收集数据
 */
async function start_collect() {
    console.log('start collect data')
    const startTime = Math.floor(Date.now() / 100000) + "";

    const runtime = parseInt(time) * 60000;
    const process_arr: ChildProcess[] = [];

    const minGasPrice = await fetchFilterMinGasPriceAsync();

    providers.forEach((item) => {
        const [prividerName, privodierUrl] = item
        const sub = fork(path.join(__dirname, './work.js').toString(), [privodierUrl, reportPath, prividerName, startTime, minGasPrice]);
        process_arr.push(sub)
    });

    process.on('beforeExit', () => {
        process_arr.forEach(x => x.kill())
    });

    const handler = setInterval(async () => {
        const minGasPrice = await fetchFilterMinGasPriceAsync();

        const message: IpcMessage = {
            action: 'update',
            datatype: 'minGasPrice',
            value: minGasPrice
        }
        process_arr.forEach(sub => {
            sub.send(message, console.error)
        })
    }, 30000)

    setTimeout(() => {
        clearInterval(handler);
        console.log('runend');
        process_arr.forEach(x => x.kill())
        setTimeout(() => start_analys(startTime), 1000)
    }, runtime);






}

/**
 * 对收集后的数据 生成分析数据
 */
function start_analys(time: string) {
    let pending_compeleted = false;
    let log_compeleted = false;

    start_data_analys(time, 'pending', () => {
        console.log('callback', times)
        pending_compeleted = true;
        if (log_compeleted && times > 1) {
            start_collect();
            times--;
        }
    })

    start_data_analys(time, 'log', () => {
        console.log('callback', times)
        log_compeleted = true;
        if (pending_compeleted && times > 1) {
            start_collect();
            times--;
        }
    })
}



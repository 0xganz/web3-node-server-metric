import path from "path";
import { ChildProcess, fork } from 'child_process';
import { createInterface, ReadLine } from "readline";
import fs, { WriteStream } from "fs";
import { setInterval } from "timers";
import provider_config from './config/provider.json'


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


function start_collect() {
    console.log('start collect data')
    const startTime = Math.floor(Date.now() / 100000) + "";

    const runtime = parseInt(time) * 60000;
    const process_arr: ChildProcess[] = []

    providers.forEach((item) => {
        const sub = fork(path.join(__dirname, './work.js').toString(), [item[1], reportPath, item[0], startTime]);
        process_arr.push(sub)
    });
    process.on('beforeExit', () => {
        process_arr.forEach(x => x.kill())
    })

    setTimeout(() => {
        console.log('runend');
        process_arr.forEach(x => x.kill())
        setTimeout(()=>start_analys(startTime), 1000)
    }, runtime);
}


function start_analys(time: string) {
    let pending_compeleted = false;
    let log_compeleted = false;

    start_data_analys(time, 'pending', parsePendingLine, () => {
        console.log('callback', times)
        pending_compeleted = true;
        if (log_compeleted && times > 1) {
            start_collect();
            times--;
        }
    })

    start_data_analys(time, 'log', parseLogLine, () => {
        console.log('callback', times)
        log_compeleted = true;
        if (pending_compeleted && times > 1) {
            start_collect();
            times--;
        }
    })
}

function start_data_analys(time: string, file_prefix: 'log' | 'pending', parseLine: (line: string) => { succeed: boolean, hash: string, time: number }, callback: () => void) {
    const files = fs.readdirSync(reportPath).map(x => { console.log(x); return x; }).filter(x => x.indexOf(time) >= 0);
    const data_file = path.join(__dirname, '../analys/', file_prefix + '_' + time + '.csv').toString();

    if (fs.existsSync(data_file)) {
        console.warn('已经分析过此时间段文件，如需重新生成，请删除文件', data_file);
        return;
    }

    const fs_analys = fs.createWriteStream(data_file);

    const data_files: data_file_info[] = []

    for (const file of files) {
        if (!file.startsWith(file_prefix)) {
            continue;
        }
        const values = file.split('_');
        const readline: ReadLine = createInterface(fs.createReadStream(path.join(reportPath, file)));
        const data_file: data_file_info = {
            fileName: file,
            type: values[0],
            provider: values[1],
            readline,
            readindex: 0,
            isPause: false,
            compelted: false
        }

        data_files.push(data_file);

    }

    data_files.sort(x => x.provider === 'infura' ? -1 : 1)

    const header = ['id'].concat(data_files.map(x => x.provider)).join(',') + "\n";
    fs_analys.write(header);

    const log_map = new Map<string, Map<string, number>>();

    data_files.forEach(x => {
        log_map.set(x.provider, new Map())
    })

    data_files.forEach((info) => {
        let index = 0;
        const dataMap = log_map.get(info.provider);
        if (!dataMap) {
            console.log('map not generate')
            return;
        }

        info.readline.on('line', (line) => {
            const { succeed, hash, time } = parseLine(line);
            if (succeed)
                dataMap.set(hash, time)
            index++;
            if (index === 1000) {
                info.readline.pause();
                index = 0;
                info.readindex += 1;
                info.isPause = true;
            }
        })

        info.readline.on('close', () => {
            info.isPause = true;
            info.compelted = true;

            console.log('read compeleted', info.fileName)
        })
    })


    let id_index = 0;
    const handler = setInterval(() => {

        if (data_files.every(x => x.isPause)) {
            console.log('log analys')
            id_index = diff_analys(log_map, fs_analys, data_files, id_index);

            data_files.forEach(file => {
                if (!file.compelted) {
                    file.isPause = false;
                    file.readline.resume();
                }
            })

            if (data_files.every(x => x.compelted)) {
                setTimeout(()=> callback(), 10000);
                console.log('analys compeleted');
                log_map.forEach((value, key) => {
                    console.log(key, file_prefix, ' 剩余未处理 数据:', value.size)
                });
                clearInterval(handler);
            }
        }
    }, 200);
}

function diff_analys(dataMap: Map<string, Map<string, number>>, fs_write: WriteStream, pending_files: data_file_info[], id_index: number) {
    const infura_map = dataMap.get('infura') || new Map();
    const deleteKeys: string[] = [];
    const providers = pending_files.slice(1).map(x => x.provider);
    const maps = providers.map((x) => dataMap.get(x));


    infura_map.forEach((value, key) => {
        const arr = [id_index, 0];
        // let finded = true;
        maps.forEach(map => {
            const time = map?.get(key);
            arr.push(time?time - value:0);
            if (time) {
                deleteKeys.push(key);
            } 
            // else {
            //     finded = false;
            // }
        })

        // if (finded) {
        fs_write.write(arr.join(',') + '\n')
        id_index++;
        // }
    })

    deleteKeys.forEach(key => {
        infura_map.delete(key)
        maps.forEach(map => map?.delete(key))
    })
    return id_index;
}


interface data_file_info {
    fileName: string;
    type: 'pending' | 'log' | string;
    provider: 'infura' | 'alchemy' | string;
    readline: ReadLine;
    readindex: number;
    isPause: boolean;
    compelted: boolean;
}

function parsePendingLine(line: string) {
    const values = line.split(',')
    let succeed = true;
    const hash = values[1];
    let time = 0;
    try {
        time = parseInt(values[0]);
    } catch (e) {
        succeed = false
    }
    return { succeed, hash, time }
}

function parseLogLine(line: string) {
    const values = line.split(',')
    let succeed = true;
    const hash = values[1] + "_" + values[2] + "_" + values[3];
    let time = 0;
    try {
        time = parseInt(values[0]);
    } catch (e) {
        succeed = false
    }
    return { succeed, hash, time }
}

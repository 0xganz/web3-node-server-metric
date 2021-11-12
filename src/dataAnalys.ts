import { createInterface, ReadLine } from "readline";
import fs, { WriteStream } from "fs";
import { setInterval } from "timers";
import path from "path";


const reportPath = path.join(__dirname, '../report').toString();

export function start_data_analys(time: string, file_prefix: 'log' | 'pending', callback: () => void) {

    const parseLine = file_prefix === 'log' ? parseLogLine : parsePendingLine

    const files = fs.readdirSync(reportPath).filter(x => x.indexOf(time) >= 0);
    const data_file = path.join(__dirname, '../analys/', file_prefix + '_' + time + '.csv').toString();

    if (fs.existsSync(data_file)) {
        console.warn('已经分析过此时间段文件，如需重新生成，请删除文件', data_file);
        return;
    }

    const base_data_file = path.join(__dirname, '../analys/', file_prefix + '_' + time + '_base.csv').toString();

    if (fs.existsSync(base_data_file)) {
        console.warn('已经分析过此时间段文件，如需重新生成，请删除文件', base_data_file);
        return;
    }

    const fs_analys = fs.createWriteStream(data_file);

    const fs_base_analys = fs.createWriteStream(base_data_file);

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

    const base_data_files = [...data_files];
    base_data_files.sort(x => x.provider.startsWith('blox') ? -1 : 1);

    data_files.sort(x => x.provider === 'alchemy' ? -1 : 1)

    const header = ['id'].concat(data_files.map(x => x.provider)).join(',') + "\n";
    fs_analys.write(header);

    const baseHeader = ['id'].concat(base_data_files.map(x => x.provider)).join(',') + "\n";
    fs_base_analys.write(baseHeader);

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
    let id_index_2 = 0;

    const diff_analys_handle = log_map.has('infura') ? diff_infura_analys : diff_base_analys;
    const handler = setInterval(() => {

        if (data_files.every(x => x.isPause)) {
            console.log('log analys')

            id_index_2 = diff_base_analys(log_map, fs_base_analys, base_data_files, id_index_2, false);
            id_index = diff_analys_handle(log_map, fs_analys, data_files, id_index, true);

            data_files.forEach(file => {
                if (!file.compelted) {
                    file.isPause = false;
                    file.readline.resume();
                }
            })

            if (data_files.every(x => x.compelted)) {
                setTimeout(() => callback(), 10000);
                console.log('analys compeleted');
                log_map.forEach((value, key) => {
                    console.log(key, file_prefix, ' 剩余未处理 数据:', value.size)
                });
                clearInterval(handler);
            }
        }
    }, 200);
}

function diff_base_analys(dataMap: Map<string, Map<string, number>>, fs_write: WriteStream, pending_files: data_file_info[], id_index: number, clear: boolean) {
    const providers = pending_files.map(x => x.provider);
    const provider_base = providers[0];
    const deleteKeys: string[] = [];
    const base_map = dataMap.get(provider_base) || new Map();
    const counter_maps = providers.slice(1).map(x => dataMap.get(x));

    base_map.forEach((value, key) => {
        const arr = [id_index, 0];
        let finded = false;
        counter_maps.forEach(map => {
            const time = map?.get(key);
            arr.push(time ? time - value : 0);
            if (time) {
                deleteKeys.push(key);
                finded = true;
            }
        })

        if (finded) {
            fs_write.write(arr.join(',') + '\n')
            id_index++;
        }
    })

    if (clear) {
        deleteKeys.forEach(key => {
            base_map.delete(key)
            counter_maps.forEach(map => map?.delete(key))
        })
    }
    return id_index;
}

function diff_infura_analys(dataMap: Map<string, Map<string, number>>, fs_write: WriteStream, pending_files: data_file_info[], id_index: number) {
    return diff_base_analys(dataMap, fs_write, pending_files, id_index, true);
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
    const hash = values[2];
    let time = 0;
    try {
        time = parseInt(values[0]);
    } catch (e) {
        succeed = false
    }
    return { succeed, hash, time }
}
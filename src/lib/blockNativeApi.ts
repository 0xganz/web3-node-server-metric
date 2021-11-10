import { json } from 'express';
import https from 'https';
import { promisify } from 'util';



function getGasFeeInfoCallback(callback:(err:Error| null, data:GasFeeInfo)=>void)  {

    https.get('https://api.blocknative.com/gasprices/blockprices',{
        headers:{
            "Authorization": '427b4068-83da-4619-a4ce-6d0772fbe586'
        }
    }, (res)=>{
        res.on('data', (data)=>{
            // console.log();
            callback(null, JSON.parse(data.toString()))
        })

        res.on('error', (err)=>{
            callback(err, {} as GasFeeInfo);
        })
    })
}

interface GasFeeInfo {
    unit: "gwei"|"wei";
    maxPrice: number;
    currentBlockNumber: number;
    blockPrices: GasFeeBaseInfo[];
}

interface GasFeeBaseInfo {
    blockNumber: number;
    baseFeePerGas: number;
    estimatedPrices: {
        confidence: number;
        price: number;
        maxPriorityFeePerGas: number;
        maxFeePerGas: number
    }[]
}
const getGasFeeInfo = promisify(getGasFeeInfoCallback)

export {
    getGasFeeInfo
}
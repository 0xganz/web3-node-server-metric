import { getGasFeeInfo } from "./lib/blockNativeApi";



async function test(){
    const data = await getGasFeeInfo();
    console.log(JSON.stringify(data))
}

test();
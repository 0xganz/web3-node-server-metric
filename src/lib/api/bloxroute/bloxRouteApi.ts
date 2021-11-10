// Account Name: None
// Account ID: b2cdcf0c-e2b1-4c0f-a83f-03542251e50f
// Plan: Professional
// Plan Valid Until: 12-04-2021
// Status: Active
// Hosted Gateway Count: 0
// Private Transaction Balance: 0
// Private Transaction Credit Balance: 0 ETH
// MEV Credit Balance: 0 USD
// Authorization Header: YjJjZGNmMGMtZTJiMS00YzBmLWE4M2YtMDM1NDIyNTFlNTBmOmQ2ZWNlZGNiNGYzN2FmYTkyNTQyN2JmNjcyNjNhY2M1


// curl https://api.blxrbdn.com \
//     -X POST \
//     -H "Content-Type: application/json" \
//     -H "Authorization: YjJjZGNmMGMtZTJiMS00YzBmLWE4M2YtMDM1NDIyNTFlNTBmOmQ2ZWNlZGNiNGYzN2FmYTkyNTQyN2JmNjcyNjNhY2M1" \
//     -d '{"method": "quota_usage", "id": "1", "params": null}' -k

// api.blxrbdn.com (Sending transactions and non-Enterprise streaming DNS) 
// Location                           Cloud Provider             IP Addresses
// United States - Virginia              Alibaba                 47.253.9.21, 54.157.119.190 
// England - London                      Alibaba                 8.208.28.250, 8.208.24.157
// Singapore                             AWS                     13.213.141.24, 18.142.27.10
// China - Beijing                       Alibaba                 39.106.255.190, 39.105.165.155 
// China - Hangzhou                      Alibaba                 47.114.76.125, 47.114.88.136 
    

const ws_profossional_url = 'wss://13.213.141.24/ws';

import WebSocket from 'ws';


function webSocket() {
    const ws = new WebSocket(ws_profossional_url, {
        headers: { "Authorization": 'YjJjZGNmMGMtZTJiMS00YzBmLWE4M2YtMDM1NDIyNTFlNTBmOmQ2ZWNlZGNiNGYzN2FmYTkyNTQyN2JmNjcyNjNhY2M1' },
        rejectUnauthorized: false,
        checkServerIdentity: ()=> true
    });

    ws.on('open', function open() {
        console.log('open')
        ws.send(`{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["pendingTxs", {"include": ["tx_hash"]}]}`)
        ws.send(`{"jsonrpc": "2.0", "id": 2, "method": "subscribe", "params": ["newBlocks", {"include": ["hash"]}]}`)
        // ws.send(`{"jsonrpc": "2.0", "id": 3, "method": "subscribe", "params": ["bdnBlocks", {"include": ["hash"]}]}`)
    });
    const subscribeMap = {
        'pendingTxs':'',
        'newBlocks':''
    }

    let evetReturn = (data:any)=>{
        console.log('event return', data)
        if(!data.id) return;
        if (data.id == 1) {
            subscribeMap.pendingTxs =data.result;
        }

        if (data.id == 2) {
            subscribeMap.newBlocks = data.result;
            handler = receiveData
        }

        // if (data.id == 3) {
        //     subscribeMap.newBlocks = data.result;
        //     handler = receiveData
        // }
        
    }

    let receiveData = (msg:any)=> {
        if (msg.params.subscription === subscribeMap.pendingTxs) {
            // console.log('pending transaction', msg.params.result.txHash)
        } else if (msg.params.subscription === subscribeMap.newBlocks){
            console.log(Date.now(), 'new block', msg.params.result.hash)
        } else {
            console.log(Date.now(), 'bdn block', msg.params.result.hash)
        }
    }

    let handler = evetReturn

    ws.on('message', (data:any) => {
        const msg = JSON.parse(data)
        handler(msg);
    });

    ws.on('error', (err) => {
        console.log(err);
    })
}

webSocket();
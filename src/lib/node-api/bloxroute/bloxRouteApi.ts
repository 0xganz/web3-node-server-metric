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
//     -d '{"method": "quota_usage", "id": "1", "params": null}'
    

const ws_profossional_url = 'wss://api.blxrbdn.com/ws';

import WebSocket from 'ws';


function webSocket() {
    const ws = new WebSocket(ws_profossional_url, {
        headers: { "Authorization": 'YjJjZGNmMGMtZTJiMS00YzBmLWE4M2YtMDM1NDIyNTFlNTBmOmQ2ZWNlZGNiNGYzN2FmYTkyNTQyN2JmNjcyNjNhY2M1' },
        rejectUnauthorized: false
    });

    ws.on('open', function open() {
        console.log('open')
        ws.send(`{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["pendingTxs", {"include": ["tx_hash"]}]}`)
    });

    ws.on('message', (data) => {
        console.log('received: %s', data);
    });

    ws.on('error', (err) => {
        console.log(err);
    })

}

webSocket();
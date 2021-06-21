//trxReceipts
require('dotenv').config();
const axios = require('axios');
const { inspect }  = require('util');
const { getAllLogs } =  require('./ABILogs');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const { INFURA_APIKEY } = process.env;

const getReceipts = async (transaction, debug) => {
  const rpc = {
    "jsonrpc": "2.0",
    "method": "eth_getTransactionReceipt",
    "params": [],
    "id": 1
  };

  const { transaction_hash } = transaction;
  rpc.params = [transaction_hash];

  try {
    const infuraUrl = `https://mainnet.infura.io/v3/${INFURA_APIKEY}`;
    const config = {
      timeout: 30000,
      url: infuraUrl,
      method: 'post',
      headers: {
        "Accept": "application/json",
        'Content-Type': 'application/json'
      },
      data: rpc,
      responseType: 'json'
    };
    const res = await axios(config);
    const { result : { logs } } = res.data;
    const uplogs = await getAllLogs(logs);

    if(debug) console.log('uplogs --',deepLogs(uplogs));

    return uplogs;
  } catch(e) {
    console.log(e);
  }

  return [];
}

// console.log('start --');
// getReceipts({transaction_hash:'0x8f7a7b99a29f5d848c39ad9d61719e4923c5d47dfd3bb6e869cdd5f406da56e2'}, true);
// getReceipts({transaction_hash:'0x92b7bc6072347f765f1d788f607d7e0beafc7d1cf247b8b2020053c02886227b'}, true);

module.exports = {
  getReceipts
}
return;

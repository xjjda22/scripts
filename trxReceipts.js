import { getAllLogs } from './ABILogs';
const {INFURA_APIKEY} = process.env;

export async function getReceipts(transaction) {
  const rpc = {
    "jsonrpc": "2.0",
    "method": "eth_getTransactionReceipt",
    "params": [],
    "id": 1
  };

  const params = {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: ""
  };

  const { transaction_hash } = transaction;
  rpc.params = [transaction_hash];
  params.body  = JSON.stringify(rpc);

  try {
    const res = await fetch(`https://mainnet.infura.io/v3/${INFURA_APIKEY}`, params);
    const { result : { logs } } = await res.json();
    return getAllLogs(logs);
  } catch(e) {
    console.log(e);
  }

  return [];
}

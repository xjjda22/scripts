// findVerifiedContracts
require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { providers, utils } = require("ethers");
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const { INFURA_APIKEY, ARCHIVENODE_APIKEY, ETHERSCAN_APIKEY } = process.env;
const ETHERSCAN_ABI_ENDPOINT = a => `https://api.etherscan.io/api?module=contract&action=getabi&address=${a}&apikey=${ETHERSCAN_APIKEY}`;

// const ETHEREUM_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_APIKEY}`;
const ETHEREUM_RPC_URL = `https://api.archivenode.io/${ARCHIVENODE_APIKEY}`;

const provider = new providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.JsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.getDefaultProvider(ETHEREUM_RPC_URL);

console.log('start --');
console.log('ETHEREUM_RPC_URL',ETHEREUM_RPC_URL);

const getBlockNumber = async (n, debug) => {
    const blockNumber = await provider.getBlockNumber();
    const blocksPerDay = 6600;
    LATEST_BLOCK = blockNumber;
    START_SCANNED_BLOCK = blockNumber - (n * blocksPerDay);
    if(debug) console.log('latest block',blockNumber);
    if(debug) console.log('blocks not scanned',START_SCANNED_BLOCK);
    readNumOfBlocks(START_SCANNED_BLOCK, 0, PENDING_BLOCK_SCANNED, 2000, true);
    return blockNumber;
}

const getBlock = async (blockNumber, debug) => {
    const block = await provider.getBlockWithTransactions(blockNumber);
    // if(debug) console.log('block',block);
    return block;
}

const getABI = async (a, debug) => {
  
  const api_url = ETHERSCAN_ABI_ENDPOINT(a);
  // if(debug) console.log('api -- ',api_url);

  const config = {
    timeout: 30000,
    url: api_url,
    method: 'get',
    responseType: 'json'
  };
  const res = await axios(config);
  const data = res.data;
  // if(debug) console.log('data -- ',api_url, deepLogs(data) );
  if(debug) {
    if(res.status != 200) console.log('res --', deepLogs(data) );
  }
  return data;
}

const readBlock = async (blockNumber, debug) => {
    
    let contract_trs = [];
    if(debug) console.log('block',blockNumber);

    let block = await getBlock(blockNumber);
    let txs = block.transactions;
    let j=0;
    for(j=0;j<txs.length;j++){
        let t = txs[j];
        // if(debug) console.log('j',j);
        if(t.to == null || t.to == 0){
            // if(debug) console.log('contract trx',t);
            let a = t.creates ? utils.getAddress(t.creates) : null;
            if(debug) console.log('contract add',t.creates);
            if(a) {
                let abi_res = await getABI(a, true);
                if(abi_res.status == '1'){
                    let ABI = JSON.parse(abi_res.result);
                    t.ABI = ABI;
                    // if(debug) console.log('contract etherscan abi', ABI);
                    contract_trs.push(t);
                } 
            }
        }
    }
    if(debug) console.log('contract creation trxs', deepLogs(contract_trs));
    if(contract_trs.length > 0){
        contract_trs.map( async c => {
            let cobj = {
                "block":c.blockNumber,
                "hash": c.hash, 
                "address": c.creates
            }
            let verifiedContractsArr = await require(`./ethereum-mainnet/verified-contracts-clones.json`);
            verifiedContractsArr.push(cobj);
            // if(debug) console.log('verifiedContractsArr ',verifiedContractsArr);

            // save verified contracts
            await fs.writeFile(`${__dirname}/ethereum-mainnet/verified-contracts-clones.json`, JSON.stringify(verifiedContractsArr), console.error);

            // save verified contract abi
            await fs.writeFile(`${__dirname}/ethereum-mainnet/${c.blockNumber}-${c.creates}.json`, JSON.stringify(c.ABI), console.error);

        })
    }
}

const readNumOfBlocks = async (blockNumber, inc, num, inter, debug) => {
    setTimeout(() => {
        inc++;
        // if(debug) console.log('blockNumber' ,blockNumber+inc);
        blockNumber+inc < blockNumber+num ? readNumOfBlocks(blockNumber, inc, num, inter, debug) : null;
        readBlock(blockNumber+inc, true);
    },inter);
}

let LATEST_BLOCK = 0, START_SCANNED_BLOCK = 0, PENDING_BLOCK_SCANNED = 20000;

getBlockNumber(3, true);
// readNumOfBlocks(14203083-1, 0, 1, 2000, true);

module.exports = {
  readNumOfBlocks
}
return;


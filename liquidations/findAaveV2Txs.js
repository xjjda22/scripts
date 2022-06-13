// findAaveV2Txs
const path = require('path');
require('dotenv').config({path:path.resolve('../', '.env')});
const fs = require('fs');
const axios = require('axios');
const { providers, utils } = require("ethers");
const { addABI, getABIs, decodeMethod } = require("abi-decoder");
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const findMatches = (clone, org, debug) => {
    const clone_filter = clone.filter( a => {
        return a.type == 'function' ? true : false;
    })
    const org_filter = org.filter( b => {
        return b.type == 'function' ? true : false;
    })
    // if(debug) console.log('abi fn filter',clone_filter, org_filter);

    const finds = org_filter.filter( j => {
        return clone_filter.some( k => {
            // if(debug) console.log('j.name == k.name', j.name, k.name);
            return j.name == k.name ?  true : false;
        });
    });
    // if(debug) console.log('finds',finds);
    return finds;
}
const arrayUnique = (array) => {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
}

const { INFURA_APIKEY, ARCHIVENODE_APIKEY, ETHERSCAN_APIKEY } = process.env;
const LIQUIDATIONS_ABI = [
    {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'collateralAsset',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'debtAsset',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'debtToCover',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'liquidatedCollateralAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'liquidator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'receiveAToken',
        type: 'bool',
      },
    ],
    name: 'LiquidationCall',
    type: 'event',
  },
];
addABI(LIQUIDATIONS_ABI);

const AAVEV2_ROUTER = utils.getAddress("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");

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
    readNumOfBlocks(START_SCANNED_BLOCK, 0, PENDING_BLOCK_SCANNED, 3000, true);
    return blockNumber;
}

const getBlock = async (blockNumber, debug) => {
    const block = await provider.getBlockWithTransactions(blockNumber);
    // if(debug) console.log('block',block);
    return block;
}
const getTxRc = async (hash, debug) => {
    const tx = await provider.getTransactionReceipt(hash);
    if(debug) console.log('tx',tx);
    return tx;
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
        let a = t.to ? utils.getAddress(t.to) : null;
        if(t.to && t.to.toLowerCase() == AAVEV2_ROUTER.toLowerCase() ){
            // if(debug) console.log('trx',t);
            let d = decodeMethod(t.data);
            // if(debug) console.log('contract d',d);
            if(d) {
                // if(debug) console.log('contract decoded input',d);
                t.decodeMethod = d;
                contract_trs.push(t);
            }
        }
    }
    if(debug) console.log('liquidations trxs',contract_trs);
    if(contract_trs.length > 0){
        contract_trs.map( async c => {
            let cobj = {
                "block":c.blockNumber,
                "hash": c.hash, 
                "address": c.to,
                "input": c.decodeMethod
            }
            let clonesArr = await require(`./json/aavev2-liquidations-trxs.json`);
            clonesArr.push(cobj);
            // if(debug) console.log('clonesArr ',clonesArr);
            await fs.writeFile(`${__dirname}/json/aavev2-liquidations-trxs.json`, JSON.stringify(clonesArr), console.error);
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

let LATEST_BLOCK = 0, START_SCANNED_BLOCK = 0, PENDING_BLOCK_SCANNED = 10000;

getBlockNumber(1, true);
// readNumOfBlocks(14874872-1, 0, 1, 2000, true);

// scanned aave v2 liquidation trx
// "block": ,
// "hash": "",
// "address": "",

module.exports = {
  readNumOfBlocks
}
return;


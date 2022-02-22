// findFlashLoanTxs
require('dotenv').config();
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
const FLASHLOANS_ABI = [
    {
        "constant": false,
        "inputs":
        [
            {
                "internalType": "uint256",
                "name": "amount0Out",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amount1Out",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "swap",
        "outputs":
        [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs":
        [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount0In",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount1In",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount0Out",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount1Out",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "Swap",
        "type": "event"
    }
];
addABI(FLASHLOANS_ABI);
const UNISWAPV2_USDC = utils.getAddress("0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc");

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
        if(t.data != '0x' && t.to != null && t.to != 0){
            // if(debug) console.log('trx',t);
            let d = decodeMethod(t.data);
            // if(debug) console.log('contract add',a);
            if(d && d.params[3].value != null && d.params[3].value != '0x') {
                // if(debug) console.log('contract decoded input',d);
                t.decodeMethod = d;
                contract_trs.push(t);
            }
        }
    }
    if(debug) console.log('flashloan trxs',contract_trs);
    if(contract_trs.length > 0){
        contract_trs.map( async c => {
            let cobj = {
                "block":c.blockNumber,
                "hash": c.hash, 
                "address": c.to,
                "input": c.decodeMethod
            }
            let clonesArr = await require(`./json/flashloan-trxs-clones.json`);
            clonesArr.push(cobj);
            // if(debug) console.log('clonesArr ',clonesArr);
            await fs.writeFile(`${__dirname}/json/flashloan-trxs-clones.json`, JSON.stringify(clonesArr), console.error);
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
// readNumOfBlocks(14241915-1, 0, 1, 2000, true);

// scanned uniswap v2 flashswap
// "block": 14092755,
// "hash": "0x284101ec1389344b360d10caa9a5c8be8fc75fe87c0a3273a0716539b5357ffd",
// "address": "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",

module.exports = {
  readNumOfBlocks
}
return;


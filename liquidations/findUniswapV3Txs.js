// findUniswapV3Txs
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
        "inputs":
        [
            {
                "components":
                [
                    {
                        "internalType": "address",
                        "name": "token0",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "token1",
                        "type": "address"
                    },
                    {
                        "internalType": "uint24",
                        "name": "fee",
                        "type": "uint24"
                    },
                    {
                        "internalType": "int24",
                        "name": "tickLower",
                        "type": "int24"
                    },
                    {
                        "internalType": "int24",
                        "name": "tickUpper",
                        "type": "int24"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount0Min",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount1Min",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "recipient",
                        "type": "address"
                    }
                ],
                "internalType": "struct IApproveAndCall.MintParams",
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "mint",
        "outputs":
        [
            {
                "internalType": "bytes",
                "name": "result",
                "type": "bytes"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs":
        [
            {
                "components":
                [
                    {
                        "internalType": "address",
                        "name": "token0",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "token1",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "tokenId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount0Min",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount1Min",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IApproveAndCall.IncreaseLiquidityParams",
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "increaseLiquidity",
        "outputs":
        [
            {
                "internalType": "bytes",
                "name": "result",
                "type": "bytes"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs":
        [
            {
                "internalType": "bytes32",
                "name": "previousBlockhash",
                "type": "bytes32"
            },
            {
                "internalType": "bytes[]",
                "name": "data",
                "type": "bytes[]"
            }
        ],
        "name": "multicall",
        "outputs":
        [
            {
                "internalType": "bytes[]",
                "name": "",
                "type": "bytes[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs":
        [
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "bytes[]",
                "name": "data",
                "type": "bytes[]"
            }
        ],
        "name": "multicall",
        "outputs":
        [
            {
                "internalType": "bytes[]",
                "name": "",
                "type": "bytes[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs":
        [
            {
                "internalType": "bytes[]",
                "name": "data",
                "type": "bytes[]"
            }
        ],
        "name": "multicall",
        "outputs":
        [
            {
                "internalType": "bytes[]",
                "name": "results",
                "type": "bytes[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
];
addABI(LIQUIDATIONS_ABI);

const UNISWAPV3_ROUTER1 = utils.getAddress("0xE592427A0AEce92De3Edee1F18E0157C05861564");
const UNISWAPV3_ROUTER2 = utils.getAddress("0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45");

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
        if(t.to && 
          (t.to.toLowerCase() == UNISWAPV3_ROUTER1.toLowerCase() || t.to.toLowerCase() == UNISWAPV3_ROUTER2.toLowerCase()) 
        ){
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
            let clonesArr = await require(`./json/uniswapv3-liquidations-trxs.json`);
            clonesArr.push(cobj);
            // if(debug) console.log('clonesArr ',clonesArr);
            await fs.writeFile(`${__dirname}/json/uniswapv3-liquidations-trxs.json`, JSON.stringify(clonesArr), console.error);
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
// readNumOfBlocks(14839482-1, 0, 1, 2000, true);

// scanned uniswap v2 liquidation trx
// "block": 14839482,
// "hash": "0x7e7d19f4df364b3524dfb7d52eda9b7920078cd7376eba563db9058a900948b0",
// "address": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",

module.exports = {
  readNumOfBlocks
}
return;


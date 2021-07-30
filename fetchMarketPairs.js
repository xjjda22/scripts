//npm install fs
//npm install axios
//npm install ethers

//ex - node fetchMarketPairs.js

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { Contract, providers } = require("ethers");

const { INFURA_APIKEY } = process.env;

const UNISWAP_LOOKUP_CONTRACT_ADDRESS = '0x5EF1009b9FCD4fec3094a5564047e190D72Bd511';
const UNISWAP_QUERY_ABI = [{
  "inputs": [{
    "internalType": "contract UniswapV2Factory",
    "name": "_uniswapFactory",
    "type": "address"
  }, {"internalType": "uint256", "name": "_start", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "_stop",
    "type": "uint256"
  }],
  "name": "getPairsByIndexRange",
  "outputs": [{"internalType": "address[3][]", "name": "", "type": "address[3][]"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "contract IUniswapV2Pair[]", "name": "_pairs", "type": "address[]"}],
  "name": "getReservesByPairs",
  "outputs": [{"internalType": "uint256[3][]", "name": "", "type": "uint256[3][]"}],
  "stateMutability": "view",
  "type": "function"
}];

const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const ETHEREUM_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_APIKEY}`;
const provider = new providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL);
const uniswapQuery = new Contract(UNISWAP_LOOKUP_CONTRACT_ADDRESS, UNISWAP_QUERY_ABI, provider);

const BATCH_COUNT_LIMIT = 100;
const UNISWAP_BATCH_SIZE = 1000;

const blacklistTokens = [
  '0xD75EA151a61d06868E31F8988D28DFE5E9df57B4'
];

// "assets":[
//     {
//         "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
//         "balance": 60447.40919661198,
//         "name": "Wrapped Ether",
//         "symbol": "WETH",
//         "weight": 0.5
//     },
//     {
//         "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
//         "balance": 117922963.245255,
//         "name": "Tether USD",
//         "symbol": "USDT",
//         "weight": 0.5
//     }
// ],
// "exchange": "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",

const readMarkets = async (pf, factoryAddress) => {
  const marketPairs = [];
  for (let i = 0; i < BATCH_COUNT_LIMIT * UNISWAP_BATCH_SIZE; i += UNISWAP_BATCH_SIZE) {
    const pairs = (await uniswapQuery.functions.getPairsByIndexRange(factoryAddress, i, i + UNISWAP_BATCH_SIZE))[0];
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const marketAddress = pair[2];
      let tokenAddress;

      if (pair[0] === WETH_ADDRESS) {
        tokenAddress = pair[1]
      } else if (pair[1] === WETH_ADDRESS) {
        tokenAddress = pair[0]
      } else {
        continue;
      }

      if (!blacklistTokens.includes(tokenAddress)) {
        const pairObj = {
          exchange: marketAddress,
          assets:[
            {
              address:pair[0]
            },
            {
              address:pair[1]
            }
          ]
        };
        marketPairs.push(pairObj);
      }
    }
    if (pairs.length < UNISWAP_BATCH_SIZE) {
      break
    }
  }
  // console.log('marketPairs',marketPairs);

  if (!marketPairs) {
    console.error(`error fetching data from ${this.name}: ${error}`);
    return false;
  } else {
    console.log('writing files -- ');
    const data = {
      total:marketPairs.length,
      results:marketPairs
    };
    fs.writeFile(`${__dirname}/json/${pf}-market-pairs.json`, JSON.stringify(data), console.error);
    return true;
  }
}

const SUSHISWAP_FACTORY_ADDRESS = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac';
const UNISWAP_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const SHIBASWAP_FACTORY_ADDRESS = '0x115934131916c8b277dd010ee02de363c09d037c';
const FACTORY_ADDRESSES = [
  UNISWAP_FACTORY_ADDRESS,
  SUSHISWAP_FACTORY_ADDRESS,
  SHIBASWAP_FACTORY_ADDRESS,
];
// readMarkets('uniswap-v2',UNISWAP_FACTORY_ADDRESS);
// readMarkets('sushiswap',SUSHISWAP_FACTORY_ADDRESS);
// readMarkets('shibaswap',SHIBASWAP_FACTORY_ADDRESS);


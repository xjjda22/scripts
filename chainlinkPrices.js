// chanlinkPrices
require('dotenv').config();
const axios = require('axios');
const { Contract, providers, utils } = require("ethers");
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const { INFURA_APIKEY, ARCHIVENODE_APIKEY } = process.env;

// const ETHEREUM_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_APIKEY}`;
const ETHEREUM_RPC_URL = `https://api.archivenode.io/${ARCHIVENODE_APIKEY}`;
const provider = new providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL);

const CHAINLINK_PRICEFEED_ABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

const CHAINLINK_ETHUSD_CONTRACT_ADDRESS = "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419";
const CHAINLINK_BTCUSD_CONTRACT_ADDRESS = "0xf4030086522a5beea4988f8ca5b36dbc97bee88c";
const CHAINLINK_BCHUSD_CONTRACT_ADDRESS = "0x9f0f69428f923d6c95b781f89e165c9b2df9789d";

const CHAINLINK_DAIUSD_CONTRACT_ADDRESS = "0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9";
const CHAINLINK_USDTUSD_CONTRACT_ADDRESS = "0x3e7d1eab13ad0104d2750b8863b489d65364e32d";
const CHAINLINK_USDCUSD_CONTRACT_ADDRESS = "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6";
const CHAINLINK_BUSDUSD_CONTRACT_ADDRESS = "0x833d8eb16d306ed1fbb5d7a2e019e106b960965a";

const CHAINLINK_LINKUSD_CONTRACT_ADDRESS = "0x2c1d072e956affc0d435cb7ac38ef18d24d9127c";
const CHAINLINK_AAVEUSD_CONTRACT_ADDRESS = "0x547a514d5e3769680ce22b2361c10ea13619e8a9";
const CHAINLINK_SNXUSD_CONTRACT_ADDRESS = "0xdc3ea94cd0ac27d9a86c180091e7f78c683d3699";

// const CHAINLINK_BNBUSD_CONTRACT_ADDRESS = "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee";

const chainLinkETHUSD = new Contract(CHAINLINK_ETHUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);
const chainLinkBTCUSD = new Contract(CHAINLINK_BTCUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);
const chainLinkBCHUSD = new Contract(CHAINLINK_BCHUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);

const chainLinkDAIUSD = new Contract(CHAINLINK_DAIUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);
const chainLinkUSDTUSD = new Contract(CHAINLINK_USDTUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);
const chainLinkUSDCUSD = new Contract(CHAINLINK_USDCUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);
const chainLinkBUSDUSD = new Contract(CHAINLINK_BUSDUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);

const chainLinkLINKUSD = new Contract(CHAINLINK_LINKUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);
const chainLinkAAVEUSD = new Contract(CHAINLINK_AAVEUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);
const chainLinkSNXUSD = new Contract(CHAINLINK_SNXUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);

// const chainLinkBNBUSD = new Contract(CHAINLINK_BNBUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);

const getPriceFeed = async (coin, feed, debug) => {
  
  const data = await feed.functions.latestRoundData();
  const dataObj = {
    "roundId": data[0],
    "answer": data[1],
    "startedAt": data[2],
    "updatedAt": data[3],
  }
  dataObj.roundId = dataObj.roundId.toString();
  dataObj.startedAt = dataObj.startedAt.toString();
  dataObj.updatedAt = dataObj.updatedAt.toString();
  dataObj.answer = dataObj.answer.toString();
  dataObj.answer = parseFloat(dataObj.answer.toString() / 10 ** 8).toFixed(2);
  if(debug) console.log('dataObj -- ', coin, dataObj);
  return dataObj;
}

console.log('start --');
getPriceFeed('eth', chainLinkETHUSD, true);
getPriceFeed('btc', chainLinkBTCUSD, true);
getPriceFeed('bch', chainLinkBCHUSD, true);

getPriceFeed('dai', chainLinkDAIUSD, true);
getPriceFeed('usdt', chainLinkUSDTUSD, true);
getPriceFeed('usdc', chainLinkUSDCUSD, true);
getPriceFeed('busd', chainLinkBUSDUSD, true);

getPriceFeed('link', chainLinkLINKUSD, true);
getPriceFeed('aave', chainLinkAAVEUSD, true);
getPriceFeed('snx', chainLinkSNXUSD, true);

// getPriceFeed('bnb', chainLinkBNBUSD, true);

module.exports = {
  getPriceFeed
}
return;

// data eth --  [
//   BigNumber { _hex: '0x05000000000000332f', _isBigNumber: true },
//   BigNumber { _hex: '0x65b9377322', _isBigNumber: true },
//   BigNumber { _hex: '0x617b5491', _isBigNumber: true },
//   BigNumber { _hex: '0x617b5491', _isBigNumber: true },
//   BigNumber { _hex: '0x05000000000000332f', _isBigNumber: true },
//   roundId: BigNumber { _hex: '0x05000000000000332f', _isBigNumber: true },
//   answer: BigNumber { _hex: '0x65b9377322', _isBigNumber: true },
//   startedAt: BigNumber { _hex: '0x617b5491', _isBigNumber: true },
//   updatedAt: BigNumber { _hex: '0x617b5491', _isBigNumber: true },
//   answeredInRound: BigNumber { _hex: '0x05000000000000332f', _isBigNumber: true }
// ]
// data btc --  [
//   BigNumber { _hex: '0x0500000000000027ca', _isBigNumber: true },
//   BigNumber { _hex: '0x0598a24644aa', _isBigNumber: true },
//   BigNumber { _hex: '0x617b54a9', _isBigNumber: true },
//   BigNumber { _hex: '0x617b54a9', _isBigNumber: true },
//   BigNumber { _hex: '0x0500000000000027ca', _isBigNumber: true },
//   roundId: BigNumber { _hex: '0x0500000000000027ca', _isBigNumber: true },
//   answer: BigNumber { _hex: '0x0598a24644aa', _isBigNumber: true },
//   startedAt: BigNumber { _hex: '0x617b54a9', _isBigNumber: true },
//   updatedAt: BigNumber { _hex: '0x617b54a9', _isBigNumber: true },
//   answeredInRound: BigNumber { _hex: '0x0500000000000027ca', _isBigNumber: true }
// ]

// dataObj --  aave {
//   roundId: '55340232221128658975',
//   answer: '304.90',
//   startedAt: '1635739324',
//   updatedAt: '1635739324'
// }
// dataObj --  eth {
//   roundId: '92233720368547771338',
//   answer: '4185.75',
//   startedAt: '1635739360',
//   updatedAt: '1635739360'
// }
// dataObj --  btc {
//   roundId: '92233720368547768385',
//   answer: '59919.45',
//   startedAt: '1635739400',
//   updatedAt: '1635739400'
// }
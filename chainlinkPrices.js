// chanlinkPrices
require('dotenv').config();
const axios = require('axios');
const { Contract, providers } = require("ethers");
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const { INFURA_APIKEY } = process.env;

const ETHEREUM_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_APIKEY}`;
const provider = new providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL);

const CHAINLINK_ETHUSD_CONTRACT_ADDRESS = "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419";
const CHAINLINK_BTCUSD_CONTRACT_ADDRESS = "0xf4030086522a5beea4988f8ca5b36dbc97bee88c";
const CHAINLINK_AAVEUSD_CONTRACT_ADDRESS = "0x547a514d5e3769680ce22b2361c10ea13619e8a9";
const CHAINLINK_PRICEFEED_ABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

const chainLinkETHUSD = new Contract(CHAINLINK_ETHUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);
const chainLinkBTCUSD = new Contract(CHAINLINK_BTCUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);
const chainLinkAAVEUSD = new Contract(CHAINLINK_AAVEUSD_CONTRACT_ADDRESS, CHAINLINK_PRICEFEED_ABI, provider);

const getPriceFeed = async (feed, debug) => {
  
  const data = await feed.functions.latestRoundData();
  if(debug) console.log('data -- ',data);
  return data;
}

console.log('start --');
getPriceFeed(chainLinkETHUSD, true);
getPriceFeed(chainLinkBTCUSD, true);
getPriceFeed(chainLinkAAVEUSD, true);

module.exports = {
  getPriceFeed
}
return;

// data ethusd--  [
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
// data btcusd--  [
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

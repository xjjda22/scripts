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
const CHAINLINK_ETHUSD_ABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

const chainLinkETHUSD = new Contract(CHAINLINK_ETHUSD_CONTRACT_ADDRESS, CHAINLINK_ETHUSD_ABI, provider);

const gasPrices = async (debug) => {
  
  const data = await chainLinkETHUSD.functions.latestRoundData();
  if(debug) console.log('data -- ',data);
  return data;
}

console.log('start --');
gasPrices(true);


module.exports = {
  gasPrices
}
return;

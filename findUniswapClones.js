// findUniswapClones
require('dotenv').config();
const { providers, utils } = require("ethers");

const { INFURA_APIKEY, ARCHIVENODE_APIKEY } = process.env;
const UNIV2_ABI = '';

// const ETHEREUM_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_APIKEY}`;
const ETHEREUM_RPC_URL = `https://api.archivenode.io/${ARCHIVENODE_APIKEY}`;

const provider = new providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.JsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.getDefaultProvider(ETHEREUM_RPC_URL);

console.log('start --');
console.log('ETHEREUM_RPC_URL',ETHEREUM_RPC_URL);

const getBlockNumber = async (debug) => {
    const blockNumber = await provider.getBlockNumber();
    console.log('blockNumber',blockNumber);
    return blockNumber;
}

const getBlock = async (blockNumber, debug) => {
    const block = await provider.getBlockWithTransactions(blockNumber);
    console.log('block',block);
    return block;
}

const readNumOfBlocks = async (n, debug) => {
    const blockNumber = await getBlockNumber();
    let i;
    let blocks = [];
    for(i=0;i<=blockNumber-n;i++){
        let block = await getBlock(blockNumber);
        blocks.push(block);
    }
}

readNumOfBlocks(10, true);

module.exports = {
  readNumOfBlocks
}
return;


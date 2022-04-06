//app
const { getEthPrice } = require( "./uniswapV2SubGraph");
const { getUSDPrice } = require( "./api/cryptoCompareApi");
const { getBlocks } = require( "./api/fbBlocks");
const { getToken } = require( "./token/findToken");
const { getReceipts } = require( "./trxReceipts");

getEthPrice(true);
getUSDPrice('CHI',true);

getToken('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',true);
getBlocks({},true);
getReceipts({transaction_hash:'0x8f7a7b99a29f5d848c39ad9d61719e4923c5d47dfd3bb6e869cdd5f406da56e2'}, true);

// module.exports app;
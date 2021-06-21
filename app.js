//app
import { getToken } from "./findToken";
import { getUSDPrice } from "./cryptoCompareApi";
import { getEthPrice } from "./uniswapV2SubGraph";
import { getBlocks } from "./fbBlocks";

getToken('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
getUSDPrice('CHI');
getEthPrice();
getBlocks();

module.exports = app;
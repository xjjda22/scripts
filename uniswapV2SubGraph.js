const axios = require('axios');
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

// const USDC = {
//   "chainId": 1,
//   "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//   "name": "USD Coin",
//   "symbol": "USDC",
//   "decimals": 6,
//   "logoURI": "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389"
// };

const uniswapV2GQL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";
const ethQL = `{
  bundles (first:1) {
    ethPrice
  }
}`;

const getEthPrice = async () => {

  const config = {
    timeout: 30000,
    url: uniswapV2GQL,
    method: 'post',
    headers: {
      // 'Accept': 'api_version=2',
      // 'Content-Type': 'application/graphql',
      'Content-Type': 'application/json'
    },
    // body: JSON.stringify({ query : ethQL }),
    data: { query : ethQL },
    responseType: 'json'
  };
  const res = await axios(config);
  const { data } = res.data;

  if (data.bundles.length > 0) {
    console.log('ethprice --',data.bundles[0].ethPrice);
    return parseFloat(data.bundles[0].ethPrice).toFixed(6);
  }

  return 0;
}

console.log('start --');
getEthPrice();
return;

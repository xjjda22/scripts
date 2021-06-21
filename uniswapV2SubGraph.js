//uniswapV2SubGraph
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

const urlArr = [
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
  "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
];
const ethQL = `{
  bundles (first:1) {
    ethPrice
  }
}`;
const pairQL = (_address) =>`{
   pair(id: "${_address}") {
    token0 {
      symbol
    }
    token1 {
      symbol
    }
  }
}`;

const getEthPrice = async (debug) => {
  const config = {
    timeout: 30000,
    url: urlArr[0],
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
    if(debug) console.log('ethprice --',data.bundles[0].ethPrice);
    return parseFloat(data.bundles[0].ethPrice).toFixed(6);
  }

  return 0;
}

const getPairAddress = async (_address, debug) =>{
  let c = { 
    coin: "", 
    logo: "",
    decimals: 18
  };
  const gQL = pairQL(_address);

  for (let i in urlArr) {
    const config = {
      timeout: 30000,
      url: urlArr[i],
      method: 'post',
      headers: {
        // 'Accept': 'api_version=2',
        // 'Content-Type': 'application/graphql',
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify({ query : gQL }),
      data: { query : gQL },
      responseType: 'json'
    };
    const res = await axios(config);
    const { data: { pair } } = res.data;

    if(pair != null){
      c.coin = `${pair.token0.symbol}-${pair.token1.symbol}`
      break;
    }
  }
  if(debug) console.log('coin --',c);
  return c;
}

// console.log('start --');
// getEthPrice(true);
// getPairAddress('0x4214290310264a27b0ba8cff02b4c592d0234aa1',true);

module.exports = {
  getEthPrice,
  getPairAddress
}
return;

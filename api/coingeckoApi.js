//npm install fs
//npm install axios

//ex - node oneInchQuote.js

const axios = require('axios');
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

//https://api.coingecko.com/api/v3/exchanges/list
let protocols = [
  "uniswap",
  "uniswap_v1",
  "uniswap_v2",
  "sushiswap",
  "aave",
  "curve",
  "synthetix",	
  "compound",	
  "dydx",
  "kyber_network",	
  "bancor",
  "1inch",
  "balancer",
  "balancer_v1",
  "bamboo_relay",
  "zero_ex",
];

//https://api.coingecko.com/api/v3/coins/list
let coinsList = require('./json/coingecko-coins-json.json');
// let tokensArr = [];
// coinsList.map( c => {
//   if(c.name.toLowerCase().includes('weth') ||
//     c.name.toLowerCase().includes('usd') ||
//     c.name.toLowerCase().includes('tether') ||
//     c.name.toLowerCase().includes('dai')){
//     tokensArr.push(c);
//   }
// })
// console.table(tokensArr);
let tokens = [
  "usd-coin",
  "tether",
  "weth",
  "dai",
];


const exchangesApi = (plat) => `https://api.coingecko.com/api/v3/exchanges/${plat}`;
const coinTickersApi = (token) => `https://api.coingecko.com/api/v3/coins/${token}/tickers?exchange_ids=${protocols.join(',')}`;
let config = {
  timeout: 30000,
  url: '',
  method: 'get',
  responseType: 'json'
};

const getQuote = async (token, debug) => {
  
  let platres,platdata;

  const platurl = coinTickersApi(token);
  config.url = platurl;
  // if(debug) console.log(platurl);
  
  try{
    platres = await axios(config);
    platdata = platres.data;
  } catch (e){
    console.log(e.response.data);
    return;
  }

  if (!platdata) {
    console.error(`error fetching data from ${this.name}: ${platdata}`);
    return false;
  } else {

    // if(debug) console.log('platdata -- ',deepLogs(platdata));
    if(debug) {
      platdata.tickers.map(t => {
        let {base, target, coin_id, volume, last, market : { name : marketName } } = t ;
        let obj = {
          coin:coin_id,
          pair: `${base}-${target}`,
          last,
          volume,
          marketName
        }
        allTickers.push(obj);
      })
      console.table(allTickers);
    }
    return true;
  }
}

let allTickers = [];

console.log('start --');
// getQuote('usd-coin', true);
// getQuote('weth', true);
// getQuote('dai', true);
// getQuote('tether', true);

module.exports = {
  getQuote
}
return;


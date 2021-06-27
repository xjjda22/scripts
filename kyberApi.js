//npm install fs
//npm install axios

//ex - node oneInchQuote.js

const axios = require('axios');
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const protocols = [
  "KYBER",
  "UNISWAP_V2",
];

const buyApi = (from, amt) => `https://api.kyber.network/buy_rate?id=${from}&qty=${amt}`;
const sellApi = (from, amt) => `https://api.kyber.network/sell_rate?id=${from}&qty=${amt}`;

let config = {
  timeout: 30000,
  url: '',
  method: 'get',
  responseType: 'json'
};

const getQuote = async (from, amt, dec, debug) => {
  
  let buyres,buydata,retbuyamt;
  let sellres,selldata,retsellamt;

  const buyurl = buyApi(from, amt);
  config.url = buyurl;
  // if(debug) console.log(buyurl);
  
  try{
    buyres = await axios(config);
    buydata = buyres.data;
    if(!buydata.error){
      retbuyamt = buydata.data[0].dst_qty[0];
    }
  } catch (e){
    console.log(e.response.data);
    return;
  }
  
  const sellurl = sellApi(from, amt);
  config.url = sellurl;
  // if(debug) console.log(sellurl);

  try{
    sellres = await axios(config);
    selldata = sellres.data;
    if(!selldata.error){
      retsellamt = selldata.data[0].dst_qty[0];
    }
  } catch (e){
    console.log(e.response.data);
  }

  if (!buydata || !selldata) {
    console.error(`error fetching data from ${this.name}: ${buydata}`);
    console.error(`error fetching data from ${this.name}: ${selldata}`);
    return false;
  } else {

    // if(debug) console.log('buydata -- ',deepLogs(buydata));
    // if(debug) console.log('selldata -- ',deepLogs(selldata));
    if(debug) {
      let obj = {
        'buy-amt': retbuyamt,
        'sell-amt': retsellamt
      }
      allTrades.push(obj);
    }
    
    return true;
  }
}

let _dec = '000000000000000000';
let _e = 1000000000000000000;
let allTrades = [];

const weth_add = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const usdt_add = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const usdc_add = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const seth_add = "0x57ab1ec28d129707052df4df418d58a2d46d5f51";

let _amt = 1, _inc = 5;

const runQuotes = async (debug) => {
  
  for(let _i=0;_i<5;_i++){
    await getQuote(weth_add, _amt, _dec, true);
    await getQuote(usdc_add, _amt, _dec, true);
    _amt = _amt+_inc; 
  }
  if(debug) console.table(allTrades);
}

console.log('start --');
runQuotes(true);
// getQuote(weth_add, _amt, _dec, true);
// getQuote(usdc_add, _amt, _dec, true);

module.exports = {
  getQuote
}
return;

//npm install fs
//npm install axios

//ex - node oneInchQuote.js

const axios = require('axios');
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

// const protocols = [
//   "AAVE",
//   "AAVE_LIQUIDATOR",
//   "AAVE_V2",
//   "BALANCER",
//   "BALANCER_V2",
//   "BANCOR",
//   "BLACKHOLESWAP",
//   "CHAI",
//   "COFIX",
//   "COMPOUND",
//   "CONVERGENCE_X",
//   "CREAMSWAP",
//   "CREAM_LENDING",
//   "CURVE",
//   "CURVE_V2",
//   "DEFISWAP",
//   "DFX_FINANCE",
//   "DODO",
//   "DODO_V2",
//   "IEARN",
//   "INDEXED_FINANCE",
//   "KYBER",
//   "KYBER_DMM",
//   "LINKSWAP",
//   "LUASWAP",
//   "MINISWAP",
//   "MOONISWAP",
//   "MSTABLE",
//   "OASIS",
//   "ONE_INCH_LIMIT_ORDER",
//   "ONE_INCH_LP",
//   "ONE_INCH_LP_1_1",
//   "ONE_INCH_LP_MIGRATOR",
//   "ONE_INCH_LP_MIGRATOR_V1_1",
//   "PMM1",
//   "PMM2",
//   "PMM3",
//   "PMM4",
//   "POWERINDEX",
//   "PSM",
//   "SADDLE",
//   "SAKESWAP",
//   "SETH_WRAPPER",
//   "SHELL",
//   "SMOOTHY_FINANCE",
//   "ST_ETH",
//   "SUSHI",
//   "SUSHISWAP_MIGRATOR",
//   "SWERVE",
//   "SYNTHETIX",
//   "S_FINANCE",
//   "UNISWAP_V1",
//   "UNISWAP_V2",
//   "UNISWAP_V2_MIGRATOR",
//   "UNISWAP_V3",
//   "VALUELIQUID",
//   "WETH",
//   "XSIGMA",
//   "ZRX"
// ];

const protocols = [
  // "UNISWAP_V1",
  "UNISWAP_V2",
  // "UNISWAP_V3",
  "SUSHI",
  // "KYBER",
  "KYBER_DMM",
  // "BALANCER",
  "BALANCER_V2",
  "BANCOR",
  "CREAMSWAP",
  // "AAVE",
  "AAVE_V2",
  "COMPOUND",
  // "CURVE",
  "CURVE_V2",
  // "DEFISWAP",
  "SYNTHETIX",
];

const quoteApi = (from, to, amt, plat) => `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${from}&toTokenAddress=${to}&amount=${amt}&protocols=${plat}`;
let config = {
  timeout: 30000,
  url: '',
  method: 'get',
  responseType: 'json'
};

const getQuote = async (from, to, amt, dec, plat1, plat2, debug) => {
  
  let platres1,platdata1,fromamt1,amt1;
  let platres2,platdata2,fromamt2,amt2,dec2;

  const platurl1 = quoteApi(from,to,amt+dec,plat1);
  config.url = platurl1;
  // if(debug) console.log(platurl1);
  
  try{
    platres1 = await axios(config);
    platdata1 = platres1.data;
    if(!platdata1.error){
      fromamt1 = platdata1.fromTokenAmount;
      amt1 = platdata1.toTokenAmount;
    }
  } catch (e){
    console.log(e.response.data);
    return;
  }
  
  const platurl2 = quoteApi(to,from,amt1,plat2);
  config.url = platurl2;
  // if(debug) console.log(platurl2);

  try{
    platres2 = await axios(config);
    platdata2 = platres2.data;
    if(!platdata2.error){
      fromamt2 = platdata2.fromTokenAmount;
      amt2 = platdata2.toTokenAmount;
      dec2 = platdata2.toToken.decimals;
    }
  } catch (e){
    console.log(e.response.data);
  }

  if (!platdata1 || !platdata2) {
    console.error(`error fetching data from ${this.name}: ${platdata1}`);
    console.error(`error fetching data from ${this.name}: ${platdata2}`);
    return false;
  } else {

    // if(debug) console.log('platdata1 -- ',deepLogs(platdata1));
    // if(debug) console.log('platdata2 -- ',deepLogs(platdata2));
    if(debug) {
      let obj = {
        'plat': plat1 ,
        'from-amt': fromamt1,
        'to-amt': amt1,
        'plat-2': plat2
      }
      let obj2= {
        'plat': plat2 ,
        'from-amt': fromamt2,
        'to-amt': amt2
      }
      let obj3 = {
        'profit': amt2-fromamt1,
        'eth-profit': parseFloat((amt2-fromamt1)/_e).toFixed(2)
      }
      if(amt2-fromamt1 > 0 ){
        profitTrades.push(obj);
        profitTrades.push(obj2);
        profitTrades.push(obj3);
      } else {
        losingTrades.push(obj);
        losingTrades.push(obj2);
        losingTrades.push(obj3);
      }
      
    }
    return true;
  }
}

let _dec = '000000000000000000';
let _e = 1000000000000000000;
let _showProfit = true;
let _showlosing = true;
let profitTrades = [], losingTrades = [];

const weth_add = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const dai_add = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const usdt_add = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const usdc_add = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const wbtc_add = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

const seth_add = "0x57ab1ec28d129707052df4df418d58a2d46d5f51";

let _amt = 1, _inc = 1;
const _plat1 = "UNISWAP_V2", _plat2 = "SUSHI";

const runQuotes = async (debug) => {
  
  for(let _p1=0;_p1<protocols.length;_p1++){
    for(let _p2=0;_p2<protocols.length;_p2++){
      let _plat1 = protocols[_p1], _plat2 = protocols[_p2];
      if(_plat1 == _plat2) continue;
      // console.log('protocols -- ', _plat1, _plat2);
      
      for(let _i=0;_i<5;_i++){
        await getQuote(weth_add, usdc_add, _amt, _dec, _plat1, _plat2, true);
        await getQuote(weth_add, usdc_add, _amt, _dec, _plat2, _plat1, true);
        _amt = _amt+_inc; 
      }
    }
  }
  
  if(debug && _showlosing) console.table(losingTrades);
  if(debug && _showProfit) console.table(profitTrades);
}

console.log('start --');
runQuotes(true);
// getQuote(_f, _t, _a, _d, _p1, _p2, true);
// getQuote(_f, _t, _a, _d, _p2, _p1, true);

module.exports = {
  getQuote
}
return;
 
//npm install fs
//npm install axios

//ex - node oneInchQuote.js

const axios = require('axios');
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const protocols = [
  "WETH",
  "MOONISWAP",
  "SUSHI",
  "COMPOUND",
  "KYBER",
  "CREAMSWAP",
  "AAVE",
  "CURVE",
  "UNISWAP_V1",
  "UNISWAP_V2",
  "BALANCER",
  "CHAI",
  "OASIS",
  "BANCOR",
  "IEARN",
  "SWERVE",
  "VALUELIQUID",
  "DODO",
  "SHELL",
  "BLACKHOLESWAP",
  "PMM1",
  "DEFISWAP",
  "COFIX",
  "ZRX",
  "LUASWAP",
  "MINISWAP",
  "MSTABLE",
  "AAVE_LIQUIDATOR",
  "SYNTHETIX",
  "AAVE_V2",
  "ST_ETH",
  "ONE_INCH_LP",
  "LINKSWAP",
  "S_FINANCE",
  "ONE_INCH_LP_1_1",
  "PSM",
  "ONE_INCH_LP_MIGRATOR_V1_1",
  "UNISWAP_V2_MIGRATOR",
  "SUSHISWAP_MIGRATOR",
  "ONE_INCH_LP_MIGRATOR",
  "POWERINDEX",
  "INDEXED_FINANCE",
  "XSIGMA"
];

const inchQuoteApi = (from, to, amt, plat) => `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${from}&toTokenAddress=${to}&amount=${amt}&protocols=${plat}`;
let config = {
  timeout: 30000,
  url: '',
  method: 'get',
  responseType: 'json'
};

const getQuote = async (from, to, amt, dec, plat1, plat2, debug) => {
  
  let platres1,platdata1,fromamt1,amt1;
  let pres2,platdata2,fromamt2,amt2,dec2;

  const platurl1 = inchQuoteApi(from,to,amt*(10**dec),plat1);
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
  
  const platurl2 = inchQuoteApi(to,from,amt1,plat2);
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
      // if((amt2-fromamt1)/(10**dec2) > 0){
        let obj1 = {
          'plat-1': plat1 ,
          'from-amt-1': fromamt1/10**18,
          'to-amt-1': amt1,
          'plat-2': plat2 ,
          'from-amt-2': fromamt2,
          'to-amt-2': amt2/10**18,
          'profit': (amt2-fromamt1)/(10**dec2)
        }
        console.table(obj1);
      // }
      
    }
    return true;
  }
}

const runQuotes = async () => {
  const weth_add = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const usdt_add = "0xdac17f958d2ee523a2206206994597c13d831ec7";
  const yfl_add = "0x28cb7e841ee97947a86B06fA4090C8451f64c0be";
  let _amt = _i = 20, _dec = 18;
  const _plat1 = "UNISWAP_V2", _plat2 = "SUSHI";

  for(_i=0;_i<50;_i++){
    await getQuote(weth_add, usdt_add, _amt, _dec, _plat1, _plat2, true);
    await getQuote(weth_add, usdt_add, _amt, _dec, _plat2, _plat1, true);
    _amt = _amt+10; 
  }

}

console.log('start --');
runQuotes();

// getQuote(_f, _t, _a, _d, _p1, _p2, true);
// getQuote(_f, _t, _a, _d, _p2, _p1, true);

module.exports = {
  getQuote
}
return;

 
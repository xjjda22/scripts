//npm install fs
//npm install axios

//ex - node oneInchQuote.js

const axios = require('axios');
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const protocols = [
  "uniswap",
  "uniswap_v1",
  "uniswap_v2",
  "aave",
  "curve",
  "synthetix",	
  "compound",	
];

const quoteApi = (plat) => `https://api.coingecko.com/api/v3/exchanges/${plat}`;
let config = {
  timeout: 30000,
  url: '',
  method: 'get',
  responseType: 'json'
};

const getQuote = async (plat, debug) => {
  
  let platres,platdata;

  const platurl = quoteApi(plat);
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

    if(debug) console.log('platdata -- ',deepLogs(platdata));
    // if(debug) {
    //   let obj = {
    //     'plat': plat1 ,
    //     'from-amt': fromamt1,
    //     'to-amt': amt1,
    //     'plat-2': plat2
    //   }
    //   let obj2= {
    //     'plat': plat2 ,
    //     'from-amt': fromamt2,
    //     'to-amt': amt2
    //   }
    //   let obj3 = {
    //     'profit': amt2-fromamt1,
    //     'eth-profit': parseFloat((amt2-fromamt1)/_e).toFixed(2)
    //   }
    //   allTickers.push(obj);
      
    // }
    return true;
  }
}
const allTickers = [];
console.log('start --');
getQuote('uniswap_v2', true);

module.exports = {
  getQuote
}
return;


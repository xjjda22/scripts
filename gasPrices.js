// gasPrices
require('dotenv').config();
const axios = require('axios');
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const { ETHERSCAN_APIKEY } = process.env;

const gasPrices = async (api, debug) => {
  
  const api_url = `${api}`;

  const config = {
    timeout: 30000,
    url: api_url,
    method: 'get',
    responseType: 'json'
  };
  const res = await axios(config);
  const data = res.data;
  if(debug) console.log('data -- ',api, data);
  return data;
}

// console.log('start --');
// gasPrices("https://ethgasstation.info/json/ethgasAPI.json", true);
// gasPrices("https://gasprice.poa.network/", true);
// gasPrices("https://www.gasnow.org/api/v3/gas/price", true);
// gasPrices("https://safe-relay.gnosis.io/api/v1/gas-station/", true);
// gasPrices("https://api.txprice.com/", true);
// gasPrices("https://api.metaswap.codefi.network/gasPrices", true);
// gasPrices("https://www.etherchain.org/api/gasPriceOracle", true);
//GasNow
//MyCrypto
//etherscan
gasPrices(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_APIKEY}`, true);


module.exports = {
  gasPrices
}
return;

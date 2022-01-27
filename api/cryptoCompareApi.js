const axios = require('axios');

const cryptoApi = _symbol => `https://min-api.cryptocompare.com/data/price?fsym=${_symbol}&tsyms=USD`;

const getUSDPrice = async (sym, debug) => {
  const purl = cryptoApi(sym);
  if(debug) console.log(purl);
  
  const config = {
    timeout: 30000,
    url: purl,
    method: 'get',
    responseType: 'json'
  };
  const res = await axios(config);
  const data = res.data;

  if (data.USD > 0) {
    if(debug) console.log('usd --', data.USD);
    return parseFloat(data.USD).toFixed(2);
  }

  return 0;
}

// console.log('start --');
// getUSDPrice('CHI', true);
// getUSDPrice('DAI', true);

module.exports = {
  getUSDPrice
}
return;
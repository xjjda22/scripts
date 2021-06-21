const axios = require('axios');

const cryptoApi = _symbol => `https://min-api.cryptocompare.com/data/price?fsym=${_symbol}&tsyms=USD`;

const getUSDPrice = async (sym) => {
  const purl = cryptoApi(sym);
  console.log(purl);
  
  const config = {
    timeout: 30000,
    url: purl,
    method: 'get',
    responseType: 'json'
  };
  const res = await axios(config);
  const data = res.data;

  if (data.USD > 0) {
    console.log('usd --', data.USD);
    return parseFloat(data.USD).toFixed(2);
  }

  return 0;
}
console.log('start --');
getUSDPrice('CHI');
getUSDPrice('DAI');
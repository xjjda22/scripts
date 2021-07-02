//npm install fs
//npm install axios

//ex - node fetchTokens.js

const fs = require('fs');
const axios = require('axios');

const dexUrl = {
  'coingecko': "https://tokens.coingecko.com/uniswap/all.json",
  'coingecko-coins': "https://api.coingecko.com/api/v3/coins/list",
  '1inch': "https://api.1inch.exchange/v3.0/1/tokens",
  '0x': "https://api.0x.org/swap/v1/tokens",
  'kyber': "https://api.kyber.network/currencies",
};

const tokensBySymbol = {}

const readFiles = async dex => {
  const tokensUrl = dexUrl[dex];

  const config = {
    timeout: 30000,
    url: tokensUrl,
    method: 'get',
    responseType: 'json'
  };

  let { data }  = await axios(config);

  if (!data) {
    console.error(`error fetching data from ${this.name}: ${error}`);
    return false;
  } else {
    console.log('writing files -- ');
    if(dex == 'coingecko') {
      let { tokens } = data;
      data.total = tokens.length;
    } else if(dex == 'coingecko-coins'){
      
    } else if(dex == '1inch'){
      let { tokens } = data;
      data.total = Object.keys(tokens).length;
    } else if(dex == '0x'){
      let { records } = data;
      data.total = records.length;
    } else if(dex == 'kyber'){
      data.total = data.data.length;
    }
    fs.writeFile(`${__dirname}/json/${dex}-json.json`, global.JSON.stringify(data), console.error);

    // if(dex == 'coingecko'){
    //   tokens.forEach(token => {
    //     tokensBySymbol[token.symbol] = token;
    //   })
    //   fs.writeFile(`${__dirname}/json/${dex}-tokens.json`, global.JSON.stringify(tokensBySymbol), console.error);
    // } else if(dex == '1inch'){

    // }
    return true;
  }
}

// readFiles('coingecko');
// readFiles('1inch');
// readFiles('0x');
// readFiles('kyber');
readFiles('coingecko-coins');

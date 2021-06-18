//npm install fs
//npm install axios

//ex - node fetchTokens.js

const fs = require('fs');
const axios = require('axios');

const dexUrl = {
  'COINGECKO': "https://tokens.coingecko.com/uniswap/all.json"
};

const tokensBySymbol = {}

const readFiles = async dex => {
  const tokensUrl = dexUrl[dex];

  const config = {
    timeout: 30000,
    url: poolUrl,
    method: 'get',
    responseType: 'json'
  };

  const { data }  = await axios(config);
  const { tokens } = data;

  if (!data) {
    console.error(`error fetching data from ${this.name}: ${error}`);
    return false;
  } else {
    tokens.forEach(token => {
      tokensBySymbol[token.symbol] = token;
    })
    console.log('writing files -- ');
    fs.writeFile(`${__dirname}/json/json${dex}.json`, global.JSON.stringify(data), console.error);
    fs.writeFile(`${__dirname}/json/tokens${dex}.json`, global.JSON.stringify(tokensBySymbol), console.error);
    return true;
  }
}

readFiles('COINGECKO');
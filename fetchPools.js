//npm install fs
//npm install axios

//ex - node fetchPools.js

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const { DEFIPULSE_APIKEY } = process.env;

const poolNames = [
  "uniswap-v2",
  "sushiswap",
  "mooniswap",
  "curve",
  "balancer"
];
const poolApi = pf => `https://data-api.defipulse.com/api/v1/blocklytics/pools/v1/exchanges?platform=${pf}&orderBy=usdLiquidity&direction=desc&api-key=${DEFIPULSE_APIKEY}`;

const readFiles = async pf => {
  const poolUrl = poolApi(pf);
  console.log(poolUrl);

  const config = {
    timeout: 30000,
    url: poolUrl,
    method: 'get',
    responseType: 'json'
  };

  const { data } = await axios(config);

  if (!data) {
    console.error(`error fetching data from ${this.name}: ${error}`);
    return false;
  } else {
    console.log('writing files -- ');
    fs.writeFile(`${__dirname}/json/${pf}-pools.json`, JSON.stringify(data), console.error);
    return true;
  }
}

// readFiles('uniswap-v2');
// readFiles('sushiswap');
// readFiles('mooniswap');
// readFiles('curve');
// readFiles('balancer');
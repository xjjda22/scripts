//npm install fs
//npm install axios

//ex - node oneInchQuote.js

const axios = require('axios');
const { inspect }  = require('util');

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

const inchQuoteApi = (f, t, a, p) => `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${f}&toTokenAddress=${t}&amount=${a}&protocols=${p}`;

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const getQuote = async (f, t, amt, p1, p2) => {
  const p1Url = inchQuoteApi(f,t,amt,p1);
  console.log(p1Url);

  const configp1 = {
    timeout: 30000,
    url: p1Url,
    method: 'get',
    responseType: 'json'
  };

  const p1res = await axios(configp1);
  const p1data =p1res.data;
  const famt1 = p1data.fromTokenAmount;
  const swap1 = p1data.toTokenAmount;

  const p2Url = inchQuoteApi(t,f,swap1,p2);
  console.log(p2Url);

  const configp2 = {
    timeout: 30000,
    url: p2Url,
    method: 'get',
    responseType: 'json'
  };

  const p2res = await axios(configp2);
  const p2data = p2res.data;
  const famt2 = p2data.fromTokenAmount;
  const swap2 = p2data.toTokenAmount;
  const d2 = p2data.toToken.decimals;

  if (!p1data) {
    console.error(`error fetching data from ${this.name}: ${error}`);
    return false;
  } else {

    // console.log('p1data -- ',deepLogs(p1data));
    // console.log('p2data -- ',deepLogs(p2data));
    console.log(`${p1} f-amt t-amt *** `, famt1/10**18, swap1);
    console.log(`${p2} f-amt t-amt *** `, famt2, swap2/10**18);
    console.log(`profit swap2-amt *** `, (swap2-famt1)/10**d2);
    return true;
  }
}

const f = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const t = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const amt = 35000000000000000000;
const p1 = "SUSHI", p2 = "UNISWAP_V2";

console.log('start --');
getQuote(f, t, amt, p1, p2);
getQuote(f, t, amt, p2, p1);
return;

 
//ABILogs
//npm install abi-decoder
//npm install @ethersproject/abi

const { addABI, decodeLogs } = require("abi-decoder");
const { Interface } = require("@ethersproject/abi");

const { getToken } = require("./findToken");
const { getEthPrice, getPairAddress } = require("./uniswapV2SubGraph"); 
const { getUSDPrice } = require("./cryptoCompareApi"); 

const eventsJson = require("./ABIEvents");

const addEvents = async () => {
  eventsJson.map(async e => {
    let { text_signature } = e;
    try {
      let i = new Interface([text_signature]);
      await addABI(i.fragments);
    } catch (e) {
      console.log(e);
    }
  });
};

addEvents();

const getAllLogs = async (_logs) => {
  const ethPrice = await getEthPrice();
  return await Promise.all(decodeLogs(_logs).map(async log => {
    let { coin, logo, decimals } = getToken(log.address);
    if(coin == "") {
      let pair = await getPairAddress(log.address);
      coin = pair.coin;
    }
    let ethValue = 0;
    let usdValue = 0;
    let value;

    if((log.name == "Transfer" || log.name == "Swap") && coin !== 'WETH' && coin !== ""){
      try {
        usdValue = await getUSDPrice(coin);
      } catch (e) {
        console.log(e);
      }
    }
    
    log.events.map(async e => {
      if ((log.name == "Transfer" || log.name == "Swap") && e.type.match("uint")) {
        value = parseFloat(e.value / 10 ** decimals).toFixed(2);
        if (coin === 'WETH') {
          ethValue = parseFloat(value * ethPrice).toFixed(2);
        } else if(coin !== "") {
          if(usdValue > 0) ethValue = parseFloat(value * usdValue).toFixed(2);
        }
      }
    });

    log.coin = {
      address: log.address,
      name: coin,
      event: log.name,
      logo,
      decimals,
      value,
      ethValue
    };

    return log;
  }));
}

module.exports = {
  getAllLogs
}

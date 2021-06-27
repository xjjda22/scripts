//findToken
const DEXES = ["coingecko"];

let tokensList = [];
const loadTokens = () => {
  DEXES.map(d => {
    let { tokens } = require(`./json/${d}-json.json`)
    tokensList.push(tokens);
  })
}
loadTokens();

const getToken = (_address, debug) =>{
  let c = { 
    coin: "", 
    logo: "",
    decimals: 18
  };

  for (let d in tokensList) {
    for (let t in tokensList[d]) {
      let o = tokensList[d][t];
      if (o.address === _address) {
        c.coin = o.symbol;
        c.logo = o.logoURI ? o.logoURI : "";
        c.decimals = o.decimals ? o.decimals : 0;
        break;
      } 
    }

    if (c.coin !== "") {
      break;
    }
  }
  if(debug) console.log('coin --', c);
  return c;
}

// console.log('start --');
// getToken('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', true);

module.exports = {
  getToken
}
return;

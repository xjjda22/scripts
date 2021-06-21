//findToken
const DEXES = ["COINGECKO"];

let tokensList = [];
async function loadTokens() {
  DEXES.map(d => {
    let { tokens } = require(`./json/json${d}.json`)
    tokensList.push(tokens);
  })
}

loadTokens();

export function getToken(_address) {
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
  return c;
}

// getToken('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')

//tokensniffer

//npm install tabletojson
//npm install fs

const fs = require('fs');
const tabletojson = require('tabletojson').Tabletojson;

const site = "https://tokensniffer.com/tokens/scam";	

const readFiles = async pf => {
  tabletojson.convertUrl(site)
  .then( (tableData) => {
  	if (!tableData) {
		console.error(`error fetching data from : ${tableData}`);
	    return false;
	} else {
	    console.log('writing files -- ');
	    let tokensArr = [];
	    tableData[0].map(t =>{
	    	let obj = {
	    		"address": t.Symbol,
          "symbol": t.BitClave,
          "network": t.Address,
          "added": t.Network
	    	}
	    	tokensArr.push(obj);
	    })
	    const data = {
	    	total: tokensArr.length,
	    	tokens: tokensArr
	    }
	    console.log('tableData',tableData);
	    fs.writeFile(`${__dirname}/json/tokensniffer-scam-tokens.json`, JSON.stringify(data), console.error);
	    return true;
	}
  });
}

readFiles();
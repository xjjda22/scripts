//etherscanScrapper

//npm install tabletojson
//npm install fs

const fs = require('fs');
const tabletojson = require('tabletojson').Tabletojson;

// const site = "https://etherscan.io/accounts/label/compound";	

const readFiles = async (s, n) => {
  tabletojson.convertUrl(s)
  .then( (tableData) => {
  	if (!tableData) {
		console.error(`error fetching data from : ${tableData}`);
	    return false;
	} else {
	    console.log('writing files -- ');
	    let tokensArr = [];
	    tableData[0].map(t =>{
	    	let obj = {
	    		"address": t.Address,
          "name": t['Name Tag']
	    	}
	    	tokensArr.push(obj);
	    })
	    const data = {
	    	total: tokensArr.length,
	    	tokens: tokensArr
	    }
	    console.log('tableData',tableData);
	    fs.writeFile(`${__dirname}/json/etherscan-sniffer-${n}-tokens.json`, JSON.stringify(data), console.error);
	    return true;
	}
  });
}

readFiles("https://etherscan.io/accounts/label/compound","compound");
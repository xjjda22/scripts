//4byteEventsApi
//npm install fs
//npm install axios

//ex - node fetchTokens.js

const fs = require('fs');
const axios = require('axios');

const siteUrl = "https://www.4byte.directory/api/v1/event-signatures/?format=json";

const validURL = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

const readFiles = async (_eventsArr, _n) => {
  const sturl = _n == 0 ? siteUrl : _n;

  const config = {
    timeout: 30000,
    url: sturl,
    method: 'get',
    responseType: 'json'
  };

  let { data : { results , next } }  = await axios(config);
  console.log('continue', next);

  if(results.length > 0) {
  	_eventsArr = _eventsArr.concat(results);
  }
  
  if(validURL(next)){
  	readFiles(_eventsArr, next);
  	return true;
  }

  if (!_eventsArr) {
    console.error(`error fetching results from ${this.name}: ${error}`);
    return false;
  } else {
    console.log('writing files -- ');
    const resultsObj = {
    	"results":_eventsArr,
    	"count":_eventsArr.length,
    }
    console.log('resultsObj',resultsObj);
    fs.writeFile(`${__dirname}/json/4byte-events.json`, global.JSON.stringify(resultsObj), console.error);
    return true;
  }
}

let eventsArr = [];
let n = 0;
readFiles(eventsArr, n);
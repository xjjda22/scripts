const axios = require('axios');
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const API_URL = 'https://blocks.flashbots.net/v1/blocks';

const getBlocks = async (params, debug) => {
  params.limit = '10';
  const fburl = `${API_URL}/?${new URLSearchParams(params)}`;

  const config = {
    timeout: 30000,
    url: fburl,
    method: 'get',
    responseType: 'json'
  };
  const res = await axios(config);
  const { blocks } = res.data;

  const bblocks =  blocks.map(block => transformBundle(block));
  if(debug) console.log('blocks --',deepLogs(bblocks));
  return bblocks;
}

const getSubBundles = (bundle) => {
  return bundle.transactions.reduce((acc, curr) => {
    if (acc[curr.bundle_index]) {
      acc[curr.bundle_index].push(curr);
    } else {
      acc[curr.bundle_index] = [curr];
    }
    return acc;
  }, []);
}

const transformBundle = (bundle) => {
  bundle.transactions = getSubBundles(bundle);
  return bundle;
}

// console.log('start --');
// getBlocks({}, true);

module.exports = {
  getBlocks
}
return;

// cryptoPunksTxs
// curl --data '{"method":"txpool_inspect","id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST https://api.archivenode.io/
require('dotenv').config();
const { providers, utils } = require("ethers");

const { INFURA_APIKEY, ARCHIVENODE_APIKEY } = process.env;
const CRYPTOPUNKS_CONT = '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb';
const addr = CRYPTOPUNKS_CONT.toLowerCase();

const ETHEREUM_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_APIKEY}`;

const provider = new providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.JsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.getDefaultProvider(ETHEREUM_RPC_URL);

console.log('start --');
console.log('ETHEREUM_RPC_URL',ETHEREUM_RPC_URL);
provider.on("block", async (blockNumber) => {
    console.log('blockNumber',blockNumber);
});
provider.on("pending", async (tx) => {
    console.log('listen --');
    console.log('tx:',tx );

    setTimeout(async () => {
    try {
       let tx = await provider.getTransaction(txHash);
       if (tx && tx.to && tx.to.toLowerCase() === addr) {
            console.log('tx hash: ',txHash );
            console.log('tx confirmation index: ',tx.transactionIndex );// 0 when transaction is pending
            console.log('tx from: ',tx.from );
            console.log('tx amount (in ether): ',utils.fromWei(tx.value, 'ether'));
            console.log('tx receiving date/time: ',new Date());
        }
    } catch (err) {
        console.error(err);
    }
  }, 15 * 1000); // running at 15 seconds
});

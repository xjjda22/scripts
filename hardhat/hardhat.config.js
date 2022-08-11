// hardhat.config.js
const path = require('path');
require('dotenv').config({path:path.resolve('../', '.env')});
const fs = require("fs");
require("@nomiclabs/hardhat-waffle");

const { INFURA_APIKEY } = process.env;

const defaultNetwork = "mainnet";
const mainnetGwei = 21;

const mnemonic = () => {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim();
  } catch (e) {
    if (defaultNetwork !== "localhost") {
      console.log(
        "☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`."
      );
    }
  }
  return "";
}
module.exports = {
	defaultNetwork,
	networks: {
	    localhost: {
	      url: "http://localhost:8545",
	    },
	    mainnet: {
	      url: "https://mainnet.infura.io/v3/"+INFURA_APIKEY, // <---- YOUR INFURA ID! (or it won't work)
	      //      url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXXXX/eth/mainnet", // <---- YOUR MORALIS ID! (not limited to infura)
	      gasPrice: mainnetGwei * 1000000000,
	      // accounts: {
	      //   mnemonic: mnemonic(),
	      // },
	    },
	    xdai: {
	      url: "https://rpc.xdaichain.com/",
	      gasPrice: 1000000000,
	      // accounts: {
	      //   mnemonic: mnemonic(),
	      // },
	    },
	},
	solidity: {
	    compilers: [
	      {
	        version: "0.8.4",
	        settings: {
	          optimizer: {
	            enabled: true,
	            runs: 200,
	          },
	        },
	      },
	      {
	        version: "0.6.7",
	        settings: {
	          optimizer: {
	            enabled: true,
	            runs: 200,
	          },
	        },
	      },
	    ],
	},
	namedAccounts: {
	    deployer: {
	      default: 0, // here this will by default take the first account as deployer
	    },
	}
};
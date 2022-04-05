// findVanityAddress
const path = require('path');
require('dotenv').config({path:path.resolve('../', '.env')});
const fs = require('fs');

const axios = require('axios');
const { providers, utils, Wallet } = require("ethers");
const { artifacts, ethers } = require("hardhat");
const { inspect }  = require('util');

const deepLogs = (obj) => {
  return inspect(obj, {depth: 5});
}

const { INFURA_APIKEY, ARCHIVENODE_APIKEY, ETHERSCAN_APIKEY } = process.env;
const ETHERSCAN_ABI_ENDPOINT = a => `https://api.etherscan.io/api?module=contract&action=getabi&address=${a}&apikey=${ETHERSCAN_APIKEY}`;

// const ETHEREUM_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_APIKEY}`;
const ETHEREUM_RPC_URL = `https://api.archivenode.io/${ARCHIVENODE_APIKEY}`;

const provider = new providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.JsonRpcProvider(ETHEREUM_RPC_URL);
// const provider = new providers.getDefaultProvider(ETHEREUM_RPC_URL);

console.log('start --');
console.log('ETHEREUM_RPC_URL',ETHEREUM_RPC_URL);

const getBlock = async (blockNumber, debug) => {
    const block = await provider.getBlockWithTransactions(blockNumber);
    // if(debug) console.log('block',block);
    return block;
}

const buildCreate2Address = async (creatorAddress, saltHex, byteCode, debug) => {
  try{
    let c;
    c =  utils.getAddress(
      '0x' +
        utils.solidityKeccak256(
          ['bytes'],
          [
            `0xff${
              creatorAddress.slice(2)
            }${
              saltHex.slice(2)
            }${
              byteCode.slice(2)
            }`,
          ]
        ).slice(-40)
    );

    // c = utils.getAddress(
    //   '0x' +
    //     utils.solidityKeccak256(
    //       ['bytes'],
    //       [
    //         `0xff${creatorAddress.slice(2)}${saltHex.slice(
    //           2
    //         )}${utils.solidityKeccak256(['bytes'], [byteCode]).slice(2)}`,
    //       ]
    //     ).slice(-40)
    // );

    if(debug) console.log(c);
    return c;
  } catch (e){
    console.log(e);
  }
}

const getCreate2Address = async (creatorAddress, saltHex, byteCode, debug) => {
  try{
    let c;
    c = await utils.getCreate2Address(creatorAddress, saltHex, byteCode);
    // c = await buildCreate2Address(creatorAddress, saltHex, byteCode);
    // if(debug) console.log('create2 ', c);
    return c;
  } catch (e){
    console.log(e);
  }
}

const getSalt = async (inc, debug) => {
  try{
    let s = inc;
    // s = await utils.formatBytes32String(s);
    // s = await utils.keccak256(utils.toUtf8Bytes(s));
    s = utils.hexlify(utils.hexZeroPad(s, 32));
    // if(debug) console.log('salt ', s, utils.isHexString(s));
    return s;
  } catch (e){
    console.log(e);
  }
}

const getByteCode = async (c, debug) => {
  try{
    let bc;
    bc = await artifacts.readArtifact(c);
    bc = bc.bytecode;
    bc = utils.solidityKeccak256(['bytes'], [bc]);
    // if(debug) console.log('byteCode', bc, utils.isHexString(bc));
    return bc ? bc : null;
  } catch (e){
    console.log(e);
  }
};

const runVanityAddress = async (creatorAddress, contractName, z, inc, num, debug) => {
    let c2Arr= []
    let c2 = "",c2m = 0;
    let saltHex = "";
    let byteCode = await getByteCode(contractName, debug);

    num = inc+num;

    for(inc; inc < num;) {
        inc++;
        saltHex = await getSalt(inc, debug);
        c2 = await getCreate2Address(creatorAddress, saltHex, byteCode, debug);
        // c2 = c2.substring(2,7);
        c2m = c2.substring(2,7).match(/^0+/);
        c2m = c2m ? c2m[0].length : 0;
        if(c2m >= z){
          c2Arr.push({
            salt:inc,
            address:c2
          })
        }
    };
    console.log('c2Arr', inc, c2Arr);
}

// sample contract ./YourContract.sol
// npx hardhat compile

// const contractCode = `contract YourContract {
//   event SetPurpose(address sender, string purpose);
//   string public purpose = "Building Unstoppable Apps!!!";
//   constructor() payable {
//     // what should we do on deploy?
//   }
//   function setPurpose(string memory newPurpose) public {
//       purpose = newPurpose;
//       // console.log(msg.sender,"set purpose to",purpose);
//       emit SetPurpose(msg.sender, purpose);
//   }
//   // to support receiving ETH by default
//   receive() external payable {}
//   fallback() external payable {}
// }`;

const contractOwnerAddress = Wallet.createRandom().address;
// const contractOwnerAddress = new ethers.Wallet("0x0123456789012345678901234567890123456789012345678901234567890123").address;
const contractName = "YourContract";
const leadingZeros = 4;

runVanityAddress(contractOwnerAddress, contractName, leadingZeros, 1, 500000, true);

module.exports = {
  runVanityAddress
}
return;


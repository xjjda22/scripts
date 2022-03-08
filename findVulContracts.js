// findVulContracts

// https://github.com/eveem-org/panoramix
// https://github.com/ConsenSys/mythril
// https://github.com/trailofbits/manticore
// https://github.com/crytic/slither
// https://github.com/crytic/pyevmasm
// https://github.com/tintinweb/ethereum-dasm
// https://github.com/Arachnid/evmdis

// https://github.com/MrLuit/evm
// https://github.com/MrLuit/selfdestruct-detect

// https://github.com/statechannels/bytecode-debugger
// https://github.com/0xalpharush/evm-disassembler


// myth analyze -a 0x41f83F6F25Eb0D3eB9615Ab7BbBf995E7f7fbA4F --infura-id 460f40a260564ac4a4f4b3fffb032dad
// python3 -m ethereum_dasm -a 0x41f83F6F25Eb0D3eB9615Ab7BbBf995E7f7fbA4F
// slither mycontract.sol
// python3 panoramix.py 0x41f83F6F25Eb0D3eB9615Ab7BbBf995E7f7fbA4F
// python3 -m ethereum_dasm -a 0x41f83F6F25Eb0D3eB9615Ab7BbBf995E7f7fbA4F -A --no-color 

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { providers, utils } = require("ethers");
const { Interface } = require("@ethersproject/abi");
const { addABI, getABIs } = require("abi-decoder");
const { EVM } = require("evm");
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

const STOP = 0x00;
const JUMPDEST = 0x5b;
const PUSH1 = 0x60;
const PUSH32 = 0x7f;
const RETURN = 0xf3;
const REVERT = 0xfd;
const INVALID = 0xfe;
const SELFDESTRUCT = 0xff;

const isHalting = (opcode) => [ STOP, RETURN, REVERT, INVALID, SELFDESTRUCT ].includes(opcode);
const isPUSH = (opcode) => opcode >= PUSH1 && opcode <= PUSH32;

const checkSelfdestruct = (code) => {
    const bytecode = Buffer.from(code, 'hex');
    let halted = false;
    for (let index = 0; index < bytecode.length; index++) {
        const opcode = bytecode[index];
        if(opcode === SELFDESTRUCT && !halted) {
            return true;
        } else if(opcode === JUMPDEST) {
            halted = false;
        } else if(isHalting(opcode)) {
            halted = true;
        } else if(isPUSH(opcode)) {
            index += opcode - PUSH1 + 0x01;
        }
    }
    return false;
}

const getBlockNumber = async (n, debug) => {
    const blockNumber = await provider.getBlockNumber();
    const blocksPerDay = 6600;
    LATEST_BLOCK = blockNumber;
    START_SCANNED_BLOCK = blockNumber - (n * blocksPerDay);
    if(debug) console.log('latest block',blockNumber);
    if(debug) console.log('blocks not scanned',START_SCANNED_BLOCK);
    readNumOfBlocks(START_SCANNED_BLOCK, 0, PENDING_BLOCK_SCANNED, 2000, true);
    return blockNumber;
}

const getBlock = async (blockNumber, debug) => {
    const block = await provider.getBlockWithTransactions(blockNumber);
    // if(debug) console.log('block',block);
    return block;
}

const getABI = async (a, debug) => {
  
  const api_url = ETHERSCAN_ABI_ENDPOINT(a);
  // if(debug) console.log('api -- ',api_url);

  const config = {
    timeout: 30000,
    url: api_url,
    method: 'get',
    responseType: 'json'
  };
  const res = await axios(config);
  const data = res.data;
  // if(debug) console.log('data -- ',api_url, deepLogs(data) );
  if(debug) {
    if(res.status != 200) console.log('res --', deepLogs(data) );
  }
  return data;
}

const readBlock = async (blockNumber, debug) => {
    
    let contract_trs = [];
    if(debug) console.log('block',blockNumber);

    let block = await getBlock(blockNumber);
    let txs = block.transactions;
    let j=0;
    for(j=0;j<txs.length;j++){
        let t = txs[j];
        // if(debug) console.log('j',j);
        if(t.to == null || t.to == 0){
            // if(debug) console.log('contract trx',t);
            let a = t.creates ? utils.getAddress(t.creates) : null;
            // if(debug) console.log('contract add',a);
            
            let evm = new EVM(t.data);
            if(evm){
                // t.byteCode = evm.getBytecode();
                t.opCodes = evm.getOpcodes();
                t.jumpDestinations = evm.getJumpDestinations();
                t.interpretedCodes = evm.parse();
                t.solCodes = evm.decompile();

                t.selfDestruct  = checkSelfdestruct(t.data);

                if(t.selfDestruct) contract_trs.push(t);
            }
        }
    }
    if(debug) console.log('contract creation trxs', deepLogs(contract_trs));
    if(contract_trs.length > 0){
        contract_trs.map( async c => {
            let cobj = {
                "block":c.blockNumber,
                "hash": c.hash, 
                "address": c.creates,
                "byteCode": c.data,
                "opCodes": c.opCodes,
                "jumpDestinations": c.jumpDestinations,
                "interpretedCodes": c.interpretedCodes,
                "solCodes": c.interpretedCodes,
                "selfDestruct": c.selfDestruct

            }
            let vulContractsArr = await require(`./ethereum-mainnet-contracts/vul-contracts-clones.json`);
            vulContractsArr.push(cobj);
            if(debug) console.log('vulContractsArr ',vulContractsArr);

            // save vul contracts
            await fs.writeFile(`${__dirname}/ethereum-mainnet-contracts/verified-contracts-clones.json`, JSON.stringify(vulContractsArr), console.error);

            // save vul contract abi
            await fs.writeFile(`${__dirname}/ethereum-mainnet-contracts/${c.blockNumber}-${c.creates}.json`, JSON.stringify(c), console.error);

        })
    }
}

const readNumOfBlocks = async (blockNumber, inc, num, inter, debug) => {
    setTimeout(() => {
        inc++;
        // if(debug) console.log('blockNumber' ,blockNumber+inc);
        blockNumber+inc < blockNumber+num ? readNumOfBlocks(blockNumber, inc, num, inter, debug) : null;
        readBlock(blockNumber+inc, true);
    },inter);
}

let LATEST_BLOCK = 0, START_SCANNED_BLOCK = 0, PENDING_BLOCK_SCANNED = 20000;

getBlockNumber(3, true);
// readNumOfBlocks(14325849-1, 0, 1, 2000, true);

module.exports = {
  readNumOfBlocks
}
return;


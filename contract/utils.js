var fs = require('fs');
var Web3 = require('web3');
var solc = require('solc');

function compileContract(contractFile, contractName) {
  let contractCode = fs.readFileSync(contractFile, 'UTF-8'); 

  let input = {
    language: 'Solidity',
    sources: {
      'Bank.sol': {
        content: contractCode,
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

  let output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  let artifact = {
    abi: output.contracts['Bank.sol'].DistributedBank.abi,
    bytecode: output.contracts['Bank.sol'].DistributedBank.evm.bytecode.object
  }

  return artifact;
}

function writeArtifact(contractFile, contractName) {
  let artifact = compileContract(contractFile, contractName);
  fs.writeFileSync('DistributedBank.json', JSON.stringify(artifact));
}

async function deployContract(contractFile, contractName) {
  const web3 = new Web3('http://127.0.0.1:8545');
  let accounts = await web3.eth.getAccounts();
  let artifact = compileContract(contractFile, contractName);

  let myContract = new web3.eth.Contract(artifact.abi);
  let deployedContract = await myContract.deploy({ data: artifact.bytecode }).send({ from: accounts[0], gas: 4000000 });

  return deployedContract;
}

module.exports = { compileContract, deployContract, writeArtifact };

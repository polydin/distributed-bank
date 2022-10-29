var Web3 = require('web3')
var web3 = new Web3('http://127.0.0.1:8545');
var accounts = await web3.eth.getAccounts();
var utils = require('./utils');

const dbank = await utils.deployContract('DistributedBank.sol', 'DistributedBank');

dbank.methods.exchange().send({ from: accounts[0], gas: 200000, value: web3.utils.toWei('10', 'ether') }).then(tx => {
  return dbank.methods.exchange().send({ from: accounts[1], gas: 200000, value: web3.utils.toWei('10', 'ether') })
}).then(tx => {
  return dbank.methods.proposeSupplyChange(10, true).send({ from: accounts[0], gas: 500000 })
})

async function getProposals() {
  let numProposals = await dbank.methods.proposalsLength().call()
  let proposals = []
  for (let i=0; i<numProposals; i++) {
    let p = await dbank.methods.proposals(i).call()
    let trimmed_p = {
      totalVoteCount: p.totalVoteCount,
      supplyChange: p.supplyChange,
      voteCount: p.voteCount,
      done: p.done,
      increase: p.increase,
      blockNum: p.blockNum,
    }
    proposals.push(trimmed_p)
  }
  return proposals
}

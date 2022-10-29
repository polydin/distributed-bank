// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
pragma experimental ABIEncoderV2;

contract DistributedBank {

  constructor() {
    proposalsLength = 0;
    // TODO: this is hardcoded for now but needs to be changed so that it varies according
    // to a market clearing mechanism
    exchangeRate = 757575757575757;
  }

  /***
    Currency Operations 
   */
  uint public totalSupply;
  uint public exchangeRate;

  function exchange() public payable {
    uint nTokens = msg.value / exchangeRate; 
    if (owners[msg.sender].isOwner) {
      updateOwner(msg.sender, owners[msg.sender].value + nTokens);
    } else {
      newOwner(msg.sender, nTokens);
    }
    totalSupply += nTokens;
  }

  function balanceOf(address owner) public view returns (uint balance) {
    return owners[owner].value;
  }

  function transfer(address from, address to, uint value) public {
    assert(from == msg.sender);
    owners[from].value -= value;
    owners[to].value += value;
  }

  /**
    Dynamic array of currency owners
   */
  mapping(address => Owner) private owners;
  address[] private ownersList;

  struct Owner {
    uint value;
    bool isOwner;
  } 

  function isOwner(address _address) public view returns (bool _isOwner) {
    return owners[_address].isOwner;
  }
 
  function getOwnerCount() public view returns (uint ownerCount) {
    return ownersList.length;
  }

  function newOwner(address ownerAddress, uint initValue) public returns (uint rowNumber) {
    if (isOwner(ownerAddress)) revert();
    owners[ownerAddress].value = initValue;
    owners[ownerAddress].isOwner = true;
    ownersList.push(ownerAddress);
    return ownersList.length - 1;
  }

  function updateOwner(address ownerAddress, uint newValue) public returns (Owner memory updatedOwner) {
    if (!isOwner(ownerAddress)) revert();
    owners[ownerAddress].value = newValue;
    return owners[ownerAddress];
  }

  /**
    Monetary Policy Operations 
   */

  struct Vote {
    uint voteCount;
    bool voted;
  }

  struct Proposal {
    uint supplyChange;
    uint totalVoteCount;
    uint voteCount;
    bool done;
    bool increase;
    uint blockNum;
    mapping(address => Vote) numVotes;
  }

  struct ProposalDAO {
    uint id;
    uint supplyChange;
    uint voteCount;
    bool done;
    bool increase;
    uint blockNum;
  }

  mapping(uint => Proposal) public proposals; 
  uint public proposalsLength;

  function proposeSupplyChange(uint value, bool increase) public returns (uint proposalId) {
    proposalId = proposalsLength++;
    Proposal storage proposal = proposals[proposalId];
    proposal.totalVoteCount = totalSupply;
    proposal.supplyChange = value;
    proposal.voteCount = 0;
    proposal.done = false;
    proposal.increase = increase;
    proposal.blockNum = block.number;
    for (uint i=0; i<ownersList.length; i++) {
      proposal.numVotes[ownersList[i]] = Vote({ voteCount: owners[ownersList[i]].value, voted: false });
    } 
  }

  function getVote(uint proposalNum, address owner) view public returns(Vote memory) {
    Proposal storage proposal = proposals[proposalNum];
    return proposal.numVotes[owner];
  }

/**
  -- Currently being handled externally, this function does not compile and must be debugged
 
  function getProposals() public view returns(ProposalDAO[] memory) {
    ProposalDAO[] memory proposalDAOs;
    for (uint i=0; i<proposalsLength; i++) {
      Proposal storage proposal = proposals[i];
      ProposalDAO memory proposalDAO = ProposalDAO({
        id: i,
        supplyChange: proposal.supplyChange,
        voteCount: proposal.voteCount,
        done: proposal.done,
        increase: proposal.increase,
        blockNum:  proposal.blockNum
      });
      proposalDAOs.push(proposalDAO);
    }
    return proposalDAOs;
  }
*/

  function getOwners() public view returns(address[] memory) {
    return ownersList;
  }

  function vote(uint proposalNum) public {
    Proposal storage proposal = proposals[proposalNum];
    assert(proposal.done == false);
    assert(proposal.numVotes[msg.sender].voted == false);
    proposal.voteCount += proposal.numVotes[msg.sender].voteCount; 
    proposal.numVotes[msg.sender].voted = true;
  }

  function endProposal(uint proposalNum) public returns (bool ok) {
    assert(proposals[proposalNum].done == false);
    assert((block.number - proposals[proposalNum].blockNum) > 5);
    Proposal storage proposal = proposals[proposalNum];
    // TODO: Change this to apply totalSupply at proposal creation and use
    //       instead
    uint supplyChange = proposal.supplyChange;
    uint totalVoteCount = proposal.totalVoteCount;
    if (proposal.voteCount >= (totalVoteCount * 9) / 10) {
      if ( (totalVoteCount > 100) && !proposal.increase) {
        totalSupply = 0;
	      return true;
      }

      uint sum = 0;
      if (proposal.increase) {
        for (uint i=0; i<getOwnerCount(); i++) {
          uint oldValue = owners[ownersList[i]].value;
          owners[ownersList[i]].value = oldValue + (oldValue * totalVoteCount / 100);
          sum += owners[ownersList[i]].value;
        }
        totalSupply = sum;
      } else if (!proposal.increase) {
        for (uint i=0; i<getOwnerCount(); i++) {
          uint oldValue = owners[ownersList[i]].value;
          owners[ownersList[i]].value = oldValue - (oldValue * totalVoteCount / 100);
          sum += owners[ownersList[i]].value;
        }
        totalSupply = sum;
      }
      proposal.done = true;
      return true;
    }
    proposal.done = true;
    return true;
  }
}

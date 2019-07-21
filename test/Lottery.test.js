const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
provider.setMaxListeners(15);
const web3 = new Web3(provider);
const lotteryContract = require('../build/contracts/Lottery');
const lotteryContractInterface = lotteryContract['abi'];
const lotteryContractBytecode = lotteryContract['bytecode'];
const storageContract = require('../build/contracts/Storage');
const storageContractInterface = storageContract['abi'];
const storageContractBytecode = storageContract['bytecode'];

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  manager = accounts[0];
  // The Contract
  // create contract instance based on Application Binary Interface (ABI)
  const lotteryContractInstance = new web3.eth.Contract(lotteryContractInterface);
  const storageContractInstance = new web3.eth.Contract(storageContractInterface);
  
  // deploy the contract passing initial value to constructor
  const deployedStorage = storageContractInstance.deploy({
  	data: storageContractBytecode
  });
  
  // const deployedLottery = lotteryContractInstance.deploy({
  //   data: lotteryContractBytecode,
  //   arguments: deployedStorage.address
  // });


  // Use the first account to deploy
  //lottery = await deployedLottery.send({ from: manager, gas: '5000000' })
  stor = await deployedStorage.send({ from: manager, gas: '5000000' })
});

describe('Auction', () => {  
	it('test', async () => {
	    //const auctionManager = await lottery.methods.manager().call();
	    assert.equal(2, 1, "test");
	});  //Continue from this line from now on...
});
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
  
    // Use the first account to deploy
  stor = await deployedStorage.send({ from: manager, gas: '5000000' })
  const storAddress = await stor.methods.owner().call();

  const deployedLottery = lotteryContractInstance.deploy({
     data: lotteryContractBytecode,
     arguments: [storAddress]
  });

  lottery = await deployedLottery.send(storAddress, { from: manager, gas: '5000000' })
});

describe('Lottery', () => {  
	it('Ownership test', async () => {
		const owner = await lottery.methods.owner().call();
	    assert.equal(manager, owner, "The manager is the one who launches the smart contract.");
	});
	it('Selling tickets', async () => {
		const ticketsToBuy = 2;
		const startingNumberOfTickets = await lottery.methods.tickets().call();
		await lottery.methods.play(ticketsToBuy).send({from: accounts[1], value: web3.utils.toWei(ticketsToBuy.toString(), 'ether'), gas:100000});
		const numberOfTicketsAfterPurchase = await lottery.methods.tickets().call();
		assert.equal(numberOfTicketsAfterPurchase, startingNumberOfTickets - ticketsToBuy, "Contract did not decrease number of available tickets.");
		
	});
	it('Add player to playerList', async () => {
		const buyer = accounts[2];
		await lottery.methods.play(2).send({from: accounts[2], value: web3.utils.toWei('2', 'ether'), gas:100000});
		const playerList = await lottery.methods.getPlayers().call();
		assert.equal(playerList[0], buyer, "Player was not added to players list.")
	});

});
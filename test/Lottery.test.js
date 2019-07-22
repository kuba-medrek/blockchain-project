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
  const storAddress = await stor._address;

  const deployedLottery = lotteryContractInstance.deploy({
     data: lotteryContractBytecode,
     arguments: [storAddress]
  });

  lottery = await deployedLottery.send(storAddress, { from: manager, gas: '5000000' })
});

describe('Storage', () => {  
	it('Ownership test', async () => {
		const owner = await stor.methods.owner().call();
	    assert.equal(manager, owner, "The manager is the one who launches the smart contract.");
	});

	it('Storage is empty', async () => {
		const contractAddress = stor._address
		storageBalance = await web3.eth.getBalance(contractAddress);
		assert.equal(storageBalance, 0, "Storage should be empty at the begining.");
	});

	const ethTransfered = 10;
	it('Check eth payment acceptance', async () =>{
		const contractAddress = stor._address;
		await stor.methods.getPaid().send({from: accounts[1], gas: "5000000", value: web3.utils.toWei(ethTransfered.toString(), 'ether')});
		storageBalance = await web3.eth.getBalance(contractAddress);
		assert.equal(storageBalance, web3.utils.toWei(ethTransfered.toString(), 'ether'), "Money was not transfered to contract");		
	});

	it('Payout money from storage to owner', async () => {
		await stor.methods.getPaid().send({from: accounts[1], gas: "5000000", value: web3.utils.toWei(ethTransfered.toString(), 'ether')});
		managerBalance = await web3.eth.getBalance(manager);
		await stor.methods.withdrawEth(web3.utils.toWei(ethTransfered.toString(), 'ether')).send({from: manager, gas: "5000000"});
		managerBalanceAfterWithdraw = await web3.eth.getBalance(manager);
		assert(managerBalance - web3.utils.toWei(ethTransfered.toString(), 'ether') < managerBalanceAfterWithdraw, "Manager balance did not change.");
	});
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
		await lottery.methods.play(2).send({from: accounts[2], value: web3.utils.toWei('2', 'ether'), gas:5000000});
		const playerList = await lottery.methods.getPlayers().call();
		assert.equal(playerList[0], buyer, "Player was not added to players list.");
	});

	it('Store winner address', async () => {
		const buyer = accounts[2];
		await lottery.methods.play(15).send({from: buyer, value: web3.utils.toWei('15', 'ether'), gas:5000000});
		const winnerList = await lottery.methods.getWinners().call();
		assert.equal(winnerList[0], buyer, "Player was not added to winner list.");
	});

	it('Payout to the winner', async () => {
		const buyer = accounts[2];
		accountBalnce = await web3.eth.getBalance(buyer);
		await lottery.methods.play(15).send({from: buyer, value: web3.utils.toWei('15', 'ether'), gas:5000000});
		accountBalnceAfterWinning = await web3.eth.getBalance(buyer);
		assert(accountBalnce - web3.utils.toWei('15', 'ether') < accountBalnceAfterWinning, "Winner did not receive money.");
	});

	it('Transfer part of winning sum to storage', async () => {
		const buyer = accounts[2];
		const storageAddress = stor._address;
		storageBalance = await web3.eth.getBalance(storageAddress);
		await lottery.methods.play(15).send({from: buyer, value: web3.utils.toWei('15', 'ether'), gas:5000000});
		storageBalanceAfterGame = await web3.eth.getBalance(storageAddress);
		assert(storageBalance < storageBalanceAfterGame, "Money was not transfered to storage.");
	});
});

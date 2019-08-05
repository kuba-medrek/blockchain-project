const bcrypt = require('bcrypt');
const Web3 = require ('web3');
const jsonfile = require('jsonfile');

const truffleConf = require('../../truffle-config');
const web3 = new Web3(`ws://${truffleConf.networks.development.host}:${truffleConf.networks.development.port}`);

module.exports = {
	loginUser: async (login, password, db, ctx) => {
		const accounts = await web3.eth.getAccounts();
		if(accounts.indexOf(login) === -1) {
			ctx.throw(400, 'No such account');
		}
		const user = db.findOne({'login': login});
		if(!user) {
			const passwordHash = await bcrypt.hash(password, 10);
			const token = require('crypto').randomBytes(64).toString('hex');

			db.insert({ login : login, password: passwordHash, token: token});
			ctx.cookies.set('bp_token', token);

			return {
				status: 201,
				token: token
			};
		}
		if(!await bcrypt.compare(password, user.password)) {
			ctx.throw(401, 'Bad creditentials');
		}

		const token = require('crypto').randomBytes(64).toString('hex');
		user.token = token;
		db.update(user);
		ctx.cookies.set('bp_token', token);

		return {
			status: 200,
			token: token
		};
	},

	balance: async address => {
		const wei = await web3.eth.getBalance(address);
		return web3.utils.fromWei(wei);
	},

	buyTokens: async (who, gameId, amount) => {
		// console.log('BUYING: ', who, gameId, amount);

		const trx = {
			from: who,
			to: await getAddress(gameId),
			value: web3.utils.toWei(amount.toString()),
			gasLimit: '1000000'
		};

		const contract = new web3.eth.Contract(
			(await jsonfile.readFile(`${__dirname}/../../build/contracts/Lottery.json`)).abi,
			await getAddress(gameId)
		);
		
		return contract.methods.play(amount).send(trx);
	},

	gameDetails: async(gameId) => { //gameId not used
		const contract = new web3.eth.Contract(
			(await jsonfile.readFile(`${__dirname}/../../build/contracts/Lottery.json`)).abi,
			await getAddress(gameId)
		);
		
		return {
			balance: web3.utils.fromWei((await contract.methods.getBalance().call()).toString()),
			counter: undefined, //await contract.gamesPlayed.call(),
			players: await contract.methods.getNumberOfPlayers().call()
		};
	}
};

const getAddress = async () => {
	const file = `${__dirname}/../../build/contracts/Lottery.json`;
	const networkId = truffleConf.networks.development.network_id;

	const addr = (await jsonfile.readFile(file)).networks[networkId].address;
	
	return addr;
};

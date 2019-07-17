const bcrypt = require('bcrypt');
const Web3 = require ('web3');

const web3 = new Web3('ws://127.0.0.1:8545');

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
	}
};

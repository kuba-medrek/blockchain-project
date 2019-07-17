const Router = require('koa-router');
const controller = require('./controllers/game');
const games = require('../games-config');

const unauthorised = new Router();
const authorised = new Router();

unauthorised.get('/', async ctx => {
	await ctx.render('home', {
		games: games.map(fillGameDetails),
		account: ctx.state.account ? await fillAccountDetails(ctx.state.account) : undefined
	});
});

unauthorised.get('/login', async ctx => {
	await ctx.render('login', {
		games: games.map(fillGameDetails)
	});
});

authorised.get('/logout', async ctx => {
	ctx.cookies.set('bp_token');
	await ctx.render('home', {
		games: games.map(fillGameDetails)
	});
});

authorised.get('/game/:name', async ctx => {
	const game = games.map(fillGameDetails).filter(game => game.simpleName === ctx.params.name)[0];
	const stats = {
		counter: 0
	};

	if(!game) {
		ctx.throw(400, 'No such game');
		await ctx.render('error', {
			games: games.map(fillGameDetails),
			account: await fillAccountDetails(ctx.state.account)
		});
	}
	
	await ctx.render('game', {
		game: game,
		stats: stats,
		games: games.map(fillGameDetails),
		account: await fillAccountDetails(ctx.state.account)
	});
});

const fillAccountDetails = async account => {
	return {
		name: account.address,
		balance: await controller.balance(account.address)
	};
};

const fillGameDetails = game => {
	const soldTickets = 1;
	const address = 'xxx';
	return {
		...game,
		...{
			totalValue: game.totalTickets * game.ticketPrice,
			soldTickets: soldTickets,
			percentageSold: soldTickets / game.totalTickets,
			address: address
		}
	};
};

module.exports = {unauthorised, authorised};

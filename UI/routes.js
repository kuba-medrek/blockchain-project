const Router = require('koa-router');
const controller = require('./controllers/game');
const games = require('../games-config');

const unauthorised = new Router();
const authorised = new Router();

unauthorised.get('/', async ctx => {
	await ctx.render('home', {
		games: await Promise.all(games.map(fillGameDetails)),
		account: ctx.state.account ? await fillAccountDetails(ctx.state.account) : undefined
	});
});

unauthorised.get('/login', async ctx => {
	await ctx.render('login', {
		games: await Promise.all(games.map(fillGameDetails))
	});
});

authorised.get('/logout', async ctx => {
	ctx.cookies.set('bp_token');
	await ctx.render('home', {
		games: await Promise.all(games.map(fillGameDetails))
	});
});

authorised.get('/game/:name', async ctx => {
	const game = (await Promise.all(games.map(fillGameDetails))).filter(game => game.simpleName === ctx.params.name)[0];

	if(!game) {
		ctx.throw(400, 'No such game');
		await ctx.render('error', {
			games: await Promise.all(games.map(fillGameDetails)),
			account: await fillAccountDetails(ctx.state.account)
		});
	}
	
	await ctx.render('game', {
		game: game,
		games: await Promise.all(games.map(fillGameDetails)),
		account: await fillAccountDetails(ctx.state.account)
	});
});

authorised.post('/api/buy', async ctx => {
	const body = ctx.request.body;
	controller.buyTokens(ctx.state.account.address, body.game, body.amount);

	ctx.body = {status: 'ok'};
	ctx.status = 200;
});

const fillAccountDetails = async account => {
	return {
		name: account.address,
		balance: await controller.balance(account.address)
	};
};

const fillGameDetails = async game => {
	const gamedetails = await controller.gameDetails();
	// console.log(gamedetails);
	const {balance, counter, players} = gamedetails;
	return {
		...game,
		...{
			totalValue: game.totalTickets * game.ticketPrice,
			soldTickets: balance / game.ticketPrice,
			percentageSold: (balance / game.ticketPrice) / game.totalTickets,
			counter: counter,
			players: players
		}
	};
};

module.exports = {unauthorised, authorised};

const Router = require('koa-router');
const controller = require('./controllers/game');
const games = require('../games-config');

const unauthorised = new Router();
const authorised = new Router();

unauthorised.get('/', async ctx => {
	await ctx.render('home', {
		games: games.map(fillDetails)
	});
});

unauthorised.get('/login', async ctx => {
	await ctx.render('login', {
		games: games.map(fillDetails)
	});
});

authorised.get('/game/:name', async ctx => {
	const game = games.map(fillDetails).filter(game => game.simpleName === ctx.params.name)[0];
	const stats = {
		counter: 0
	};

	if(!game) {
		ctx.throw(400, 'No such game');
		await ctx.render('error', {
			games: games.map(fillDetails)
		});
	}
	
	await ctx.render('game', {
		game: game,
		stats: stats,
		games: games.map(fillDetails)
	});
});

const fillDetails = game => {
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

const bcrypt = require('bcrypt');

module.exports = {
	loginUser: async (login, password, db, ctx) => {
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
	}
};

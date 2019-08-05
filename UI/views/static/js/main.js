/* eslint-disable no-undef */
async function login() {
	let login = document.getElementById('login');
	let password = document.getElementById('password');

	// console.log(login.value, password.value);

	const result = await fetch('/api/login', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			login: login.value,
			password: password.value
		})
	})
	.then(res => res.json())
	.catch(err => window.alert('Bad password'));

	if(result) {
		window.location = '/';
	}
}

async function buyToken() {
	const tokensNum = document.getElementById('tokens-count');

	const result = await fetch('/api/buy', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			game: window.location.toString().split('/').slice(-1)[0],
			amount: tokensNum.value
		})
	})
	.then(res => res.json());
	
	if(result.status === 'ok') {
		window.alert(`${tokensNum.value} bought`);
		location.reload();
	}
	// console.log(result);
}

function preventOvermax() {
	const button = document.getElementById('buy-token');
	const input = document.getElementById('tokens-count');
	const max = parseInt(input.max);

	if(parseInt(input.value) > max) {
		console.log('disabling');
		button.className = button.className.replace(/active/, 'disabled');
	} else {
		console.log('enabling');
		button.className = button.className.replace(/disabled/, 'active');
	}
}

if(location.toString().indexOf('/game/') > -1) {
	document.getElementById('buy-token').addEventListener('click', buyToken);
	document.getElementById('tokens-count').addEventListener('change', preventOvermax);
} else if(location.toString().indexOf('/login') > -1) {
	document.getElementById('login-button').addEventListener('click', login);
}

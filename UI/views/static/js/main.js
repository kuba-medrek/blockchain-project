/* eslint-disable no-undef */
async function login() {
	let login = document.getElementById('login');
	let password = document.getElementById('password');

	console.log(login.value, password.value);

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
		localStorage.bp_token = result.token;
		// window.cookies
	}
}

document.getElementById('login-button').addEventListener('click', login);

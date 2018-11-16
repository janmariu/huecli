const http = require('http');

const USERNAME = 'xMOIj8mpGZROeXvsL2fNwjBSGDvb0TwwKN2gHAcP'
const HOST = '192.168.1.132'

main();

async function main()
{
	const res = await getLightState(USERNAME, HOST, 1);
	
	console.log(res);
	
	console.log('Main has ended.');
}

async function getLightState(user, hostname, ligth)
{
	return new Promise((resolve, reject) => {
		http.get({
			hostname: hostname,
			port: 80,
			path: `/api/${user}/lights/1`,
			agent: false
		}, (res) => { 
			let result = '';
			res.on('data', (chunk) => { result += chunk });
			res.on('end', () => {
				const json = JSON.parse(result);
				resolve(json);		
			});
		})
	});
}
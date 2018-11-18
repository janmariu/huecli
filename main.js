const http = require('http');

const _config = { 
	hostname : '192.168.1.132', 
	port: 80,
	path: '/api/xMOIj8mpGZROeXvsL2fNwjBSGDvb0TwwKN2gHAcP'
};

main();

async function main()
{
	const roomJson = await getRooms(_config);
	const res = getLightList(roomJson);

	res.map((r) => console.log(r));
	
	console.log('Main has ended.');
}

function getLightList(roomJson)
{
	return Object.values(roomJson).map(
		(room) => room.lights.map(
		  (light) => { return { light: light, room: room.name }; } 
	  )).reduce((reduced, next) => reduced.concat(next));
}

async function getRooms(config)
{
	return new Promise((resolve, reject)=> {
		http.get({
			...config, 
			path: `${config.path}/groups`
		}, (res) => {
			let result = '';			
			res.on('data', (chunk) => {result += chunk});
			res.on('end', () => {
				resolve(JSON.parse(result));
			});
		});	
	});
}

async function getLightState(config, ligth)
{
	return new Promise((resolve, reject) => {
		http.get({
			...config,
			path: `${config.path}/lights/${light}`
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

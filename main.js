const http = require('http');

const _config = { 
	hostname : '192.168.1.132', 
	port: 80,
	path: '/api/xMOIj8mpGZROeXvsL2fNwjBSGDvb0TwwKN2gHAcP'
};

main();

async function main()
{
	let status = await isGroupOn(3, _config);

	if(status)
	{
		toggleGroup(3, _config, false);
	}
	else
	{
		toggleGroup(3, _config, true);
	}

	console.log('Main has ended.');
}

async function isGroupOn(group, config)
{
	const status = await get({ ...config, path: `${config.path}/groups/${group}`})
	return status.state.all_on && status.state.any_on;
}

async function toggleGroup(group, config, newState)
{
	const payload = JSON.stringify({ "on" : newState }); 
	return put({
		...config,
		path: `${config.path}/groups/${group}/action`
	 }, payload); 
}

async function getLightList(config)
{
	const roomJson = await get({ ...config, path: `${config.path}/groups` });

	return Object.values(roomJson).map(
		(room) => room.lights.map(
		  (light) => { return { light: light, room: room.name }; } 
	  )).reduce((reduced, next) => reduced.concat(next));
}

async function getLightState(config, ligth)
{
	return get({...config, path: `${config.path}/lights/${light}`});
}

async function get(config) {
	return new Promise((resolve, reject) => {
		http.get(
			config,		
			(res) => { 
				let result = '';
				res.on('data', (chunk) => { result += chunk });
				res.on('end', () => {
					const json = JSON.parse(result);
					resolve(json);		
				});
			})
		});
}

async function put(config, payload) {
	return new Promise( (resolve, reject) => { 
		let request = http.request({
			...config,			
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': payload.length
			}
		},
		(res) => {
			let result = '';
			res.on('data', (data) => { result += data });
			res.on('error', (data) => console.error(data));
			res.on('end', (data) => resolve(JSON.parse(result)));
		});

		request.write(payload);
		request.end();
	});
}

#!/usr/bin/env node

const http = require('http');

const _config = { 
	hostname : '192.168.1.132', 
	port: 80,
	path: '/api/xMOIj8mpGZROeXvsL2fNwjBSGDvb0TwwKN2gHAcP'
};

cmd();

async function cmd()
{
	if(process.argv.length == 2)
	{
		console.log("Example usage:");
		console.log(`usage: ${process.argv[1]} room`);
		console.log(`usage: ${process.argv[1]} light`);
		console.log(`usage: ${process.argv[1]} room <number> action`);
		console.log(`usage: ${process.argv[1]} light <number> action`);
	}

	//app room -> list available rooms
	if(process.argv[2] === 'room' && !process.argv[3])
	{	
		const rooms = await getLightsForRooms(_config);
		rooms.map((room) => {
			console.log(`${room.roomnumber} ${room.room}`);
		});
	}

	//app room number -> show status for given room.
	if(process.argv[2] === 'room' && process.argv[3] && !process.argv[4]) 
	{
		const on = await isGroupOn(process.argv[3], _config);
		console.log(`Lights in room ${process.argv[3]} are ${on ? 'on' : 'off'}`);
	}

	//app room number on/off -> switch room lights on or off
	if(process.argv[2] === 'room' && process.argv[3] && (process.argv[4] === 'on' 
		|| process.argv[4] === 'off'))
	{
		console.log(`Turning room ${process.argv[3]} ${process.argv[4]}`);
		await toggleGroup(process.argv[3], _config, process.argv[4] === 'on');		
	}	

	if(process.argv[2] === 'light' && !process.argv[3])
	{
		const lights = await getLights(_config);
		lights.map((light) => console.log(`${light.index} ${light.name} ${light.on ? 'on' : 'off'} ${light.online ? 'online' : 'offline'} brightness: ${light.brightness}`));
	}
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

async function getLights(config)
{
	const lights = await get({ ...config, path: `${config.path}/lights` });

	return Object.values(lights).map((light, index) => {
		return { 
		  index: index+1, 
		  name: light.name, 
		  on: light.state.on,
		  online: light.state.reachable,
		  brightness: light.state.bri };
	  });
}

async function getLightsForRooms(config)
{
	const roomJson = await get({ ...config, path: `${config.path}/groups` });

	return Object.values(roomJson).map(
		(room, idx) => room.lights.map(
		  (light) => { return { roomnumber: idx+1, light: light, room: room.name }; } 
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

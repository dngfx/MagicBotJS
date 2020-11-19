const msgHandler = require( "../src/message-handler" ).messageHandler;
const utils = require( "../src/utils.js" ).utils;

const ping = {
	client: "",
	logger: "",
	name:   "Ping",

	ping: function( str, event, prefix = true ) {
		let self = ping;
		let target = event.target;

		const received_time = event.time;
		let fasttime = process.hrtime.bigint();

		let difference = parseInt( fasttime - received_time ) / 1000;
		difference = difference.toString().split( "." )[ 0 ];

		str = `Pong! Delay: 0.${difference} seconds.`;

		msgHandler.sendCommandMessage( target, str, prefix, self.name );
	},
};

module.exports = ping;

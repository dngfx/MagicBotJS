const msgHandler = require( "../src/message-handler" ).messageHandler;

const ping = {
	client: "",
	logger: "",
	name:   "Ping",

	ping: function( str, target, prefix = true ) {
		let self = ping;

		str = "Pong!";

		msgHandler.sendCommandMessage( target, str, prefix, self.name );
	},
};

module.exports = ping;

const msgHandler = require( "../src/message-handler" ).messageHandler;

const echo = {
	client: "",
	logger: "",
	name:   "Echo",

	echo: function( str, target, prefix = true ) {
		let self = echo;
		str = str.join( " " );

		msgHandler.sendCommandMessage( target, str, prefix, self.name );
	},
};

module.exports = echo;

const msgHandler = require( "../src/message-handler" ).messageHandler;

const echo = {
	client: "",
	logger: "",
	name:   "Echo",

	echo: function( str, event, prefix = true ) {
		let self = echo;
		let target = event.target;
		str = str.join( " " );

		msgHandler.sendCommandMessage( target, str, prefix, self.name );
	},
};

module.exports = echo;

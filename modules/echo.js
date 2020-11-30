const msgHandler = require( "../src/message-handler" ).messageHandler;

const echo = {
	client: "",
	logger: "",
	name:   "Echo",

	echo: function( str, event, prefix = true ) {
		const self   = echo;
		const target = event.target;
		str          = str.join( " " );

		msgHandler.sendCommandMessage( target, str, prefix, self.name );
	},

	action: function( str, event, prefix = true ) {
		const self   = echo;
		const target = event.target;
		str          = str.join( " " );

		msgHandler.sendAction( target, str );
	},
};

module.exports = echo;

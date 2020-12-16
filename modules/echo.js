const core  = require( "../src/core-handler.js" ).coreHandler;
const color = require( "irc-colors" ).global();
let self;
const echo  = {
	client: "",
	logger: "",
	name:   "Echo",

	echo: function( str, event, prefix = true ) {
		const target = event.target;
		str          = str.join( " " );

		core.messageHandler.sendCommandMessage( target, str, prefix, self.name );
	},

	action: function( str, event, prefix = true ) {
		const target = event.target;
		str          = str.join( " " );

		core.messageHandler.sendAction( target, str );
	},

	mypermissions: function( str, event, prefix = true ) {
		const id     = core.db.getUserId( event.nick );
		const target = event.target;
		let permissions;
		if( core.userHandler.getUser( event.nick ).authenticated === false ) {
			core.messageHandler.sendCommandMessage( target, "You must be authenticated to show permissions", prefix, "Permissions", true );

			return;
		}

		permissions = core.db.getUserSetting( id, "permissions" );
		permissions = permissions === false ? [ "" ] : JSON.parse( permissions );

		core.messageHandler.sendCommandMessage( target, `${"Your permissions".irc.bold()}: ${permissions.join( ", " )}`, prefix, "Permissions" );
	},

	myid: function( str, event, prefix = true ) {
		const id     = core.db.getUserId( event.nick );
		const target = event.target;

		core.messageHandler.sendCommandMessage( target, `${"Your ID".irc.bold()}: ${id}`, prefix, "Permissions" );
	},
};

self           = echo;
module.exports = echo;

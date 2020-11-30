const core = require( "../src/core-handler.js" ).coreHandler;

let self;

const admin = {
	client: "",
	logger: "",
	name:   "Admin",

	reloadmodule: function( str, event, prefix = true ) {
		const name   = self.name;
		const target =
			typeof event.nick === "string" ? event.nick : event.target;
		str          = str[ 0 ];

		const result = core.moduleHandler.reloadModule( str );
		core.messageHandler.sendCommandMessage( target, result, prefix, name );
	},

	showusers: function( str, event, prefix = true ) {
		console.log( core.userHandler.getAllUsers() );
	},

	loadModule: function( str, event, prefix = true ) {
		const name   = self.name;
		const target =
			typeof event.nick === "string" ? event.nick : event.target;
		str          = str[ 0 ];

		if( core.modules.moduleExists( str ) === true ) {
			const msg = `Module ${str} is already loaded`;
			core.messageHandler.sendCommandMessage( target, msg, prefix, name, true );

			return;
		}

		const result = core.moduleHandler.reloadModule( str );
		core.messageHandler.sendCommandMessage( target, result, prefix, name );
	},

	rawcommand: function( str, event, prefix = true ) {
		if( event.hostname !== "top.hat" || event.nick !== "dfx" ) {
			return;
		}

		if( str[ 0 ] === "rawcommand" ) {
			return;
		}

		const command = str.join( " " );

		self.client.raw( command );
	},

	joinchannel: function( str, event, prefix = true ) {
		const name   = self.name;
		const target =
			typeof event.nick === "string" ? event.nick : event.target;

		if( str[ 0 ] === "joinchannel" ) {
			return;
		}

		event.nick = self.client.user.nick;

		core.channelHandler.onJoinPart( event, "join", str );

		core.messageHandler.sendCommandMessage( target, `Joining channels ${JSON.stringify( str )}`, prefix, name );
	},

	partchannel: function( str, event, prefix = true ) {
		const name   = self.name;
		const target =
			typeof event.nick === "string" ? event.nick : event.target;

		if( str[ 0 ] === "partchannel" ) {
			str = target;
		} else {
			str = str[ 0 ];
		}

		console.log( `Channel is ${str}` );

		event.nick = self.client.user.nick;

		core.channelHandler.onJoinPart( event, "part", str );
	},

	listusers: function( str, event, prefix = true ) {
		const name    = self.name;
		const channel =
			typeof event.nick === "string" ? event.nick : event.target;

		if( str[ 0 ] === "partchannel" ) {
			str = channel;
		} else {
			str = str[ 0 ];
		}

		console.log( `Channel is ${str}` );

		const info  = core.channelHandler.getChannelUsers( str );
		const users = Object.keys( info ).join( ", " );

		core.messageHandler.sendCommandMessage( channel, `Users in ${str}: ${users}}`, prefix, name );
	},

	reloadallmodules: function( str, event, prefix = true ) {
		const name   = self.name;
		const target =
			typeof event.nick === "string" ? event.nick : event.target;

		const result = core.moduleHandler.reloadAllModules();
		core.messageHandler.sendCommandMessage( target, result, prefix, name );
	},
};

self           = admin;
module.exports = admin;

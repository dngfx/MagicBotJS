const msgHandler = require( "../src/message-handler" ).messageHandler;
const modules = require( "../src/module-handler.js" ).Modules;
const userHandler = require( "../src/user-handler.js" ).userHandler;
const channelHandler = require( "../src/channel-handler.js" ).channelHandler;

let self;

const admin = {
	client: "",
	logger: "",
	name:   "Admin",

	reloadmodule: function( str, event, prefix = true ) {
		let name = self.name;
		let target = event.target;
		str = str[ 0 ];

		let result = modules.reloadModule( str );
		msgHandler.sendCommandMessage( target, result, prefix, name );
	},

	loadModule: function( str, event, prefix = true ) {
		let name = self.name;
		let target = event.target;
		str = str[ 0 ];

		if( modules.moduleExists( str ) === true ) {
			let msg = `Module ${str} is already loaded`;
			msgHandler.sendCommandMessage( target, msg, prefix, name, true );

			return;
		}

		let result = modules.reloadModule( str );
		msgHandler.sendCommandMessage( target, result, prefix, name );
	},

	rawcommand: function( str, event, prefix = true ) {
		if( event.hostname !== "toupee\x0F" || event.nick !== "dfx" ) {
			return;
		}

		if( str[ 0 ] === "rawcommand" ) {
			return;
		}

		let command = str.join( " " );

		self.client.raw( command );
	},

	joinchannel: function( str, event, prefix = true ) {
		let name = self.name;
		let target = event.target;

		if( str[ 0 ] === "joinchannel" ) {
			return;
		}

		event.nick = self.client.user.nick;

		channelHandler.onJoinPart( event, "join", str );

		msgHandler.sendCommandMessage(
			target,
			`Joining channels ${JSON.stringify( str )}`,
			prefix,
			name
		);
	},

	partchannel: function( str, event, prefix = true ) {
		let name = self.name;
		let target = event.target;

		if( str[ 0 ] === "partchannel" ) {
			str = target;
		} else {
			str = str[ 0 ];
		}

		console.log( `Channel is ${str}` );

		event.nick = self.client.user.nick;

		channelHandler.onJoinPart( event, "part", str );
	},

	reloadallmodules: function( str, target, prefix = true ) {},
};

self = admin;
module.exports = admin;

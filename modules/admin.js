const msgHandler = require( "../src/message-handler" ).messageHandler;
const modules = require( "../src/module-handler.js" ).Modules;

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

	reloadallmodules: function( str, target, prefix = true ) {},
};

self = admin;
module.exports = admin;

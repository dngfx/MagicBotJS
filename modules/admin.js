const msgHandler = require( "../src/message-handler" ).messageHandler;
const modules = require( "../src/module-handler.js" ).Modules;

const admin = {
	client: "",
	logger: "",
	name:   "Admin",

	reloadmodule: function( str, target, prefix = true ) {
		self = admin;
		let name = self.name;
		str = str[ 0 ];

		let result = modules.reloadModule( str );
		msgHandler.sendCommandMessage( target, result, prefix, name );
	},

	reloadallmodules: function( str, target, prefix = true ) {},
};

module.exports = admin;

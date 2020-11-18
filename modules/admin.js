const msgHandler = require( "../src/message-handler" ).messageHandler;
const modules = require( "../src/module-handler.js" ).Modules;

const admin = {
	client: "",
	logger: "",
	name:   "Admin",

	reloadmodule: function( str, target, prefix = true ) {
		console.log( str );
		str = str[ 0 ];

		console.info( "Beginning module reload " + str );
		modules.reloadModule( str );
		console.info( "Reloaded module " + str );
	},
};

module.exports = admin;

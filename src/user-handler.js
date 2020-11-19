const Database = require( "../src/db.js" ).Database;
const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const modules = require( "./module-handler.js" ).Modules;
const cmdPrefix = config.bot_config.irc_server.command_prefix;
const serverHandler = require( "./server-handler.js" ).serverHandler;

/**
 * @returns userHandler
 */
let self;

const userHandler = {
	config: null,
	client: null,
	users:  {},

	init: function( client ) {
		self = userHandler;
		self.client = client;
		self.config = config;

		let network = Database.server_config;
		let alias = Database.server_alias;

		let network_name = alias[ "1" ];

		self.loadUsers( network[ network_name ]);
	},

	loadUsers: function( server ) {
		//console.log( server );
	},

	updateUser: function( server, channel, user ) {
		console.log( server, channel, user );
	},
};

self = userHandler;
exports.userHandler = userHandler;

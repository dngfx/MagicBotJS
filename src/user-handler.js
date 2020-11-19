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
	},

	updateUser: function( server, channel, user ) {

	},
};

self = userHandler;
exports.userHandler = userHandler;

const Database = require( "../src/db.js" ).Database;
const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const modules = require( "./module-handler.js" ).Modules;
const cmdPrefix = config.bot_config.irc_server.command_prefix;
const serverHandler = require( "./server-handler.js" ).serverHandler;
const channelHandler = require( "./channel-handler.js" ).channelHandler;

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
	},

	addUser: function( user ) {
		if( typeof self.users[ user.nick ] !== "undefined" ) {
			return;
		}

		self.users[ user.nick ] = user;
	},

	updateUser: function( server, channel, user ) {
		console.log( server, channel, user );
	},

	getUsersInChannel: function( channel ) {
		let users = channelHandler.getChannelUsers( channel );
		console.log( users );
	},
};

self = userHandler;
exports.userHandler = userHandler;

const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const colors = require( "colors" );

const core = require( "./core-handler.js" ).coreHandler;

/**
 * @returns userHandler
 */
let self;

const userHandler = {
	config: null,
	client: null,
	users:  {},

	init: function( client ) {
		self.client = client;
		self.config = config;

		const network = core.db.server_config;
		const alias   = core.db.server_alias;

		const network_name = alias[ "1" ];
	},

	addUser: function( user ) {
		if( typeof self.users[ user.nick ] !== "undefined" ) {
			return;
		}

		self.users[ user.nick ]                       = user;
		self.users[ user.nick ].authenticated         = false;
		self.users[ user.nick ].authenticated_account = null;
	},

	checkPermission: function( user, permission ) {
		if( self.users[ user ].authenticated === false ) {
			return false;
		}

		const account = self.users[ user ].authenticated_account;
		const id      = core.db.getUserId( account );

		const permissions = core.db.getUserSetting( id, "permissions" );

		if( permissions === false ) {
			return false;
		}

		if( permissions.value === "*" ) {
			return true;
		}
	},

	changeNick: function( server, event ) {
		const old_nick = event.nick;
		const new_nick = event.new_nick;

		if( typeof self.users[ old_nick ] !== "undefined" ) {
			self.users[ new_nick ] = self.users[ old_nick ];
			delete self.users[ old_nick ];
		}

		logger.info( `User ${old_nick.bold} changed nick to ${new_nick.bold}` );
	},

	// should only be called internally, so there should always be a result
	getUser: function( user ) {
		return self.users[ user ];
	},

	getAllUsers: function() {
		return self.users;
	},

	getUsersInChannel: function( channel ) {
		const users = core.channelHandler.getChannelUsers( channel );

		return users;
	},
};

self                = userHandler;
exports.userHandler = userHandler;

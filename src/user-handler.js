const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const colors = require( "colors" );

const core = require( "./core-handler.js" ).coreHandler;

/**
 * @returns userHandler
 */
let self;

const userHandler = {
	config:    null,
	client:    null,
	users:     {},
	mode_type: {
		q: "~",
		a: "&",
		o: "@",
		h: "%",
		v: "+",
	},

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
		self.users[ user.nick ].modes                 = [];
	},

	addMode: function( user, mode ) {
		if( typeof self.users[ user ].modes[ mode ] !== "undefined" ) {
			self.users[ user ].modes[ mode ] = true;
		}
	},

	removeUser: function( client, event ) {
		const user = event.nick;
		if( typeof self.users[ user ] === "undefined" ) {
			return;
		}

		delete self.users[ user ];
	},

	checkPermission: function( user, permission ) {
		if( !self.users[ user ].authenticated ) {
			return false;
		}

		const account = self.users[ user ].authenticated_account;
		const id      = core.db.getUserId( account );

		let permissions = core.db.getUserSetting( id, "permissions" );
		if( permissions === false ) {
			return false;
		}

		permissions = JSON.parse( permissions );

		if( permissions.includes( "*" ) || permissions.includes( permission ) ) {
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

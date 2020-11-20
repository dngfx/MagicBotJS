const config    = require( "../.config/config.js" ).Config;
const cmdPrefix = config.bot_config.irc_server.command_prefix;
const colors    = require( "colors" );
const logger    = require( "./logging.js" ).Logger;
const modules   = require( "./module-handler.js" ).Modules;

/**
 * @alias serverHandler
 */
let self;

const serverHandler = {
	config:         {},
	client:         {},
	servers:        {},
	myaccount:      {},
	caps:           {},
	server_notices: {},

	pong: function( client, event ) {
		logger.debug( "PONG " + event.message );
	},

	regainNick: function( event, type ) {},

	serverOptions: function( event ) {
		let server_options = {};
		const options      = event.options;
		const network      = self.client.network.name;

		if( typeof self.servers[ network ] === "undefined" ) {
			self.servers[ network ] = {};
		}

		if( typeof self.servers[ network ].caps !== "undefined" ) {
			logger.info( "Skipping " + network + " as I already have it." );

			return;
		}

		server_options = {};

		for( const [
			key, value
		] of Object.entries( options ) ) {
			server_options[ String( key ).toLowerCase() ] = value;
		}

		self.servers[ network ].caps = server_options;
		delete self.caps[ network ];
		logger.debug( `Added ${network.bold} to the server pool` );
	},

	account: function( event ) {
		self.myaccount[ event.account ] = {};
		self.myaccount[ event.account ] = event;

		logger.info( `Account ${event.account.bold} recognised. ${event.nick.bold}!${event.ident.bold}@${event.hostname.bold}` );
	},

	capabilities: function( event ) {
		const caps                                      = Object.keys( event.capabilities );
		self.caps[ self.config.level.server_name ]      = {};
		self.caps[ self.config.level.server_name ].caps = caps;
	},

	serverMessage: function( event, command ) {
		const serverInfo = {
			low:  251,
			high: 266,
		};

		const type = typeof event.type === "undefined" ? command : event.type;

		let number;

		const isNumber = !isNaN( event.command );
		if( isNumber ) {
			number = event.command.valueOf();
		}
		if( isNumber && number >= serverInfo.low && number <= serverInfo.high ) {
			serverHandler.serverNotice( event, "serverInfo" );

			return;
		}

		switch ( type ) {
			case "notice":
			case "message":
				self.serverNotice( event, type );
				break;

			case "nick in use":
				self.regainNick( event, type );
				break;

			case "loggedin":
				logger.info( `Now logging in. Nick: ${event.nick} Account: ${event.account}` );
				break;

			case "server options":
				self.serverOptions( event );
				break;

			case "account":
				self.account( event );
				break;

			case "cap ack":
				self.capabilities( event );
				break;

			default:
				console.error( "No handler for " + type );
				break;
		}
	},

	serverNotice: function( event, type ) {
		if( type !== "notice" && type !== "message" && type !== "serverInfo" ) {
			return;
		}

		let serverMessage;
		if( type === "serverInfo" ) {
			const arr = event.params;
			arr.shift();
			serverMessage = arr.join( " " );
		}

		const message =
			type === "serverInfo" ? serverMessage : event.message.trim();

		const network = self.client.network.name;

		if( typeof self.server_notices[ network ] === "undefined" ) {
			self.server_notices[ network ] = new Array();
		}

		const notices = self.server_notices[ network ];

		if( typeof notices[ message ] !== "undefined" ) {
			return;
		}

		self.server_notices[ network ][ message ] = true;

		logger.info( `${"[SERVER NOTICE]".bold} ${message}` );
	},

	unknown: function( client, info, command ) {
		const nonsenseCommands = [
			"251",
			"252",
			"253",
			"254",
			"255",
			"265",
			"266",
		];

		if(
			nonsenseCommands.includes( command ) ||
			command === "unknown command"
		) {
			logger.info( `Nonsense command: ${JSON.stringify( info.command )}` );
			console.log( command, info );
		} else {
			logger.warn( `Unknown command: ${command}` );
			console.log( "--- " + command + " START ---" );
			console.log( info );
			console.log( "--- " + command + " END -----" );
		}
	},

	init: function( client ) {
		self.config = config;
		self.client = client;
	},
};

self                  = serverHandler;
exports.serverHandler = serverHandler;

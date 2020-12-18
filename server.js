const colors   = require( "colors" );
const irc      = require( "irc-framework" );
const config   = require( "./.config/config.js" ).Config;
const lang     = require( "./src/lang.js" ).lang;
const Database = require( "./src/db.js" ).Database;
Database.init();

const core = require( "./src/core-handler.js" ).coreHandler;
core.init();

const eventHandler    = core.eventHandler;
const serverHandler   = core.serverHandler;
const messageHandler  = core.messageHandler;
const moduleHandler   = core.moduleHandler;
const channelHandler  = core.channelHandler;
const userHandler     = core.userHandler;
const utils           = core.utils;
const defaultSettings = {
	"client-version":   "MagicBotJS v1.0.0",
	"log-level":        "info",
	"sasl":             null,
	"chghost":          false,
	"debug":            false,
	"echo-message":     false,
	"default-channels": false,
	"ssl-verify":       false,
};

const dbConfig       = core.db.getConfig( 1 );
const serverSettings = core.db.getServerSettings( 1 );

dbConfig.settings = defaultSettings;

for( const setting in serverSettings ) {
	dbConfig.settings[ setting ] = serverSettings[ setting ];
}

core.db.server_config = dbConfig;

const logger   = require( "./src/logging.js" ).Logger;
const channels = dbConfig.settings[ "default-channels" ];

channelHandler.default_channels = channels;

function getSasl( dbConfig ) {
	const val                   = dbConfig.settings[ "sasl" ].args.split( ":" );
	const [ account, password ] = [ val[ 0 ], val[ 1 ] ];

	return {
		account:  account,
		password: password,
	};
}

const sasl = dbConfig.settings.sasl !== null ? getSasl( dbConfig ) : null;
const bot  = new irc.Client({
	host:               dbConfig.hostname,
	nick:               dbConfig.nickname,
	username:           dbConfig.username,
	gecos:              dbConfig.realname,
	port:               dbConfig.port,
	version:            dbConfig.settings[ "client-version" ],
	tls:                dbConfig.tls,
	debug:              dbConfig.settings.debug,
	enable_chghost:     dbConfig.settings.chghost,
	enable_echomessage: dbConfig.settings[ "echo-message" ],
	auto_connect:       false,
	account:            sasl,

	rejectUnauthorized: dbConfig.settings[ "ssl-verify" ],
	request_extra_caps: [ "userhost-in-names" ],
});

//bot.request_extra_caps = [ "userhost-in-names" ];

// eslint-disable-next-line no-constant-condition
if( false ) {
	bot.on( "debug", ( msg ) => {
		msg = JSON.stringify( msg );
		logger.debug({type: lang.DEBUGMSG, message: msg});
	});

	bot.on( "raw", ( msg ) => {
		msg = JSON.stringify( msg );
		logger.debug({type: lang.RAWMSG, message: msg});
	});
}

function middlewareHandler() {
	return function( client, raw_events, parsed_events ) {
		core.assignClient( client );

		parsed_events.use( eventHandler.parsedHandler );
	};
}

bot.connect();
bot.use( middlewareHandler() );

const colors = require( "colors" );
colors.enable();

const irc = require( "irc-framework" );
const config = require( "./.config/config.js" ).Config;

const Database = require( "./src/db.js" ).Database;
Database.init();
let dbConfig = Database.getConfig( 1 );

const serverConfig = config.bot_config.irc_server;
const eventHandler = require( "./src/event-handler.js" ).EventHandler;
const moduleHandler = require( "./src/module-handler.js" ).Modules;
const messageHandler = require( "./src/message-handler.js" ).messageHandler;
const channelHandler = require( "./src/channel-handler.js" ).channelHandler;
const serverHandler = require( "./src/server-handler.js" ).serverHandler;
const userHandler = require( "./src/user-handler.js" ).userHandler;

const logger = require( "./src/logging.js" ).Logger;

let channels =
	dbConfig.settings[ "default-channels" ] === undefined
		? ""
		: dbConfig.settings[ "default-channels" ];

channelHandler.default_channels = channels;

function getSasl( dbConfig ) {
	let account, password;
	[
		account, password
	] = dbConfig.settings[ "sasl" ].args.split( ":" );

	return {
		account:  account,
		password: password,
	};
}

let sasl = dbConfig.settings.sasl !== undefined ? getSasl( dbConfig ) : null;
const bot = new irc.Client({
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
});

function middlewareHandler() {
	return function( client, raw_events, parsed_events ) {
		moduleHandler.client = client;

		serverHandler.init( client );
		channelHandler.init( client );
		eventHandler.init( client );
		channelHandler.init( client );
		messageHandler.init( client, bot );
		userHandler.init( client );

		parsed_events.use( eventHandler.parsedHandler );
	};
}

bot.connect();
bot.use( middlewareHandler() );

const irc = require( "irc-framework" );
const config = require( "./.config/config.js" ).Config;
const serverConfig = config.bot_config.irc_server;
const eventHandler = require( "./src/event-handler.js" ).EventHandler;
const moduleHandler = require( "./src/module-handler.js" ).Modules;
const messageHandler = require( "./src/message-handler.js" ).messageHandler;
const channelHandler = require( "./src/channel-handler.js" ).channelHandler;

const bot = new irc.Client({
	host:           serverConfig.hostname,
	nick:           serverConfig.nick,
	username:       serverConfig.username,
	gecos:          serverConfig.realname,
	port:           serverConfig.port,
	tls:            serverConfig.secure,
	debug:          serverConfig.debug,
	enable_chghost: serverConfig.enable_chghost,
	channels:       serverConfig.channels,

	account: {
		account:  serverConfig.username,
		password: serverConfig.password,
	},

	rejectUnauthorized: serverConfig.verify_cert,
});

function middlewareHandler() {
	return function( client, raw_events, parsed_events ) {
		moduleHandler.client = client;

		eventHandler.init( client );
		channelHandler.init( client );
		messageHandler.init( client );

		parsed_events.use( eventHandler.parsedHandler );
	};
}

bot.connect();
bot.use( middlewareHandler() );

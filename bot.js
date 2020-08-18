const irc          = require( "irc-framework" );
const config       = require( "./.config/config.js" ).Config;
const serverConfig = config.bot_config.irc_server;
const eventHandler = require( "./src/event-handler.js" ).EventHandler;


const bot = new irc.Client(
	{
		host:           serverConfig.hostname,
		nick:           serverConfig.nick,
		username:       serverConfig.username,
		gecos:          serverConfig.realname,
		port:           serverConfig.port,
		tls:            serverConfig.secure,
		debug:          serverConfig.debug,
		enable_chghost: serverConfig.enable_chghost,


		account: {
			account:  serverConfig.username,
			password: serverConfig.password
		},

		rejectUnauthorized: serverConfig.verify_cert

	}
);

bot.connect();
bot.use( middlewareHandler() );

function middlewareHandler() {
	return function( client, raw_events, parsed_events ) {
		parsed_events.use( eventHandler.parsedHandler );
	};
}

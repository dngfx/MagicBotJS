const irc          = require( "irc-framework" );
const config       = require( "./.config/config.js" ).Config;
const serverConfig = config.bot_config.irc_server;

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

bot.on( "raw", ( msg ) => {
	console.log( msg );
} );

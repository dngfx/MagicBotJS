const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const modules = require( "./module-handler.js" ).Modules;

const messageHandler = {
	client: null,
	config: null,

	init: function( client ) {
		self = messageHandler;
		self.client = client;
		self.config = config.bot_config.irc_server;
	},

	generatePrefix: function( prefix ) {
		return "[" + prefix + "] ";
	},

	sendMessage: function( target, message ) {
		self = messageHandler;

		const is_channel = target === "#";
		const channel_id = is_channel ? `[${target}] ` : "";

		self.client.say( target, message );
		logger.info( `${channel_id}<${self.client.user.nick}> ${message}` );
	},

	sendCommandMessage: function(
		target,
		message,
		prefix = false,
		prefixText = "",
		error = false
	) {
		let self = messageHandler;
		prefixText = prefix !== false ? self.generatePrefix( prefixText ) : "";

		const is_channel = target === "#";
		const channel_id = is_channel ? `[${target}] ` : "";

		self.client.say( target, prefixText + message );
		logger.info( `${channel_id}<${self.client.user.nick}> ${prefixText}${message}` );
	},
};

exports.messageHandler = messageHandler;

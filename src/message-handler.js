const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const modules = require( "./module-handler.js" ).Modules;
const color = require( "irc-colors" );

const messageHandler = {
	client: null,
	config: null,

	init: function( client ) {
		self = messageHandler;
		self.client = client;
		self.config = config.bot_config.irc_server;
	},

	generatePrefix: function( prefix, error = false ) {
		let text =
			error === true ? color.bold.red( prefix ) : color.bold.green( prefix );

		return "[" + text + "] ";
	},

	sendMessage: function( target, message ) {
		self = messageHandler;

		const is_channel = target[ 0 ] === "#";
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
		let command =
			prefix !== false ? self.generatePrefix( prefixText, error ) : "";

		const channel = target;
		const is_channel = target[ 0 ] === "#";
		const channel_id = is_channel === true ? `[${channel}] ` : "";

		self.client.say( target, command + message );
		logger.info( `${channel_id}<${self.client.user.nick}> ${prefixText}${message}` );
	},
};

exports.messageHandler = messageHandler;

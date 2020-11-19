const config  = require( "../.config/config.js" ).Config;
const logger  = require( "./logging.js" ).Logger;
const modules = require( "./module-handler" ).Modules;
const color   = require( "irc-colors" ).global();
const colors  = require( "colors" );

let self;

const messageHandler = {
	client: null,
	config: null,
	_bot:   null,

	init: function( client, bot ) {
		self.client = client;
		self.config = config.bot_config.irc_server;
		self._bot   = bot;
	},

	generatePrefix: function( prefix, error = false ) {
		const text = !error
			? `[${prefix.irc.green.bold()}] `
			: `[${prefix.irc.red.bold()}] `;

		return text;
	},

	sendMessage: function( target, message ) {
		const is_channel = target[ 0 ] === "#";
		const channel_id = is_channel ? `[${target}] ` : "";

		self.client.say( target, message );
		logger.info( `${channel_id}<${
			self.client.user.nick
		}> ${message.irc.stripColorsAndStyle()}` );
	},

	sendCommandMessage: function(
		target,
		message,
		prefix = false,
		prefixText = "",
		error = false
	) {
		const command =
			prefix !== false ? self.generatePrefix( prefixText, error ) : "";

		if( prefix !== false ) {
			prefixText = !error ? prefixText.bold.green : prefixText.bold.red;
			prefixText = `[${prefixText}] `;
		}

		const channel    = target;
		const is_channel = target[ 0 ] === "#";
		const channel_id = is_channel === true ? `[${channel}] ` : "";

		self.client.say( target, command + message );
		logger.info( `${channel_id}<${
			self.client.user.nick
		}> ${prefixText}${message.irc.stripColorsAndStyle()}` );
	},
};

self                   = messageHandler;
exports.messageHandler = messageHandler;

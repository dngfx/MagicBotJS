const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const lang   = require( "./lang.js" ).lang;
const color  = require( "irc-colors" ).global();
const colors = require( "colors" );
const core   = require( "./core-handler.js" ).coreHandler;

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
		const text = !error ? `[${prefix.irc.green.bold()}] ` : `[${prefix.irc.red.bold()}] `;

		return text;
	},

	sendMessage: async function( target, message, prefix = false, prefixText = "", error = false ) {
		let user_prefix  = "";
		let target_str   = target;
		const channel    = target;
		const is_channel = target[ 0 ] === "#";
		const channel_id = is_channel === true ? `[${channel}] ` : "";

		const command = prefix !== false ? self.generatePrefix( prefixText, error ) : "";

		if( prefix !== false ) {
			prefixText = !error ? prefixText.bold.green : prefixText.bold.red;
			prefixText = `[${prefixText}] `;
		}

		if( is_channel === true ) {
			user_prefix = await core.channelHandler.getMode( self.client.user.nick, channel );
		} else {
			target_str = `${self.client.user.nick} -> ${target}`;
		}

		self.client.say( target, message );
		logger.info({
			type:    target_str,
			message: `<${user_prefix}${self.client.user.nick}> ${prefixText}${message.irc.stripColors()}`,
		});
	},

	sendAction: function( target, message ) {
		self.client.action( target, message );
	},

	sendCommandMessage: async function( target, message, prefix = false, prefixText = "", error = false ) {
		const command = prefix !== false ? self.generatePrefix( prefixText, error ) : "";

		if( prefix !== false ) {
			prefixText = !error ? prefixText.bold.green : prefixText.bold.red;
			prefixText = `[${prefixText}] `;
		}

		let user_prefix  = "";
		let target_str   = target;
		const channel    = target;
		const is_channel = target[ 0 ] === "#";
		const channel_id = is_channel === true ? `[${channel}] ` : "";
		if( is_channel === true ) {
			user_prefix = await core.channelHandler.getMode( self.client.user.nick, channel );
		} else {
			target_str = `${self.client.user.nick} -> ${target}`;
		}

		self.client.say( target, command + message );
		logger.info({
			type:    target_str,
			message: `<${user_prefix}${self.client.user.nick}> ${prefixText}${message.irc.stripColors()}`,
		});
	},
};

self                   = messageHandler;
exports.messageHandler = messageHandler;

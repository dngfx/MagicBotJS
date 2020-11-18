const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const modules = require( "./module-handler.js" ).Modules;
const cmdPrefix = config.bot_config.irc_server.command_prefix;

const channelHandler = {
	config:   null,
	client:   null,
	channels: {},

	init: function( client ) {
		self = channelHandler;
		self.client = client;
		self.config = config.bot_config.irc_server;
	},

	joinChannel: function( client, channel ) {
		self = channelHandler;
		client.join( channel );

		if( channel.match( "," ) ) {
			let channels = channel.split( "," );
			channels.forEach( ( channel_name ) => {
				logger.info( "Joining Channel " + channel_name );
				self.channels[ channel_name ] = {};
			});
		} else {
			logger.info( "Joining Channel " + channel );
			self.channels[ channel ] = {};
		}
	},

	partChannel: function( client, channel ) {
		client.part( channel );
		logger.info( "Parting Channel " + channel );
	},

	topic: function( client, info ) {
		self.channels[ info.channel ].topic = info.topic;
	},

	onJoinPart: function( client, info, event ) {
		if( client.user.nick === info.nick ) {
			return;
		}

		const action = event === "join" ? "joined" : "parted";

		logger.info( `${info.nick} ${action} ${info.channel}` );
	},

	serverNotice: function( event ) {
		if( event.type !== "notice" ) {
			return;
		}

		logger.info( `[SERVER NOTICE] ${event.message}` );
	},

	handleCommand: function( command, event, client, next ) {
		self = channelHandler;

		switch ( command ) {
			case "join":
			case "part":
				self.onJoinPart( client, event, command );
				break;

			case "topic":
				self.topic( client, event );
				break;

			default:
				logger.debug( "Unknown command " + command );
				break;
		}
	},

	getChannelTopic: function( channel ) {
		self = channelHandler;

		if( self.channels.hasOwnProperty( channel ) ) {
			return self.channels[ channel ].topic;
		} else {
			logger.error( "Could not find channel " + channel );
		}
	},
};

exports.channelHandler = channelHandler;

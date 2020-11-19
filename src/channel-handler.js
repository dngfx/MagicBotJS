const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const modules = require( "./module-handler.js" ).Modules;
const cmdPrefix = config.bot_config.irc_server.command_prefix;
const Database = require( "../src/db.js" ).Database;
const serverHandler = require( "./server-handler.js" ).serverHandler;

/**
 * @returns channelHandler
 */
let self;

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
		self.channels[ info.channel ].topic = {};
		self.channels[ info.channel ].topic = info.topic;
	},

	onJoinPart: function( client, info, event ) {
		if( client.user.nick === info.nick ) {
			return;
		}

		const action = event === "join" ? "joined" : "parted";

		logger.info( `${info.nick} ${action} ${info.channel}` );
	},

	channelUserList: function( event ) {
		let channel = event.channel;

		if( typeof self.channels[ channel ] === "undefined" ) {
			self.channels[ channel ] = {};
		}

		let users = event.users;
		let cur_user;

		for( const user in users ) {
			cur_user = users[ user ];

			self.addUserToDb( cur_user );
			self.channels[ channel ][ cur_user.nick ] = {
				nick:  cur_user.nick,
				ident: cur_user.ident,
			};
		}
	},

	addUserToDb: function( user ) {
		let network = self.client.network.name;
		let network_id = Database.server_config[ network ].server_id;

		Database.insertOneRow(
			"users",
			{
				server_id: network_id,
				nickname:  user.nick,
			},
			true
		);
	},

	serverNotice: function( event ) {
		if( event.type !== "notice" ) {
			return;
		}

		logger.info( `[SERVER NOTICE] ${event.message}` );
	},

	handleCommand: function( command, event, client, next ) {
		switch ( command ) {
			case "join":
			case "part":
				self.onJoinPart( client, event, command );
				break;

			case "topic":
				self.topic( client, event );
				break;

			case "userlist":
				self.channelUserList( event );
				break;

			default:
				logger.debug( "Unknown command " + command );
				break;
		}
	},

	getChannelTopic: function( channel ) {
		if( self.channels.hasOwnProperty( channel ) ) {
			return self.channels[ channel ].topic;
		} else {
			logger.error( "Could not find channel " + channel );
		}
	},
};

self = channelHandler;
exports.channelHandler = channelHandler;

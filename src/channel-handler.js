const config    = require( "../.config/config.js" ).Config;
const cmdPrefix = config.bot_config.irc_server.command_prefix;
const logger    = require( "./logging.js" ).Logger;
const colors    = require( "colors" );

const core = require( "./core-handler.js" ).coreHandler;

/**
 * @default channelHandler
 */
let self;

const channelHandler = {
	config:           null,
	client:           null,
	channels:         {},
	default_channels: null,
	mode_prefix:      {
		q: "~",
		a: "&",
		o: "@",
		h: "%",
		v: "+",
	},

	init: function( client ) {
		self        = channelHandler;
		self.client = client;
		self.config = config.bot_config.irc_server;
	},

	addMode: function( user, channel, mode ) {
		if( typeof self.channels[ channel ][ user ].modes === "undefined" ) {
			self.channels[ channel ][ user ].modes = {};
		}

		if( typeof self.channels[ channel ][ user ].modes[ mode ] !== "undefined" ) {
			self.channels[ channel ][ user ].modes[ mode ] = self.mode_prefix[ mode ];
		}
	},

	getMode: function( nick, channel ) {
		const user = self.channels[ channel ][ nick ].modes;
		let mode   = "";

		for( const char in user ) {
			if( mode !== "" || user.length === 0 ) {
				break;
			}

			mode = self.mode_prefix[ user[ char ] ];

			return mode;
		}

		return mode;
	},

	setUserModes: function( channel ) {
		self.client.raw( "NAMES " + channel );
	},

	joinChannel: function( channel ) {
		if( typeof channel === "string" && channel.includes( "," ) ) {
			const channels = channel.split( "," );
			channels.forEach( ( channel_name ) => {
				logger.info( "Joining Channel " + channel_name );
				self.channels[ channel_name ] = {};
			});
		} else {
			logger.info( "Joining Channel " + channel );
			self.channels[ channel ] = {};
		}

		self.client.join( channel );
	},

	partChannel: function( channel ) {
		self.client.part( channel );
		logger.info( "Parting Channel " + channel );
	},

	topic: function( info ) {
		self.channels[ info.channel ].topic = {};
		self.channels[ info.channel ].topic = info.topic;

		logger.info( `Topic for ${info.channel.bold} is ${info.topic.bold}` );
	},

	topicSetBy: function( info ) {
		logger.info( `Topic for ${info.channel.bold} was set by ${info.nick.bold}` );

		self.setUserModes( info.channel );
	},

	onJoinPart: function( event, joinpart, channels = null ) {
		if( self.client.user.nick === event.nick ) {
			if( channels === null ) {
				if( typeof event.channel === "string" ) {
					channels = event.channel;
				} else {
					return;
				}
			}
		}

		if( joinpart === "join" && typeof channels !== "string" ) {
			let cur_channel;
			for( const channel in channels ) {
				cur_channel = channels[ channel ];
				if( typeof self.channels[ cur_channel ] === "undefined" ) {
					self.channels[ cur_channel ] = {};
					logger.info( `${event.nick} joined ${cur_channel}` );
				}
			}

			self.joinChannel( channels.join( "," ) );

			return;
		} else {
			if( joinpart === "join" ) {
				const channel = channels !== null ? channels : event.channel;

				if( typeof self.channels[ channel ] === "undefined" ) {
					self.channels[ channels ] = {};
				}

				logger.info( `Joining channel ${channel.bold}` );
				self.joinChannel( channel );

				return;
			}
		}

		const channel = channels;

		delete self.channels[ channel ];
		self.partChannel( channel );

		const action = joinpart === "join" ? "joined" : "parted";

		logger.info( `${event.nick} ${action} ${event.channel}` );
	},

	channelUserList: function( event ) {
		const channel = event.channel;

		if( typeof self.channels[ channel ] === "undefined" ) {
			self.channels[ channel ] = {};
		}

		const users = event.users;
		let cur_user;

		for( const user in users ) {
			cur_user = users[ user ];

			core.userHandler.addUser( cur_user );

			self.addUserToDb( cur_user );
			self.channels[ channel ][ cur_user.nick ] = {
				nick:  cur_user.nick,
				ident: cur_user.ident,
				modes: cur_user.modes,
			};
		}
	},

	getChannelUsers: function( channel ) {
		if( typeof self.channels[ channel ] === "undefined" ) {
			return false;
		}

		const list = self.channels[ channel ];
		delete list.topic;

		return list;
	},

	addUserToDb: function( user ) {
		const network    = self.client.network.name;
		const network_id = core.db.server_config[ network ].server_id;

		core.db.insertOneRow( "users", {
			server_id: network_id,
			nickname:  user.nick,
		}, true );
	},

	serverNotice: function( event ) {
		if( event.type !== "notice" ) {
			return;
		}

		logger.info( `${"[SERVER NOTICE]".bold} ${event.message}` );
	},

	handleCommand: function( command, event, client, next ) {
		switch ( command ) {
			case "join":
			case "part":
				self.onJoinPart( event, command );
				break;

			case "topic":
				self.topic( event );
				break;

			case "topicsetby":
				self.topicSetBy( event );
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

self                   = channelHandler;
exports.channelHandler = channelHandler;

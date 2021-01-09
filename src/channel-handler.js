const config    = require( "../.config/config.js" ).Config;
const cmdPrefix = config.bot_config.irc_server.command_prefix;
const logger    = require( "./logging.js" ).Logger;
const lang      = require( "./lang.js" ).lang;
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
	mode_type:        {
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

	initChannel: function( channel ) {
		self.channels[ channel ] = {};

		if( typeof channel === "string" ) {
			const channelDb = core.db.getChannelByName( channel );
			console.log( channelDb );

			return true;
		}

		console.log( channel );

		if( typeof channel === "object" ) {
			for( const chan in channel ) {
				if( chan in self.channels === false ) {
					self.channels[ channel ] = {};
				}
			}

			return true;
		}

		return true;
	},

	addMode: function( user, channel, mode, caller = null ) {
		console.log( user, channel, mode );
		if( user === channel ) {
			return;
		}

		if( user in self.channels[ channel ] === false ) {
			self.channels[ channel ][ user ] = {};
		}

		const target = channel;

		if( self.channels[ channel ][ user ].hasOwnProperty( "modes" ) === false ) {
			self.channels[ channel ][ user ].modes = [];
		}

		const keys      = self.channels[ channel ][ user ].modes;
		const full_keys = [];

		if( typeof mode !== "string" ) {
			const modes = mode;
			for( const key of modes ) {
				self.channels[ channel ][ user ][ "modes" ].push( key.substring( 1 ) );
				full_keys.push( key );
			}

			logger.info({
				type:    lang.SNOTICE,
				message: `Added modes ${full_keys.join( ", " ).bold} to ${user.bold} on channel ${channel.bold}`,
			});
		}
	},

	getMode: function( nick, channel ) {
		if( !self.channels[ channel ].hasOwnProperty( nick ) ) {
			self.setUserModes( channel, nick );

			return;
		}

		const user = Object.values( self.channels[ channel ][ nick ].modes );
		for( const prefix in user ) {
			if( typeof self.mode_type[ user[ prefix ] ] === "string" ) {
				return self.mode_type[ user[ prefix ] ];
			}
		}

		return "";
	},

	setUserModes: function( channel, nick = null ) {
		nick = nick === null ? self.client.user.nick : nick;
		if( typeof self.channels[ channel ][ nick ] === "undefined" ) {
			self.channels[ channel ][ nick ]       = {};
			self.channels[ channel ][ nick ].modes = {};

			console.log( self.channels[ channel ][ nick ] );
		}
		self.client.raw( "NAMES " + channel );
	},

	joinChannel: function( channel ) {
		console.log( "Calling joinChannel" );
		const setup = self.initChannel( channel );

		if( setup === true ) {
			self.client.join( channel );

			return true;
		}

		return true;
	},

	partChannel: function( channel ) {
		self.client.part( channel );
		logger.info({
			type:    lang.SNOTICE,
			message: `Parting Channel ${channel.bold}`,
		});
	},

	topic: function( info ) {
		self.channels[ info.channel ].topic = {};
		self.channels[ info.channel ].topic = info.topic;

		logger.info({
			type:    lang.SNOTICE,
			message: `Topic for ${info.channel.bold} is ${info.topic.bold}`,
		});
	},

	topicSetBy: function( info ) {
		logger.info({
			type:    lang.SNOTICE,
			message: `Topic for ${info.channel.bold} was set by ${info.nick.bold}`,
		});
	},

	onJoinPart: function( event, joinpart, channels = null ) {
		if( channels === null ) {
			if( typeof event.channel === "string" ) {
				channels = event.channel;
			} else {
				return;
			}
		}

		if( joinpart === "join" && typeof channels !== "string" ) {
			logger.info({
				type:    lang.SNOTICE,
				message: `Joining Channels ${channels.join( ", " ).bold}`,
			});
			console.log( "Calling joinChannel from onJoinPart (multiple channels)" );
			self.joinChannel( channels.join( "," ) );

			return;
		} else {
			if( joinpart === "join" ) {
				const channel = channels !== null ? channels : event.channel;

				const message =
					self.client.user.nick === event.nick
						? `Joining Channel ${channel.bold}`
						: `${event.nick.bold} joined ${channel.bold}`;

				if( self.client.user.nick === event.nick ) {
					console.log( "Calling joinChannel from onJoinPart (one channel)" );
					self.joinChannel( channel );
				} else {
					self.refreshChannelUsers( channel );
				}

				logger.info({
					type:    lang.SNOTICE,
					message: message,
				});

				return;
			}
		}

		const channel = channels;

		if( self.client.user.nick === event.nick ) {
			delete self.channels[ channel ];
			self.partChannel( channel );
		} else {
			self.removeFromChannel( channel, event.nick );
		}

		const action = joinpart === "join" ? "joined" : "parted";

		logger.info({
			type:    lang.SNOTICE,
			message: `${event.nick.bold} ${action} ${event.channel.bold}`,
		});
	},

	refreshChannelUsers( channel ) {
		self.client.raw( "NAMES " + channel );
	},

	removeFromChannel( channel, nick ) {
		if( self.channels[ channel ].hasOwnProperty( nick ) ) {
			logger.debug({
				title:   lang.SNOTICE,
				message: `Removing ${nick} from ${channel}`,
			});
			delete self.channels[ channel ][ nick ];
		}
	},

	channelUserList: function( command, event ) {
		console.log( "Calling channelUserList" );
		const channel = event.channel;

		const users = event.users;
		let cur_user;

		for( const user in users ) {
			cur_user = users[ user ];

			self.addUserToDb( cur_user );
			self.channels[ channel ][ cur_user.nick ] = {
				nick:  cur_user.nick,
				ident: cur_user.ident,
				modes: cur_user.modes,
			};

			core.userHandler.addUser( cur_user );
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
		const network_id = core.db.server_config.server_id;

		core.db.insertOneRow( "users", {
			server_id: network_id,
			nickname:  user.nick,
		}, true );
	},

	serverNotice: function( event ) {
		if( event.type !== "notice" ) {
			return;
		}

		logger.info({type: lang.SNOTICE, message: event.message});
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

			default:
				logger.debug({
					type:    lang.SNOTICE,
					message: `Unknown command ${command.bold}`,
				});
				break;
		}
	},

	getChannelTopic: function( channel ) {
		if( self.channels.hasOwnProperty( channel ) ) {
			return self.channels[ channel ].topic;
		} else {
			logger.error({
				type:    lang.SNOTICE,
				message: `Could not find channel ${channel.bold}`,
			});
		}
	},
};

self                   = channelHandler;
exports.channelHandler = channelHandler;

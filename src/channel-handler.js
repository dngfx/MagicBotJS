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

	initChannel: async function( channel ) {
		if( typeof channel === "string" && channel in self.channels === false ) {
			self.channels[ channel ] = {};

			return true;
		}

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
				message: `Added modes ${full_keys.join( ", " ).bold} to ${
					user.bold
				} on channel ${channel.bold}`,
			});
		}
	},

	getMode: function( nick, channel ) {
		const user = Object.values( self.channels[ channel ][ nick ].modes );
		for( const prefix in user ) {
			if( typeof self.mode_type[ user[ prefix ] ] === "string" ) {
				return self.mode_type[ user[ prefix ] ];
			}
		}

		return "";
	},

	setUserModes: function( channel ) {
		if( self.channels.hasOwnProperty( channel ) === false ) {
			self.initChannel( channel );
		}

		if(
			typeof self.channels[ channel ][ self.client.user.nick ] === "undefined"
		) {
			self.channels[ channel ][ self.client.user.nick ]       = {};
			self.channels[ channel ][ self.client.user.nick ].modes = {};
		}
		self.client.raw( "NAMES " + channel );
	},

	joinChannel: async function( channel ) {
		const setup = await self.initChannel( channel ).then( ( res ) => {
			if( res === true ) {
				self.client.join( channel );
			}

			return true;
		});

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
			self.joinChannel( channels.join( "," ) );

			return;
		} else {
			if( joinpart === "join" ) {
				const channel = channels !== null ? channels : event.channel;

				if( typeof self.channels[ channel ] === "undefined" ) {
					self.channels[ channels ] = {};
				}

				const message =
					self.client.user.nick === event.nick
						? `Joining Channel ${channel.bold}`
						: `${event.nick.bold} joined ${channel.bold}`;

				logger.info({
					type:    lang.SNOTICE,
					message: message,
				});

				if( self.client.user.nick === event.nick ) {
					self.joinChannel( channel );
				} else {
					self.refreshChannelUsers( channel );
				}

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
		const channel = event.channel;

		if( typeof self.channels[ channel ] === "undefined" ) {
			self.initChannel( channel );
		}

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

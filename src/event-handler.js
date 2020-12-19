const config    = require( "../.config/config.js" ).Config;
const cmdPrefix = config.bot_config.irc_server.command_prefix;
const logger    = require( "./logging.js" ).Logger;
const lang      = require( "./lang.js" ).lang;
const core      = require( "./core-handler.js" ).coreHandler;
const colors    = require( "colors" );

let self;
const eventReactor = {
	config:       null,
	client:       null,
	server:       null,
	firedCommand: false,

	mode: async function( client, event ) {
		if( event.target[ 0 ] === "#" ) {
			core.channelHandler.initChannel( event.target );
		}

		const is_channel = event.target[ 0 ] === "#";
		const target     = event.target;
		const nick       = event.nick;
		const mode       = event.modes;
		const ournick    = client.user.nick;

		const raw_modes        = event.raw_modes;
		const raw_params       = event.raw_params;
		const target_nick      = is_channel ? event.nick : target;
		const exit_immediately = 0;
		const plural           = raw_params.length > 2 ? "s" : "";
		const real_nick        = typeof raw_params !== "undefined" ? raw_params[ 0 ] : nick;
		const real_from        = typeof raw_params === "undefined" ? nick : raw_params[ 0 ];

		if( real_from !== real_nick ) {
			logger.info({
				title:   lang.SNOTICE,
				message: `${real_nick} sets type: ${raw_modes} on ${real_from}`,
			});

			return;
		}

		const modes = {};
		let user    = "";
		mode.forEach( ( item, index, array ) => {
			if( index.param === null ) {
				return;
			}

			user = item.param === null ? nick : item.param;
			if( user in modes === false ) {
				modes[ user ] = [];
			}

			modes[ user ].push( item.mode );
		});
		core.channelHandler.addMode( user, target, modes[ user ] );
	},

	pong: function( client, event ) {
		logger.debug({
			type:    lang.SEVENT,
			message: "PONG " + event.message,
		});
	},

	message: function( client, message ) {
		logger.info( message );

		return;
	},

	privateMessage: async function( client, message ) {
		const is_channel    = message.target[ 0 ] === "#";
		const is_private    = !is_channel;
		const ournick       = client.user.nick;
		const target        = is_channel === true ? message.target : message.nick;
		const maybe_command = message.message[ 0 ] === cmdPrefix || is_private === true;

		message.time = process.hrtime.bigint();

		let type = "";
		if( is_channel ) {
			type = message.target;
		}

		if( is_private ) {
			type = `${client.user.nick} <- ${message.nick}`;
		}

		let parsedMessage = message.message;
		let prefix        = "";

		if( is_channel ) {
			prefix = await core.channelHandler.getMode( message.nick, target );
		}

		if( maybe_command && ( is_channel || is_private ) ) {
			self.firedCommand = false;
			const cmd         = is_private ? message.message : message.message.split( cmdPrefix )[ 1 ];
			let args          = cmd.split( " " );
			let cmdText       = "";

			if( args.length < 2 ) {
				cmdText = cmd;
			} else {
				cmdText = cmd.split( " " )[ 0 ];
				args    = cmd.split( " " ).slice( 1 );
			}

			if( core.moduleHandler.commandExists( cmdText ) ) {
				const [ cmdModule, cmdName ] = core.moduleHandler.getModuleFromCmd( cmdText );

				const modulePermission  = typeof cmdModule.permission === "string" ? cmdModule.permission : null;
				const commandPermission =
					typeof cmdModule.commands[ cmdName ].permission === "string"
						? cmdModule.commands[ cmdName ].permission
						: null;

				// Check if there's a module-wide permission check in effect
				if( modulePermission || commandPermission ) {
					// Check permissions
					const hasCommandPermission = core.userHandler.checkPermission( message.nick, commandPermission );
					const hasModulePermission  = core.userHandler.checkPermission( message.nick, modulePermission );

					// Check permission (If we don't have either command or module permissions, fail)
					if( hasCommandPermission === false || hasModulePermission === false ) {
						core.messageHandler.sendCommandMessage( target, `You do not have the required permissions for this command.`, true, cmdModule.name, true );

						return;
					}
				}

				cmdModule.commands[ cmdName ].command( args, message );
				self.firedCommand = true;

				if( cmdModule.name === "Authentication" ) {
					parsedMessage = `${cmdText} ********`;
				}
			}
		}

		if( self.firedCommand === false ) {
			core.moduleHandler.handleHook( "onmessage", client, message );
		}

		self.firedCommand = false;

		const str = `<${prefix}${message.nick}> ${parsedMessage}`;

		logger.info({type: type, message: str});
	},

	unknown: function( client, info, command ) {
		let number;
		let commandHandled = false;

		const isNumber = !isNaN( info.command );
		if( isNumber ) {
			number = parseInt( info.command );
		}

		// Parseint strips leading zeroes
		if( isNumber ) {
			switch ( number ) {
				case 3:
				case 4:
					return;

				case 251:
				case 252:
				case 253:
				case 254:
				case 255:
				case 256:
				case 257:
				case 258:
				case 259:
				case 260:
				case 261:
				case 262:
				case 263:
				case 264:
				case 265:
				case 266:
					core.serverHandler.serverNotice( info, "serverInfo" );
					commandHandled = true;

					return;

				default:
					break;
			}
		}

		if( commandHandled ) {
			return;
		}

		if( command === "unknown command" ) {
			logger.info({
				type:    lang.SEVENT,
				message: `Nonsense command: ${JSON.stringify( info )}`,
			});
			console.log( command, info );
		} else {
			logger.warn({
				type:    lang.SEVENT,
				message: `Unknown command: ${command}`,
			});
			console.log( "--- " + command + " START ---" );
			console.log( info );
			console.log( "--- " + command + " END -----" );
		}
	},

	init: function( client ) {
		if( eventReactor.config === null ) {
			eventReactor.config = config.bot_config;
			eventReactor.client = client;
		}
	},
};

const eventHandler = {
	ircClient:  null,
	config:     null,
	calledInit: null,

	init: function( client ) {
		if( self.calledInit === null ) {
			self.config = config.bot_config.irc_server;
			eventReactor.init( client );
			core.channelHandler.init( client );
			core.moduleHandler.initModules( client );

			self.calledInit = true;
		}

		return true;
	},

	parsedHandler: function( command, event, client, next ) {
		//console.log( command, JSON.stringify( event ) );
		switch ( command ) {
			case "registered":
				core.channelHandler.onJoinPart( event, "join", core.channelHandler.default_channels );
				break;

			case "privmsg":
				eventReactor.privateMessage( client, event );
				break;

			case "nick":
				core.userHandler.changeNick( client, event );
				break;

			case "quit":
				core.userHandler.removeUser( client, event );
				break;

			case "loggedin":
			case "account":
			case "cap ack":
			case "server options":
				core.serverHandler.serverMessage( event, command );
				break;

			case "message":
			case "notice":
				if( event.from_server === true ) {
					core.serverHandler.serverMessage( event, command );
				}
				break;

			case "pong":
				eventReactor.pong( client, event );
				break;

			case "mode":
				eventReactor.mode( client, event );
				break;

			case "cap ls":
				break;

			case "userlist":
				core.channelHandler.channelUserList( command, event );
				break;

			case "join":
			case "part":
			case "topic":
			case "topicsetby":
				logger.debug({
					type:    lang.SEVENT,
					message: `Handling client command ${command}`,
				});
				core.channelHandler.handleCommand( command, event, client, next );

				return;

			// Events safe to ignore
			case "motd":
				break;

			default:
			case "unknown command":
				eventReactor.unknown( client, event, command );
				break;
		}

		next();
	},
};

self                 = eventHandler;
exports.eventHandler = eventHandler;

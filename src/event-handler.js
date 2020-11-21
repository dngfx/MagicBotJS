const config         = require( "../.config/config.js" ).Config;
const logger         = require( "./logging.js" ).Logger;
const modules        = require( "./module-handler.js" ).Modules;
const cmdPrefix      = config.bot_config.irc_server.command_prefix;
const channelHandler = require( "./channel-handler.js" ).channelHandler;
const serverHandler  = require( "./server-handler.js" ).serverHandler;

let self;
const eventReactor = {
	config: null,
	client: null,
	server: null,

	mode: function( client, event ) {
		const target = event.target;
		const nick   = event.nick;
		const mode   = event.modes;

		const raw_modes  = event.raw_modes;
		const raw_params = event.raw_params;

		let target_nick      = "";
		let exit_immediately = 0;
		const plural         = raw_params.length > 2 ? "s" : "";

		if( raw_params.length > 0 ) {
			// Are they all for the same person (they should always be for the same person)
			raw_params.forEach( ( raw_nick ) => {
				if( raw_nick !== target_nick && target_nick !== "" ) {
					exit_immediately = 1;

					return;
				}

				target_nick = raw_nick;
			});

			if( exit_immediately === 1 ) {
				return;
			}

			if( target === nick ) {
				logger.info( `${target} set mode${plural} ${raw_modes}` );
			} else {
				logger.info( `[${target}] ${nick} sets mode${plural} ${raw_modes} on ${target_nick}` );
			}
		} else {
			if( target === nick ) {
				logger.info( `${target} set mode${plural} ${raw_modes}` );
			} else {
				logger.info( `${target} set mode${plural} ${raw_modes} on ${nick}` );
			}
		}
	},

	pong: function( client, event ) {
		logger.debug( "PONG " + event.message );
	},

	message: function( client, message ) {
		console.log( message );
		logger.info( message );

		return;
	},

	privateMessage: function( client, message ) {
		const is_channel    = message.target[ 0 ] === "#";
		const is_private    = message.target === client.user.nick;
		const maybe_command = message.message[ 0 ] === cmdPrefix;

		message.time = process.hrtime.bigint();

		let logBuild = "";
		if( is_channel ) {
			logBuild += `[${message.target}] `;
		}

		if( is_private ) {
			logBuild += `[PRIVATE MESSAGE FROM ${message.nick}] `;
		}

		const str = `${logBuild}<${message.nick}> ${message.message}`;

		logger.info( str );

		if( maybe_command && is_channel ) {
			const cmd   = message.message.split( cmdPrefix )[ 1 ];
			let args    = cmd.split( " " );
			let cmdText = "";
			if( args.length < 2 ) {
				cmdText = cmd;
			} else {
				cmdText = cmd.split( " " )[ 0 ];
				args    = cmd.split( " " ).slice( 1 );
			}

			if( modules.commandExists( cmdText ) ) {
				const cmdModule = modules.getModuleFromCmd( cmdText );

				cmdModule[ cmdText ]( args, message );
			}
		}
	},

	unknown: function( client, info, command ) {
		const nonsenseCommands = {
			low:  251,
			high: 266,
		};

		const ignoreCommands = [ "003", "004" ];

		if( ignoreCommands.includes( info.command ) ) {
			logger.debug( `Ignored command ${info.command}` );

			return;
		}

		let number;

		const isNumber = !isNaN( info.command );
		if( isNumber ) {
			number = info.command.valueOf();
		}
		if(
			isNumber &&
			number >= nonsenseCommands.low &&
			number <= nonsenseCommands.high
		) {
			serverHandler.serverMessage( info, info.command );

			return;
		}

		if( command === "unknown command" ) {
			logger.info( `Nonsense command: ${JSON.stringify( info )}` );
			console.log( command, info );
		} else {
			logger.warn( `Unknown command: ${command}` );
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
			channelHandler.init( client );
			modules.initModules( client );

			self.calledInit = true;
		}

		return true;
	},

	parsedHandler: function( command, event, client, next ) {
		//console.log( command, JSON.stringify( event ) );
		switch ( command ) {
			case "registered":
				logger.info( "Registered to server successfully" );
				channelHandler.onJoinPart( event, "join", channelHandler.default_channels );
				break;

			case "privmsg":
				eventReactor.privateMessage( client, event );
				break;

			case "loggedin":
			case "account":
			case "cap ack":
			case "server options":
				serverHandler.serverMessage( event, command );
				break;

			case "message":
			case "notice":
				if( event.from_server === true ) {
					serverHandler.serverMessage( event, command );
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

			case "join":
			case "part":
			case "topic":
			case "userlist":
			case "topicsetby":
				logger.debug( "Handling client command " + command );
				channelHandler.handleCommand( command, event, client, next );

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
exports.EventHandler = eventHandler;

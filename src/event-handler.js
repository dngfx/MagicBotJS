const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const modules = require( "./module-handler.js" ).Modules;
const cmdPrefix = config.bot_config.irc_server.command_prefix;
const channelHandler = require( "./channel-handler.js" ).channelHandler;

const eventReactor = {
	config: null,
	client: null,

	mode: function( client, event ) {
		const target = event.target;
		const nick = event.nick;
		const mode = event.modes;

		const raw_modes = event.raw_modes;
		const raw_params = event.raw_params;

		let target_nick = "";
		let exit_immediately = 0;
		let plural = raw_params.length > 2 ? "s" : "";

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
		const is_channel = message.target[ 0 ] === "#";
		const is_private = message.target === client.user.nick;
		const maybe_command = message.message[ 0 ] === cmdPrefix;
		console.log( message.message );

		if( maybe_command && is_channel ) {
			const cmd = message.message.split( cmdPrefix )[ 1 ];
			let args = cmd.split( " " );
			let cmdText = "";
			if( args.length < 2 ) {
				cmdText = cmd;
				console.log( message.message.split( " " ) );
			} else {
				cmdText = cmd.split( " " )[ 0 ];
				args = cmd.split( " " ).slice( 1 );
			}

			if( modules.commandExists( cmdText ) ) {
				const cmdModule = modules.getModuleFromCmd( cmdText );

				cmdModule[ cmdText ]( args, message.target );
			}
		}

		let logBuild = "";
		if( is_channel ) {
			logBuild += `[${message.target}] `;
		}

		if( is_private ) {
			logBuild += `[PRIVATE MESSAGE FROM ${message.nick}] `;
		}

		const str = `${logBuild}<${message.nick}> ${message.message}`;

		logger.info( str );
	},

	serverNotice: function( event ) {
		if( event.type !== "notice" ) {
			return;
		}

		logger.info( `[SERVER NOTICE] ${event.message}` );
	},

	unknown: function( client, info, command ) {
		const nonsenseCommands = [
			"251", "252", "253", "254", "255", "265", "266"
		];

		if( nonsenseCommands.includes( command ) || command === "unknown command" ) {
			logger.info( `Nonsense command: ${info.command}` );
		} else {
			logger.warn( `Unknown command: ${command}` );
			/*console.log( "--- " + command + " START ---" );
			console.log( info );
			console.log( "--- " + command + " END -----" );*/
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
	calledInit: false,

	init: function( client ) {
		self = eventHandler;
		if( self.config === null ) {
			self.config = config.bot_config.irc_server;
			eventReactor.init( client );
			channelHandler.init( client );
			modules.initModules( client );

			self.calledInit = true;
		}
	},

	parsedHandler: function( command, event, client, next ) {
		let self = eventHandler;

		let channels = self.config.channels.join( "," );

		//console.log( command, JSON.stringify( event ) );

		if( event.from_server === true ) {
			eventReactor.serverNotice( event );
		}

		switch ( command ) {
			case "registered":
				logger.info( "Registered to server successfully" );
				channelHandler.joinChannel( client, channels );
				break;

			case "privmsg":
				eventReactor.privateMessage( client, event );
				break;

			case "pong":
				eventReactor.pong( client, event );
				break;

			case "join":
			case "part":
			case "topic":
			case "userlist":
			case "topicsetby":
				logger.debug( "Handling client command " + command );
				channelHandler.handleCommand( command, event, client, next );

				return;

			default:
			case "unknown command":
				eventReactor.unknown( client, event, command );
				break;
		}

		next();
	},
};

exports.EventHandler = eventHandler;

const config    = require( "../.config/config.js" ).Config;
const logger    = require( "./logging.js" ).Logger;
const modules   = require( "./module-handler.js" ).Modules;
const cmdPrefix = config.bot_config.irc_server.command_prefix;

const eventReactor = {
	joinChannel: function( client, channel ) {
		client.join( channel );
		logger.info( "Joining Channel " + channel );
	},

	partChannel: function( client, channel ) {
		client.part( channel );
		logger.info( "Parting Channel " + channel );
	},

	message: function( client, message ) {

	},

	privateMessage: function( client, message ) {
		let is_channel    = message.target[ 0 ] === "#";
		let is_private    = ( message.target === client.user.nick );
		let maybe_command = message.message[ 0 ] === cmdPrefix;

		if( maybe_command && is_channel ) {
			let cmd     = message.message.split( cmdPrefix )[ 1 ];
			let cmdText = cmd.split( " " )[ 0 ];
			let args    = cmd.split( " " ).slice( 1 );

			if( modules.moduleExists( cmdText ) ) {
				let cmdModule = modules.returnModule( cmdText );
				cmdModule[ cmdText ]( args, message.target );
			}
		}

		let logBuild = "";
		if( is_channel ) {
			logBuild += `[${ message.target }] `;
		}

		if( is_private ) {
			logBuild += `[PRIVATE MESSAGE FROM ${ message.nick }] `;
		}

		let str = `${ logBuild }<${ message.nick }> ${ message.message }`;

		logger.info( str );

	},

	onJoinPart: function( client, info, event ) {
		if( client.user.nick === info.nick ) {
			return;
		}

		let action = ( event === "join" ) ? "joined" : "parted";

		logger.info( `${ info.nick } ${ action } ${ info.channel }` );

	},

	serverNotice: function( event ) {
		if( event.type !== "notice" ) {
			return;
		}

		logger.info( `[SERVER NOTICE] ${ event.message }` );
	},


	unknown: function( client, info ) {
		let nonsenseCommands = [
			"251", "252", "253", "254", "255", "265", "266"
		];

		if( nonsenseCommands.includes( info.command ) ) {
			//logger.info( `Nonsense command: ${ info.command }` );
		} else {
			//logger.warn( `Unknown command: ${ info.command }` );
		}
	}


};

const eventHandler = {
	ircClient:     null,
	parsedHandler: function( command, event, client, next ) {
		//console.log( event );
		if( this.ircClient == null ) {
			this.ircClient = true;
			modules.initModules( client );
		}

		//console.log( command, JSON.stringify( event ) );

		if( event.from_server === true ) {
			eventReactor.serverNotice( event );
		}


		switch( command ) {
			case "registered":
				eventReactor.joinChannel( client, "#premium-test" );
				break;

			case "privmsg":
				eventReactor.privateMessage( client, event );
				break;

			case "join":
			case "part":
				eventReactor.onJoinPart( client, event, command );
				break;

			case "unknown command":
				eventReactor.unknown( client, event );
				break;
		}

		next();

	}
};

exports.EventHandler = eventHandler;

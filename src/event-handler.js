const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;

const cmdPrefix = config.bot_config.irc_server.command_prefix;

const eventReactor = {
	joinChannel: function( client, channel ) {
		client.join( channel );
		logger.info( "Joining Channel " + channel );
	},

	privateMessage: function( client, message ) {
		let logBuild = "";
		if( message.target[ 0 ] === "#" ) {
			logBuild += `[${ message.target }] `;
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
	parsedHandler: function( command, event, client, next ) {
		switch( command ) {
			case "registered":
				console.log( "Registered: ", event );
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

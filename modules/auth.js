const core   = require( "../src/core-handler.js" ).coreHandler;
const crypto = require( "crypto" );

let self;

const auth = {
	client:   null,
	logger:   null,
	name:     "Authentication",
	commands: {
		register: {
			command: function( str, event, prefix = true ) {
				if( event.target[ 0 ] === "#" ) {
					core.messageHandler.sendCommandMessage( event.target, "This command can only be used in a private message", prefix, self.name, true );

					return;
				}

				const user = core.userHandler.getUser( event.nick );
				if( user.authenticated === true ) {
					core.messageHandler.sendCommandMessage( event.nick, "You are already identified", prefix, self.name );

					return;
				}

				const id = core.db.getUserId( event.nick );

				const alreadyRegistered = core.db.userSettingExists( id, "password" );
				if( alreadyRegistered === true ) {
					core.messageHandler.sendCommandMessage( event.nick, "Account already exists", prefix, self.name, true );

					return;
				}

				let password = event.message.split( " " )[ 1 ];
				password     = crypto.createHash( "sha3-512" ).update( password ).digest( "hex" );

				core.db.insertOneRow( "user_settings", {
					user_id: id,
					setting: "password",
					value:   password,
				}, true );

				core.messageHandler.sendCommandMessage( event.nick, `Successfully registered account for ${event.nick}`, prefix, self.name );
			},
		},

		identify: {
			command: function( str, event, prefix = true ) {
				if( event.target[ 0 ] === "#" ) {
					core.messageHandler.sendCommandMessage( event.target, "This command can only be used in a private message", prefix, self.name, true );

					return;
				}

				const parts = event.message.split( " " );
				let password, user;

				if( parts.length === 3 ) {
					user     = parts[ 1 ];
					password = parts[ 2 ];
				} else if( parts.length === 2 ) {
					user     = event.nick;
					password = parts[ 1 ];
				} else {
					core.messageHandler.sendCommandMessage( event.nick, `You must identify using the format "identify <password> or identify <nick> <password>"`, prefix, self.name, true );

					return;
				}

				password = crypto.createHash( "sha3-512" ).update( password ).digest( "hex" );
				const id = core.db.getUserId( event.nick );

				const correctPassword = core.db.getUserSetting( id, "password" );

				if( typeof correctPassword === "undefined" ) {
					core.messageHandler.sendCommandMessage( event.nick, "User does not exist", prefix, self.name, true );

					return;
				}

				if( correctPassword === password ) {
					core.userHandler.users[ event.nick ].authenticated         = true;
					core.userHandler.users[ event.nick ].authenticated_account = user;

					core.messageHandler.sendCommandMessage( event.nick, `You are now authenticated for ${user}`, prefix, self.name );

					return;
				} else {
					core.messageHandler.sendCommandMessage( event.nick, "Incorrect password", prefix, self.name, true );

					return;
				}
			},
		},
	},
};

self           = auth;
module.exports = auth;

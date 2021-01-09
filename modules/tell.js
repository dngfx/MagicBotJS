const core   = require( "../src/core-handler.js" ).coreHandler;
const db     = core.db;
const crypto = require( "crypto" );

let self = null;

const tell = {
	client:   null,
	logger:   null,
	name:     "Tell",
	commands: {
		tell: {
			command: function( str, event, prefix = true ) {
				const target     = event.target;
				const is_channel = target[ 0 ] === "#";

				if( str.length < 2 ) {
					core.messageHandler.sendCommandMessage( target, `Insufficient arguments`, prefix, self.name, true );

					return;
				}

				const command = str;
				const user    = command[ 0 ];
				command.shift();
				console.log( command );
				const msg = command.join( " " );

				const userId = db.getUserId( user );
				if( !userId ) {
					core.messageHandler.sendCommandMessage( target, `Could not find user ${user}`, prefix, self.name, true );

					return;
				}
			},
		},
	},
};

self           = tell;
module.exports = tell;

const core = require( "../src/core-handler.js" ).coreHandler;

let self;

const admin = {
	client:            "",
	logger:            "",
	name:              "Admin",
	requirePermission: "admin",

	reloadmodule: function( str, event, prefix = true ) {
		const name   = self.name;
		const target = event.target[ 0 ] === "#" ? event.target : event.nick;
		str          = str[ 0 ];

		const result = core.moduleHandler.reloadModule( str );
		core.messageHandler.sendCommandMessage( target, result, prefix, name );
	},

	showusers: function( str, event, prefix = true ) {
		console.log( core.userHandler.getAllUsers() );
	},

	loadModule: function( str, event, prefix = true ) {
		const name   = self.name;
		const target = event.target[ 0 ] === "#" ? event.target : event.nick;
		str          = str[ 0 ];

		if( core.modules.moduleExists( str ) === true ) {
			const msg = `Module ${str} is already loaded`;
			core.messageHandler.sendCommandMessage( target, msg, prefix, name, true );

			return;
		}

		const result = core.moduleHandler.reloadModule( str );
		core.messageHandler.sendCommandMessage( target, result, prefix, name );
	},

	rawcommand: function( str, event, prefix = true ) {
		if( event.hostname !== "top.hat" || event.nick !== "dfx" ) {
			return;
		}

		if( str[ 0 ] === "rawcommand" ) {
			return;
		}

		const command = str.join( " " );

		self.client.raw( command );
	},

	joinchannel: function( str, event, prefix = true ) {
		const name   = self.name;
		const target = event.target[ 0 ] === "#" ? event.target : event.nick;

		if( str[ 0 ] === "joinchannel" ) {
			return;
		}

		console.log( str[ 0 ]);
		core.channelHandler.onJoinPart( event, "join", str[ 0 ]);

		core.messageHandler.sendCommandMessage( target, `Joining channels ${JSON.stringify( str )}`, prefix, name );
	},

	partchannel: function( str, event, prefix = true ) {
		const name   = self.name;
		const target = event.target[ 0 ] === "#" ? event.target : event.nick;

		if( str[ 0 ] === "partchannel" ) {
			str = target;
		} else {
			str = str[ 0 ];
		}

		core.channelHandler.onJoinPart( event, "part", str );
	},

	listusers: function( str, event, prefix = true ) {
		const name   = self.name;
		const target = event.target[ 0 ] === "#" ? event.target : event.nick;

		if( event.target[ 0 ] === "#" ) {
			core.messageHandler.sendCommandMessage( event.target, "This command can only be used in a private message", prefix, self.name );

			return;
		}

		if( str[ 0 ] === "listusers" ) {
			str = target;
		} else {
			str = str[ 0 ];
		}

		const info  = core.channelHandler.getChannelUsers( str );
		const users = Object.keys( info ).join( ", " );

		core.messageHandler.sendCommandMessage( target, `Users in ${str}: ${users}`, prefix, name );
	},

	reloadallmodules: function( str, event, prefix = true ) {
		const name   = self.name;
		const target = event.target[ 0 ] === "#" ? event.target : event.nick;

		const result = core.moduleHandler.reloadAllModules();
		core.messageHandler.sendCommandMessage( target, result, prefix, name );
	},

	shutdownjs: function( str, event, prefix = true ) {
		let message = "Bye";
		if( str[ 0 ] !== "shutdownjs" ) {
			message = str[ 0 ];
		}

		self.client.quit( message );
		process.exit( 1 );
	},
};

self           = admin;
module.exports = admin;

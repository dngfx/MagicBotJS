const config = require( "../.config/config.js" ).Config;
const serverConfig = config.bot_config.irc_server;
const sqlite = require( "better-sqlite3" );
const path = require( "path" );
const db_path = path.join( __dirname, config.bot_config.db_file );

const db = new sqlite( db_path, {
	fileMustExist: true,
	verbose:       console.log,
	timeout:       5000,
});

const database = {
	server_config: {},

	init: function() {
		self = database;

		let stmt = db.prepare( "SELECT * FROM servers WHERE enabled = 'true'" );
		let row, key, value, server_id;

		for( row of stmt.iterate() ) {
			server_id = row.server_id;
			self.server_config[ row.server_id ] = row;
			self.server_config[ row.server_id ].settings = {};
		}

		stmt = db.prepare( "SELECT setting, value FROM server_settings WHERE server_id = 1" );
		for( const row of stmt.iterate() ) {
			let val = JSON.parse( row.value );
			self.server_config[ server_id ].settings[ row.setting ] = val;
		}

		return true;
	},

	getConfig: function( server_id = 1 ) {
		self = database;

		return self.server_config[ server_id ];
	},
};

exports.Database = database;

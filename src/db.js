const config       = require( "../.config/config.js" ).Config;
const serverConfig = config.bot_config.irc_server;
const sqlite       = require( "better-sqlite3" );
const path         = require( "path" );
const db_path      = path.join( __dirname, config.bot_config.db_file );

const db = new sqlite( db_path, {
	fileMustExist: true,
	timeout:       5000,
});

//db.pragma( "journal_mode = WAL" );
db.pragma( "synchronous = FULL" );

let self;

const database = {
	server_config: {},
	server_alias:  {},

	init: function() {
		const stmt = db.prepare( "SELECT * FROM servers WHERE enabled = 'true'" );
		let key, row, server_id, value;

		for( row of stmt.iterate() ) {
			const alias     = row.alias;
			const server_id = row.server_id;

			self.server_alias[ server_id ] = alias;

			const network                        = alias;
			self.server_config[ alias ]          = row;
			self.server_config[ alias ].settings = {};
			let server_config;

			const settings = db.prepare( "SELECT setting, value FROM server_settings WHERE server_id = " +
					server_id );
			for( const inner of settings.iterate() ) {
				const val                                             = JSON.parse( inner.value );
				self.server_config[ alias ].settings[ inner.setting ] = val;
			}
		}

		return true;
	},

	getConfig: function( server ) {
		const network =
			typeof server === "number" ? self.server_alias[ server ] : server;

		return self.server_config[ network ];
	},

	updateUsers: function( server ) {
		return;
	},

	getBotSetting: function( setting ) {
		const stmt = db.prepare( "SELECT * FROM bot_settings WHERE setting = ?" );
		const row  = stmt.get( setting );

		if( row !== undefined ) {
			return JSON.parse( row.value );
		}
	},

	insertOneRow: function( table, fields, skip_if_exists = null ) {
		const length     = Object.keys( fields ).length;
		fields.server_id = String( fields.server_id );
		let build        = Object.keys( fields ).join( ", :" );
		let keys         = Object.keys( fields ).join( ", " );
		keys             = `(${keys})`;
		build            = `(:${build})`;

		const insert = db.prepare( `INSERT OR IGNORE INTO ${table} ${keys} VALUES ${build}` );
		try {
			insert.run( fields );
		} catch( err ) {
			console.log( err );
		}
	},
};

self             = database;
exports.Database = database;

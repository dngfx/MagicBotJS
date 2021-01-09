const config  = require( "../.config/config.js" ).Config;
const sqlite  = require( "better-sqlite3" );
const path    = require( "path" );
const db_path = path.join( __dirname, "..", ".config", "bot.db" );

const db = new sqlite( db_path, {
	fileMustExist: true,
	timeout:       5000,
});

//db.pragma( "journal_mode = WAL" );
db.pragma( "synchronous = FULL" );

let self;

const database = {
	server_config: config.bot_config,
	server_alias:  {},

	init: async function() {
		//	console.log( self.server_config );

		return true;
	},

	getConfig: function( server ) {
		const network = typeof server === "number" ? self.server_alias[ server ] : server;

		const stmt = db.prepare( "SELECT * FROM servers WHERE server_id = ?" );
		const row  = stmt.get( server );

		return row;
	},

	getServerSettings: function( server ) {
		if( typeof server !== "number" ) {
			return false;
		}

		let setting, value;
		const settings = {};
		const stmt     = db.prepare( "SELECT * FROM server_settings WHERE server_id = ?" );
		const row      = stmt.all( server );

		for( const num in row ) {
			setting = row[ num ];
			try {
				value                            = setting.value;
				settings[ setting[ "setting" ] ] = JSON.parse( value );
			} catch( e ) {
				console.log( e );
			}
		}

		return settings;
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

	getUserId: function( nick ) {
		const stmt = db.prepare( "SELECT user_id FROM users WHERE LOWER(nickname) = ?" );
		const row  = stmt.get( nick.toLowerCase() );

		return typeof row !== "undefined" ? row.user_id : false;
	},

	userSettingExists: function( id, setting ) {
		const stmt = db.prepare( "SELECT user_id FROM user_settings WHERE user_id = ? AND setting = ?" );
		const row  = stmt.get( id, setting );

		return typeof row !== "undefined";
	},

	getUserSetting: function( id, setting ) {
		const stmt = db.prepare( "SELECT * FROM user_settings WHERE user_id = ? AND setting = ?" );
		const row  = stmt.get( id, setting );

		return typeof row === "undefined" ? false : row.value;
	},

	getChannelByName: function( channel ) {
		const stmt = db.prepare( "SELECT channel_id, server_id FROM channels WHERE name = ?" );
		const row  = stmt.get( channel );

		return typeof row === "undefined" ? false : row.value;
	},

	insertOneRow: function( table, fields, ignore_server_id = null ) {
		if( ignore_server_id !== true ) {
			fields.server_id = String( fields.server_id );
		}

		const length = Object.keys( fields ).length;
		let build    = Object.keys( fields ).join( ", :" );
		let keys     = Object.keys( fields ).join( ", " );
		keys         = `(${keys})`;
		build        = `(:${build})`;

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

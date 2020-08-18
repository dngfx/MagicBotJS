const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const reqdir = require( "require-dir" );
const path   = require( "path" );
const fs     = require( "fs" );

var loadedModules = {};

const moduleHandler = {
	modulePath:    null,
	loadedModules: null,

	initModules: function( client ) {
		this.modulePath    = path.join( __dirname, "../modules" );
		this.loadedModules = reqdir( this.modulePath );

		Object.keys( this.loadedModules ).forEach( function( key ) {
			moduleHandler.loadedModules[ key ].init( client, logger );
		} );
	},

	returnModule: function( moduleName ) {
		if( !this.loadedModules.hasOwnProperty( moduleName ) ) {
			logger.warn( "Could not access module " + moduleName );
		}

		return this.loadedModules[ moduleName ];
	},

	moduleExists: function( moduleName ) {
		return this.loadedModules.hasOwnProperty( moduleName );
	}
};

exports.Modules = moduleHandler;

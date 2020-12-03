const glob   = require( "glob" );
const path   = require( "path" );
const fs     = require( "fs" );
const logger = require( "./logging.js" ).Logger;

let self;

const moduleHandler = {
	moduleDict:      {},
	moduleFunctions: {},
	commandPathway:  {},
	modulePath:      null,
	loadedModules:   {},
	client:          null,

	init: function( client ) {
		if( self.client !== null ) {
			return;
		}

		self.client = client;
	},

	reloadModule: function( moduleName ) {
		if( !self.moduleExists( moduleName ) ) {
			logger.error( `Could not reload module ${moduleName.bold}, module does not exist.` );

			return `Could not reload module ${moduleName}, module does not exist.`;
		}

		const fileName                            = self.loadedModules[ moduleName ].fileName;
		const [ module_deleted, message_deleted ] = self.deleteModule( moduleName );

		if( module_deleted === false ) {
			return message_deleted;
		} else {
			logger.debug( message_deleted );
		}

		const [ module_loaded, message_loaded ] = self.loadModule( moduleName, fileName );

		if( module_loaded === true ) {
			return message_loaded.replace( "Loaded", "Reloaded" );
		} else {
			return message_loaded;
		}
	},

	reloadAllModules: function() {
		let message;
		Object.getOwnPropertyNames( self.loadedModules ).forEach( ( module ) => {
			message = self.reloadModule( module );
			logger.debug( message );
		});

		return "Reloaded all modules";
	},

	deleteModule: function( moduleName ) {
		if( !self.moduleExists( moduleName ) ) {
			logger.error( `Could not unload module ${moduleName.bold}, module does not exist.` );

			return [ false, `Could not unload module ${moduleName}, module does not exist.`, ];
		}

		const fileName = self.loadedModules[ moduleName ].fileName;
		const name     = require.resolve( fileName );

		const functions       = self.moduleFunctions[ moduleName ];
		let functions_deleted = [];

		Object.getOwnPropertyNames( functions ).forEach( ( function_name ) => {
			functions_deleted.push( function_name );
			delete self.commandPathway[ function_name ];
		});

		functions_deleted = functions_deleted.join( " " );
		logger.debug( "Functions deleted: " + functions_deleted );

		delete self.moduleFunctions[ moduleName ];
		delete self.loadedModules[ moduleName ];
		delete require.cache[ name ];

		logger.debug( "Deleted all references" );

		return [ true, `Unloaded module ${moduleName} successfully` ];
	},

	loadModule: function( moduleName, file ) {
		if( self.moduleExists( moduleName ) ) {
			logger.error( `Could not load module ${moduleName.bold}, module already exists.` );

			return [ false, `Could not load module ${moduleName}, module already exists.`, ];
		}

		self.moduleFunctions[ moduleName ] = {};

		self.loadedModules[ moduleName ]          = require( file );
		self.loadedModules[ moduleName ].fileName = file;
		self.loadedModules[ moduleName ].client   = self.client;

		Object.getOwnPropertyNames( self.loadedModules[ moduleName ]).forEach( ( var_name ) => {
			const isFunction =
					typeof self.loadedModules[ moduleName ][ var_name ] ===
					"function";
			if( isFunction === true ) {
				if( typeof self.commandPathway[ var_name ] !== "undefined" ) {
					logger.error( "Could not redefine function " + var_name.bold );

					return [ false, "Could not redefine function " + var_name, ];
				}

				self.moduleFunctions[ moduleName ][ var_name ] = true;
				self.commandPathway[ var_name ]                = moduleName;
			}
		});

		const thisModule  = self.loadedModules[ moduleName ];
		thisModule.client = self.client;

		return [ true, `Loaded module ${moduleName} successfully` ];
	},

	initModules: function( client ) {
		self.client = client;
		logger.info( "Loading modules" );
		self.modulePath = path.join( __dirname, "../modules" );
		glob.sync( self.modulePath + "/*.js" ).forEach( ( file ) => {
			const dash = file.split( "/" );

			const dot = dash[ dash.length - 1 ].split( "." );

			if( dot.length === 2 ) {
				const key = dot[ 0 ];

				logger.info( `${"[MODULES]".bold} Loaded ${key}` );
				self.loadModule( key, file );
			}
		});
		logger.info( `${"[MODULES]".bold} Module load complete` );
	},

	returnModule: function( moduleName ) {
		if( self.loadedModules.hasOwnProperty( moduleName ) ) {
			return self.loadedModules[ moduleName ];
		} else {
			logger.warn( `Tried to call module ${moduleName} which does not exist` );
		}
	},

	hasFunction: function( moduleName, functionName ) {
		if( self.loadedModules.hasOwnProperty( moduleName ) ) {
			const theModule = self.loadedModules[ moduleName ];

			return self.moduleFunctions[ moduleName ].hasOwnProperty( functionName );
		} else {
			logger.warn( `Tried to call module ${moduleName} which does not exist` );
		}
	},

	moduleExists: function( moduleName ) {
		return self.loadedModules.hasOwnProperty( moduleName );
	},

	commandExists: function( commandName ) {
		return self.commandPathway.hasOwnProperty( commandName );
	},

	getModuleFromCmd: function( commandName ) {
		return self.loadedModules[ self.commandPathway[ commandName ] ];
	},
};

self            = moduleHandler;
exports.Modules = moduleHandler;

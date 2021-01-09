const glob   = require( "glob" );
const path   = require( "path" );
const fs     = require( "fs" );
const logger = require( "./logging.js" ).Logger;
const lang   = require( "./lang.js" ).lang;

let self;

const moduleHandler = {
	moduleDict:      {},
	moduleFunctions: {},
	commandPathway:  {},
	aliasPathways:   {},
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
			logger.error({
				type:    lang.SMODULES,
				message: `Could not reload module ${moduleName.bold}, module does not exist.`,
			});

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
			logger.debug({type: lang.SEVENT, message: message});
		});

		return "Reloaded all modules";
	},

	deleteModule: function( moduleName ) {
		if( !self.moduleExists( moduleName ) ) {
			logger.error({
				type:    lang.SMODULES,
				message: `Could not unload module ${moduleName.bold}, module does not exist.`,
			});

			return [ false, `Could not unload module ${moduleName}, module does not exist.` ];
		}

		const fileName = self.loadedModules[ moduleName ].fileName;
		const name     = require.resolve( fileName );

		const module          = self.loadedModules[ moduleName ];
		const functions       = self.commandPathway[ moduleName ];
		let functions_deleted = [];

		console.log( module, functions, functions.aliases );

		if( functions.hasOwnProperty( "aliases" ) ) {
			for( const alias in functions[ "aliases" ] ) {
				const a = functions[ "aliases" ][ alias ];
				console.log( "Deleting alias", a );
				delete self.aliasPathways[ a ];
			}
		}
		Object.getOwnPropertyNames( module.commands ).forEach( ( function_name ) => {
			functions_deleted.push( function_name );
			delete self.commandPathway[ function_name ];
		});

		functions_deleted = functions_deleted.join( " " );
		logger.debug({
			type:    lang.SMODULES,
			message: `Functions deleted: ${functions_deleted}`,
		});

		delete self.moduleFunctions[ moduleName ];
		delete self.loadedModules[ moduleName ];
		delete self.commandPathway[ moduleName ];
		delete require.cache[ name ];

		logger.debug({
			type:    lang.SMODULES,
			message: `Deleted all references`,
		});

		return [ true, `Unloaded module ${moduleName} successfully` ];
	},

	loadModule: function( moduleName, file ) {
		if( self.moduleExists( moduleName ) ) {
			logger.error({
				type:    lang.SMODULES,
				message: `Could not load module ${moduleName.bold}, module already exists.`,
			});

			return [ false, `Could not load module ${moduleName}, module already exists.` ];
		}

		self.moduleFunctions[ moduleName ] = {};

		self.loadedModules[ moduleName ]          = require( file );
		self.loadedModules[ moduleName ].fileName = file;
		self.loadedModules[ moduleName ].client   = self.client;

		const module = self.loadedModules[ moduleName ];

		Object.getOwnPropertyNames( module.commands ).forEach( ( cmdName ) => {
			const cmdObj  = module[ "commands" ][ cmdName ];
			const cmd     = cmdObj.command;
			const aliases = cmdObj.hasOwnProperty( "aliases" ) ? cmdObj.aliases : false;
			const hooks   = cmdObj.hasOwnProperty( "hooks" ) ? cmdObj.hooks : false;

			// Does the command already exist in another module?
			if( typeof self.commandPathway[ cmdName ] !== "undefined" ) {
				logger.error({
					type:    lang.SMODULES,
					message: `Could not redefine function ${cmdName.bold}`,
				});

				return [ false, "Could not redefine function " + cmdName ];
			}

			self.commandPathway[ cmdName ]            = cmdObj;
			self.commandPathway[ cmdName ].moduleName = moduleName;

			if( aliases !== false ) {
				for( const alias in aliases ) {
					const name = aliases[ alias ];
					// Are we clashing with a function that already exists?
					if( self.commandPathway.hasOwnProperty( name ) || self.aliasPathways.hasOwnProperty( name ) ) {
						// Put a warning in
						logger.warn({
							type:    lang.SMODULES,
							message: `Assigning alias ${name.bold} failed. Function or alias ${name.bold} already exists.`,
						});

						continue;
					}

					self.aliasPathways[ name ]            = cmdObj;
					self.aliasPathways[ name ].moduleName = moduleName;
					self.aliasPathways[ name ].aliasFor   = cmdName;
					logger.debug({
						type:    lang.SMODULES,
						message: `Assigned alias ${name.bold} for command ${cmdName.bold}`,
					});
				}
			}

			if( hooks !== false ) {
				logger.debug({
					type:    lang.SNOTICE,
					message: `Assigned hooks for command ${cmdName.bold}: ${JSON.stringify( hooks )}`,
				});
			}
		});

		const thisModule  = self.loadedModules[ moduleName ];
		thisModule.client = self.client;

		return [ true, `Loaded module ${moduleName} successfully` ];
	},

	handleHook: function( hook, client, message ) {
		// We hook by command now, not by entire module (hurrah)
		Object.getOwnPropertyNames( self.commandPathway ).forEach( ( cmdName ) => {
			/*logger.verbose({
				type:    lang.SMODULES,
				message: `Checking command ${cmdName.bold} for hook ${hook.bold}`,
			});*/

			let pathway;
			if( typeof self.commandPathway[ cmdName ] !== "undefined" ) {
				pathway = self.commandPathway[ cmdName ];
			} else if( typeof self.aliasPathways[ cmdName ] !== "undefined" ) {
				pathway = self.aliasPathways[ cmdName ];
			} else {
				return;
			}

			if( pathway.hasOwnProperty( "hooks" ) && pathway.hooks.includes( hook ) ) {
				logger.verbose({
					type:    lang.SMODULES,
					message: `Executing hook ${hook} for command ${cmdName}`,
				});

				pathway.command( message, client );
			}
		});
	},

	initModules: function( client ) {
		self.client = client;
		logger.info({type: lang.SMODULES, message: `Loading modules`});
		self.modulePath = path.join( __dirname, "../modules" );
		glob.sync( self.modulePath + "/*.js" ).forEach( ( file ) => {
			const dash = file.split( "/" );

			const dot = dash[ dash.length - 1 ].split( "." );

			if( dot.length === 2 ) {
				const key = dot[ 0 ];

				logger.info({
					type:    lang.SMODULES,
					message: `Loaded ${key}`,
				});
				self.loadModule( key, file );
			}
		});
		logger.info({
			type:    lang.SMODULES,
			message: `Module load complete`,
		});
	},

	returnModule: function( moduleName ) {
		if( self.loadedModules.hasOwnProperty( moduleName ) ) {
			return self.loadedModules[ moduleName ];
		} else {
			logger.warn({
				type:    lang.SMODULES,
				message: `Tried to call module ${moduleName} which does not exist`,
			});
		}
	},

	hasFunction: function( moduleName, functionName ) {
		if( self.loadedModules.hasOwnProperty( moduleName ) ) {
			const theModule = self.loadedModules[ moduleName ];

			return self.moduleFunctions[ moduleName ].hasOwnProperty( functionName );
		} else {
			logger.warn({
				type:    lang.SMODULES,
				message: `Tried to call module ${moduleName} which does not exist`,
			});
		}
	},

	moduleExists: function( moduleName ) {
		return self.loadedModules.hasOwnProperty( moduleName );
	},

	commandExists: function( commandName ) {
		return self.commandPathway.hasOwnProperty( commandName ) || self.aliasPathways.hasOwnProperty( commandName );
	},

	getModuleFromCmd: function( cmdName ) {
		let pathway;
		let alias = cmdName;
		if( typeof self.commandPathway[ cmdName ] !== "undefined" ) {
			pathway = self.commandPathway[ cmdName ].moduleName;
		} else if( typeof self.aliasPathways[ cmdName ] !== "undefined" ) {
			pathway = self.aliasPathways[ cmdName ].moduleName;
			alias   = self.aliasPathways[ cmdName ].aliasFor;
		} else {
			return;
		}

		return [ self.loadedModules[ pathway ], alias ];
	},
};

self            = moduleHandler;
exports.Modules = moduleHandler;

const fs   = require( "fs" );
const path = require( "path" );
const ini  = require( "ini" );
const lang = require( "./lang.js" ).lang;
let self;

const coreHandler = {
	client:         null,
	db:             null,
	eventHandler:   null,
	serverHandler:  null,
	messageHandler: null,
	moduleHandler:  null,
	channelHandler: null,
	userHandler:    null,
	utils:          null,
	init_complete:  null,
	api_keys:       null,

	init: async function( configPath ) {
		if( self.init_complete !== null ) {
			return;
		}
		self.db             = require( "./db.js" ).Database;
		self.utils          = require( "./utils.js" ).utils;
		self.utils.api_keys = ini.parse( fs.readFileSync( `${configPath}/api.ini`, "utf-8" ) ).bot;
		self.moduleHandler  = require( "./module-handler.js" ).Modules;
		self.eventHandler   = require( "./event-handler.js" ).eventHandler;
		self.messageHandler = require( "./message-handler.js" ).messageHandler;
		self.channelHandler = require( "./channel-handler.js" ).channelHandler;
		self.serverHandler  = require( "./server-handler.js" ).serverHandler;
		self.userHandler    = require( "./user-handler.js" ).userHandler;
		self.api_keys       = ini.parse( fs.readFileSync( `${configPath}/api.ini`, "utf-8" ) ).bot;

		self.init_complete = true;

		await self.db.init();

		return true;
	},

	assignClient: function( client ) {
		if( self.client !== null ) {
			return;
		}
		self.client = client;
		self.eventHandler.init( client );
		self.moduleHandler.init( client );
		self.messageHandler.init( client );
		self.channelHandler.init( client );
		self.serverHandler.init( client );
		self.userHandler.init( client );
		self.utils.init( client );
	},
};

self                = coreHandler;
exports.coreHandler = coreHandler;

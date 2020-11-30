const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const moment = require( "moment" );

let self;

const Utils = {
	client: null,

	init: function( client ) {
		self.client = client;
	},

	getUnixTime: function() {
		return moment().format( "X.SSSSSS" );
	},
};

self          = Utils;
exports.utils = Utils;

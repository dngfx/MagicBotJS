const config = require( "../.config/config.js" ).Config;
const logger = require( "./logging.js" ).Logger;
const moment = require( "moment" );

const Utils = {
	getUnixTime: function() {
		return moment().format( "X.SSSSSS" );
	},
};

exports.utils = Utils;

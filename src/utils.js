const config   = require( "../.config/config.js" ).Config;
const logger   = require( "./logging.js" ).Logger;
const moment   = require( "moment" );
const convert  = require( "./colour_convert/convert.js" ).colour_convert;
const irccolor = require( "irc-colors" );

let self;

const Utils = {
	client: null,

	init: function( client ) {
		self.client = client;
	},

	getUnixTime: function() {
		return moment().format( "X.SSSSSS" );
	},

	convertYTTime: function( input ) {
		const reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
		let hours    = 0,
			minutes = 0,
			seconds = 0;

		if( reptms.test( input ) ) {
			const matches = reptms.exec( input );
			if( matches[ 1 ]) {
				hours = Number( matches[ 1 ]);
			}
			if( matches[ 2 ]) {
				minutes = Number( matches[ 2 ]);
			}
			if( matches[ 3 ]) {
				seconds = Number( matches[ 3 ]);
			}
		}

		return [
			hours,
			minutes,
			seconds 
		];
	},

	convert_irc_to_console: function( text ) {
		text = convert.irc_to_ansi( text );
		text = irccolor.stripColors( text );

		return text;
	},
};

self          = Utils;
exports.utils = Utils;

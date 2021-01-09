const config      = require( "../.config/config.js" ).Config;
const logger      = require( "./logging.js" ).Logger;
const moment      = require( "moment" );
const convert     = require( "./colour_convert/convert.js" ).colour_convert;
const irccolor    = require( "irc-colors" );
const BitlyClient = require( "bitly" ).BitlyClient;

let self;

const Utils = {
	client:    null,
	bitly_api: null,
	api_keys:  null,

	init: function( client ) {
		self.client    = client;
		self.bitly_api = new BitlyClient( self.api_keys[ "bitly-api-key" ] );
	},

	getShortLink: async function( url ) {
		const result = await self.bitly_api.shorten( url );

		return result;
	},

	getUnixTime: function() {
		return moment().format( "X.SSSSSS" );
	},

	parseUnixTime: function( time ) {
		return moment.unix( time );
	},

	parseTime: function( time ) {
		return moment( time );
	},

	formatToStandardTime( time ) {
		if( Number.isInteger( time ) ) {
			time = self.parseUnixTime( time );
		} else {
			time = self.parseTime( time );
		}

		return self.formatToFancyTime( time );
	},

	formatToFancyTime( time, str = "Do MMM, YYYY [at] HH:mm" ) {
		return time.format( str );
	},

	prevent_highlight: function( user ) {
		return `${user[ 0 ]}\u200c${user.substr( 1 )}`;
	},

	prevent_highlight_filename: function( filename ) {
		return filename.replace( ".", "\u200c.\u200c" );
	},

	parseTwitterTime: function( time ) {
		return moment( time, "ddd MMM D HH:mm:ss ZZ YYYY" );
	},

	convertYTTime: function( input ) {
		const reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
		let hours    = 0,
			minutes = 0,
			seconds = 0;

		if( reptms.test( input ) ) {
			const matches = reptms.exec( input );
			if( matches[ 1 ] ) {
				hours = Number( matches[ 1 ] );
			}
			if( matches[ 2 ] ) {
				minutes = Number( matches[ 2 ] );
			}
			if( matches[ 3 ] ) {
				seconds = Number( matches[ 3 ] );
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

	sizeConvert: function( size, decimal_places = 0 ) {
		if( size === 0 ) {
			return "0 B";
		}

		const k       = 1024;
		const decimal = decimal_places < 0 ? 0 : decimal_places;
		const sizes   = [
			" B",
			" KB",
			" MB" 
		];

		const i = Math.floor( Math.log( size ) / Math.log( k ) );

		return parseFloat( ( size / Math.pow( k, i ) ).toFixed( decimal ) ) + sizes[ i ];
	},

	commaFormatNumber: function( num ) {
		const nf = new Intl.NumberFormat();

		return nf.format( num );
	},

	fuzzFormatNumber: function( num, digits = 1 ) {
		const si = [
			{value: 1, symbol: ""},
			{value: 1e3, symbol: "K"},
			{value: 1e6, symbol: "M"},
			{value: 1e9, symbol: "B"},
			{value: 1e9, symbol: "T"},
		];

		const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
		let i;
		for( i = si.length - 1; i > 0; i-- ) {
			if( num >= si[ i ].value ) {
				break;
			}
		}

		return ( num / si[ i ].value ).toFixed( digits ).replace( rx, "$1" ) + si[ i ].symbol;
	},
};

self = Utils;

exports.utils = Utils;

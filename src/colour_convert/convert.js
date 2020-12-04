/* eslint-disable quotes */
const colors = require( "colors" );

const colour_codes = {
	//           IRC, ANSI
	WHITE:       [ 0, 97 ],
	BLACK:       [ 1, 30 ],
	BLUE:        [ 2, 34 ],
	GREEN:       [ 3, 32 ],
	RED:         [ 4, 91 ],
	GOLD:        [ 24, 17 ],
	BROWN:       [ 5, 31 ],
	PURPLE:      [ 6, 35 ],
	ORANGE:      [ 7, 33 ],
	YELLOW:      [ 8, 93 ],
	LIGHTGREEN:  [ 9, 92 ],
	CYAN:        [ 10, 36 ],
	LIGHTCYAN:   [ 11, 96 ],
	LIGHTBLUE:   [ 12, 94 ],
	PINK:        [ 13, 95 ],
	GREY:        [ 14, 90 ],
	LIGHTGREY:   [ 15, 37 ],
	TRANSPARENT: [ 99, 39 ],
};

const colour_codes_256 = {
	COLORS: {},

	assignColors: function() {
		colour_codes_256.COLORS[ 16 ] = 52;
		colour_codes_256.COLORS[ 17 ] = 94;
		colour_codes_256.COLORS[ 18 ] = 100;
		colour_codes_256.COLORS[ 19 ] = 58;
		colour_codes_256.COLORS[ 20 ] = 22;
		colour_codes_256.COLORS[ 21 ] = 29;
		colour_codes_256.COLORS[ 22 ] = 23;
		colour_codes_256.COLORS[ 23 ] = 24;
		colour_codes_256.COLORS[ 24 ] = 17;
		colour_codes_256.COLORS[ 25 ] = 54;
		colour_codes_256.COLORS[ 26 ] = 53;
		colour_codes_256.COLORS[ 27 ] = 89;
		colour_codes_256.COLORS[ 28 ] = 88;
		colour_codes_256.COLORS[ 29 ] = 130;
		colour_codes_256.COLORS[ 30 ] = 142;
		colour_codes_256.COLORS[ 31 ] = 64;
		colour_codes_256.COLORS[ 32 ] = 28;
		colour_codes_256.COLORS[ 33 ] = 35;
		colour_codes_256.COLORS[ 34 ] = 30;
		colour_codes_256.COLORS[ 35 ] = 25;
		colour_codes_256.COLORS[ 36 ] = 18;
		colour_codes_256.COLORS[ 37 ] = 91;
		colour_codes_256.COLORS[ 38 ] = 90;
		colour_codes_256.COLORS[ 39 ] = 125;
		colour_codes_256.COLORS[ 40 ] = 124;
		colour_codes_256.COLORS[ 41 ] = 166;
		colour_codes_256.COLORS[ 42 ] = 184;
		colour_codes_256.COLORS[ 43 ] = 106;
		colour_codes_256.COLORS[ 44 ] = 34;
		colour_codes_256.COLORS[ 45 ] = 49;
		colour_codes_256.COLORS[ 46 ] = 37;
		colour_codes_256.COLORS[ 47 ] = 33;
		colour_codes_256.COLORS[ 48 ] = 19;
		colour_codes_256.COLORS[ 49 ] = 129;
		colour_codes_256.COLORS[ 50 ] = 127;
		colour_codes_256.COLORS[ 51 ] = 161;
		colour_codes_256.COLORS[ 52 ] = 196;
		colour_codes_256.COLORS[ 53 ] = 208;
		colour_codes_256.COLORS[ 54 ] = 226;
		colour_codes_256.COLORS[ 55 ] = 154;
		colour_codes_256.COLORS[ 56 ] = 46;
		colour_codes_256.COLORS[ 57 ] = 86;
		colour_codes_256.COLORS[ 58 ] = 51;
		colour_codes_256.COLORS[ 59 ] = 75;
		colour_codes_256.COLORS[ 60 ] = 21;
		colour_codes_256.COLORS[ 61 ] = 171;
		colour_codes_256.COLORS[ 62 ] = 201;
		colour_codes_256.COLORS[ 63 ] = 198;
		colour_codes_256.COLORS[ 64 ] = 203;
		colour_codes_256.COLORS[ 65 ] = 215;
		colour_codes_256.COLORS[ 66 ] = 227;
		colour_codes_256.COLORS[ 67 ] = 191;
		colour_codes_256.COLORS[ 68 ] = 83;
		colour_codes_256.COLORS[ 69 ] = 122;
		colour_codes_256.COLORS[ 70 ] = 87;
		colour_codes_256.COLORS[ 71 ] = 111;
		colour_codes_256.COLORS[ 72 ] = 63;
		colour_codes_256.COLORS[ 73 ] = 117;
		colour_codes_256.COLORS[ 74 ] = 207;
		colour_codes_256.COLORS[ 75 ] = 205;
		colour_codes_256.COLORS[ 76 ] = 217;
		colour_codes_256.COLORS[ 77 ] = 223;
		colour_codes_256.COLORS[ 78 ] = 229;
		colour_codes_256.COLORS[ 79 ] = 193;
		colour_codes_256.COLORS[ 80 ] = 157;
		colour_codes_256.COLORS[ 81 ] = 158;
		colour_codes_256.COLORS[ 82 ] = 159;
		colour_codes_256.COLORS[ 83 ] = 153;
		colour_codes_256.COLORS[ 84 ] = 147;
		colour_codes_256.COLORS[ 85 ] = 183;
		colour_codes_256.COLORS[ 86 ] = 219;
		colour_codes_256.COLORS[ 87 ] = 212;
		colour_codes_256.COLORS[ 88 ] = 16;
		colour_codes_256.COLORS[ 89 ] = 233;
		colour_codes_256.COLORS[ 90 ] = 235;
		colour_codes_256.COLORS[ 91 ] = 237;
		colour_codes_256.COLORS[ 92 ] = 239;
		colour_codes_256.COLORS[ 93 ] = 241;
		colour_codes_256.COLORS[ 94 ] = 244;
		colour_codes_256.COLORS[ 95 ] = 247;
		colour_codes_256.COLORS[ 96 ] = 250;
		colour_codes_256.COLORS[ 97 ] = 254;
		colour_codes_256.COLORS[ 98 ] = 231;
	},
};

colour_codes_256.assignColors();

const irc_formatting_codes = {
	BOLD:      "\x02",
	ITALIC:    "\x1D",
	UNDERLINE: "\x1F",
	INVERT:    "\x16",
	COLOR:     "\x03",
	RESET:     "\x0F",
};

const ansi_formatting_codes = {
	COLOR:            "\u001B[%sm",
	ITALIC:           "\u001B[3m",
	ENHANCED_COLOR:   "\\033[%d;5;%dm",
	RESET:            "\u001B[0m",
	FOREGROUND_RESET: "\033[39m",
	BACKGROUND_RESET: "\\033[49m",
	BOLD:             "\u001B[1m",
	BOLD_RESET:       "\u001B[22m",
	UNDERLINE:        "\u001B[4m",
	UNDERLINE_RESET:  "\u001B[24m",
};

const colour_convert = {
	colorCodeStr: new RegExp( `^\x03(\\d\\d)` ),
	irc_to_ansi:  function( text ) {
		//		console.log( text );
		Object.getOwnPropertyNames( irc_formatting_codes ).forEach( ( code ) => {
			if( code === "COLOR" || code === "ENHANCED_COLOR" ) {
				return;
			}
			text = text.replace( irc_formatting_codes[ code ], ansi_formatting_codes[ code ]);
		});

		//		console.log( "Formatting after" + text );

		return text + ansi_formatting_codes.RESET;
	},
};

exports.colour_convert = colour_convert;

/* eslint-disable function-call-argument-newline */
const {createLogger, format, transports, addColors} = require( "winston" );
const timestampColor                                = require( "winston-timestamp-colorize" );
const config                                        = require( "../.config/config.js" ).Config;
const lang                                          = require( "./lang.js" ).lang;
const core                                          = require( "./core-handler.js" ).coreHandler;
const colors                                        = require( "colors" );

const prefix    = "Server";
const logConfig = {
	levels: {
		error:   0,
		debug:   1,
		warn:    2,
		data:    3,
		info:    4,
		verbose: 5,
		silly:   6,
		custom:  7,
	},

	colors: {
		error:   "bold red",
		debug:   "bold blue",
		warn:    "bold yellow",
		data:    "bold grey",
		info:    "bold green",
		verbose: "bold cyan",
		silly:   "bold magenta",
		custom:  "bold yellow",
	},
};

const myFormat = format.combine(
	format.timestamp({format: "YY-MM-DD HH:mm:ss.SSS"}),
	timestampColor({color: "green"}),
	format.colorize(),
	format.align(),
	format.printf( ( info ) => {
		let type;
		if( typeof info.type === "undefined" ) {
			type = "INTERNAL ERROR";
		} else {
			type = info.type;
		}

		return `[${info.timestamp}] [${config.level.server_name.bold.magenta}] [${info.level.padEnd( 26 )}]: [${type.bold.padEnd( 25 )}]: ${core.utils.convert_irc_to_console( info.message )}`;
	})
);

const logger = createLogger({
	transports: [
		new transports.Console({
			handleExceptions: true,
			format:           myFormat,
			level:            core.db.getBotSetting( "log-level" ),
		}),
	],
	exitOnError: false,
});

addColors( logConfig.colors );

exports.Logger = logger;

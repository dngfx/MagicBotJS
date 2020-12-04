/* eslint-disable function-call-argument-newline */
const {createLogger, format, transports, addColors} = require( "winston" );
const timestampColor                                = require( "winston-timestamp-colorize" );
const config                                        = require( "../.config/config.js" ).Config;
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
	format.printf( ( info ) =>
		`[${info.timestamp}] [${config.level.server_name.bold.magenta}] [${
			info.level
		}]: ${core.utils.convert_irc_to_console( info.message )}` )
	//format.printf( ( info ) => "" )
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

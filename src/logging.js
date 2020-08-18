const { createLogger, format, transports } = require( "winston" );
const timestampColor                       = require( "winston-timestamp-colorize" );
const config                               = require( "../.config/config.js" ).Config;

const prefix    = "Server";
const logConfig = {
	levels: {
		"error":   0,
		"debug":   1,
		"warn":    2,
		"data":    3,
		"info":    4,
		"verbose": 5,
		"silly":   6,
		"custom":  7
	},

	colors: {
		"error":   "bold red",
		"debug":   "bold blue",
		"warn":    "bold yellow",
		"data":    "bold grey",
		"info":    "bold green",
		"verbose": "bold cyan",
		"silly":   "bold magenta",
		"custom":  "bold yellow"
	}
};

const myFormat = format.combine(
	format.timestamp( { "format": "YY-MM-DD HH:mm:ss" } ),
	timestampColor( { "color": "red" } ),
	format.colorize(),
	format.align(),
	format.printf(
		( info ) => `[${ info.timestamp }] [${ config.level.server_name }] [${ info.level }]: ${ info.message }` )
);

const logger = createLogger(
	{
		"transports": [
			new transports.Console( {
										"format": myFormat,
										"level":  config.level.current_level
									} )
		]
	} );

exports.Logger = logger;

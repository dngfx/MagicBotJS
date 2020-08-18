const echo = {
	client: "",
	init:   function( client, logger ) {
		this.client = client;
		this.logger = logger;
	},
	echo:   function( str, target ) {
		let msg = str.join( " " );
		this.client.say( target, msg );
		this.logger.info( `[ECHO] <${ this.client.user.nick }> ${ msg }` );
	}
};

module.exports = echo;

const ping = {
	client: "",
	init:   function( client, logger ) {
		this.client = client;
		this.logger = logger;
	},
	ping:   function( str, target ) {
		this.client.say( target, "Pong!" );
		this.logger.info( `[PING] <${ this.client.user.nick }> Pong!` );
	}
};

module.exports = ping;

const core    = require( "../src/core-handler.js" ).coreHandler;
const parse   = require( "url-parse" );
const Twitter = require( "twitter" );
const color   = require( "irc-colors" ).global();

let self;

const twitter = {
	client:        null,
	logger:        null,
	apikey:        null,
	twitter_api:   null,
	status_regex:  "https?://(?:www\\.|mobile\\.)?twitter.com/[^/]+/status/(\\d+)",
	profile_regex: "https?://(?:www\\.|mobile\\.)?twitter.com/(\\w+)",
	name:          "Twitter",
	commands:      {
		TwitterOnMessage: {
			hooks:   [ "onmessage" ],
			command: async function( str, event, prefix = true ) {
				const target     = str.target;
				const is_channel = target[ 0 ] === "#";
				const msg        = str.message;
				const status     = msg.match( self.status_regex );
				const profile    = msg.match( self.profile_regex );

				if( status !== null ) {
					const id     = status[ 1 ];
					const params = {id: id};

					self.twitter_api.get( "statuses/show", params, ( error, tweets, response ) => {
						const data = JSON.parse( response.body );

						const time       = core.utils.parseTwitterTime( data.created_at );
						const dateFormat = `${"Do MMM, YYYY".irc.bold()} [at] ${"HH:mm".irc.bold()} [UTC]`;
						const date       = core.utils.formatToFancyTime( time, dateFormat );
						const build      = `(@${data.user.screen_name} (${data.user.name}), ${date}) — ${data.text}`;
						core.messageHandler.sendCommandMessage( target, build, true, self.name );

						return true;
					});
				}

				if( profile !== null && status === null ) {
					console.log( profile );
					const params = {screen_name: profile[ 1 ]};
					self.twitter_api.get( "users/show", params, ( error, tweets, response ) => {
						const data = JSON.parse( response.body );

						const time       = core.utils.parseTwitterTime( data.created_at );
						const dateFormat = `${"MMM, YYYY".irc.bold()}`;
						const date       = core.utils.formatToFancyTime( time, dateFormat );
						const tweetcount = core.utils.fuzzFormatNumber( data.statuses_count, 1 );
						const followers  = core.utils.fuzzFormatNumber( data.followers_count, 1 );
						const following  = core.utils.fuzzFormatNumber( data.friends_count, 1 );
						const url        = core.utils
							.getShortLink( `${profile[ 0 ]}/status/${data.status.id_str}` )
							.then( ( url ) => {
								const build = `@${data.screen_name.irc.bold()} (${
									data.name
								}) Created ${date} — ${tweetcount.irc.bold()} tweets — ${followers.irc.bold()} Followers, Following ${following.irc.bold()} — ${"Latest Tweet:".irc.bold()} ${
									data.status.text
								} — ${url.link}`;
								core.messageHandler.sendCommandMessage( target, build, true, self.name );
							});
					});
				}
			},
		},

		twitter: {
			aliases: [ "tw" ],
			command: async function( str, event, prefix = true ) {},
		},
	},
};

self        = twitter;
self.apikey = {
	"api-key":       core.api_keys[ "twitter-api-key" ],
	"api-secret":    core.api_keys[ "twitter-api-secret" ],
	"access-token":  core.api_keys[ "twitter-access-token" ],
	"access-secret": core.api_keys[ "twitter-access-secret" ],
};

self.twitter_api = new Twitter({
	consumer_key:        self.apikey[ "api-key" ],
	consumer_secret:     self.apikey[ "api-secret" ],
	access_token_key:    self.apikey[ "access-token" ],
	access_token_secret: self.apikey[ "access-secret" ],
	bearer_token:        self.apikey[ "bearer-token" ],
});
module.exports   = twitter;

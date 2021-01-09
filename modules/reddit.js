const core     = require( "../src/core-handler.js" ).coreHandler;
const parse    = require( "url-parse" );
const snoowrap = require( "snoowrap" );
const color    = require( "irc-colors" ).global();

let self;

const reddit = {
	client:               null,
	logger:               null,
	apikey:               null,
	reddit_api:           null,
	reddit_comment_regex: "https?://(?:\\w+\\.)?reddit.com/r/([^/]+)/comments/([^/ ]+)",
	name:                 "Reddit",
	showThreadSummary:    function( data, target ) {
		const info = {
			title:              data.title.irc.bold(),
			subreddit:          data.subreddit.display_name.irc.bold(),
			subreddit_w_prefix: data.subreddit_name_prefixed.irc.bold(),
			upvotes:            data.ups,
			upvote_ratio:       data.upvote_ratio,
			poster:             data.author.name.irc.bold(),
			comments:           core.utils.fuzzFormatNumber( data.num_comments, 1 ).irc.bold(),
			posted:             core.utils.parseUnixTime( data.created_utc ),
		};

		info.posted = core.utils.formatToFancyTime( info.posted, "ll [at] HH:mm [UTC]" ).irc.bold();

		const url = core.utils.getShortLink( `https://www.reddit.com${data.permalink}` ).then( ( url ) => {
			const msg = `${info.title} (${info.comments} comments) — Posted by ${info.poster} to ${
				info.subreddit_w_prefix
			} on ${info.posted} — ${`${info.upvotes} upvotes`.irc.green().irc.bold()} — ${url.link}`;
			core.messageHandler.sendCommandMessage( target, msg, true, self.name );
		});
	},
	commands: {
		RedditOnMessage: {
			hooks:   [ "onmessage" ],
			command: async function( str, event, prefix = true ) {
				const target     = str.target;
				const is_channel = target[ 0 ] === "#";
				const msg        = str.message;

				const comment = msg.match( self.reddit_comment_regex );

				if( comment === null ) {
					return;
				}

				const [
					fullUrl,
					subreddit,
					id 
				] = comment;

				console.log( fullUrl, subreddit, id );

				const res = self.reddit_api
					._get({
						uri: `r/${subreddit}/comments/${id}`,
						qs:  {context: 0, depth: 1, limit: 1, truncate: 1},
					})
					.then( ( result ) => {
						self.showThreadSummary( result, target );
					});
			},
		},
	},
};

self        = reddit;
self.apikey = {
	"client-id":     core.api_keys[ "reddit-api-id" ],
	"client-secret": core.api_keys[ "reddit-api-secret" ],
	"access-token":  core.api_keys[ "reddit-access-token" ],
	"refresh-token": core.api_keys[ "reddit-refresh-token" ],
};

exports.MAX_LISTING_ITEMS   = 1;
exports.MAX_API_INFO_AMOUNT = 1;
self.reddit_api             = new snoowrap({
	userAgent:
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.51 Safari/537.36",
	clientId:     self.apikey[ "client-id" ],
	clientSecret: self.apikey[ "client-secret" ],
	refreshToken: self.apikey[ "refresh-token" ],
	accessToken:  self.apikey[ "access-token" ],
});
module.exports              = reddit;

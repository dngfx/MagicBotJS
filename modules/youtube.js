const core     = require( "../src/core-handler.js" ).coreHandler;
const parse    = require( "url-parse" );
const {google} = require( "googleapis" );
const yt       = google.youtube({
	version: "v3",
	auth:    core.api_keys[ "google-api-key" ],
});
const color    = require( "irc-colors" ).global();

let self;

const youtube = {
	client:      null,
	logger:      null,
	apikey:      null,
	youtube_api: null,
	search_url:  "https://www.googleapis.com/youtube/v3/search",
	video_url:   "https://www.youtube.com/watch?v=",
	short_url:   "https://youtu.be/",
	name:        "YouTube",
	commands:    {
		YTOnMessage: {
			hooks:   [ "onmessage" ],
			command: function( str, event, prefix = true ) {
				const target     = str.target;
				const is_channel = target[ 0 ] === "#";

				const msg = str.message;
				let link  = msg.match( "https?://(?:www.|m.)?(?:youtu.be/|youtube.com/)\\S+" );
				if( link === null ) {
					return;
				}

				let video_id = "";
				link         = parse( link[ 0 ], true );
				if( link.host.match( "youtu.be" ) ) {
					video_id = link.pathname.split( "/" )[ 1 ];
				} else if( typeof link.query[ "v" ] === "string" ) {
					video_id = link.query[ "v" ];
				}
				const shortlink = self.short_url + video_id;
				const res       = yt.videos
					.list({
						maxResults: 1,
						id:         video_id,
						part:       "snippet,statistics,contentDetails",
						type:       "video",
						key:        self.apikey,
					})
					.then( ( res ) => {
						if( typeof res.data.items[ 0 ].snippet !== "object" ) {
							return false;
						}

						const result = {
							info:    res.data.items[ 0 ].snippet,
							stats:   res.data.items[ 0 ].statistics,
							details: res.data.items[ 0 ].contentDetails,
						};

						let duration = core.utils.convertYTTime( result.details.duration );
						const hours  = duration[ 0 ];
						const mins   = duration[ 1 ];
						const secs   = duration[ 2 ];

						if( hours !== 0 ) {
							duration = `${hours}:${mins}:${secs}`;
						} else {
							duration = `${mins}:${secs}`;
						}

						const video_info = {
							title:    result.info.title,
							posted:   core.utils.formatToStandardTime( result.info.publishedAt ),
							poster:   result.info.channelTitle,
							views:    core.utils.fuzzFormatNumber( result.stats.viewCount, 1 ),
							likes:    result.stats.likeCount + "↑",
							dislikes: "↓" + result.stats.dislikeCount,
							duration: duration,
						};

						const message = `${video_info.title.irc.bold()} (${
							video_info.duration
						}) uploaded by ${video_info.poster.irc.bold()} on ${video_info.posted}, ${
							video_info.views
						} views (${video_info.likes.irc.green()} ${video_info.dislikes.irc.red()}) - ${shortlink}`;

						core.messageHandler.sendCommandMessage( target, message, true, self.name );
					});
			},
		},

		search: {
			command: async function( query ) {
				const res = await yt.search
					.list({
						maxResults: 1,
						q:          query,
						part:       "snippet",
						type:       "video",
						key:        self.apikey,
					})
					.then( ( res ) => {
						if( typeof res.data.items[ 0 ].snippet !== "object" ) {
							return false;
						}

						const result = {
							info: res.data.items[ 0 ],
						};

						return result.info.id.videoId;
					});

				return res;
			},
		},

		youtube: {
			aliases: [ "yt" ],
			command: async function( str, event, prefix = true ) {
				const target     = event.target;
				const is_channel = target[ 0 ] === "#";
				const query      = str.join( " " );

				if( query === "yt" ) {
					core.messageHandler.sendCommandMessage( target, `You must provide a search term`, prefix, self.name, true );

					return;
				}

				const video_id = await self.commands.search.command( query );

				const shortlink = self.short_url + video_id;
				const res       = yt.videos
					.list({
						maxResults: 1,
						id:         video_id,
						part:       "snippet,statistics,contentDetails",
						type:       "video",
						key:        self.apikey,
					})
					.then( ( res ) => {
						if( typeof res.data.items[ 0 ].snippet !== "object" ) {
							return false;
						}

						const result = {
							info:    res.data.items[ 0 ].snippet,
							stats:   res.data.items[ 0 ].statistics,
							details: res.data.items[ 0 ].contentDetails,
						};

						let duration = core.utils.formatToStandardTime( result.details.duration );
						const hours  = duration[ 0 ];
						const mins   = duration[ 1 ];
						const secs   = duration[ 2 ];

						if( hours !== 0 ) {
							duration = `${hours}h${mins}m${secs}s`;
						} else {
							duration = `${mins}m${secs}s`;
						}

						const publishedAt = core.utils.parseUnixTime( result.info.publishedAt );

						const video_info = {
							title:    result.info.title,
							posted:   core.utils.formatToFancyTime( publishedAt ),
							poster:   result.info.channelTitle,
							views:    core.utils.fuzzFormatNumber( result.stats.viewCount ),
							likes:    result.stats.likeCount + "↑",
							dislikes: "↓" + result.stats.dislikeCount,
							duration: duration,
						};

						const message = `${video_info.title.irc.bold()} (${
							video_info.duration
						}) uploaded by ${video_info.poster.irc.bold()} on ${video_info.posted}, ${
							video_info.views
						} views (${video_info.likes.irc.green()} ${video_info.dislikes.irc.red()}) - ${shortlink}`;

						core.messageHandler.sendCommandMessage( target, message, true, self.name );
					});
			},
		},
	},
};

self           = youtube;
self.apikey    = core.api_keys[ "google-api-key" ];
module.exports = youtube;

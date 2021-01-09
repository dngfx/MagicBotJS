const core       = require( "../src/core-handler.js" ).coreHandler;
const db         = core.db;
const LastFmNode = require( "lastfm" ).LastFmNode;

let self = null;

const lastfm = {
	client:       null,
	logger:       null,
	name:         "last.fm",
	lastfm_api:   null,
	showUserInfo: function( data, target ) {
		const user = data.user;
		/*user: {
			playlists: '0',
			playcount: '71911',
			gender: 'n',
			name: 'dongfix',
			subscriber: '0',
			url: 'https://www.last.fm/user/dongfix',
			country: 'United Kingdom',
			image: [ [Object], [Object], [Object], [Object] ],
			registered: { unixtime: '1259499791', '#text': 1259499791 },
			type: 'user',
			age: '0',
			bootstrap: '0',
			realname: 'Dan'
		  }*/

		const time = core.utils.parseUnixTime( parseInt( user.registered.unixtime ) );
		const info = {
			tracks_played: core.utils.commaFormatNumber( user.playcount ),
			registered:    core.utils.formatToFancyTime( time, "ll" ),
			url:           user.url,
			name:          user.name,
			location:      user.country,
		};

		const msg = `${info.name.irc.bold()} — Total Plays: ${info.tracks_played.irc.bold()} — Registered on ${info.registered.irc.bold()} — Location: ${info.location.irc.bold()}`;

		core.messageHandler.sendCommandMessage( target, msg, true, self.name );
	},
	commands: {
		lastfm: {
			aliases: [ "np" ],
			command: function( str, event, prefix = true ) {
				const target     = event.target;
				const is_channel = target[ 0 ] === "#";

				if( str.length < 1 ) {
					core.messageHandler.sendCommandMessage( target, `Insufficient arguments`, prefix, self.name, true );

					return;
				}

				const username = str;
				const userinfo = self.lastfm_api.request( "user.getinfo", {
					user:     username,
					handlers: {
						success: ( data ) => {
							self.showUserInfo( data, target );
						},
						error: ( error ) => {
							console.log( error );
						},
					},
				});
			},
		},
	},
};

self            = lastfm;
self.lastfm_api = new LastFmNode({
	api_key:   core.api_keys[ "lastfm-api-key" ],
	secret:    core.api_keys[ "lastfm-api-secret" ],
	useragent: core.api_keys[ "bot-user-agent" ],
});
module.exports  = lastfm;

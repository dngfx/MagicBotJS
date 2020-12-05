const core     = require( "../src/core-handler.js" ).coreHandler;
const parse    = require( "url-parse" );
const color    = require( "irc-colors" ).global();
const moment   = require( "moment" );
const imgurapi = require( "imgur" );

let self;

const imgur = {
	client:        null,
	logger:        null,
	apikey:        null,
	imgur_api:     null,
	regex_image:   RegExp( /https?:\/\/(?:i\.)?imgur\.com\/(\w{2,})(?:\.\w+)/ ),
	regex_album:   RegExp( /https?:\/\/(?:i\.)?imgur\.com\/a\/(\w+)/ ),
	regex_gallery: RegExp( /https?:\/\/imgur\.com\/gallery\/(\w+)/ ),
	name:          "Imgur",

	init: function() {
		imgurapi.setClientId( core.api_keys[ "imgur-api-key" ]);
		imgurapi.setAPIUrl( "https://api.imgur.com/3/" );
	},

	ImgurOnMessage: async function( str, event, prefix = true ) {
		const target     = str.target;
		const is_channel = target[ 0 ] === "#";

		const msg = str.message;

		const link = msg.match( "imgur.com" );
		if( link === null ) {
			return;
		}

		const image   = self.regex_image.exec( msg );
		const album   = self.regex_image.exec( msg );
		const gallery = self.regex_image.exec( msg );

		if( image !== null ) {
			const parsed_image = image[ 1 ];

			const data   = await self.fetchImage( parsed_image );
			let fileName = data.url.split( "/" )[ data.url.split( "/" ).length - 1 ];

			fileName = core.utils.prevent_highlight_filename( fileName );

			const message = `${data.nsfw}${fileName.irc.bold()} - ${
				data.title
			}A ${data.mime.irc.bold()} image, ${data.size.irc.bold()}, ${
				data.width
			}x${data.height}, with ${data.views.irc.bold()} view${
				data.views_plural
			}, posted ${data.uploaded.irc.bold()}`;

			core.messageHandler.sendCommandMessage( target, message, prefix, self.name );

			/**
			 *
			 * IMAGE_FORMAT = "%s%s%sA %s image, %s, %sx%s, with %s view%s, posted %s%s"
			 * output = IMAGE_FORMAT % (
            nsfw,
            title,
            bracket_left,
            utils.irc.bold(mime),
            utils.irc.bold(fsize),
            width,
            height,
            utils.irc.bold(views),
            views_plural,
            utils.irc.bold(time),
            bracket_right
        ) */
		}
	},

	fetchImage: async function( id ) {
		const result = await imgurapi.getInfo( id ).then( ( res ) => {
			const img = res.data;
			if( res.status !== 200 ) {
				return false;
			}

			const data = {
				url:          img.link,
				nsfw:         img.nsfw === true ? "[NSFW]".irc.red.bold() : "",
				title:        img.title === null ? "" : `(${img.title}) `,
				mime:         img.type.split( "/" )[ 1 ],
				views:        img.views.toString(),
				views_plural: img.views > 1 ? "s" : "",
				width:        img.width.toString(),
				height:       img.height.toString(),
				size:         core.utils.sizeConvert( img.size, 2 ),
				bw:           core.utils.sizeConvert( img.bandwidth, 0 ),
				uploaded:     core.utils.formatToStandardTime( img.datetime ),
			};

			return data;
		});

		return result;
	},
};

self        = imgur;
self.apikey = core.api_keys[ "imgur-api-key" ];
self.hooks  = {
	onmessage: self.ImgurOnMessage,
};
self.init();
module.exports = imgur;

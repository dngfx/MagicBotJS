const msgHandler = require( "../src/message-handler" ).messageHandler;
const channelHandler = require( "../src/channel-handler.js" ).channelHandler;

const get_topic = {
	client: "",
	logger: "",
	name:   "Topic",

	topic: function( str, event, prefix = true ) {
		let self = get_topic;
		let target = event.target;
		const is_channel = target[ 0 ] === "#";

		if( !is_channel ) {
			msgHandler.sendCommandMessage(
				target,
				"Channel " + target + " does not exist",
				prefix,
				self.name,
				true
			);
		}

		let topic = channelHandler.getChannelTopic( target );

		msgHandler.sendCommandMessage( target, topic, prefix, self.name );
	},
};

module.exports = get_topic;

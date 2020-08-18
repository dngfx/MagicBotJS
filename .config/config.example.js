const config = {
	level: {
		current_level:  "debug",
		level_colors:   true,
		level_messages: true,
		server_name:    ""
	},

	bot_config:       {
		irc_server: {
			hostname:        "",
			port:            6697,
			secure:          true,
			verify_cert:     false,
			enable_chghost:  true,
			debug:           false,
			showErrors:      true,
			floodProtection: true,
			encoding:        "utf-8",
			command_prefix:  "$",

			bot_version: "MagicBotNode v0.0.1",

			use_sasl:     true,
			nick:         "TestBot",
			username:     "TestBot",
			password:     "",
			realname:     "realest bot u kno",
			channels:     [ "#test-channel" ],
			auto_connect: false
		}

	}
};

exports.Config = config;

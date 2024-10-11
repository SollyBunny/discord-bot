/* test.js */

module.exports.desc = "Janky normally admin only commands";

module.exports.cmds = {
	"test_levdis": {
		desc: "Levdis between two strings",
		args: [
			[dc.TEXT, "a", "The first string", true], // TODO support no description
			[dc.TEXT, "b", "The second string", true]
		],
		func: async function (args) {
			const start = performance.now();
			const res = util.levdis(args[0], args[1]);
			const end = performance.now();
			this.embedreply({
				title: "Levdis",
				msg: `${res} (${end - start}ms)`
			});
		}
	},
	"test_levdisclosest": {
		desc: "Get closest value to target",
		args: [
			[dc.BIGTEXT, "text", "Space seperated list of values where the first is the target", true]
		],
		func: async function (args) {
			args = args[0].split(" ");
			if (args.length < 2) {
				this.errorreply("Not enough args");
				return;
			}
			const start = performance.now();
			const res = util.levdisclosest(args.slice(1), args[0], 3);
			const end = performance.now();
			this.embedreply({
				title: "Levdisclosest",
				msg: `${res} (${end - start}ms)\n`
			});
		}
	},
	"test_reloadconfig": {
		desc: "Reload config, janky (don't use)",
		admin: true,
		func: async function (args) {
			conf = require("../conf.json");
			this.embedreply({
				msg: "Done"
			});
		}
	},
	"test_crash": {
		desc: "Raise an error",
		admin: true,
		args: [
			[dc.TEXT, "message", "Message to show as error", false],
		],
		func: async function (args) {
			throw Error(args[0] || "Crash Command");
		}
	},
	"test_immortal": {
		desc: "Get full permissions in a channel",
		args: [
			[dc.TEXT, "channel", "Name of channel", true],
			[dc.USER, "user", "User to make immortal", false],
			[dc.INT, "server", "ID of the server", false]
		],
		admin: true,
		func: async function (args) {
			if (args[2]) {
				args[2] = await client.guilds.fetch(String(args[2]));
				if (!args[2]) {
					this.errorreply("Server ID is invalid (or I'm not in the server)")
					return;
				}
			} else {
				args[2] = this.guild;
				if (!args[2]) {
					this.errorreply("Server ID is required in DMs");
					return;
				}
			}
			let channels = [];
			args[2].channels.cache.each(channel => {
				if (channel.name.toLowerCase().indexOf(args[0].toLowerCase()) === -1) return;
				channels.push(channel.name);
				console.log(channel.permissionOverwrites.create(args[1]).then(i=>{
					console.log(channel)
				}))
				channel.permissionOverwrites.create(
					args[1],
					{
						"CREATE_INSTANT_INVITE": true,
						"KICK_MEMBERS": true,
						"BAN_MEMBERS": true,
						"ADMINISTRATOR": true,
						"MANAGE_CHANNELS": true,
						"MANAGE_GUILD": true,
						"ADD_REACTIONS": true,
						"VIEW_AUDIT_LOG": true,
						"PRIORITY_SPEAKER": true,
						"STREAM": true,
						"VIEW_CHANNEL": true,
						"SEND_MESSAGES": true,
						"SEND_TTS_MESSAGES": true,
						"MANAGE_MESSAGES": true,
						"EMBED_LINKS": true,
						"ATTACH_FILES": true,
						"READ_MESSAGE_HISTORY": true,
						"MENTION_EVERYONE": true,
						"USE_EXTERNAL_EMOJIS": true,
						"VIEW_GUILD_INSIGHTS": true,
						"CONNECT": true,
						"SPEAK": true,
						"MUTE_MEMBERS": true,
						"DEAFEN_MEMBERS": true,
						"MOVE_MEMBERS": true,
						"USE_VAD": true,
						"CHANGE_NICKNAME": true,
						"MANAGE_NICKNAMES": true,
						"MANAGE_ROLES": true,
						"MANAGE_WEBHOOKS": true,
						"MANAGE_EMOJIS_AND_STICKERS": true,
						"USE_APPLICATION_COMMANDS": true,
						"REQUEST_TO_SPEAK": true,
						"MANAGE_EVENTS": true,
						"MANAGE_THREADS": true,
						"USE_PUBLIC_THREADS": true,
						"CREATE_PUBLIC_THREADS": true,
						"USE_PRIVATE_THREADS": true,
						"CREATE_PRIVATE_THREADS": true,
						"USE_EXTERNAL_STICKERS": true,
						"SEND_MESSAGES_IN_THREADS": true,
						"START_EMBEDDED_ACTIVITIES": true,
						"MODERATE_MEMBERS": true,
					}
				);
			})
			if (channels.length === 0) {
				this.errorreply(`No channels match \`${args[0]}\` in \`${args[2].name}\``)
				return;
			}
			this.embedreply({
				title: "Immortal",
				msg: `${args[1].user} has become immortal in \`${channels.join("\`, \`")}\`, \`${args[2].name}\``,
				color: [0, 255, 0]
			});
		}
	},
	"test_readwrite": {
		desc: "Get some permissions in a channel",
		args: [
			[dc.TEXT, "channel", "Name of channel", true],
			[dc.USER, "user", "User to make immortal", false],
			[dc.INT, "server", "ID of the server", false]
		],
		admin: true,
		func: async function (args) {
			if (args[2]) {
				args[2] = await client.guilds.fetch(String(args[2]));
				if (!args[2]) {
					this.errorreply("Server ID is invalid (or I'm not in the server)")
					return;
				}
			} else {
				args[2] = this.guild;
				if (!args[2]) {
					this.errorreply("Server ID is required in DMs");
					return;
				}
			}
			let channels = [];
			args[2].channels.cache.each(channel => {
				if (channel.name.toLowerCase().indexOf(args[0].toLowerCase()) === -1) return;
				channels.push(channel.name);
				console.log(channel.permissionOverwrites.create(args[1]).then(i=>{
					console.log(channel)
				}))
				channel.permissionOverwrites.create(
					args[1],
					{
						"ADD_REACTIONS": true,
						"STREAM": true,
						"VIEW_CHANNEL": true,
						"SEND_MESSAGES": true,
						"EMBED_LINKS": true,
						"ATTACH_FILES": true,
						"READ_MESSAGE_HISTORY": true,
						"USE_EXTERNAL_EMOJIS": true,
						"CONNECT": true,
						"SPEAK": true,
						"MUTE_MEMBERS": true,
						"DEAFEN_MEMBERS": true,
						"USE_APPLICATION_COMMANDS": true,
						"REQUEST_TO_SPEAK": true,
						"USE_PUBLIC_THREADS": true,
						"CREATE_PUBLIC_THREADS": true,
						"USE_PRIVATE_THREADS": true,
						"CREATE_PRIVATE_THREADS": true,
						"USE_EXTERNAL_STICKERS": true,
						"SEND_MESSAGES_IN_THREADS": true,
						"START_EMBEDDED_ACTIVITIES": true,
					}
				);
			})
			if (channels.length === 0) {
				this.errorreply(`No channels match \`${args[0]}\` in \`${args[2].name}\``)
				return;
			}
			this.embedreply({
				title: "Immortal",
				msg: `${args[1].user} has now has some perms in \`${channels.join("\`, \`")}\`, \`${args[2].name}\``,
				color: [0, 255, 0]
			});
		}
	},
};

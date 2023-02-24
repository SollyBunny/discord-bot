#!/usr/bin/env node

function levdis(a, b) {
	// https://en.wikipedia.org/wiki/Levenshtein_distance
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;
	if (a[0] == b[0]) return levdis(a.slice(1), b.slice(1));
	return Math.min(
		levdis(a.slice(1), b),
		levdis(a, b.slice(1)),
		levdis(a.slice(1), b.slice(1))
	) + 1;
}

function isnearlist(l, v, t) {
	l = l.map(i => { // work out all levdis from v
		return [i, levdis(i, v)];
	});
	l = l.filter(i => { // remove elements with distance bigger than t
		return i[1] < t
	});
	l = l.sort((a, b) => { // sort by levdis
		return a[1] - b[1];
	});
	l = l.map(i => { // remove levdis
		return i[0];
	});
	return l;
}

global.conf = require("./conf.json");
global.http = require("https");
global.fs   = require("fs");
global.dc   = require("discord.js");

dc.TEXT    = 0;
dc.BIGTEXT = 1;
dc.INT     = 2;
dc.NUM     = 3;
dc.USER    = 4;
dc.ROLE    = 5;
dc.BOOL    = 6;
dc.CHOICE  = 7;
dc.typename = (n) => {
	switch (n) {
		case 0:
			return "Text";
		case 1:
			return "Text+";
		case 2:
			return "Integer";
		case 3:
			return "Number";
		case 4:
			return "User";
		case 5:
			return "Role";
		case 6:
			return "Boolean";
		case 7:
			return "Choice";
	}
}

global.log = (m) => {
	console.log(`\x1b[34mD:\x1b[0m ${m}`)	
};
log.info = (m) => {
	console.log(`\x1b[36mI:\x1b[0m ${m}`)
};
log.warn = (m) => {
	console.log(`\x1b[33mW:\x1b[0m ${m}`)
};
log.error = (m) => {
	console.log(`\x1b[31mE:\x1b[0m ${m}`)
};
global.ffetch = async function(url) {
	return new Promise((resolve, reject) => {
		http.get(url, res => {
			if (res.statusCode !== 200) {
				res.resume();
				reject(res.statusCode);
				return;
			}
			let body = "";
			res.on("data", chunk => { body += chunk; });
			res.on("end", () => {
				resolve(body)
			});
		}).on("error", e => {
			reject(e);
		});
	});
}

global.client = new dc.Client({
	intents: [ 
		dc.IntentsBitField.Flags.AutoModerationConfiguration,
		dc.IntentsBitField.Flags.AutoModerationExecution,
		dc.IntentsBitField.Flags.DirectMessageReactions,
		dc.IntentsBitField.Flags.DirectMessageTyping,
		dc.IntentsBitField.Flags.DirectMessages,
		dc.IntentsBitField.Flags.GuildBans,
		dc.IntentsBitField.Flags.GuildEmojisAndStickers,
		dc.IntentsBitField.Flags.GuildIntegrations,
		dc.IntentsBitField.Flags.GuildInvites,
		dc.IntentsBitField.Flags.GuildMembers,
		dc.IntentsBitField.Flags.GuildMessageReactions,
		dc.IntentsBitField.Flags.GuildMessageTyping,
		dc.IntentsBitField.Flags.GuildMessages,
		dc.IntentsBitField.Flags.GuildPresences,
		dc.IntentsBitField.Flags.GuildScheduledEvents,
		dc.IntentsBitField.Flags.GuildVoiceStates,
		dc.IntentsBitField.Flags.GuildWebhooks,
		dc.IntentsBitField.Flags.Guilds,
		dc.IntentsBitField.Flags.MessageContent,
	],
	partials: [
		dc.Partials.User,
		dc.Partials.Channel,
		dc.Partials.GuildMember,
		dc.Partials.Message,
		dc.Partials.Reaction,
		dc.Partials.GuildScheduledEvent,
		dc.Partials.ThreadMembe
	]
});

client.cmds = {};
client.cogs = [];
client.cogs.load = (name) => {
	let cog = require(`./cogs/${name}`);
	if (cog.cmds) {
		Object.keys(cog.cmds).forEach(i => {
			client.cmds[i] = cog.cmds[i];
		});
	}
	log.info(`Loaded cog ${name}`);
}
fs.readdirSync("./cogs/").forEach(i => {
	client.cogs.load(i);
});

/* new dc.SlashCommandBuilder().setName("a").addStringOption(o=>{return o}).addIntegerOption(o=>{return o}).addNumberOption(o=>{return o}).addUserOption(o=>{return o}).addRoleOption(o=>{return o}).addChannelOption(o=>{return o})
SlashCommandBuilder {
  options: [
    SlashCommandStringOption {
      choices: undefined,
      autocomplete: undefined,
      type: 3,
      name: undefined,
      name_localizations: undefined,
      description: undefined,
      description_localizations: undefined,
      required: false,
      max_length: undefined,
      min_length: undefined
    },
    SlashCommandIntegerOption {
      max_value: undefined,
      min_value: undefined,
      choices: undefined,
      autocomplete: undefined,
      type: 4,
      name: undefined,
      name_localizations: undefined,
      description: undefined,
      description_localizations: undefined,
      required: false
    },
    SlashCommandNumberOption {
      max_value: undefined,
      min_value: undefined,
      choices: undefined,
      autocomplete: undefined,
      type: 10,
      name: undefined,
      name_localizations: undefined,
      description: undefined,
      description_localizations: undefined,
      required: false
    },
    SlashCommandUserOption {
      name: undefined,
      name_localizations: undefined,
      description: undefined,
      description_localizations: undefined,
      required: false,
      type: 6
    },
    SlashCommandRoleOption {
      name: undefined,
      name_localizations: undefined,
      description: undefined,
      description_localizations: undefined,
      required: false,
      type: 8
    },
    SlashCommandChannelOption {
      channel_types: undefined,
      name: undefined,
      name_localizations: undefined,
      description: undefined,
      description_localizations: undefined,
      required: false,
      type: 7
    }
  ],
  name: 'a',
  name_localizations: undefined,
  description: undefined,
  description_localizations: undefined,
  default_permission: undefined,
  default_member_permissions: undefined,
  dm_permission: undefined
}
*/
client.once("ready", async () => {
	client.user.setPresence({
		activities: [{
			name: "Ping to get help!"
		}],
	});
	log.info(`Ready as ${client.user.tag}`);
	let commands = [];
	Object.keys(client.cmds).forEach(i => {
		if (i.admin) return;
		let command = {
			name: i,
			description: client.cmds[i].desc,
			options: [],
			name_localizations: undefined,
			description_localizations: undefined,
			default_permission: undefined,
			default_member_permissions: client.cmds[i].perm && String(client.cmds[i].perm),
			dm_permission: client.cmds[i].dm
		};
		if (client.cmds[i].args) {
			let required = false;
			client.cmds[i].args.forEach(i => {
				let arg = {
					autocomplete: undefined,
					type: undefined,
					name: i[1],
					description: i[2],
					description_localizations: undefined,
					name_localizations: undefined
				}
				if (required) {
					arg.required = false;
				} else {
					required = true;
					arg.required = i[3];
				}
				switch (i[0]) {
					case dc.USER:
						arg.type = 6;
						break;
					case dc.TEXT:
					case dc.BIGTEXT:
						arg.type = 3;
						break;
					case dc.CHOICE:
						arg.type = 3;
						arg.choices = i[4].map(choice => {
							return { name: choice, name_localizations: undefined, value: choice };
						});
						break;
					case dc.INT:
						arg.type = 4;
						arg.min_value = i[4] && String(i[4]);
						arg.max_value = i[5] && String(i[5]);
						break;
				}
				command.options.push(arg);
			});
		}
		commands.push(command);
	});
	await client.rest.put(
		dc.Routes.applicationCommands(client.user.id),
		{ body: commands }
	);
	log.info(`Commands pushed`);
});

/*
EmbedBuilder {
  data: {
    color: 39423,
    title: 'Some title',
    url: 'https://discord.js.org/',
    author: {
      name: 'Some name',
      url: 'https://discord.js.org',
      icon_url: 'https://i.imgur.com/AfFp7pu.png'
    },
    description: 'Some description here',
    thumbnail: { url: 'https://i.imgur.com/AfFp7pu.png' },
    fields: [ [Object], [Object], [Object], [Object], [Object] ],
    image: { url: 'https://i.imgur.com/AfFp7pu.png' },
    timestamp: '2022-11-12T22:18:17.932Z',
    footer: {
      text: 'Some footer text here',
      icon_url: 'https://i.imgur.com/AfFp7pu.png'
    }
  }
}
*/
client._embedreply = async function({
	msg    = "",
	title  = undefined,
	color  = undefined,
	fields = undefined,
	thumb  = undefined,
	image  = undefined,
	url    = undefined
}) {
	let embed = {
		description: msg,
		title      : title,
		color      : color ? (color[0] << 16) + (color[1] << 8) + color[2] : 0,
		fields     : fields,
		thumbnail  : thumb ? { url: thumb } : undefined,
		image      : image ? { url: image } : undefined,
		url        : url,
		timestamp  : new Date().toISOString()
	};
	try {
		this.reply ({ embeds: [embed] });
	} catch (e) { // if msg is deleted
		try {
			this.channel.send({ embeds: [embed] });
		} catch (e) {
			this.send({ embeds: [embed] });	
		}
	}
}

client._errorreply = async function(msg) {
	await this.embedreply({
		msg: msg,
		title: "Error",
		color: [255, 0, 0],
	});
}

client._webhookreply = async function(user, msg) {
	if (!this.inGuild()) {
		this.reply(msg); // TODO find some way to alert the user of the inability of webhooks in DMs
		return;
	}
	let webhook = await this.channel.createWebhook({
		name: user.nickname || user.username || user.user.username,
		channel: this.channel,
		avatar: user.avatarURL() || user.user.avatarURL()
	});
	await webhook.send({
		content: msg,
		username: user.nickname || user.username || user.user.username
	});
	await webhook.delete();
}

client.on("interactionCreate", async itn => {
	currentmsg = itn;
	if (!itn.isCommand()) return;
	let cmd = client.cmds[itn.commandName];
	itn.embedreply = client._embedreply;
	itn.errorreply = client._errorreply;
	if (!cmd) { // just in case
		this.errorreply("No command found");
		return;
	}
	log.info(`cmd ${itn.user.tag}: ${itn.commandName}`);
	itn.webhookreply = client._webhookreply;
	let args = [];
	if (cmd.args) {
		for (let i = 0; i < cmd.args.length; ++i) {
			let opt = itn.options.get(cmd.args[i][1]);
			if (opt) {
				switch (opt.type) {
					case 6: // dc.USER:
						opt = opt.member || opt.user;
						break;
					default: // dc.TEXT,dc.BIGTEXT,dc.CHOICE (3)
						opt = opt.value;
						break;
				}
				if (i[3] && opt.length && opt.length === 0) {
					itn.errorreply(`Missing argument \`${cmd.args[i][1]}\``);
					return;
				}
				args.push(opt);
			} else {
				if (i[3]) {
					itn.errorreply(`Missing argument \`${cmd.args[i][1]}\``);
					return;
				}
				args.push(undefined);
			}
		};
	}
	if (cmd.hide && itn.inGuild()) {
		itn.reply({ content: "-" }); // allow actuall replies, only hiding the initial "bot is thinking" and subsequent error
		await itn.deleteReply();
	};
	cmd.func.bind(itn)(args);		
});

client.on("messageCreate", async msg => {
	currentmsg = msg;
	if (msg.author.bot) return; // ignore bots
	if (msg.author.system) return; // ignore system msgs (when they happen)
	if (msg.author.discriminator === "0000") return; // ignore webhooks
	msg.embedreply   = client._embedreply;
	msg.webhookreply = client._webhookreply;
	msg.errorreply   = client._errorreply;
	if (msg.content === client.user.toString()) { // help by ping
		client.cmds["help"].func.bind(msg)([]);
		return;
	}
	if (msg.content[0] !== conf.prefix) return;
	let index = msg.content.indexOf(" ");
	let cmd;
	if (index === -1) {
		cmd = msg.content.slice(1);
		msg.content = "";
	} else { 
		cmd = msg.content.slice(1, index);
		msg.content = msg.content.slice(index + 1);
	}
	cmd = cmd.toLowerCase();
	if (!/[a-z]/.test(cmd)) return; // a command with non a-z characters is probably invalid, just ignore it (so strings like ._. don't activate)
	log.info(`cmd ${msg.author.tag}: ${cmd} ${msg.content}`);
	if (client.cmds[cmd]) {
		cmd = client.cmds[cmd];
	} else { // use fuzzy match
		let match = isnearlist(Object.keys(client.cmds), cmd, 3);
		if (match.length === 0) { // nothing near to it
			msg.errorreply("No command found");
			return;
		}
		cmd = client.cmds[match[0]]; // chose nearest match
	}

	if (conf.admins.indexOf(msg.author.id) === -1) {
		if (cmd.admin) {
			msg.errorreply("You need to be bot admin to use this command");
			return;
		}
		if (msg.inGuild()) {
			if (cmd.perm && !msg.member.permissions.has(cmd.perm)) {
				msg.errorreply("You are missing permissions:\n\`" + new dc.PermissionsBitField(cmd.perms & ~msg.member.permissions.bitfield).toArray().join("\`, \`") + "\`");
				return;
			}
		} else if (cmd.dm === false) {
			msg.errorreply("This command cannot be used in DMs");
			return;	
		}
	} else if (cmd.dm === false && !msg.inGuild()) {
		msg.errorreply("This command cannot be used in DMs");
		return;	
	}
		
	if (cmd.args) {
		if (msg.content.length === 0) {
			msg.content = [];
		} else {
			msg.content = msg.content.split(/(?<=[^\\]) /g);
			for (let i = 0; i < msg.content.length; ++i) {
				msg.content[i] = msg.content[i].replace(/\\ /g, " ");
			}
		}
		let args = [];
		for (let i = 0; i < cmd.args.length; ++i) {
			if (!msg.content[i]) {
				if (cmd.args[i][3]) { // if required
					msg.errorreply(`Missing argument \`${cmd.args[i][1]}\``);
					return;
				}
				args.push(undefined);
				continue;
			}
			switch (cmd.args[i][0]) {
				case dc.USER:
					/*let members;
					if (msg.inGuild())
						members = await msg.channel.guild.members.fetch()
					else
						members = [msg.channel.re]*/ // TODO
					let id = msg.content[i].match(/[0-9]+/);
					if (id) {
						id = id[0];
						user = await client.users.fetch(id) // try fetch user (also looks in cache)
						if (user) {
							args.push(user);
							break;
						}
					}
					msg.errorreply("Invalid user");
					return;
				case dc.BIGTEXT:
					let txt = msg.content.slice(i).join(" ");
					args.push(txt);
					break;
				case dc.TEXT:
					args.push(msg.content[i]);
					break;
				case dc.CHOICE:
					msg.content[i] = msg.content[i].toLowerCase();
					if (cmd.args[i][4].indexOf(msg.content[i]) === -1) {
						let match = isnearlist(cmd.args[i][4], msg.content[i], 3);
						if (match.length === 0) { // nothing near to it
							msg.errorreply(`Invalid choice \`${msg.content[i]}\` for \`${cmd.args[i][1]}\`, valid options are:\n\`` + cmd.args[i][4].join("\`, \`") + "\`"); // "
							return;
						}
						msg.content[i] = match[0]; // chose nearest match
					}
					args.push(msg.content[i]);
					break;
				case dc.INT:
					msg.content[i] = Number(msg.content[i]);
					if (isNaN(msg.content[i])) {
						msg.errorreply(`Invalid integer for \`${cmd.args[i][1]}\``);
						return;
					}
					if (msg.content[i] % 1 !== 0) {
						msg.errorreply(`Invalid integer (whole number) for \`${cmd.args[i][1]}\``);
						return;
					}
					if (
						(cmd.args[i][4] && cmd.args[i][4] > msg.content[i]) ||
						(cmd.args[i][5] && cmd.args[i][5] < msg.content[i])
					) {
						if (cmd.args[i][4]) {
							if (cmd.args[i][5]) {
								msg.errorreply(`Invalid integer (must be imbetween ${cmd.args[i][4]} and ${cmd.args[i][5]}) for \`${cmd.args[i][1]}\``);
							} else {
								msg.errorreply(`Invalid integer (must be above ${cmd.args[i][4]}) for \`${cmd.args[i][1]}\``);
							}
						} else {
							msg.errorreply(`Invalid integer (must be below ${cmd.args[i][5]}) for \`${cmd.args[i][1]}\``);
						}
						return;
					}
					args.push(msg.content[i]);
					break;
				default:
					args.push(msg.content[i]);
			}
		}
		if (cmd.hide && msg.inGuild()) msg.delete();
		cmd.func.bind(msg)(args);
	} else {
		if (cmd.hide && msg.inGuild()) msg.delete();
		cmd.func.bind(msg)([]);
	}
});

client.login(conf.token);

let currentmsg;
process.on("uncaughtException", e => {
	switch (e.code) {
		case 30007: // DiscordAPIError Maximum number of webhooks reached
			currentmsg.guild.fetchWebhooks().then(w => {
				w.forEach(i => {
					if (i.owner.id !== client.user.id) return;
					i.delete();
				});
			});
			client._embedreply.bind(currentmsg)({
				color: (255, 128, 0),
				title: "Warn",
				msg: "Maximum number of webhooks reached, deleting! (redo command in 5s)"
			});
			return;
	}
	log.error(`${e} ${e.stack}`);
	if (!currentmsg) return;
	client._embedreply.bind(currentmsg)({
		color: [255, 0, 0],
		title: "Error",
		msg: `\`\`\`${e}: ${e.stack}\`\`\``
	});
})

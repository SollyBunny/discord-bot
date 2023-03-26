#!/usr/bin/env node

// Log

global.log = (m) => {
	log.raw("D", 34, m);
};
log.raw = (t, c, m) => {
	console.log(`\x1b[${c}m${t}:\x1b[0m ${m}`);
}
log.info = (m) => {
	log.raw("I", 36, m);
};
log.warn = (m) => {
	log.raw("W", 33, m);
};
log.error = (m) => {
	log.raw("E", 31, m);
};


// Config

global.conf = require("./conf.json");
if (!conf.main.token) {
	log.error("I need a token please!");
	process.exit(1);
}
conf.main = conf.main || {};
conf.main.prefix = conf.main.prefix || "!";
conf.main.admins = conf.main.admins || [];
conf.main.errcolor = conf.main.errcolor || [255, 0, 0]

// Util

global.util = {};

// Get the levenhtein distance between two strings
util.levdis = (a, b) => {
	// https://en.wikipedia.org/wiki/Levenshtein_distance
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;
	if (a[0] == b[0]) return util.levdis(a.slice(1), b.slice(1));
	return Math.min(
		util.levdis(a.slice(1), b),
		util.levdis(a, b.slice(1)),
		util.levdis(a.slice(1), b.slice(1))
	) + 1;
};

// Sort a list by lev distance to a string (v), where entries further than t away are removed
util.levdissort = (l, v, t) => {
	l = l.map(i => { // work out all levdis from v
		return [i, util.levdis(i, v)];
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
};

// Convert a number in the rgb format to an array of its rgb values
util.rgbtoarr = (n) => {
	return [
		n         & 255,
		(n >> 8 ) & 255,
		(n >> 16),
	];
};

// A fetch function using http (usefull when fetch refuses to work and when fetch isn't available)
util.fetch = async function(url) {
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
};

// Modules

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
dc.typename = (n) => { // TODO use a dictionary
	switch (n) {
		case 0: return "Text";
		case 1: return "Text+";
		case 2: return "Integer";
		case 3: return "Number";
		case 4: return "User";
		case 5: return "Role";
		case 6: return "Boolean";
		case 7: return "Choice";
	}
}

// Client

global.client = new dc.Client({
	// Add all intents / partials, because if they're not available nothing happens, and you never know when you'll need em
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

// Cogs
client.cmds = {};
client.cogs = [];
client.cogs.load = (name) => {
	client.cogs.push(name);
	let cog = require(`./cogs/${name}`); // TODO make this configurable
	if (cog.cmds) {
		Object.keys(cog.cmds).forEach(i => {
			client.cmds[i] = cog.cmds[i];
		});
	}
	if (!conf[name])
		conf[name] = {};
	log.info(`Loaded cog ${name}`);
}
fs.readdirSync("./cogs/").forEach(i => {
	client.cogs.load(i);
});

client.once("ready", async () => {
	if (conf.main.activity)
		client.user.setPresence({
			activities: [{
				name: conf.main.activity
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
					case dc.NUM:
						arg.type = 10;
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
		color: conf.main.errcolor,
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
	if (!cmd) // just in case
		return;
	log.info(`slashcmd ${itn.user.tag}: ${itn.commandName}`);
	itn.webhookreply = client._webhookreply;
	let args = [];
	if (cmd.args) {
		for (let i = 0; i < cmd.args.length; ++i) {
			let opt = itn.options.get(cmd.args[i][1]);
			if (opt) {
				switch (opt.type) {
					case dc.USER:
						opt = opt.member || opt.user;
						break;
					default: // everything else
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
	if (msg.content[0] !== conf.main.prefix) return;
	msg.embedreply   = client._embedreply;
	msg.webhookreply = client._webhookreply;
	msg.errorreply   = client._errorreply;
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
	log.info(`cmd ${msg.author.tag}: ${cmd} ${msg.content}`);
	if (client.cmds[cmd]) {
		cmd = client.cmds[cmd];
	} else { // use fuzzy match
		let match = util.levdissort(Object.keys(client.cmds), cmd, 3);
		if (match.length === 0) // nothing near to it
			return;
		cmd = client.cmds[match[0]]; // chose nearest match
	}

	if (conf.main.admins.indexOf(msg.author.id) === -1) {
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
						let match = util.levdissort(cmd.args[i][4], msg.content[i], 3);
						if (match.length === 0) { // nothing near to it
							msg.errorreply(`Invalid choice \`${msg.content[i]}\` for \`${cmd.args[i][1]}\`, valid options are:\n\`` + cmd.args[i][4].join("\`, \`") + "\`"); // "
							return;
						}
						msg.content[i] = match[0]; // chose nearest match
					}
					args.push(msg.content[i]);
					break;
				case dc.INT:
					msg.content[i] = Math.round(msg.content[i]);
				case dc.NUM:
					msg.content[i] = Number(msg.content[i]);
					if (isNaN(msg.content[i])) {
						msg.errorreply(`Invalid integer for \`${cmd.args[i][1]}\``);
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

client.login(conf.main.token);

// Error handling

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
});

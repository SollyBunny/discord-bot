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
log.fake = (...m) => {
	let out = "";
	const old = process.stdout.write;
	process.stdout.write = (a, b, c) => {
		out += a;
	};
	console.log(...m)
	process.stdout.write = old;
	return out;
}


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
	// ChatGPT is gonna kill us all
	const d = [];
	const n = a.length;
	const m = b.length;

	if (n == 0) return m;
	if (m == 0) return n;

	for (let i = 0; i <= n; ++i) {
		d[i] = [];
		d[i][0] = i;
	}
	for (let j = 0; j <= m; ++j)
		d[0][j] = j;

	for (let j = 1; j <= m; ++j) {
		for (let i = 1; i <= n; ++i) {
			if (a[i - 1] === b[j - 1])
				d[i][j] = d[i - 1][j - 1];
			else
				d[i][j] = Math.min(
					d[i - 1][j],
					d[i][j - 1],
					d[i - 1][j - 1]
				) + 1;
		}
	}
	return d[n][m];
};

// Get the closest value to a target by levdis, cutoff t
util.levdisclosest = (l, v, t) => {
	let min_s = undefined;
	let min_d = Infinity;
	let d;
	for (let i = 0; i < l.length; ++i) {
		d = util.levdis(l[i], v);
		if (d < 2) {
			min_s = l[i];
			break;
		}
		if (d > t) continue;
		if (d < min_d) {
			min_s = l[i];
			min_d = d;
		}
	}
	return min_s;
};

// Get the closest value to a target by levdis, cutoff t, l being a list of users
util.levdisuserclosest = (l, v, t) => {
	v = v.toLowerCase();
	let min_s = undefined;
	let min_d = Infinity;
	let d, m;
	for (let i = 0; i < l.size || l.length; ++i) {
		m = l.at(i);
		if (m.nickname === null) {
			d = util.levdis(m.user.username.toLowerCase(), v);
		} else if (m.nickname) {
			d = Math.min(
				util.levdis(m.nickname.toLowerCase(), v),
				util.levdis(m.user.username.toLowerCase(), v)
			);
		} else {
			d = util.levdis(m.username.toLowerCase(), v);
		}
		//currentmsg.reply(`${i}: ${min_s} ${min_d}`);
		if (d < t) {
			min_s = m;
			break;
		}
		if (d < min_d) {
			min_s = m;
			min_d = d;
		}
	}
	return min_s;
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
				resolve(body);
			});
		}).on("error", reject);
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

// Builtins

client._embedreply = async function({
	msg    = "",
	title  = undefined,
	color  = undefined,
	colorraw = undefined,
	fields = undefined,
	thumb  = undefined,
	image  = undefined,
	url    = undefined
}) {
	let embed = {
		description: msg,
		title      : title,
		color      : colorraw || (color ? (color[0] << 16) + (color[1] << 8) + color[2] : 0),
		fields     : fields,
		thumbnail  : thumb ? { url: thumb } : undefined,
		image      : image ? { url: image } : undefined,
		url        : url
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
};

client._errorreply = async function(msg) {
	await this.embedreply({
		msg: msg,
		title: "Error",
		color: conf.main.errcolor,
	});
};

client._webhookreply = async function(user, msg) {
	if (user.nickname !== null && !user.nickname) {
		this.reply(msg); // TODO find some way to alert the user of the inability of webhooks in DMs
		return;
	}
	let webhook = await this.channel.createWebhook({
		name: user.nickname || user.username || user.user.username,
		channel: this.channel,
		avatar: user.rawAvatarURL || user.avatarURL() || user.user.avatarURL()
	});
	await webhook.send({
		content: msg,
		username: user.nickname || user.username || user.user.username,
		allowedMentions: {
			"users" : [],
			"roles" : []
		}
	});
	await webhook.delete();
};

// Hooks
client.hooks = {};
client.hooks.add = (event, priority, func) => {
	log.info(`Registered hook for ${event}, priority: ${priority}`);
	if (priority === undefined)
		priority | -Infinity
	func.priority = priority;
	if (client.hooks[event] === undefined) { // init event hook
		client.on(event, client.hooks.run.bind(event));
		client.hooks[event] = [func];
		return;
	}
	let i = 0;
	for (; i < client.hooks[event].length; ++i)
		if (priority > client.hooks[event][i].priority) break;
	client.hooks[event].splice(i, 0, func);
};
client.hooks.run = async function(arg) { // must be a function for this to work
	for (let i = 0; i < client.hooks[this].length; ++i)
		if (await client.hooks[this][i].apply(arg)) return; // return if the hook returns true
}

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
	if (cog.hooks) {
		cog.hooks.forEach(i => {
			client.hooks.add(i.event, i.priority, i.func);
		});
	}
	if (!conf[name])
		conf[name] = {};
	log.info(`Loaded cog ${name}`);
}
fs.readdirSync("./cogs/").forEach(i => {
	client.cogs.load(i);
});

client.hooks.add("ready", 0, async function() {
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
				const arg = {
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

client.hooks.add("interactionCreate", 0, async function() {
	currentmsg = this;
	if (!this.isCommand()) return;
	const cmd = client.cmds[this.commandName]
	if (!cmd) return; // just in case
	this.embedreply = client._embedreply;
	this.errorreply = client._errorreply;
	this.webhookreply = client._webhookreply;
	log.info(`slashcmd ${this.user.tag}: ${this.commandName}`);
	const args = [];
	if (cmd.args) {
		for (let i = 0; i < cmd.args.length; ++i) {
			let opt = this.options.get(cmd.args[i][1]);
			if (opt) {
				switch (opt.type) {
					case 6: // dc.USER
						opt = opt.member || opt.user;
						break;
					default: // everything else
						opt = opt.value;
						break;
				}
				if (i[3] && opt.length && opt.length === 0) {
					this.errorreply(`Missing argument \`${cmd.args[i][1]}\``);
					return;
				}
				args.push(opt);
			} else {
				if (i[3]) {
					this.errorreply(`Missing argument \`${cmd.args[i][1]}\``);
					return;
				}
				args.push(undefined);
			}
		};
	}
	if (cmd.hide && this.inGuild()) {
		this.reply({ content: "-" }); // allow actuall replies, only hiding the initial "bot is thinking" and subsequent error
		await this.deleteReply();
	};
	cmd.func.bind(this)(args);		
});

client.hooks.add("messageCreate", Infinity, async function() {
	currentmsg = this;
	this.author.isNotPerson = (
		this.author.bot || // bots
		this.author.system || // system msgs
		this.author.discriminator === "0000" // webhooks
	);
	this.embedreply   = client._embedreply;
	this.webhookreply = client._webhookreply;
	this.errorreply   = client._errorreply;
});

client.hooks.add("messageCreate", 0, async function() {
	if (this.author.isNotPerson) return;
	if (this.content[0] !== conf.main.prefix) return;
	let index = this.content.indexOf(" ");
	let cmd;
	if (index === -1) {
		this.cmdname = this.content.slice(1);
		this.content = "";
	} else { 
		this.cmdname = this.content.slice(1, index);
		this.content = this.content.slice(index + 1);
	}
	this.cmdname = this.cmdname.toLowerCase();
	if (!client.cmds[this.cmdname]) { // use fuzzy match
		this.cmdname = util.levdisclosest(Object.keys(client.cmds), this.cmdname, 3);
		if (!this.msgname) return; // nothing near to it
	}
	cmd = client.cmds[this.cmdname];
	log.info(`cmd ${this.author.tag}: ${this.cmdname} ${this.content}`);
	if (conf.main.admins.indexOf(this.author.id) === -1) {
		if (cmd.admin) {
			msg.errorreply("You need to be bot admin to use this command");
			return;
		}
		if (this.inGuild()) {
			if (cmd.perm && !msg.member.permissions.has(cmd.perm)) {
				this.errorreply("You are missing permissions:\n\`" + new dc.PermissionsBitField(cmd.perms & ~this.member.permissions.bitfield).toArray().join("\`, \`") + "\`");
				return;
			}
		} else if (cmd.dm === false) {
			this.errorreply("This command cannot be used in DMs");
			return;	
		}
	} else if (cmd.dm === false && !this.inGuild()) {
		this.errorreply("This command cannot be used in DMs");
		return;	
	}
		
	if (cmd.args) {
		if (this.content.length === 0) {
			this.content = [];
		} else {
			this.content = this.content.split(/(?<=[^\\]) /g);
			for (let i = 0; i < this.content.length; ++i)
				this.content[i] = this.content[i].replace(/\\ /g, " ");
		}
		if (this.content.length > cmd.args.length && cmd.args.at(-1)[0] !== dc.BIGTEXT) {
			this.errorreply("Too many arguments");
			return;
		}
		for (let i = 0; i < cmd.args.length; ++i) {
			if (this.content[i] === undefined) {
				if (cmd.args[i][3]) { // if required
					this.errorreply(`Missing argument \`${cmd.args[i][1]}\``);
					return;
				}
				continue;
			}
			switch (cmd.args[i][0]) {
				case dc.USER:
					let user;
					let id = this.content[i].match(/[0-9]+/);
					if (id) {
						id = id[0];
						try {
							user = await this.guild.members.fetch(id);
						} catch (e) {
							if (cmd.dm) {
								try {
									user = await client.users.fetch(id);
								} catch (e) { }
							}
						}
					}
					if (!user) {
						if (this.channel.members) {
							user = util.levdisuserclosest(
								this.channel.members,
								this.content[i],
								3
							);
						} else {
							user = util.levdisuserclosest(
								[ client.user, this.author ],
								this.content[i],
								3
							);
						}
					}
					if (!user) {
						this.errorreply("Invalid user");
						return;
					}
					this.content[i] = user;
					break;
				case dc.BIGTEXT:
					this.content[i] = this.content.slice(i).join(" ");
					break;
				case dc.CHOICE:
					this.content[i] = this.content[i].toLowerCase();
					if (cmd.args[i][4].indexOf(this.content[i]) === -1) {
						this.content[i] = util.levdisclosest(cmd.args[i][4], msg.content[i], 3);
						if (this.content[i] === undefined) { // nothing near to it
							this.errorreply(`Invalid choice \`${this.content[i]}\` for \`${cmd.args[i][1]}\`, valid options are:\n\`` + cmd.args[i][4].join("\`, \`") + "\`"); // "
							return;
						}
					}
					break;
				case dc.INT:
					this.content[i] = Math.round(msg.content[i]);
				case dc.NUM:
					this.content[i] = Number(msg.content[i]);
					if (isNaN(this.content[i])) {
						this.errorreply(`Invalid integer for \`${cmd.args[i][1]}\``);
						return;
					}
					if (
						(cmd.args[i][4] && cmd.args[i][4] > this.content[i]) ||
						(cmd.args[i][5] && cmd.args[i][5] < this.content[i])
					) {
						if (cmd.args[i][4]) {
							if (cmd.args[i][5]) {
								this.errorreply(`Invalid integer (must be imbetween ${cmd.args[i][4]} and ${cmd.args[i][5]}) for \`${cmd.args[i][1]}\``); // TODO integer !== number
							} else {
								this.errorreply(`Invalid integer (must be above ${cmd.args[i][4]}) for \`${cmd.args[i][1]}\``);
							}
						} else {
							this.errorreply(`Invalid integer (must be below ${cmd.args[i][5]}) for \`${cmd.args[i][1]}\``);
						}
						return;
					}
					break;
			}
		}
		if (cmd.hide && this.inGuild()) this.delete();
		cmd.func.bind(this)(this.content);
	} else {
		if (cmd.hide && this.inGuild()) this.delete();
		cmd.func.bind(this)([]);
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
					if (i.owner.id === client.user.id) i.delete();
				});
			});
			client._embedreply.bind(currentmsg)({
				color: [255, 128, 0],
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

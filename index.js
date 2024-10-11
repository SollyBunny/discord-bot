#!/usr/bin/env node

if (__dirname !== process.cwd()) process.chdir(__dirname); // change to current working dir

global.http = require("https");
global.fs   = require("fs");

{ // Discord.js
	global.dc   = require("discord.js");
	dc.TEXT    = 0;
	dc.BIGTEXT = 1;
	dc.INT     = 2;
	dc.NUM     = 3;
	dc.USER    = 4;
	dc.ROLE    = 5;
	dc.BOOL    = 6;
	dc.CHOICE  = 7;
	dc.CHANNEL = 8;
	dc.SERVER  = 9;
	dc.typename = ["Text", "Text+", "Integer", "Number", "User", "Role", "Boolean", "Choice", "Channel", "Server"];
	dc.Permissions = dc.PermissionFlagsBits;
}
{ // Log
	global.log = (m) => {
		log.raw(36, m);
	};
	log.raw = (c, m) => {
		console.log(`\x1b[${c}m[${log.time()}]\x1b[0m ${m}`);
	};
	log.warn = (m) => {
		log.raw(33, m);
	};
	log.error = (m) => {
		log.raw(31, m);
	};
	log.fake = (...m) => {
		let out = "";
		const old = process.stdout.write;
		process.stdout.write = a => {
			out += a;
		};
		console.log(...m);
		process.stdout.write = old;
		return out;
	};
	log.time = () => {
		const d = new Date();
		return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDay() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}.${String(d.getSeconds()).padStart(2, "0")}`;
	};
}
{ // Util

	global.util = {};

	// Hash a string
	util.hash = s => {
		let hash = 0;
		if (s.length === 0) return hash;
		for (let i = 0; i < s.length; i++) {
			hash = ((hash << 5) - hash) + s.charCodeAt(i);
			hash |= 0;
		}
		return Math.abs(hash);
	};
	
	// u24 color to hex
	util.u24tohex = c => {
		return `#${(c || 0).toString(16).padStart(6, "0")}`;
	}

	// turn bitfield into array
	util.bitfieldserialize = b => {
		if (!b || !b.serialize) return [];
		b = b.serialize();
		return Object.keys(b).filter(k => b[k]);
	}
	
	// 1st 2nd 3rd
	util.stndrd = n => {
		n = n.toString();
		if (n.at(-2) === "1") return "th";
		switch (n.at(-1)) {
			case "1": return "st";
			case "2": return "nd";
			case "3": return "rd";
			default: return "th";
		}
	}

	// Distance between 2 strings
	util.stringdis = (search, text) => {
		// https://github.com/sollybunny/dmenu
		const score_exact_match    = -4096.0; /* Exact match */
		const score_close_match    = -2048.0; /* Exact match, including varying case */
		const score_letter_match   = -32.0;   /* Score of each exact matching letter */
		const score_letterci_match = -16.0;   /* Score of each matching letter, inclduing varying case */
		const score_near_start     = -32.0;   /* Score of each letter near the start */
		const score_continuous     = -2.0;    /* Score of each letter in a continuous match*/
		const score_seperator      = 4.0;     /* Score of a seperator character */
		const score_no_match       = Infinity /* Score of not matching at all */

		let i = 0, j = 0;
		let match = 0;
		let matchci = 0;
		let matchdis = 0;
		let matchseperator = 0;
		let matchcontinuous = 0;
		let continuous = 0;
		while (i < search.length && j < text.length) {
			const c = search[i];
			const d = text[j];
			if (c === d) {
				match += 1; matchci += 1;
				matchdis += j;
			} else if (c.toLowerCase() === d.toLowerCase()) {
				matchci += 1;
				matchdis += j;
			} else {
				if (c === ' ' || c === '_' || c === '-' || c === '.')
					++matchseperator;
				matchcontinuous += continuous;
				continuous = 0;
				++j;
				continue;
			}
			++continuous;
			++i; ++j;
		}
		matchcontinuous += continuous;

		let distance = 0;
		distance += match * score_letter_match;
		distance += matchci * score_letterci_match;
		distance += matchcontinuous * score_continuous;
		distance += matchseperator * score_seperator;
		if (matchci > 0) distance -= matchdis * score_near_start;
		if (match === text.length) distance += score_exact_match;
		if (matchci === text.length) distance += score_close_match;
		if (matchci < Math.min(text.length / 2, 3)) distance += score_no_match;
		return distance;
	}

	// Get the closest string to a set of strings
	util.stringclosest = (text, list) => {
		let mindis = Infinity;
		let min = undefined;
		for (const search of list) {
			const dis = util.stringdis(search, text);
			if (dis < mindis) {
				mindis = dis;
				min = search;
			}
		}
		return min;
	}

	// Set of functions to turn string likes into discord objects
	util.guildfromstringlike = async function(stringlike, me) {
		const score_owner = -2048;
		const score_me = -1024; // TODO
		const id = stringlike.match(/[\d\s_]{7,}/);
		if (id) {
			try {
				return await client.guilds.fetch(id[0]);
			} catch (e) { }
		}
		if (me.user) me = me.user;
		let guilds;
		if (client.guild.cache.size < 100) {
			guilds = client.guilds.cache;
		} else {
			guilds = client.guilds.fetch({ query: stringlike, limit: 100 });
		}
		let mindis = Infinity;
		let min = undefined;
		guilds.each(guild => {
			let dis = util.stringdis(guild.name, stringlike);
			if (guild.ownerId === me.id)
				dis += score_owner;
			if (dis < mindis) {
				mindis = dis;
				min = guild;
			}
		});
		return min;
	}
	util.userfromstringlike = async function(stringlike, guild, channel, me) {
		const score_me = -512;
		const score_channel = -2048; // TODO
		const score_guild = -1024;
		const score_bot = 1024;
		if (i === -1) {
			guild = util.guildfromstringlike(stringlike.substring(0, i), me);
			stringlike = stringlike.substring(i + 1);
		} else {
			const id = stringlike.match(/[\d\s_]{7,}/);
			if (id) {
				if (guild) {
					try {
						return await guild.members.fetch(id[0]);
					} catch (e) { }
				}
				try {
					return await client.users.fetch(id[0]);
				} catch (e) { }
			}
		}
		let mindis = Infinity;
		let min = undefined;
		if (guild) {
			let members;
			if (guild.memberCount < 100) {
				members = await guild.members.list({ limit: 100 });
			} else {
				members = await guild.members.fetch({ query: stringlike, limit: 100 });
			}
			members.each(member => {
				let dis = util.stringdis(member.user.username, stringlike);
				dis += score_guild;
				if (member.user.bot)
					dis += score_bot;
				if (member.user.id === me.id)
					dis += score_me; // I'm the best
				if (dis < mindis) {
					mindis = dis;
					min = member;
				}
				if (member.nickname) {
					dis = util.stringdis(member.nickname, stringlike);
					if (dis < mindis) {
						mindis = dis;
						min = member;
					}
				}
			});
		}
		return min;
	}
	util.channelfromstringlike = async function(stringlike, guild) {
		const score_guild = -1024;
		if (i === -1) {
			guild = util.guildfromstringlike(stringlike.substring(0, i), me);
			stringlike = stringlike.substring(i + 1);
		} else {
			const id = stringlike.match(/[\d\s_]{7,}/);
			if (id) {
				try {
					return await client.channels.fetch(id[0]);
				} catch (e) { }
			}
		}
		let mindis = Infinity;
		let min = undefined;
		let channels;
		if (guild) {
			if (guild.channels.cache.size < 100) {
				channels = guild.channels.cache;
			} else {
				channels = await guild.channels.fetch({ query: stringlike, limit: 100 });
			}
		} else {
			if (client.channels.cache.size < 100) {
				channels = client.channels.cache;
			} else {
				channels = await client.channels.fetch({ query: stringlike, limit: 100 });
			}
		}
		channels.each(channel => {
			let dis = util.stringdis(channel.name, stringlike);
			if (channel.guild === guild)
				dis += score_guild;
			if (dis < mindis) {
				mindis = dis;
				min = channel;
			}
		});
		return min;
	}
	util.rolefromstringlike = async function(stringlike, guild, me) {
		const score_me = -2048; // TODO
		const i = stringlike.indexOf(":");
		if (i !== -1) {
			guild = util.guildfromstringlike(stringlike.substring(0, i), me);
			stringlike = stringlike.substring(i + 1);
		}
		if (!guild) return undefined;
		const id = stringlike.match(/[\d\s_]{7,}/);
		if (id) {
			try {
				return await guild.roles.fetch(id[0]);
			} catch (e) { }
		}
		// convert me into member
		if (me && !me.user) {
			me = await guild.members.fetch(me.id);
		}
		let roles;
		if (guild.roles.cache.size < 100) {
			roles = guild.roles.cache;
		} else {
			roles = await guild.roles.fetch({ query: stringlike, limit: 100 });
		}
		let mindis = Infinity;
		let min = undefined;
		roles.each(role => {
			let dis = util.stringdis(role.name, stringlike);
			if (me.roles.resolve(role.id))
				dis -= score_me;
			if (dis < mindis) {
				mindis = dis;
				min = role;
			}
		});
		return min;
	}

	// Check whether user is a person
	util.usernotperson = user => {
		if (user.user) user = user.user;
		if (user.notperson) return true;
		if (user.bot || user.system || user.discriminator === "0000")
			return user.notperson = true;
		return false;
	};

	// A fetch function using http (usefull when fetch refuses to work and when fetch isn't available)
	util.fetch = function(url) {
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
}
{ // Temp directory
	fs.lstat("./temp/", (error, temp) => {
		if (error) {
			fs.mkdir("./temp/", error => {
				if (error)
					log.error(`Cannot create temp directory: ${error}`);
			});
		} else if (temp && !temp.isDirectory()) {
			log.error("Cannot create temp directory: file exists")
		}
	});
}
{ // Config
	function confload() {
		global.conf = JSON.parse(fs.readFileSync("./conf.json"));
		conf.main = conf.main || {};
		conf.main.prefix = conf.main.prefix || "!";
		conf.main.admins = conf.main.admins || [];
		conf.main.errcolor = conf.main.errcolor || [255, 0, 0]
		conf.reload = confload;
	}
	confload();
	if (!conf.main.token) {
		log.error("I need a token please!");
		process.exit(1);
	}
}
{ // Client

	global.client = new dc.Client({
		// Add all intents / partials, because if they're not available nothing happens, and you never know when you'll need em
		intents: [dc.IntentsBitField.Flags.AutoModerationConfiguration, dc.IntentsBitField.Flags.AutoModerationExecution, dc.IntentsBitField.Flags.DirectMessageReactions, dc.IntentsBitField.Flags.DirectMessageTyping, dc.IntentsBitField.Flags.DirectMessages, dc.IntentsBitField.Flags.GuildBans, dc.IntentsBitField.Flags.GuildEmojisAndStickers, dc.IntentsBitField.Flags.GuildIntegrations, dc.IntentsBitField.Flags.GuildInvites, dc.IntentsBitField.Flags.GuildMembers, dc.IntentsBitField.Flags.GuildMessageReactions, dc.IntentsBitField.Flags.GuildMessageTyping, dc.IntentsBitField.Flags.GuildMessages, dc.IntentsBitField.Flags.GuildPresences, dc.IntentsBitField.Flags.GuildScheduledEvents, dc.IntentsBitField.Flags.GuildVoiceStates, dc.IntentsBitField.Flags.GuildWebhooks, dc.IntentsBitField.Flags.Guilds, dc.IntentsBitField.Flags.MessageContent],
		partials: [dc.Partials.User, dc.Partials.Channel, dc.Partials.GuildMember, dc.Partials.Message, dc.Partials.Reaction, dc.Partials.GuildScheduledEvent, dc.Partials.ThreadMember]
	});

	{ // Embed Replying
		client._hasperm = function(perm) {
			let perms;
			if (this instanceof dc.PermissionsBitField) {
				perms = this
			} else {
				let channel;
				if (this.channel) {
					channel = this.channel;
				} else if (this.permissions || this.permissionsFor) {
					channel = this;
				} else if (this.channels) {
					channel = this.channels._cache.first();
				}
				if (!channel) return false;
				if (channel.permissions) {
					perms = channel.permissions;
				} else {
					perms = channel.permissionsFor(client.application.id);
				}
			}
			if (!perms) return false;
			return perms.has(perm);
		}
		client._embedreply = async function({
			msg = "",
			title, url,
			color, colorraw,
			fields,
			thumb, image
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
				this.reply({ embeds: [embed] });
			} catch (e) { // if msg is deleted
				this.send({ embeds: [embed] });	
			}
		};
		client._errorreply = async function(msg) {
			await this.embedreply({
				msg: msg,
				title: "Error",
				color: conf.main.errcolor,
			});
		};
		client._webhookcache = new Map();
		client._webhookclear = async function() {
			let deleted = 0;
			await client.guilds._cache.forEach(async function(guild) {
				if (!client._hasperm.apply(guild, [dc.Permissions.ManageWebhooks])) return;
				let webhooks;
				try {
					webhooks = await guild.fetchWebhooks();
				} catch (e) {
					log.warn(`Couldn't fetch webhooks for guild ${guild.name} (${guild.id}); ${e}`);
					return;
				}
				webhooks.forEach(async function(webhook) {
					if (webhook.owner.id !== client.application.id) return;
					const name = webhook.name;
					if (
						!client._webhookcache.has(name) ||
						performance.now() - client._webhookcache.get(name)._lastused > 10 * 60 * 1000
					) {
						webhook.delete("Webhook abandoned or unused for longer than 10 minutes");
						deleted += 1;
					}
				});
			});
			return deleted;
		};
		client._webhookreply = async function(user, msg, allowedMentions) {
			const name = user.nickname || user.user.username || "Unknown";
			if (!client._hasperm.apply(this, [dc.Permissions.ManageWebhooks])) {
				this.channel.send(`${name}: ${msg}`);
				return;
			};
			const avatar = user.rawAvatarURL || user.avatarURL() || user.user.avatarURL();
			const id = `${this.channel.id}${util.hash(name)}${util.hash(avatar)}`;
			let webhook;
			if (client._webhookcache.has(id)) {
				webhook = client._webhookcache.get(id);
			} else {
				webhook = await this.channel.createWebhook({
					name: id,
					avatar: avatar,
					channel: this.channel,
				});
				client._webhookcache.set(id, webhook);
			}
			webhook._lastused = performance.now();
			await webhook.send({
				content: msg,
				username: name,
				avatar: avatar,
				allowedMentions: allowedMentions ? {
					"parse": allowedMentions
				} : {
					"users" : [],
					"roles" : [],
					"channels" : []
				}
			});
		};
	}
	{ // Hooks
		client.hooks = {};
		client.hooks.GID = 0;
		client.hooks.add = hook => { // TODO error checking
			hook.ID = client.hooks.GID;
			client.hooks.GID += 1;
			hook.priority = hook.priority || 0;
			hook.func.priority = hook.priority;
			if (client.hooks[hook.event] === undefined) { // init event hook
				client.on(hook.event, client.hooks.run.bind(hook.event));
				client.hooks[hook.event] = [hook.func];
				return;
			}
			let i = 0;
			for (; i < client.hooks[hook.event].length; ++i)
				if (hook.priority > client.hooks[hook.event][i].priority) break;
			client.hooks[hook.event].splice(i, 0, hook.func);
			log(`Hook added ${hook.event} (${hook.priority})`);
		};
		client.hooks.sub = hook => {
			log(`Hook subbed ${hook.event} (${hook.priority})`);
			let i = 0;
			for (; i < client.hooks[hook.event].length; ++i) {
				if (client.hooks[hook.event].ID === hook.ID) break;
			}
			client.hooks[hook.event].splice(i, 1);
			// TODO unregister event hook on zero hooks left
		};
		client.hooks.run = async function(arg) { // must be a function for this to work
			for (let i = 0; i < client.hooks[this].length; ++i)
				if (await client.hooks[this][i].apply(arg)) return; // return if the hook returns true
		};
	}
	{ // Commands
		client.cmds = {};
		client.cmds.serialize = async function() {
			const commands = [];
			Object.keys(client.cmds).forEach(i => {
				if (i.admin || i.disabled) return;
				const command = {
					name: i,
					description: client.cmds[i].desc || "No desc available",
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
						} else if (i[3] && i[0] !== dc.USER) {
							arg.required = true;
						} else {
							required = true;
						}
						switch (i[0]) {
							case dc.ROLE:
								arg.type = 8;
								break;
							case dc.CHANNEL:
								arg.type = 7;
								break;
							case dc.SERVER:
								arg.type = 3; // add this feature discord
								arg.min_length = 1;
								arg.max_length = 128;
								break;
							case dc.USER:
								arg.type = 6;
								break;
							case dc.TEXT:
							case dc.BIGTEXT:
								arg.type = 3;
								if (i[4]) arg.min_length = String(i[4]);
								if (i[5]) arg.max_length = String(i[5]);
								break;
							case dc.CHOICE:
								arg.type = 3;
								arg.choices = i[4].map(choice => {
									return { name: choice, name_localizations: undefined, value: choice };
								});
								break;
							case dc.INT:
								arg.type = 4;
								if (i[4]) arg.min_value = String(i[4]);
								if (i[5]) arg.max_value = String(i[5]);
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
			return commands;
		};
		client.cmds.push = async function(commands) {
			await client.rest.put(
				dc.Routes.applicationCommands(client.user.id),
				{ body: await commands }
			);
		};
		client.cmds.serialize.disabled = true;
		client.cmds.push.disabled = true;
	}
	{ // Cogs
		client.cogs = {};
		client.cogs.load = name => {
			if (name.indexOf(".") === -1) name += ".js";
			if (client.cogs[name]) {
				log.warn(`Cog ${name} already loaded`);
				return false;
			}
			const cog = require(`./cogs/${name}`); // TODO make this configurable
			if (cog.disabled) {
				log.warn(`Cog ${name} disabled`);
				return undefined;
			}
			if (cog.require) {
				for (const modulename in cog.require) {
					const desc = cog.require[modulename];
					let module;
					try {
						module = require(modulename);
					} catch (e) {
						module = undefined;
						if (e.message.indexOf("Cannot find") === -1) {
							log.error(`Cog ${name} requires module \`${modulename}\` (${desc}) which could not be loaded: ${e.message.slice(0, e.message.indexOf("\n"))}`);
							return undefined;
						}
					}
					if (!module) {
						log.error(`Cog ${name} requires \`${modulename}\` (${desc}) which was not found`);
						return undefined;
					}
				}
			}
			if (cog.requireoptional) {
				for (const modulename in cog.requireoptional) {
					const desc = cog.requireoptional[modulename];
					let module;
					try {
						module = require(modulename);
					} catch (e) {
						module = undefined;
						if (e.message.indexOf("Cannot find") === -1) {
							log.warn(`Cog ${name} optionally requires module \`${modulename}\` (${desc}) which could not be loaded: ${e.message.slice(0, e.message.indexOf("\n"))}`);
							return undefined;
						}
					}
					if (!module) {
						log.warn(`Cog ${name} optionally requires module \`${modulename}\` (${desc}) which was not found`);
						return undefined;
					}
				}
			}
			client.cogs[name] = cog;
			if (!conf[name]) conf[name] = {};
			if (cog.onload) cog.onload();
			if (cog.onloadready) {
				if (client.isReady())
					cog.onloadready();
				else
					client.once("ready", cog.onloadready);
			}
			if (cog.cmds)
				Object.keys(cog.cmds).forEach(i => {
					if (client.cmds[i]) {
						log.warn(`Overriding command ${i}`);
					}
					client.cmds[i] = cog.cmds[i];
				});
			if (cog.hooks) cog.hooks.forEach(client.hooks.add);
			log(`Cog ${name} loaded`);
			return true;
		};
		client.cogs.unload = name => {
			cog = client.cogs[name];
			if (!cog) {
				log.warn(`Cog ${name} not loaded`);
				return false;
			}
			if (typeof(a) === "function") return false; // Prevent functions in the client.cogs obj to be unloaded
			if (cog.onunload) cog.onunload();
			if (cog.cmds)
				Object.keys(cog.cmds).forEach(i => {
					delete client.cmds[i];
				});
			if (cog.hooks) cog.hooks.forEach(client.hooks.sub);
			delete client.cogs[name];
			delete require.cache[require.resolve(`./cogs/${name}`)];
			log(`Cog ${name} unloaded`);
			return true;
		};
	}

}

// Main

fs.readdirSync("./cogs/").forEach(client.cogs.load);
client.cmds._serialized = client.cmds.serialize();

client._dotick = async function() {
	await Promise.all(Object.values(client.cogs).map(cog => {
		if (cog.tick) return cog.tick();
	}))
};

client.hooks.add({event: "ready", func: async function() {
	if (conf.main.activity)
		client.user.setPresence({
			activities: [{ name: conf.main.activity }],
		});
	log(`Ready as ${client.user.tag}`);
	client.cmds.push(client.cmds._serialized);
	setInterval(client._webhookclear, 60 * 10 * 1000);
	setInterval(client._dotick, 60 * 10 * 1000);
	client._webhookclear;
}});

async function setupmsg() {
	this.author = this.author || this.member || this.user;
	this.author.isAdmin = conf.main.admins.indexOf(this.author.id) !== -1;
	this.embedreply   = client._embedreply;
	this.webhookreply = client._webhookreply;
	this.errorreply   = client._errorreply;
	this.hasperm      = client._hasperm;
}
client.hooks.add({event: "messageCreate",     priority: Infinity, func: setupmsg});
client.hooks.add({event: "interactionCreate", priority: Infinity, func: setupmsg});

client.hooks.add({event: "interactionCreate", func: async function() {
	if (!this.isCommand()) return;
	const cmd = client.cmds[this.commandName]
	if (!cmd) return; // just in case
	if (this.inGuild() === false && cmd.dm === false) {
		this.errorreply("This command cannot be used in DMs");
		return;
	}
	log(`slashcmd ${this.user.tag}: ${this.commandName}`);
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
					this.errorreply(`\`${cmd.args[i][1]}\`: This field is required`);
					return;
				}
				args.push(opt);
			} else {
				if (i[3]) {
					this.errorreply(`\`${cmd.args[i][1]}\`: This field is required`);
					return;
				}
				args.push(undefined);
			}
		};
	}
	if (cmd.hide && this.inGuild()) {
		await this.deferReply();
		await this.deleteReply();
	};
	cmd.func.bind(this)(args);		
}});

client.hooks.add({event: "messageCreate", func: async function() {
	if (util.usernotperson(this.author)) return;
	if (!this.content.startsWith(conf.main.prefix)) return;
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
		console.log(this.cmdname, Object.keys(client.cmds));
		this.cmdname = util.stringclosest(this.cmdname, Object.keys(client.cmds));
		if (!this.cmdname) return; // nothing near to it
	}
	cmd = client.cmds[this.cmdname];
	if (!cmd) return;
	log(`cmd ${this.author.tag}: ${this.cmdname} ${this.content}`);
	if (!this.author.isAdmin) {
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
			if (!this.content[i] && cmd.args[i][0] !== dc.USER) {
				if (cmd.args[i][3]) { // if required
					this.errorreply(`Field \`${cmd.args[i][1]}\` is required`);
					return;
				}
				continue;
			}
			switch (cmd.args[i][0]) {
				case dc.SERVER: {
					const guild = util.guildfromstringlike(this.content[i], me);
					if (!guild) {
						this.errorreply(`\`${this.content[i]}\` is not a valid guild name or id, I can only see guilds im in`);
						return;
					}
				} case dc.ROLE: {
					if (cmd.dm) {
						this.errorreply(`Role arguments aren't allowed in dms`);
						return;
					}
					const role = util.rolefromstringlike(this.content[i], this.guild, this.channel, this.author);
					if (!role) {
						this.errorreply(`\`${this.content[i]}\` is not a valid role name or id`);
						return;
					}
					break;
				} case dc.USER: {
					if (!this.content[i]) {
						this.content[i] = this.author;
						break;
					}
					const user = await util.userfromstringlike(this.content[i], this.guild, this.channel, this.author);
					if (!user) {
						this.errorreply(`\`${cmd.args[i][1]}\` is not a valid username or user id`);
						return;
					}
					this.content[i] = user;
					break;
				} case dc.BIGTEXT:
					this.content[i] = this.content.slice(i).join(" ");
				case dc.TEXT:
					this.content[i] = this.content[i].replace(/\\ /g, " ");
					if (
						(cmd.args[i][4] && cmd.args[i][4] > this.content[i].length) ||
						(cmd.args[i][5] && cmd.args[i][5] < this.content[i].length)
					) {
						if (cmd.args[i][4]) {
							if (cmd.args[i][5]) this.errorreply(`\`${cmd.args[i][1]}\` must be between ${cmd.args[i][4]} and ${cmd.args[i][5]} characters`);
							else                this.errorreply(`\`${cmd.args[i][1]}\` must be longer than ${cmd.args[i][5]} characters`);
						} else {
							this.errorreply(`\`${cmd.args[i][1]}\` must be shorter than ${cmd.args[i][5]} characters`);
						}
						return;
					}
					break;
				case dc.CHOICE:
					this.content[i] = this.content[i].toLowerCase();
					if (cmd.args[i][4].indexOf(this.content[i]) === -1) {
						this.content[i] = util.stringclosest(this.content[i], cmd.args[i][4]);
						console.log("hi", this.content[i]);
						if (this.content[i] === undefined) { // nothing near to it
							this.errorreply(`Invalid option for \`${cmd.args[i][1]}\`, options are:\n\`` + cmd.args[i][4].join("\`, \`") + "\`");
							return;
						}
					}
					break;
				case dc.INT:
					this.content[i] = Number(this.content[i]);
					if (isNaN(this.content[i])) {
						this.errorreply(`Invalid Integer for \`${cmd.args[i][1]}\``);
						return;
					}
					if (this.content[i] % 1 !== 0) {
						this.errorreply(`\`${cmd.args[i][1]}\` must be a whole number`);
						return;
					}
					// no break
				case dc.NUM:
					if (cmd.args[i][0] === dc.NUM) {
						this.content[i] = Number(msg.content[i]);
						if (isNaN(this.content[i])) {
							this.errorreply(`Invalid Number for \`${cmd.args[i][1]}\``);
							return;
						}
					}
					if (
						(cmd.args[i][4] && cmd.args[i][4] > this.content[i]) ||
						(cmd.args[i][5] && cmd.args[i][5] < this.content[i])
					) {
						if (cmd.args[i][4]) {
							if (cmd.args[i][5]) this.errorreply(`\`${cmd.args[i][1]}\` must be between ${cmd.args[i][4]} and ${cmd.args[i][5]}`);
							else                this.errorreply(`\`${cmd.args[i][1]}\` must be larger than ${cmd.args[i][5]}`);
						} else {
							this.errorreply(`\`${cmd.args[i][1]}\` must be smaller than ${cmd.args[i][5]}`);
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
}});

client.login(conf.main.token);

// Error handling
process.on("uncaughtException", e => {
	log.error(`${e} ${e.stack}`);
	if (!conf.main.error) return;
	const embed = {
		description: `\`\`\`${e}: ${e.stack}\`\`\``,
		title      : "Error",
		color      : 255 << 16
	};
	client.channels.fetch(conf.main.error).then(channel => {
		channel.send({ embeds: [embed] }).catch(() => log.warn("Unable to send error message"));
	}).catch(() => log("Unable to fetch error channel"));
});

// REPL
if (require.main === module) {
	const repl = require("repl");
	if (repl.start)
		require("repl").start();
	else
		log.error("Cannot start repl");
}

/*function hextoarray(hex) {
	return [
		parseInt(hex.slice(1, 3), 16),
		parseInt(hex.slice(3, 5), 16),
		parseInt(hex.slice(5, 7), 16)
	];
}*/
function inttoarray(int) {
	return [
		int         & 255,
		(int >> 8 ) & 255,
		(int >> 16) & 255,
	];
}

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

const helptext = `A cool bot made by SollyBunny#6656
Use \`help <page>\` to look at all the different commands
Use \`help <cmdname>\` to look at help for a specific command (also works as a search)
Haz fun!`

module.exports.cmds = {
	"avatar": {
		desc: "Show someone's profile picture",
		args: [
			[dc.USER, "user", "Who's profile picture", false],
		],
		func: async function (args) {
			args = args[0] || this.member;
			this.embedreply({
				title: "Avatar",
				image: args.displayAvatarURL({ dynamic: true }),
				color: args.displayColor === 0 ? [255, 255, 255] : inttoarray(args.displayColor)
			});
		}
	},
	"profile": {
		desc: "Show someone's profile",
		args: [
			[dc.USER, "user", "Who's profile", false],
		],
		func: async function (args) {
			args = args[0] || this.member;
			let embed = {
				image: args.displayAvatarURL({ dynamic: true }),
				color: args.displayColor === 0 ? [255, 255, 255] : inttoarray(args.displayColor),
				fields: [
					{
						name: "ID",
						value: `\`${args.id}\``,
						inline: true
					}, {
						name: "Created",
						value: args.user.createdAt.toString(),
						inline: true
					}
				]
			};
			if (args.user) { // in guild
				embed.fields.push({
					name: "Joined",
					value: args.joinedAt.toString(),
					inline: true
				});
				if (args._roles.length > 0) {
					embed.fields.push({
						name: "Roles",
						value: args._roles.map(i => {
							return `<@&${i}>`;
						}).join(" "),
						inline: true
					});
				}
			}
			if (args.nickname) {
				embed.title = `${args.nickname} (${args.tag || args.user.tag})`;
			} else {
				embed.title = args.tag || args.user.tag;
			}
			this.embedreply(embed);
		}
	},
	"purge": {
		desc: "Delete multiple messages",
		args: [
			[dc.INT, "messages", "Number of messages to purge", true, 1, 99],
		],
		perm: dc.PermissionFlagsBits.ManageMessages,
		dm: false,
		func: async function (args) {
			try {
				await this.channel.bulkDelete(args[0] + 1)
			} catch {
				this.errorreply("Purge failed");
			}
		}
	},
	"perms": {
		desc: "Get perms of a user",
		args: [
			[dc.USER, "user", "Who's perms", false],
		],
		dm: false,
		func: async function (args) {
			args = args[0] || this.member;
			let perms = args.permissions.serialize();
			this.embedreply({
				msg: Object.keys(perms).map(i => {
					return `${i}: ${perms[i]}`
				}).join("\n"),
				color: (255, 128, 0)
			});
		}
	},
	"help": {
		desc: "Get help",
		args: [
			[dc.BIGTEXT, "topic", "Either topic or page number of help", false]
		],
		func: async function (args) {
			if (!args[0]) {
				this.embedreply({
					title: "Help",
					msg: helptext,
					color: conf.color
				});
				return;
			}
			if (!isNaN(parseInt(args[0]))) { // page number of cmdlist
				args = parseInt(args[0]) - 1; // conv to int
				let data = Object.keys(client.cmds).slice(args * 10, args * 10 + 10);
				if (data.length === 0) {
					this.embedreply({
						title: "Help",
						msg: "Sorry, I didn't quiet catch that (invalid page number)",
						color: [255, 0, 0]
					});
					return;
				}
				data = data.map(i => {
					if (client.cmds[i].args) { // no args
						return {
							name: "`" + i + " " + client.cmds[i].args.map(m => {
								if (i[3])
									return `<${m[1]}*>`;
								return `<${m[1]}>`;
							}).join(" ") + "`",
							value: client.cmds[i].desc + (client.cmds[i].admin ? " (admin)" : ""),
						};
					} else {
						return {
							name: "`" + i + "`",
							value: client.cmds[i].desc + (client.cmds[i].admin ? " (admin)" : ""),
						};
					}
				});
				this.embedreply({
					title: `Help (page ${args})`,
					fields: data,
					color: conf.color
				});
				return;
			}
			if (client.cmds[args[0]]) {
				args[1] = client.cmds[args[0]];
				let msg = args[1].desc;
				if (args[1].perm)
					msg += "\nRequires: " + (new dc.PermissionsBitField(args[1].perm)).toArray.join(", ");
				if (args[1].args) {
					this.embedreply({
						title: args[0][0].toUpperCase() + args[0].slice(1),
						msg: msg,
						fields: args[1].args.map(i => {
							let value = `${i[2]} (${dc.typename(i[0])})`;
							if (i[3]) value += " (required)";
							return {
								name: i[1],
								value: value
							};
						}),
						color: conf.color
					});
				} else {
					this.embedreply({
						title: args[0][0].toUpperCase() + args[0].slice(1),
						msg: msg,
						color: conf.color
					});
				}
				return;
			}
			args = isnearlist(Object.keys(client.cmds), args[0], 5);
			if (args.length === 0) {
				this.embedreply({
					title: "Help",
					msg: "Sorry, I didn't quiet catch that (unknown command)",
					color: [255, 0, 0]
				});
				return;
			}
			this.embedreply({
				title: `Help`,
				msg: `Did you mean:\n\`${args.join("\`,\`")}\``,
				color: conf.color
			});
		}
	},
	"uptime": {
		desc: "Get uptime of bot",
		func: async function(args) {
			let t = process.uptime();
			if (t >= 604800) // weeks / days
				t = `${Math.floor(t / 604800)} weeks, ${Math.floor((t % 604800) / 86400)} days`;
			else if (t >= 86400) // days / hours
				t = `${Math.floor(t / 86400)} days, ${Math.floor((t % 86400) / 3600)} hours`;
			else if (t >= 3600) // hours / minutes
				t = `${Math.floor(t / 3600)} hours, ${Math.floor((t % 3600) / 60)} minutes`;
			else if (t >= 60) // minutes / seconds
				t = `${Math.floor(t / 60)} minutes, ${Math.floor(t % 60)} seconds`;
			else // seconds
				t = `${Math.floor(t)} seconds`;
			this.embedreply({
				title: "Uptime",
				msg: t,
				color: conf.color
			});
		}
	}
};

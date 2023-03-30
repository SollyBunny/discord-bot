/* system.js
Interal bot commands which can't be put into the main program

Config:
"system": {
	"color": [r, g, b],
	"helptext": "<something helpfull>"
}
*/

if (conf.system.helptext)
	conf.system.helptext = conf.system.helptext.replaceAll("$prefix", conf.main.prefix);
else 
	conf.system.helptext = "No help text set!";

module.exports.hooks = [
	{
		event: "messageCreate",
		priority: 10,
		func: async function() {
			if (this.content !== client.user.toString()) return;
			this.embedreply({
				title: "Help",
				msg: conf.system.helptext,
				color: conf.system.color
			});
		}
	}
];

module.exports.cmds = {
	"restart": {
		desc: "Restart the bot",
		admin: true,
		func: async function (args) {
			process.exit(0);
		}
	},
	"shutdown": {
		desc: "Shutdown the bot",
		admin: true,
		func: async function (args) {
			// Hint that the scripts outside should... ya know not restart
			process.exit(1);
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
					msg: conf.system.helptext,
					color: conf.system.color
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
					color: conf.system.color
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
						color: conf.system.color
					});
				} else {
					this.embedreply({
						title: args[0][0].toUpperCase() + args[0].slice(1),
						msg: msg,
						color: conf.system.color
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
				color: conf.system.color
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
				color: conf.system.color
			});
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
	}
};

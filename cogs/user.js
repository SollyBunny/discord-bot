/* user.js */

module.exports.desc = "Find info about your friends";

module.exports.cmds = {
	"profile": {
		desc: "Show someone's profile",
		args: [
			[dc.USER, "user", "Who's profile", false],
		],
		func: async function (args) {
			const user = args[0];
			let embed = {
				thumb: user.displayAvatarURL({ dynamic: true }),
				color: [255, 255, 255],
				colorraw: user.displayColor,
				fields: [
					{
						name: "ID",
						value: `\`${user.id}\``,
						inline: false
					}, {
						name: "Created",
						value: (user.user || user).createdAt.toString(),
						inline: false
					}
				]
			};
			if (user.user) { // in guild
				embed.fields.push({
					name: "Color",
					value: util.u24tohex(user.displayColor),
					inline: true
				});
				embed.fields.push({
					name: "Joined",
					value: user.joinedAt.toString(),
					inline: true
				});
				if (user._roles.length > 0) {
					embed.fields.push({
						name: "Roles",
						value: user._roles.map(i => {
							return `<@&${i}>`;
						}).join(" "),
						inline: true
					});
				}
			}
			if (user.nickname)
				embed.title = `${user.nickname} (${user.tag || user.user.tag})`;
			else
				embed.title = user.tag || user.user.tag;
			this.embedreply(embed);
		}
	},
	"avatar": {
		desc: "Show someone's profile picture",
		args: [
			[dc.USER, "user", "Who's profile picture", false],
		],
		func: async function (args) {
			const user = args[0];
			this.embedreply({
				title: `${user.displayName}'s avatar`,
				image: args.displayAvatarURL({ dynamic: true }) + "?size=512",
				color: [255, 255, 255],
				colorraw: args.displayColor
			});
		}
	},
	"perms": {
		desc: "Get perms of a user",
		args: [
			[dc.USER, "user", "Who's perms", false],
		],
		dm: false,
		func: async function (args) {
			const user = args[0];
			this.embedreply({
				title: `${user.displayName}'s permissions`,
				msg: util.bitfieldserialize(user.permissions).join(", "),
				color: [255, 255, 255],
				colorraw: user.displayColor
			});
		}
	},
	"roleinfo": {
		desc: "Get info about a role",
		args: [
			[dc.ROLE, "role", "What role", true],
		],
		dm: false,
		func: async function (args) {
			let role = args[0];
			console.log(role, Object.getOwnPropertyNames(role.permissions));
			console.dir(role.permissions);
			this.embedreply({
				title: `${role.name} ${role.unicodeEmoji || ""}`,
				colorraw: role.color,
				fields: [
					{
						name: "ID",
						value: `\`${role.id}\``,
						inline: false
					}, {
						name: "Color",
						value: util.u24tohex(role.color),
						inline: true
					}, {
						name: "Position",
						value: `${role.rawPosition}${util.stndrd(role.rawPosition)} / ${(await role.guild.roles.fetch()).size}`,
						inline: true
					}, {
						name: "Permissions",
						value: role.permissions ? util.bitfieldserialize(role.permissions).join(", ") : "None",
						inline: false
					}
				]
			})
		}
	}
};

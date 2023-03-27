/* user.js
Find info about your friends
*/

module.exports.cmds = {
	"profile": {
		desc: "Show someone's profile",
		args: [
			[dc.USER, "user", "Who's profile", false],
		],
		func: async function (args) {
			args = args[0] || this.member || this.user;
			let embed = {
				thumb: args.displayAvatarURL({ dynamic: true }),
				colorraw: args.displayColor,
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
			if (args.nickname)
				embed.title = `${args.nickname} (${args.tag || args.user.tag})`;
			else
				embed.title = args.tag || args.user.tag;
			this.embedreply(embed);
		}
	},
	"avatar": {
		desc: "Show someone's profile picture",
		args: [
			[dc.USER, "user", "Who's profile picture", false],
		],
		func: async function (args) {
			args = args[0] || this.member || this.user;
			this.embedreply({
				title: `${args.nickname || args.username}'s avatar`,
				image: args.displayAvatarURL({ dynamic: true }) + "?size=512",
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
			console.log(args);
			args = args[0] || this.member || this.user;
			let perms = args.permissions.serialize();
			this.embedreply({
				title: `${args.displayName}'s permissions`,
				msg: Object.keys(perms).filter(i => {
					return perms[i];
				}).join(", "),
				colorraw: args.displayColor
			});
		}
	},
};

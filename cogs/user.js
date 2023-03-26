/* user.js
Find info about your friends
*/

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
				color: args.displayColor === 0 ? [255, 255, 255] : util.rgbtoarr(args.displayColor)
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
				color: args.displayColor === 0 ? [255, 255, 255] : util.rgbtoarr(args.displayColor),
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
};

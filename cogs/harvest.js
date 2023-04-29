/* ping.js */

module.exports.desc = "Gimme your msgs";

async function getdata(channel, start) {
	const msgs = await channel.messages.fetch({ limit: 100, cache: false, before: start });
	const data = msgs.map(i => i.content ? `${i.author.tag}: ${i.content}`.replaceAll("\n", " ") : "").filter(i => i).join("\n");
	return [data, msgs.at(-1).id];
}

module.exports.cmds = {
	"harvest": {
		desc: "Harvest messages",
		admin: true,
		args: [
			[dc.TEXT, "id", "ID of the message to start from", false]
		],
		func: async function (args) {
			args = args[0] || undefined;
			let data; 
			let out = [];
			for (let i = 0; i < 10; ++i) {
				data = await getdata(this.channel, args);
				args = data[1];
				out.push(data[0]);
			}
			out = out.join("\n");
			fs.writeFileSync(`./data/harvest/${Date.now()}.txt`, out);
			this.embedreply({
				msg: `Harvested 1000 messages, use arg \`${args}\` to start from this harvest`
			});
		}
	}
};

// 1097136879654158438

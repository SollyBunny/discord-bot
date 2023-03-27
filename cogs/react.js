/* react.js
React to what people say

Config:
"react": {
	"gametext": "<the game!>",
	"dadpfp": "<pfp>",
	"dadname": "<im dad>",
	"dadtext": "Hi, $x, I'm $y"
}
*/

conf.react.gametext = conf.react.gametext || "The game!";
conf.react.dadname = conf.react.dadname || "Dad";
conf.react.dadtext = conf.react.dadtext || "Hi, $x, I'm $y!";
conf.react.dadtext = conf.react.dadtext.replaceAll("$y", conf.react.dadname)

client.on("messageCreate", async msg => {
	if (msg.author.bot) return; // ignore bots
	if (msg.author.system) return; // ignore system msgs (when they happen)
	if (msg.author.discriminator === "0000") return; // ignore webhooks
	msg.content = msg.content.toLowerCase();
	if (msg.content.indexOf("the game") !== -1) {
		try {
			await msg.reply ({ content: conf.react.gametext });
		} catch (e) {
			msg.channel.send({ content: conf.react.gametext });
		}
	} else if (msg.content.startsWith("im ") || msg.content.startsWith("i'm ") || msg.content.startsWith("i’m ")) {
		msg.content = conf.react.dadtext.replace("$x", msg.content.slice(3).trim().slice(0, 100));
		msg.webhookreply = client._webhookreply;
		msg.webhookreply(
			{
				nickname: conf.react.dadname,
				rawAvatarURL: conf.react.dadpfp
			},
			msg.content
		);
	}
});

/* react.js
Config:
"react": {
	"gametext": "<the game!>",
	"dadpfp": "<pfp>",
	"dadname": "<im dad>",
	"dadtext": "Hi, $x, I'm $y",
	"dadchance": 0.5
}
*/

module.exports.desc = "React to what people say";

module.exports.hooks = [
	{
		event: "messageCreate",
		priority: 10,
		func: async function() {
			if (this.author.isNotPerson) return;
			this.content = this.content.toLowerCase();
			if (this.content.indexOf("the game") !== -1) {
				try {
					await this.reply ({ content: conf.react.gametext });
				} catch (e) {
					this.channel.send({ content: conf.react.gametext });
				}
			} else if (this.content.startsWith("im ") || this.content.startsWith("i'm ") || this.content.startsWith("i’m ")) {
				if (Math.random() > conf.react.dadchance) return;
				this.content = conf.react.dadtext.replace("$x", this.content.slice(3).trim().slice(0, 100));
				this.webhookreply(
					{
						nickname: conf.react.dadname,
						rawAvatarURL: conf.react.dadpfp
					},
					this.content
				);
			} else { return; }
			return true;
		}
	}
];

module.exports.onstart = async function() {
	
	conf.react.gametext = conf.react.gametext || "The game!";
	conf.react.dadname = conf.react.dadname || "Dad";
	conf.react.dadtext = conf.react.dadtext || "Hi, $x, I'm $y!";
	conf.react.dadtext = conf.react.dadtext.replaceAll("$y", conf.react.dadname);
	conf.react.dadchance = conf.react.dadchance || 1;

}
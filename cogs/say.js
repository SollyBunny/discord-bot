/* say.js
Config:
"say": {
	"stickers": {
		"<name1>": "<funnygif1>",
		"<name2>": "<funnygif2>"
	}
}
*/

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !?*(),.#\"\'\n".split("");

let welsh;

module.exports.desc = "Trolling.inc";

module.exports.cmds = {
	"sticker": {
		desc: "Send a sticker",
		args: [
			[dc.CHOICE, "name", "Name of sticker", true, Object.keys(conf.say.stickers)]
		],
		hide: true,
		func: async function (args) {
			this.webhookreply(this.member, conf.say.stickers[args[0]]);
		}
	},
	"welsh": {
		desc: "Use a bad predictive model to speak welsh",
		hide: true,
		func: async function (args) {
			let prevchar = chars[Math.floor(Math.random() * 26) + 26];
			let out = prevchar;
			let ran;
			let i;
			while (out.character.length < 100) {
				ran = Math.random();
				for (i = 0; i < chars.length; ++i)
					if (welsh[prevchar][i] > ran) break;
				if (i === chars.length) break;
				out += chars[i];
				prevchar = chars[i];
			}
			this.webhookreply(this.member, out);
		}
	},
	"echo": {
		desc: "Echo whatever you say",
		args: [
			[dc.BIGTEXT, "text", "What to echo", true, undefined, 500]
		],
		func: async function (args) {
			try {
				await this.reply ({ content: args[0] });
			} catch (e) {
				this.channel.send({ content: args[0] });
			}
		}
	},
	"say": {
		desc: "Make anyone say anything",
		args: [
			[dc.USER, "user", "Who says this", false],
			[dc.BIGTEXT, "text", "What to say", true, undefined, 500],
		],
		dm: false,
		hide: true,
		func: async function (args) {
			if (!args[1]) return;
			this.webhookreply(args[0] || this.member, args[1]);
		}
	}
};

module.exports.onload = async function() {

	welsh = JSON.parse(fs.readFileSync("./data/welsh.json"));

};
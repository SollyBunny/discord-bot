/* say.js
Trolling.inc

Config:
"say": {
	"stickers": {
		"<name1>": "<funnygif1>",
		"<name2>": "<funnygif2>"
	}
}
*/

const predict = require("./predict.json");
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !?*(),.#\"\'\n".split("");

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
			while (1) {
				ran = Math.random();
				for (i = 0; i < chars.length; ++i)
					if (predict[prevchar][i] > ran) break;
				if (i === chars.length) break;
				out += chars[i];
				prevchar = chars[i];
				if (out.length > 100) break;
			}
			this.webhookreply(this.member, out);
		}
	},
	"echo": {
		desc: "Echo whatever you say",
		args: [
			[dc.BIGTEXT, "text", "What to echo", true]
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
			[dc.BIGTEXT, "text", "What to say", true],
		],
		dm: false,
		hide: true,
		func: async function (args) {
			this.webhookreply(args[0] || this.member, args[1] || "");
		}
	}
};

/* ping.js */

module.exports.desc = "Everyone's first commands :)";

module.exports.cmds = {
	"ping": {
		desc: "Gets ping",
		func: async function () {
			let ping = Date.now() - this.createdTimestamp;
			let color;
			if      (ping > 500) color = [255, 0, 0];
			else if (ping < 10)  color = [0, 255, 0];
			else                 color = [Math.round((ping - 10) / 490 * 255), Math.round((1 - (ping - 10) / 490) * 255), 0];
			this.embedreply({
				title: "Pong",
				msg: `${ping}ms`,
				color: color
			});
		}
	},
	"pong": {
		desc: "Gets pong",
		func: async function () {
			let ping = Date.now() - this.createdTimestamp;
			let color;
			if (ping > 500) {
				color = [255, 0, 0];
			} else if (ping < 10) {
				color = [0, 255, 0];
			} else {
				color = [Math.round((ping - 10) / 490 * 255), Math.round((1 - (ping - 10) / 490) * 255), 0];
			}
			this.embedreply({
				title: "Ping",
				msg: `${ping}ms`,
				color: color
			});
		}
	},
	"sup": {
		desc: "sup",
		func: async function () {
			this.reply({ content: "sup" });
		}
	},
	"bitch": {
		desc: "bitch",
		func: async function () {
			this.reply({ content: "bitch" });
		}
	}
};

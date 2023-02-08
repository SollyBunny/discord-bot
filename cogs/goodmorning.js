const cron = require("node-cron");

let channel;

const days = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday"
];
const months = [
	"January",
	"Febuary",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
const quotes = require("./goodmorning.json");

function dailyrandom(l) {
	let date = new Date();
	let day = String(date.getFullYear() * 12 * 30 + date.getMonth() * 30 + date.getDate());
	let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
	for (let i = 0, m; i < day.length; ++i) {
		m = day.charCodeAt[i];
		h1 = h2 ^ Math.imul(h1 ^ m, 597399067);
		h2 = h3 ^ Math.imul(h2 ^ m, 2869860233);
		h3 = h4 ^ Math.imul(h3 ^ m, 951274213);
		h4 = h1 ^ Math.imul(h4 ^ m, 2716044179);		
	}
	day = (h1 ^ h2 ^ h3 ^ h4) >>> 0;
	day %= l.length;
	return l[day];
}
function stndrd(n) {
	n = n.toString().at(-1);
	if (n == 0) return "st";
	if (n == 1) return "nd";
	if (n == 2) return "rd";
	return "th";
}
function goodmorning() {
	let date = new Date();
	channel.embedreply({
		title: "Good Morning",
		msg: `It is **${days[date.getDay()]}**, the **${date.getDay() + 1}${stndrd(date.getDay())}** of **${months[date.getMonth()]}**, **${date.getFullYear()}**\n\n > ${dailyrandom(quotes)}`,
		color: [0, 255, 255]
	});
}

client.once("ready", async function() {
	channel = await client.channels.fetch("851076951371546644");
	channel.embedreply = client._embedreply;
	cron.schedule("0 7 * * *", () => {
		goodmorning();
	});
});

module.exports.cmds = {
	"goodmorning": {
		desc: "Say good morning text",
		func: async function (args) {
			goodmorning();
		}
	},
	"quote": {
		desc: "Get a random inspirational quote",
		func: async function (args) {
			let i = Math.floor(Math.random() * quotes.length);
			this.embedreply({
				title: `Quote #${i}`,
				msg: quotes[i],
				color: this.color
			});
		}
	}
};

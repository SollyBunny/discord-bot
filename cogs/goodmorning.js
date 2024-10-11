/* goodmorning.js

Config:
"goodmorning": {
	"visualcrossingkey": "<visualcrossing key>",
	"dailybully": [
		"<channel>"
	],
	"goodmorning": [
		["<channel>", "<location>"]
	],
	"days": ["day1", "day2" ... "day7"],
	"mons": ["mon1", "mon2" ... "mon7"]
}

*/

let cron, cron2222, cron0700;

function dailyrandom(l) {
	return l[dailyrandomseed % l.length]
}
function dailybully(channel) {
	let members = channel.members;
	members = members.filter(i => {
		if (i.user.system || i.user.bot) return false;
		return true;
	});
	return {
		title: "Bully",
		color: [128, 5, 5],
		msg: `<@${members.at(dailyrandomseed % members.size).user.id}> is being bullied today`
	};
}

async function weathertoday(location) {
	let data;
	try {
		data = await util.fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/next1days?unitGroup=metric&elements=datetime%2Clatitude%2Clongitude%2Ctemp%2Cfeelslike%2Chumidity%2Cprecip%2Cprecipprob%2Cwindspeed%2Cwinddir%2Cpressure%2Ccloudcover%2Cvisibility%2Csevererisk%2Csunrise%2Csunset%2Cmoonphase%2Cdescription%2Cicon&include=days&key=${conf.goodmorning.visualcrossingkey}&options=nonulls&contentType=json`);
		data = JSON.parse(data);
	} catch (e) {
		return {
			msg: `Unable to fetch location "\`${location}\`"`,
			color: [0, 255, 255]
		};
	}
	return {
		title: `${data.resolvedAddress} (${data.latitude}, ${data.longitude})`,
		url: `https://www.google.com/maps/@?api=1&map_action=map?&center=${data.latitude},${data.longitude}`,
		msg: `${data.days[0].description}\n:thermometer: ${Math.round(data.days[0].temp)}°C (feels like ${Math.round(data.days[0].feelslike)}°C)`,
		thumb: `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/4th%20Set%20-%20Color/${data.days[0].icon}.png`,
		color: [0, 255, 255],
		fields: [
			{
				name: "Cloud Cover :cloud:",
				value: Math.round(data.days[0].cloudcover) + "%",
				inline: true
			}, {
				name: "Visibility :eyes:",
				value: Math.round(data.days[0].visibility) + "% (" + Math.round(9.75 * data.days[0].visibility) + "m)",
				inline: true
			}, {
				name: "Humidity :fog:",
				value: Math.round(data.days[0].humidity) + "%",
				inline: true
			}, {
				name: "Rain :droplet:",
				value: data.days[0].precip + "mm (" + Math.round(data.days[0].precipprob) + "%)",
				inline: true
			}, {
				name: "Pressure :timer:",
				value: Math.round(data.days[0].pressure) + "hPa",
				inline: true
			}, {
				name: "Wind :dash:",
				value: Math.round(data.days[0].windspeed) + "kmh (" + Math.round(data.days[0].winddir) + "°)",
				inline: true
			}, {
				name: "Sunrise :sunrise_over_mountains:",
				value: data.days[0].sunrise,
				inline: true
			}, {
				name: "Sunset :city_dusk:",
				value: data.days[0].sunset	,
				inline: true					
			}, {
				name: "Moon Phase " + [":new_moon:", ":new_moon:", ":waxing_crescent_moon:", ":first_quarter_moon:", ":waxing_gibbous_moon:", ":full_moon:", ":waning_gibbous_moon:", ":last_quarter_moon:", ":waning_crescent_moon:", ":new_moon:"][Math.floor(data.days[0].moonphase * 10)],
				value: Math.round(data.days[0].moonphase * 100) + "%",
				inline: true
			}
		]
	};
}

function t0700() {
	dailyrandomseed = Math.floor(Math.random() * 100000);
	conf.goodmorning.goodmorning.forEach(async function(i) {
		let date = new Date();
		let embed = await weathertoday(i[1]);
		embed.title = "Good morning";
		embed.msg = `It is **${conf.goodmorning.days[date.getDay()]}**, the **${date.getDate()}${util.stndrd(date.getDate())}** of **${conf.goodmorning.mons[date.getMonth()]}**, **${date.getFullYear()}**\n\n > ${dailyrandom(quotes)}\n\n` + embed.msg;
		embed.url = undefined;
		i[0].embedreply(embed);
	});
	conf.goodmorning.dailybully.forEach(async function(i) {
		i[0].embedreply(dailybully(i[0]));
	});
}
function t2222() {
	conf.goodmorning.goodmorning.forEach(async function(i) {
		i[0].send({ content: "22:22!" });
	});
}

module.exports.desc = "Handles time based functions";

module.exports.require = { "node-cron": "Set timers" };

module.exports.cmds = {
	"quote": {
		desc: "Get a random inspirational quote",
		func: async function () {
			let i = Math.floor(Math.random() * quotes.length);
			this.embedreply({
				title: `Quote #${i}`,
				msg: quotes[i],
				color: this.color
			});
		}
	},
	"weather": {
		desc: "Get today's weather",
		args: [
			[dc.BIGTEXT, "location", "Where to get weather data for", true]
		],
		func: async function (args) {
			this.embedreply(await weathertoday(args[0]));
		}
	},
	"bully": {
		desc: "Who's being bullied today",
		dm: false,
		func: async function () {
			this.embedreply(dailybully(this.channel));
		}
	},
	"test_cron": {
		desc: "Run all cron functions now",
		admin: true,
		func: async function () {
			t0700();
			t2222();
		}
	}
};

module.exports.onload = async function() {

	cron = require("node-cron");

	conf.goodmorning.dailybully = conf.goodmorning.dailybully || [];
	conf.goodmorning.goodmorning = conf.goodmorning.goodmorning || [];

	conf.goodmorning.days = conf.goodmorning.days || [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	];
	conf.goodmorning.mons = conf.goodmorning.mons || [
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

	quotes = JSON.parse(fs.readFileSync("./data/quotes.json"));
	dailyrandomseed = Math.floor(Math.random() * 100000);

};

module.exports.onloadready = async function() {

	if (conf.goodmorning.dailybully) {
		for (let i = 0; i < conf.goodmorning.dailybully.length; ++i) {
			try {
				conf.goodmorning.dailybully[i] = await client.channels.fetch(conf.goodmorning.dailybully[i])
			} catch (e) {
				conf.goodmorning.dailybully[i] = undefined;
				continue;
			}
			conf.goodmorning.dailybully[i].embedreply = client._embedreply;
		}
		conf.goodmorning.dailybully.filter(i => { return i === undefined; });
	} else {
		conf.goodmorning.dailybully = [];
	}
	if (conf.goodmorning.goodmorning) {
		for (let i = 0; i < conf.goodmorning.goodmorning.length; ++i) {
			try {
				conf.goodmorning.goodmorning[i][0] = await client.channels.fetch(conf.goodmorning.goodmorning[i][0])
			} catch (e) {
				conf.goodmorning.goodmorning[i][0] = undefined;
				continue;
			}
			conf.goodmorning.goodmorning[i][0].embedreply = client._embedreply;
		}
		conf.goodmorning.goodmorning.filter(i => { return i !== undefined; });
	} else {
		conf.goodmorning.goodmorning = [];
	}

	cron0700 = cron.schedule("0 7 * * *", t0700);
	cron2222 = cron.schedule("22 22 * * *", t2222);

};

module.exports.onunload = async function() {
	cron0700.destroy();
	cron2222.destroy();
};
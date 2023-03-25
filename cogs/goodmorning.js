
const cron = require("node-cron");
const quotes = require("./goodmorning.json");

let channel = [];
let dailyrandomseed = Math.floor(Math.random() * 100000);

const days = conf.goodmorning.days || [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];
const months = conf.goodmorning.months || [
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

function dailyrandom(l) {
	return l[dailyrandomseed % l.length]
}
function dailybully(channel) {
	let members = channel.members;
	members = members.filter(i => {
		if (i.user.system || i.user.bot) return false;
		return true;
	})
	return {
		title: "Bully",
		color: [128, 5, 5],
		msg: `<@${members.at(dailyrandomseed % members.size).user.id}> is being bullied today`
	};
}

function stndrd(n) {
	n = n.toString();
	if (n.at(-2) === "1") return "th";
	switch (n.at(-1)) {
		case "1": return "st";
		case "2": return "nd";
		case "3": return "rd";
		default: return "th";
	}
}

async function weathertoday(location) {
	let data;
	try {
		data = await ffetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/next1days?unitGroup=metric&elements=datetime%2Clatitude%2Clongitude%2Ctemp%2Cfeelslike%2Chumidity%2Cprecip%2Cprecipprob%2Cwindspeed%2Cwinddir%2Cpressure%2Ccloudcover%2Cvisibility%2Csevererisk%2Csunrise%2Csunset%2Cmoonphase%2Cdescription%2Cicon&include=days&key=${conf.visualcrossingkey}&options=nonulls&contentType=json`);
		data = JSON.parse(data);
	} catch (e) {
		return {
			title: "Error",
			msg: `Location "\`${location}\`" not found`,
			color: [255, 0, 0]
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

function t07() {
	dailyrandomseed = Math.floor(Math.random() * 100000);
	channel.forEach(async function(i) {
		let date = new Date();
		let embed = await weathertoday(conf.goodmorninglocation);
		embed.title = "Good morning";
		embed.msg = `It is **${days[date.getDay()]}**, the **${date.getDate()}${stndrd(date.getDate())}** of **${months[date.getMonth()]}**, **${date.getFullYear()}**\n\n > ${dailyrandom(quotes)}\n\n` + embed.msg;
		embed.url = undefined;
		i[1].embedreply(embed);
		i[0].embedreply(dailybully(i[1]));
	});
}
function t2222() {
	channel.forEach(i => {
		i[1].send({ content: "22:22!" });
	});
}

client.once("ready", async function() {
	for (let i = 0, m, out; i < conf.goodmorning.length; ++i) {
		m = conf.goodmorning[i];
		out = [
			client.channels.fetch(m[0]),
			client.channels.fetch(m[1]),
			m[2]
		];
		out[0] = await out[0];
		out[0].embedreply = client._embedreply;
		out[1] = await out[1];
		out[1].embedreply = client._embedreply;
		channel.push(out);
	}
	cron.schedule("0 7 * * *", t07);
	cron.schedule("22 22 * * *", t2222);
});

module.exports.cmds = {
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
		func: async function (args) {
			this.embedreply(dailybully(this.channel));
		}
	},
};

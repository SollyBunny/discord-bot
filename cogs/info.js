const nekosopts = ["neko", "smug", "woof", "8ball", "goose", "cuddle", "avatar", "slap", "pat", "gecg", "feed", "fox_girl", "lizard", "hug", "meow", "kiss", "wallpaper", "tickle", "waifu", "ngif", "lewd"];
const nekosurl  = "https://nekos.life/api/v2/img/"
const wikiurl1 = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageprops&ppprop=disambiguation&generator=search&gsrinterwiki=1&gsrsearch=";
const wikiurl2 = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cpageimages&exintro=1&explaintext=1&exsectionformat=plain&piprop=original&exchars=1000&pageids=";

https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageprops&generator=search&formatversion=2&ppprop=disambiguation&gsrsearch=asd&gsrnamespace=0&gsrqiprofile=engine_autoselect&gsrinterwiki=1&gsrsort=relevance

function ffetch(url) {
	return new Promise((resolve, reject) => {
		http.get(url, res => {
			if (res.statusCode !== 200) {
				res.resume();
				reject(res.statusCode);
				return;
			}
			let body = "";
			res.on("data", chunk => { body += chunk; });
			res.on("end", () => {
				resolve(body)
			});
		}).on("error", e => {
			reject(e);
		});
	});
}


module.exports.cmds = {
	"neko": {
		desc: "Cute nekos",
		args: [
			[dc.CHOICE, "type", "What type of neko", false, nekosopts],
		],
		func: async function (args) {
			args = args[0];
			if (args === undefined) {
				args = "neko";
			} else if (nekosopts.indexOf(args) === -1) {
				this.errorreply(`Invalid option "${args}", valid options are:\n\`` + nekosopts.join("\`, \`") + "\`") // "
				return;
			}
			let data = await ffetch(`${nekosurl}${args}`);
			data = data.slice(8, -3);
			args = args.charAt(0).toUpperCase() + args.slice(1).toLowerCase();
			this.embedreply({
				title: args,
				image: data,
				color: [255, 0, 255]
			});
		}
	},
	"wiki": {
		desc: "Find an entry in the world's largest encyclopedia",
		args: [
			[dc.BIGTEXT, "text", "What to find", true],
		],
		func: async function (args) {
			let out = [];
			let data;
			// fetch initial wiki page(s)
			data = await ffetch(`${wikiurl1}${args[0]}`);
			data = JSON.parse(data);
			if (data.query === undefined) { // no query, no pages
				this.embedreply({
					msg: `No pages found for "${args[0]}"`,
					color: [255, 255, 255]
				});
				return;
			}
			out = [];
			for (let i in data.query.pages) { // code pages
				i = data.query.pages[i];
				if (i.title.indexOf("(disambiguation)") !== -1) // disambiguation page
					continue
				if (i.pageprops) // has pageprops: { disambiguation: '' } ie is disambiguation page
					continue;
				out.push(i);
			}
			let extract = "*Disambiguation: " + out.slice(1).map((i) => { // add disambiguation text
			return `[${i.title}](https://wikipedia.com/wiki/${encodeURIComponent(i.title)})`;
		}).join(", ") + "*\n";
			if (out.length === 0) { // no non disambiguation articles found
				this.embedreply({ // off we go
					msg: extract,
					title: encodeURIComponent(args[0]),
					url: `https://wikipedia.com/wiki/${encodeURIComponent(args[0])}`,
					color: [255, 255, 255]
				});
			} else {
				data = await ffetch(`${wikiurl2}${out[0].pageid}`) // get content of "main" page
				data = JSON.parse(data).query.pages[String(out[0].pageid)]; // get data from responce
				extract += "\n" + data.extract;
				this.embedreply({ // off we go
					msg: extract,
					title: data.title,
					url: `https://wikipedia.com/wiki/${encodeURIComponent(data.title)}`,
					thumb: data.original ? data.original.source : undefined,
					color: [255, 255, 255]
				});
	    	}
	    }
	}
};

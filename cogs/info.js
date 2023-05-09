/* info.js */

const wikiurl1 = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageprops&ppprop=disambiguation&generator=search&gsrinterwiki=1&gsrsearch=";
const wikiurl2 = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cpageimages&exintro=1&explaintext=1&exsectionformat=plain&piprop=original&exchars=1000&pageids=";
const wikiurlrandom = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cpageimages&generator=random&exchars=1000&exintro=1&explaintext=1&exsectionformat=plain&piprop=original&grnnamespace=0";
const nekosopts = ["neko", "smug", "woof", "8ball", "goose", "cuddle", "avatar", "slap", "pat", "gecg", "feed", "kitsune", "lizard", "hug", "meow", "kiss", "wallpaper", "tickle", "waifu", "gif", "lewd", "why", "emoticon", "fact", "name"];
const nekosurl = "https://nekos.life/api/v2/img/"
const nekosopts2 = ["why", "emoticon", "fact", "name"];
const nekosurl2 = "https://nekos.life/api/v2/";

module.exports.desc = "Fetches stuff from the interwebs";

module.exports.cmds = {
	"test_gimg": {
		desc: "Fetch images from google images",
		args: [
			[dc.BIGTEXT, "text", "What to search", false, undefined, 50]
		],
		func: async function (args) {
	

		}
	},
	"neko": {
		desc: "Cute nekos",
		args: [
			[dc.CHOICE, "type", "What type of neko", false, nekosopts],
		],
		func: async function (args) {
			args = args[0] || nekosopts[0];
			let data;
			if (nekosopts2.indexOf(args) === -1) {
				switch (args) {
					case "gif": args = "ngif"; break;
					case "kitsune": args = "fox_neko"; break;
				}
				data = await util.fetch(`${nekosurl}${args}`);
				data = data.slice(8, -3);
				args = args.charAt(0).toUpperCase() + args.slice(1).toLowerCase();
				this.embedreply({
					title: args,
					image: data,
					color: [255, 0, 255]
				});
			} else {
				if (args === "emoticon") args = "cat";
				data = await util.fetch(`${nekosurl2}${args}`);
				data = data.slice(data.indexOf('"', 7) + 1, data.lastIndexOf('"'));
				args = args.charAt(0).toUpperCase() + args.slice(1).toLowerCase();
				this.embedreply({
					title: args,
					msg: data,
					color: [255, 0, 255]
				});
			}
		}
	},
	"wiki": {
		desc: "Find an entry in the world's largest encyclopedia",
		args: [
			[dc.BIGTEXT, "text", "What to find", true, undefined, 100],
		],
		func: async function (args) {
			args = args[0].toLowerCase();
			let data;
			if (args === "random") {
				data = await util.fetch(wikiurlrandom);
				data = JSON.parse(data);
				data = Object.values(data.query.pages)[0];
				this.embedreply({
					msg: data.extract,
					title: data.title,
					url: `https://wikipedia.com/wiki/${encodeURIComponent(data.title)}`,
					thumb: data.original ? data.original.source : undefined,
					color: [255, 255, 255]
				});
				return;
			}
			let out = [];
			// fetch initial wiki page(s)
			data = await util.fetch(`${wikiurl1}${args}`);
			data = JSON.parse(data);
			if (data.query === undefined || data.query.pages.length === 0) { // no query, no pages
				this.errorreply(`No pages found for "${args}"`);
				return;
			}
			out = undefined;
			let extract = "";
			Object.values(data.query.pages).sort((a, b) => {
				return a.index - b.index;
			}).forEach(i => { // code pages
				// has pageprops: { disambiguation: '' } ie is disambiguation page
				// or out has already been defined
				if (out || i.pageprops) {
					extract += `[${i.title}](https://wikipedia.com/wiki/${encodeURIComponent(i.title)}), `;
					return;
				};
				out = i;
			});
			if (extract.length > 0) // add disambiguation starting text if there were disambiguations
				extract = "*Disambiguation: " + extract.slice(0, -2) + "*\n";
			if (out === undefined) { // no non disambiguation articles found
				this.embedreply({ // off we go
					msg: extract,
					title: data.title,
					url: `https://wikipedia.com/wiki/${encodeURIComponent(data.title)}`,
					thumb: data.original ? data.original.source : undefined,
					color: [255, 255, 255]
				});
			} else {
				data = await util.fetch(`${wikiurl2}${out.pageid}`) // get content of "main" page
				data = JSON.parse(data).query.pages[String(out.pageid)]; // get data from responce
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

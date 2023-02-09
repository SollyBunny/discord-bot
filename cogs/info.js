const nekosopts = ["neko", "smug", "woof", "8ball", "goose", "cuddle", "avatar", "slap", "pat", "gecg", "feed", "fox_girl", "lizard", "hug", "meow", "kiss", "wallpaper", "tickle", "waifu", "ngif", "lewd"];
const nekosurl  = "https://nekos.life/api/v2/img/"
const wikiurl1 = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageprops&ppprop=disambiguation&generator=search&gsrinterwiki=1&gsrsearch=";
const wikiurl2 = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cpageimages&exintro=1&explaintext=1&exsectionformat=plain&piprop=original&exchars=1000&pageids=";

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
			if (data.query === undefined || data.query.pages.length === 0) { // no query, no pages
				this.errorreply(`No pages found for "${args[0]}"`);
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
					title: encodeURIComponent(args[0]),
					url: `https://wikipedia.com/wiki/${encodeURIComponent(args[0])}`,
					color: [255, 255, 255]
				});
			} else {
				data = await ffetch(`${wikiurl2}${out.pageid}`) // get content of "main" page
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

/* info.js */

const dicturl1 = "https://en.wiktionary.org/w/api.php?action=query&format=json&generator=search&gsrsearch="
const dicturl2 = "https://en.wiktionary.org/w/api.php?action=query&format=json&prop=extracts%7Cpageimages&exsectionformat=wiki&explaintext=1&exchars=1000&pageids="
const wikiurl1 = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageprops&ppprop=disambiguation&generator=search&gsrinterwiki=1&gsrsearch=";
const wikiurl2 = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cpageimages&exintro=1&explaintext=1&exsectionformat=plain&piprop=original&exchars=1000&pageids=";
const wikiurlrandom = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cpageimages&generator=random&exchars=1000&exintro=1&explaintext=1&exsectionformat=plain&piprop=original&grnnamespace=0";
const nekosopts = ["neko", "smug", "woof", "8ball", "goose", "cuddle", "avatar", "slap", "pat", "gecg", "feed", "kitsune", "lizard", "hug", "meow", "kiss", "wallpaper", "tickle", "waifu", "gif", "lewd", "why", "emoticon", "fact", "name"];
const nekosurl = "https://nekos.life/api/v2/img/"
const nekosopts2 = ["why", "emoticon", "fact", "name"];
const nekosurl2 = "https://nekos.life/api/v2/";

async function wikiyoink(url1, url2) {
	// TODO own sorting algorithm (wiki one sucks)
	// fetch initial wiki page(s)
	data = await util.fetch(url1);
	data = JSON.parse(data);
	if (data.query === undefined || data.query.pages.length === 0) return false // no query, no pages
	data = Object.values(data.query.pages).filter(i => (i.title.indexOf("(disambiguation)") === -1) && (!i.pageprops));
	if (data.length === 0) return false;
	data = data.sort((a, b) => a.index - b.index);
	let tries = 1;
	while (1) {
		data[0] = JSON.parse(await util.fetch(`${url2}${data[0].pageid}`));
		data[0] = Object.values(data[0].query.pages)[0];
		if (data[0].missing === undefined) {
			if (data[0].original) data[0].original = data[0].original.source;
			return data;
		}
		if (tries > out.length) return data;
		// remove first el & move to back
		data.push(data[0]);
		data.shift();
	}
}

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
					case "gif":     args = "ngif"; break;
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
				data = await util.fetch(`${nekosurl2}${args === "emoticon" ? "cat" : args}`);
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
	"dict": {
		desc: "Find an entry in the world's largest dictionary",
		args: [
			[dc.BIGTEXT, "text", "What to find", true, undefined, 100],
		],
		func: async function (args) {
			// TODO readd images
			args = args[0];
			const out = await wikiyoink(`${dicturl1}${args}`, dicturl2);
			if (out === false) { this.errorreply(`No pages found for \`${args}\``); return; }
			const embed = {
				color: [255, 255, 255], 
				msg: "",
				title: out[0].title,
				url: `https://wiktionary.com/wiki/${encodeURIComponent(out[0].title)}`
			};
			if (out.length > 1) {
				embed.msg += "*Disambiguation: " + out.slice(1).map(i => 
					`[${i.title}](https://wiktionary.com/wiki/${encodeURIComponent(i.title)})`
				).join(", ") + "*\n";
			}
			if (out[0].extract) {
				embed.msg += out[0].extract
					.slice(2)
					.replaceAll("====", "**")
					.replaceAll("=== ", "**__")
					.replaceAll(" ===", "__**")
					.replaceAll(/==.+?==/g, "")
					.replaceAll(/\n+/g, "\n")
				;
			} else {
				out.title = "Disambiguation";
			}
			this.embedreply(embed);
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
			const out = await wikiyoink(`${wikiurl1}${args}`, wikiurl2);
			if (out === false) { this.errorreply(`No pages found for \`${args}\``); return; }
			const embed = {
				color: [255, 255, 255], 
				msg: "",
				title: out[0].title,
				url: `https://wikipedia.com/wiki/${encodeURIComponent(out[0].title)}`
			};
			if (out.length > 1) {
				embed.msg += "*Disambiguation: " + out.slice(1).map(i => 
					`[${i.title}](https://wikipedia.com/wiki/${encodeURIComponent(i.title)})`
				).join(", ") + "*\n";
			}
			if (out[0].extract) {
				embed.thumb = out[0].original;
				embed.msg += out[0].extract;
			} else {
				out.title = "Disambiguation";
			}
			this.embedreply(embed);
		}
		
	}
};
